// * Handles canvas-based image cropping, format conversion, and downloads

import {
  AssetSelection,
  CropBounds,
  AssetExportOptions,
  AssetFormat,
  Point,
  ResizeHandle,
} from "../types/asset-extraction";

// * Convert percentage-based bounds to pixel coordinates
export function boundsToPixels(
  bounds: AssetSelection["bounds"],
  imageWidth: number,
  imageHeight: number
): CropBounds {
  return {
    x: (bounds.x / 100) * imageWidth,
    y: (bounds.y / 100) * imageHeight,
    width: (bounds.width / 100) * imageWidth,
    height: (bounds.height / 100) * imageHeight,
  };
}

// * Convert pixel coordinates to percentage-based bounds
export function pixelsToBounds(
  crop: CropBounds,
  imageWidth: number,
  imageHeight: number
): AssetSelection["bounds"] {
  return {
    x: (crop.x / imageWidth) * 100,
    y: (crop.y / imageHeight) * 100,
    width: (crop.width / imageWidth) * 100,
    height: (crop.height / imageHeight) * 100,
  };
}

// * Convert screen coordinates to image coordinates
export function screenToImageCoords(
  screenPoint: Point,
  imageElement: HTMLImageElement,
  containerElement: HTMLElement
): Point {
  const containerRect = containerElement.getBoundingClientRect();
  const imageRect = imageElement.getBoundingClientRect();

  // Relative position within the container
  const relativeX = screenPoint.x - containerRect.left;
  const relativeY = screenPoint.y - containerRect.top;

  // Scale to image's natural dimensions
  const scaleX = imageElement.naturalWidth / imageElement.clientWidth;
  const scaleY = imageElement.naturalHeight / imageElement.clientHeight;

  // Offset for image position within container
  const imageOffsetX = imageRect.left - containerRect.left;
  const imageOffsetY = imageRect.top - containerRect.top;

  return {
    x: (relativeX - imageOffsetX) * scaleX,
    y: (relativeY - imageOffsetY) * scaleY,
  };
}

// * Convert image coordinates to screen coordinates
export function imageToScreenCoords(
  imagePoint: Point,
  imageElement: HTMLImageElement,
  containerElement: HTMLElement
): Point {
  const containerRect = containerElement.getBoundingClientRect();
  const imageRect = imageElement.getBoundingClientRect();

  const scaleX = imageElement.clientWidth / imageElement.naturalWidth;
  const scaleY = imageElement.clientHeight / imageElement.naturalHeight;

  const imageOffsetX = imageRect.left - containerRect.left;
  const imageOffsetY = imageRect.top - containerRect.top;

  return {
    x: imagePoint.x * scaleX + imageOffsetX,
    y: imagePoint.y * scaleY + imageOffsetY,
  };
}

// * Generate resize handles for a selection rectangle
export function generateResizeHandles(bounds: CropBounds): ResizeHandle[] {
  const handles: ResizeHandle[] = [
    // Corner handles
    { type: "nw", position: { x: bounds.x, y: bounds.y }, cursor: "nw-resize" },
    {
      type: "ne",
      position: { x: bounds.x + bounds.width, y: bounds.y },
      cursor: "ne-resize",
    },
    {
      type: "sw",
      position: { x: bounds.x, y: bounds.y + bounds.height },
      cursor: "sw-resize",
    },
    {
      type: "se",
      position: { x: bounds.x + bounds.width, y: bounds.y + bounds.height },
      cursor: "se-resize",
    },

    // Edge handles
    {
      type: "n",
      position: { x: bounds.x + bounds.width / 2, y: bounds.y },
      cursor: "n-resize",
    },
    {
      type: "e",
      position: { x: bounds.x + bounds.width, y: bounds.y + bounds.height / 2 },
      cursor: "e-resize",
    },
    {
      type: "s",
      position: { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height },
      cursor: "s-resize",
    },
    {
      type: "w",
      position: { x: bounds.x, y: bounds.y + bounds.height / 2 },
      cursor: "w-resize",
    },
  ];

  return handles;
}

// * Create a cropped image from canvas using selection bounds
export async function cropImageFromCanvas(
  sourceCanvas: HTMLCanvasElement,
  cropBounds: CropBounds,
  options: AssetExportOptions = { format: "png" }
): Promise<string> {
  const { x, y, width, height } = cropBounds;
  const { format, quality = 0.9, scale = 1 } = options;

  // Create new canvas for cropped image
  const croppedCanvas = document.createElement("canvas");
  const ctx = croppedCanvas.getContext("2d");

  if (!ctx) {
    throw new Error("Unable to get canvas context");
  }

  // Set canvas dimensions with scale
  croppedCanvas.width = width * scale;
  croppedCanvas.height = height * scale;

  // Scale the context if needed
  if (scale !== 1) {
    ctx.scale(scale, scale);
  }

  // Draw cropped portion
  ctx.drawImage(
    sourceCanvas,
    x,
    y,
    width,
    height, // Source rectangle
    0,
    0,
    width,
    height // Destination rectangle
  );

  // Convert to data URL with specified format
  const mimeType = `image/${format === "jpeg" ? "jpeg" : format}`;
  return croppedCanvas.toDataURL(mimeType, quality);
}

// * Check if an image is from a cross-origin source
function isCrossOriginImage(imageElement: HTMLImageElement): boolean {
  try {
    const imageUrl = new URL(imageElement.src);
    const currentOrigin = window.location.origin;
    return imageUrl.origin !== currentOrigin;
  } catch {
    return false;
  }
}

// * Process a cross-origin image through our API
async function processCorsImage(imageUrl: string): Promise<string> {
  const response = await fetch("/api/process-cors-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageUrl }),
  });

  if (!response.ok) {
    throw new Error("Failed to process cross-origin image");
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

// * Create a cropped image directly from an image element
export async function cropImageFromElement(
  imageElement: HTMLImageElement,
  selection: AssetSelection,
  options: AssetExportOptions = { format: "png" }
): Promise<string> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Unable to get canvas context");
  }

  // Convert percentage bounds to pixels
  const cropBounds = boundsToPixels(
    selection.bounds,
    imageElement.naturalWidth,
    imageElement.naturalHeight
  );

  const { x, y, width, height } = cropBounds;
  const { format, quality = 0.9, scale = 1 } = options;

  // Set canvas dimensions
  canvas.width = width * scale;
  canvas.height = height * scale;

  // Scale context if needed
  if (scale !== 1) {
    ctx.scale(scale, scale);
  }

  // Handle cross-origin images
  let imageToUse = imageElement;
  let processedImageUrl: string | null = null;

  if (isCrossOriginImage(imageElement)) {
    try {
      // Process the image through our CORS proxy
      processedImageUrl = await processCorsImage(imageElement.src);

      // Create a new image element with the processed URL
      imageToUse = new Image();
      imageToUse.crossOrigin = "anonymous";

      await new Promise<void>((resolve, reject) => {
        imageToUse.onload = () => resolve();
        imageToUse.onerror = () =>
          reject(new Error("Failed to load processed image"));
        imageToUse.src = processedImageUrl!;
      });
    } catch (error) {
      console.error("Failed to process cross-origin image:", error);
      // Fallback: try the original approach
      try {
        // Draw the cropped portion with original image
        ctx.drawImage(
          imageElement,
          x,
          y,
          width,
          height, // Source rectangle (from original image)
          0,
          0,
          width,
          height // Destination rectangle (full cropped canvas)
        );

        // Convert to data URL
        const mimeType = `image/${format === "jpeg" ? "jpeg" : format}`;
        return canvas.toDataURL(mimeType, quality);
      } catch {
        throw new Error(
          "Cannot extract asset from cross-origin image without CORS headers"
        );
      }
    }
  }

  try {
    // Draw the cropped portion
    ctx.drawImage(
      imageToUse,
      x,
      y,
      width,
      height, // Source rectangle (from original image)
      0,
      0,
      width,
      height // Destination rectangle (full cropped canvas)
    );

    // Convert to data URL
    const mimeType = `image/${format === "jpeg" ? "jpeg" : format}`;
    const dataUrl = canvas.toDataURL(mimeType, quality);

    // Clean up processed image URL if created
    if (processedImageUrl) {
      URL.revokeObjectURL(processedImageUrl);
    }

    return dataUrl;
  } catch (error) {
    // Clean up on error
    if (processedImageUrl) {
      URL.revokeObjectURL(processedImageUrl);
    }
    throw error;
  }
}

// * Download a data URL as a file
export function downloadAsset(dataUrl: string, filename: string): void {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// * Generate a filename for an asset
export function generateAssetFilename(
  assetName: string,
  format: AssetFormat,
  projectName?: string
): string {
  const sanitizedName = assetName.replace(/[^a-zA-Z0-9-_]/g, "-").toLowerCase();
  const prefix = projectName
    ? `${projectName.replace(/[^a-zA-Z0-9-_]/g, "-").toLowerCase()}-`
    : "";
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");

  return `${prefix}${sanitizedName}-${timestamp}.${format}`;
}

// * Validate selection bounds
export function validateSelectionBounds(
  bounds: AssetSelection["bounds"]
): boolean {
  return (
    bounds.x >= 0 &&
    bounds.y >= 0 &&
    bounds.width > 0 &&
    bounds.height > 0 &&
    bounds.x + bounds.width <= 100 &&
    bounds.y + bounds.height <= 100
  );
}

// * Clamp selection bounds to image boundaries
export function clampSelectionBounds(
  bounds: AssetSelection["bounds"]
): AssetSelection["bounds"] {
  return {
    x: Math.max(0, Math.min(bounds.x, 100 - bounds.width)),
    y: Math.max(0, Math.min(bounds.y, 100 - bounds.height)),
    width: Math.max(1, Math.min(bounds.width, 100 - bounds.x)),
    height: Math.max(1, Math.min(bounds.height, 100 - bounds.y)),
  };
}

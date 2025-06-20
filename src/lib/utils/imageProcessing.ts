export type ExportFormat = "png" | "jpg" | "webp" | "svg";
export type ResolutionScale = 1 | 2 | 3;

export interface ImageProcessingOptions {
  format: ExportFormat;
  quality?: number; // 0-1 for jpg/webp compression
  scale?: ResolutionScale;
  width?: number;
  height?: number;
}

export interface ProcessedImageResult {
  blob: Blob;
  width: number;
  height: number;
  format: ExportFormat;
  size: number;
}

// * Loads an image from a URL and returns an HTMLImageElement
export const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous"; // Enable CORS for external images

    img.onload = () => resolve(img);
    img.onerror = (error) =>
      reject(new Error(`Failed to load image: ${error}`));

    img.src = url;
  });
};

// * Creates a canvas element with specified dimensions
export const createCanvas = (
  width: number,
  height: number
): HTMLCanvasElement => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
};

// * Scales an image to specified dimensions while maintaining aspect ratio
export const calculateScaledDimensions = (
  originalWidth: number,
  originalHeight: number,
  targetWidth?: number,
  targetHeight?: number,
  scale: ResolutionScale = 1
): { width: number; height: number } => {
  let width = originalWidth * scale;
  let height = originalHeight * scale;

  if (targetWidth && targetHeight) {
    // Fit within specified dimensions
    const widthRatio = targetWidth / width;
    const heightRatio = targetHeight / height;
    const ratio = Math.min(widthRatio, heightRatio);

    width = width * ratio;
    height = height * ratio;
  } else if (targetWidth) {
    // Scale to target width
    const ratio = targetWidth / width;
    width = targetWidth;
    height = height * ratio;
  } else if (targetHeight) {
    // Scale to target height
    const ratio = targetHeight / height;
    height = targetHeight;
    width = width * ratio;
  }

  return {
    width: Math.round(width),
    height: Math.round(height),
  };
};

// * Processes an image with specified options and returns a blob
export const processImage = async (
  imageUrl: string,
  options: ImageProcessingOptions
): Promise<ProcessedImageResult> => {
  try {
    // Load the original image
    const img = await loadImage(imageUrl);

    // Calculate scaled dimensions
    const { width, height } = calculateScaledDimensions(
      img.naturalWidth,
      img.naturalHeight,
      options.width,
      options.height,
      options.scale
    );

    // Create canvas and draw scaled image
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Could not get canvas context");
    }

    // Apply high-quality scaling
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Draw the image scaled to the canvas
    ctx.drawImage(img, 0, 0, width, height);

    // Convert to blob with specified format and quality
    const blob = await canvasToBlob(canvas, options.format, options.quality);

    return {
      blob,
      width,
      height,
      format: options.format,
      size: blob.size,
    };
  } catch (error) {
    throw new Error(
      `Image processing failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};

// * Converts canvas to blob with specified format and quality
export const canvasToBlob = (
  canvas: HTMLCanvasElement,
  format: ExportFormat,
  quality: number = 0.9
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const mimeType = getMimeType(format);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error(`Failed to convert canvas to ${format} blob`));
        }
      },
      mimeType,
      format === "jpg" || format === "webp" ? quality : undefined
    );
  });
};

// * Gets MIME type for export format
export const getMimeType = (format: ExportFormat): string => {
  const mimeTypes: Record<ExportFormat, string> = {
    png: "image/png",
    jpg: "image/jpeg",
    webp: "image/webp",
    svg: "image/svg+xml",
  };
  return mimeTypes[format];
};

// * Crops an image to specified coordinates and dimensions
export const cropImage = async (
  imageUrl: string,
  cropArea: { x: number; y: number; width: number; height: number },
  options: Omit<ImageProcessingOptions, "width" | "height">
): Promise<ProcessedImageResult> => {
  try {
    const img = await loadImage(imageUrl);

    // Calculate scaled dimensions for the crop
    const { width, height } = calculateScaledDimensions(
      cropArea.width,
      cropArea.height,
      undefined,
      undefined,
      options.scale
    );

    // Create canvas for cropped image
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Could not get canvas context");
    }

    // Apply high-quality scaling
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Draw the cropped portion of the image
    ctx.drawImage(
      img,
      cropArea.x,
      cropArea.y,
      cropArea.width,
      cropArea.height, // Source rectangle
      0,
      0,
      width,
      height // Destination rectangle
    );

    // Convert to blob
    const blob = await canvasToBlob(canvas, options.format, options.quality);

    return {
      blob,
      width,
      height,
      format: options.format,
      size: blob.size,
    };
  } catch (error) {
    throw new Error(
      `Image cropping failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};

// * Validates image file and returns basic metadata
export const validateAndGetImageInfo = (
  file: File
): Promise<{
  width: number;
  height: number;
  format: string;
  size: number;
}> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("File is not an image"));
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
        format: file.type,
        size: file.size,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };

    img.src = url;
  });
};

// * Optimizes image size by adjusting quality or dimensions
export const optimizeImageSize = async (
  imageUrl: string,
  maxSizeKB: number,
  options: ImageProcessingOptions
): Promise<ProcessedImageResult> => {
  let currentQuality = options.quality || 0.9;
  let currentScale = options.scale || 1;

  // Try reducing quality first
  while (currentQuality > 0.1) {
    const result = await processImage(imageUrl, {
      ...options,
      quality: currentQuality,
    });

    if (result.size <= maxSizeKB * 1024) {
      return result;
    }

    currentQuality -= 0.1;
  }

  // If quality reduction isn't enough, try scaling down
  while (currentScale > 0.5) {
    currentScale -= 0.1;

    const result = await processImage(imageUrl, {
      ...options,
      quality: 0.8,
      scale: currentScale as ResolutionScale,
    });

    if (result.size <= maxSizeKB * 1024) {
      return result;
    }
  }

  // Return the smallest possible version
  return processImage(imageUrl, {
    ...options,
    quality: 0.1,
    scale: 0.5 as ResolutionScale,
  });
};

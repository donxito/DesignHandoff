export interface AssetSelection {
  id: string;
  bounds: {
    x: number; // percentage of the image width (0-100)
    y: number; // percentage of the image height (0-100)
    width: number; // percentage of the image width (0-100)
    height: number; // percentage of the image height (0-100)
  };
  name?: string;
  format?: string;
  createdAt: string;
}

export interface CropBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface AssetExportOptions {
  format: AssetFormat;
  quality?: number; // for jpeg format (0-1)
  scale?: number; // export scale multiplier (1x, 2x, 3x)
  includeBackground?: boolean; // for PNG format with transparent background
}

export type AssetFormat = "png" | "jpeg" | "webp" | "svg";

export interface ResizeHandle {
  type: "nw" | "ne" | "sw" | "se" | "n" | "s" | "e" | "w";
  position: Point;
  cursor: string;
}

export interface AssetPreviewData {
  selection: AssetSelection;
  imageUrl: string;
  originalDimensions: {
    width: number;
    height: number;
  };
  croppedDataUrl?: string;
}

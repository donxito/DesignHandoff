import { Database } from "./database";

// * Export format types
export type ExportFormat = "png" | "jpg" | "webp" | "svg";
export type ResolutionScale = 1 | 2 | 3;

// * Database types
export type DbExportedAsset =
  Database["public"]["Tables"]["exported_assets"]["Row"];
export type DbExportedAssetInsert =
  Database["public"]["Tables"]["exported_assets"]["Insert"];
export type DbExportedAssetUpdate =
  Database["public"]["Tables"]["exported_assets"]["Update"];

// * Exported asset type with relations
export interface ExportedAsset extends DbExportedAsset {
  design_file?: {
    id: string;
    name: string;
  };
  creator?: {
    id: string;
    email: string;
    full_name: string | null;
  };
}

// * Export configuration interfaces
export interface ExportConfiguration {
  format: ExportFormat;
  scale: ResolutionScale;
  quality?: number; // 0-1 for lossy formats
  maxSizeKB?: number; // Optional size limit
  includeMetadata?: boolean;
}

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

// * Single asset export parameters
export interface SingleExportParams {
  designFileId: string;
  imageUrl: string;
  name: string;
  config: ExportConfiguration;
  cropArea?: CropArea;
}

// * Batch export parameters
export interface BatchExportParams {
  designFileId: string;
  imageUrl: string;
  baseName: string;
  configs: ExportConfiguration[];
  cropArea?: CropArea;
}

// * Export progress tracking
export interface ExportProgress {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number; // 0-100
  currentStep?: string;
  error?: string;
  result?: ExportedAsset;
}

// * Batch export results
export interface BatchExportResult {
  successful: ExportedAsset[];
  failed: {
    config: ExportConfiguration;
    error: string;
  }[];
  totalProcessed: number;
  totalSuccessful: number;
  totalFailed: number;
}

// * Asset download options
export interface AssetDownloadOptions {
  format?: ExportFormat;
  filename?: string;
  includeOriginal?: boolean;
}

// * Asset library organization
export interface AssetCategory {
  id: string;
  name: string;
  description?: string;
  color: string;
  project_id: string;
  created_at: string;
  assets_count?: number;
}

// * Asset search and filter options
export interface AssetFilters {
  formats?: ExportFormat[];
  scales?: ResolutionScale[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  sizeRange?: {
    min: number; // bytes
    max: number; // bytes
  };
  dimensionRange?: {
    minWidth: number;
    maxWidth: number;
    minHeight: number;
    maxHeight: number;
  };
  createdBy?: string;
  searchTerm?: string;
}

// * Asset statistics
export interface AssetStatistics {
  totalAssets: number;
  totalSizeMB: number;
  formatBreakdown: Record<ExportFormat, number>;
  scaleBreakdown: Record<ResolutionScale, number>;
  recentExports: number; // Last 7 days
  averageFileSize: number; // bytes
  popularFormats: { format: ExportFormat; count: number }[];
}

// * Export queue management
export interface ExportQueueItem {
  id: string;
  params: SingleExportParams;
  priority: "low" | "normal" | "high";
  addedAt: Date;
  estimatedDuration?: number; // seconds
}

export interface ExportQueue {
  items: ExportQueueItem[];
  processing: ExportQueueItem | null;
  totalItems: number;
  completedItems: number;
  failedItems: number;
}

// * Asset optimization settings
export interface OptimizationSettings {
  enableAutoOptimization: boolean;
  maxFileSizeKB: number;
  preferredQuality: number; // 0-1
  enableProgressive: boolean; // for JPEG
  stripMetadata: boolean;
}

// * Asset preview configuration
export interface AssetPreviewConfig {
  showDimensions: boolean;
  showFileSize: boolean;
  showFormat: boolean;
  showScale: boolean;
  thumbnailSize: "small" | "medium" | "large";
  gridColumns: number;
}

// * API response types
export interface AssetExportResponse {
  success: boolean;
  data?: ExportedAsset;
  error?: string;
  warnings?: string[];
}

// * Batch export response
export interface BatchExportResponse {
  success: boolean;
  data?: BatchExportResult;
  error?: string;
  jobId?: string; // For tracking long-running operations
}

// * Webhook payload for export completion
export interface ExportWebhookPayload {
  eventType: "export.completed" | "export.failed" | "batch.completed";
  timestamp: string;
  projectId: string;
  userId: string;
  data: {
    exportId?: string;
    batchId?: string;
    asset?: ExportedAsset;
    batchResult?: BatchExportResult;
    error?: string;
  };
}

// * Export template for reusable configurations
export interface ExportTemplate {
  id: string;
  name: string;
  description?: string;
  configs: ExportConfiguration[];
  project_id: string;
  created_by: string;
  created_at: string;
  is_default: boolean;
  usage_count: number;
}

// * Asset comparison data
export interface AssetComparison {
  original: {
    width: number;
    height: number;
    format: string;
    size: number;
  };
  exported: {
    width: number;
    height: number;
    format: ExportFormat;
    size: number;
    scale: ResolutionScale;
  };
  compressionRatio: number;
  qualityScore?: number; // If available from analysis
}

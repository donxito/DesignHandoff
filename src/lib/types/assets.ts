import { Database } from './supabase';

export type DbAsset = Database['public']['Tables']['design_files']['Row'];

export type AssetType = 'icon' | 'image' | 'illustration';

export interface Asset extends DbAsset {
  // Extended properties
  width?: number;
  height?: number;
  file_size?: number;
}

export interface AssetMetadata {
  width?: number;
  height?: number;
  format?: string;
  size: number;
}

export interface ExtractAssetParams {
  designFileId: string;
  name: string;
  type: AssetType;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}
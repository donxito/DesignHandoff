import { supabase } from "@/lib/supabase/client";
import { Tables } from "@/lib/types/database";
import {
  processImage,
  cropImage,
  optimizeImageSize,
  type ExportFormat,
  type ResolutionScale,
  type ProcessedImageResult,
} from "@/lib/utils/imageProcessing";

export interface ExportAssetParams {
  designFileId: string;
  imageUrl: string;
  name: string;
  format: ExportFormat;
  scale?: ResolutionScale;
  quality?: number;
  cropArea?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  maxSizeKB?: number;
}

export type ExportedAsset = Tables<"exported_assets">;

export interface BatchExportParams {
  designFileId: string;
  imageUrl: string;
  baseName: string;
  formats: ExportFormat[];
  scales: ResolutionScale[];
  quality?: number;
  cropArea?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface BatchExportResult {
  successful: ExportedAsset[];
  failed: {
    config: { format: ExportFormat; scale: ResolutionScale };
    error: string;
  }[];
  totalProcessed: number;
  totalSuccessful: number;
  totalFailed: number;
}

class AssetExportService {
  /**
   * Exports a single asset with specified parameters
   */
  async exportAsset(params: ExportAssetParams): Promise<ExportedAsset> {
    try {
      // Get current user session
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error("Authentication required");
      }

      const userId = sessionData.session.user.id;

      // Get project ID from design file
      const { data: designFile, error: designFileError } = await supabase
        .from("design_files")
        .select("project_id")
        .eq("id", params.designFileId)
        .single();

      if (designFileError || !designFile) {
        throw new Error("Design file not found");
      }

      // Process the image
      let processedImage: ProcessedImageResult;

      if (params.cropArea) {
        processedImage = await cropImage(params.imageUrl, params.cropArea, {
          format: params.format,
          quality: params.quality,
          scale: params.scale,
        });
      } else {
        processedImage = await processImage(params.imageUrl, {
          format: params.format,
          quality: params.quality,
          scale: params.scale,
        });
      }

      // Optimize if max size is specified
      if (params.maxSizeKB && processedImage.size > params.maxSizeKB * 1024) {
        processedImage = await optimizeImageSize(
          params.imageUrl,
          params.maxSizeKB,
          {
            format: params.format,
            quality: params.quality,
            scale: params.scale,
          }
        );
      }

      // Generate file path for storage
      const timestamp = new Date().getTime();
      const fileName = `${params.name.replace(/\s+/g, "-")}-${params.scale}x.${params.format}`;
      const filePath = `exported-assets/${designFile.project_id}/${timestamp}-${fileName}`;

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from("exported-assets")
        .upload(filePath, processedImage.blob, {
          contentType: processedImage.blob.type,
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("exported-assets")
        .getPublicUrl(filePath);

      // Create database record
      const { data: assetRecord, error: dbError } = await supabase
        .from("exported_assets")
        .insert({
          design_file_id: params.designFileId,
          project_id: designFile.project_id,
          name: params.name,
          format: params.format,
          scale: params.scale || 1,
          width: processedImage.width,
          height: processedImage.height,
          file_size: processedImage.size,
          file_url: publicUrlData.publicUrl,
          created_by: userId,
        })
        .select()
        .single();

      if (dbError) {
        // Clean up uploaded file if database insert fails
        await supabase.storage.from("exported-assets").remove([filePath]);
        throw dbError;
      }

      return assetRecord;
    } catch (error) {
      throw new Error(
        `Asset export failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Exports multiple formats and resolutions in batch
   */
  async batchExport(params: BatchExportParams): Promise<BatchExportResult> {
    const results = {
      successful: [] as ExportedAsset[],
      failed: [] as {
        config: { format: ExportFormat; scale: ResolutionScale };
        error: string;
      }[],
      totalProcessed: 0,
      totalSuccessful: 0,
      totalFailed: 0,
    };

    // Create all combinations of formats and scales
    const combinations = params.formats.flatMap((format) =>
      params.scales.map((scale) => ({ format, scale }))
    );

    results.totalProcessed = combinations.length;

    // Process each combination
    for (const { format, scale } of combinations) {
      try {
        const exportName = `${params.baseName}-${scale}x`;

        const result = await this.exportAsset({
          designFileId: params.designFileId,
          imageUrl: params.imageUrl,
          name: exportName,
          format,
          scale,
          quality: params.quality,
          cropArea: params.cropArea,
        });

        results.successful.push(result);
        results.totalSuccessful++;
      } catch (error) {
        results.failed.push({
          config: { format, scale },
          error: error instanceof Error ? error.message : "Unknown error",
        });
        results.totalFailed++;
      }
    }

    return results;
  }

  /**
   * Gets all exported assets for a design file
   */
  async getExportedAssets(designFileId: string): Promise<ExportedAsset[]> {
    const { data, error } = await supabase
      .from("exported_assets")
      .select(
        `
        *,
        profiles!exported_assets_created_by_fkey(
          id,
          email,
          full_name
        )
      `
      )
      .eq("design_file_id", designFileId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch exported assets: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Gets all exported assets for a project
   */
  async getProjectAssets(projectId: string): Promise<ExportedAsset[]> {
    const { data, error } = await supabase
      .from("exported_assets")
      .select(
        `
        *,
        design_files!exported_assets_design_file_id_fkey(
          id,
          name
        ),
        profiles!exported_assets_created_by_fkey(
          id,
          email,
          full_name
        )
      `
      )
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch project assets: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Deletes an exported asset
   */
  async deleteExportedAsset(assetId: string): Promise<void> {
    try {
      // Get asset details first
      const { data: asset, error: fetchError } = await supabase
        .from("exported_assets")
        .select("file_url")
        .eq("id", assetId)
        .single();

      if (fetchError || !asset) {
        throw new Error("Asset not found");
      }

      // Extract file path from URL
      const pathMatch = asset.file_url.match(/\/exported-assets\/(.+)$/);
      if (pathMatch && pathMatch[1]) {
        // Delete from storage
        await supabase.storage
          .from("exported-assets")
          .remove([`exported-assets/${pathMatch[1]}`]);
      }

      // Delete database record
      const { error: deleteError } = await supabase
        .from("exported_assets")
        .delete()
        .eq("id", assetId);

      if (deleteError) {
        throw deleteError;
      }
    } catch (error) {
      throw new Error(
        `Failed to delete asset: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Downloads multiple assets as a ZIP file
   */
  async downloadAssetsAsZip(assetIds: string[]): Promise<Blob> {
    try {
      // Get asset details
      const { data: assets, error } = await supabase
        .from("exported_assets")
        .select("name, format, scale, file_url")
        .in("id", assetIds);

      if (error || !assets) {
        throw new Error("Failed to fetch assets for download");
      }

      // This would require a ZIP library like JSZip
      // For now, we'll throw an error indicating this needs implementation
      throw new Error(
        "ZIP download functionality needs JSZip library implementation"
      );
    } catch (error) {
      throw new Error(
        `ZIP download failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
}

// Export singleton instance
export const assetExportService = new AssetExportService();

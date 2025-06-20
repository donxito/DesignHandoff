import { useState, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { assetExportService } from "@/lib/services/assetExport";
import {
  type ExportedAsset,
  type SingleExportParams,
  type BatchExportParams,
  type BatchExportResult,
  type ExportProgress,
  type AssetFilters,
  type AssetStatistics,
  ExportFormat,
  ResolutionScale,
} from "@/lib/types/assetExport";

// Query keys for React Query
export const assetExportKeys = {
  all: ["assetExport"] as const,
  assets: (designFileId: string) =>
    [...assetExportKeys.all, "assets", designFileId] as const,
  projectAssets: (projectId: string) =>
    [...assetExportKeys.all, "projectAssets", projectId] as const,
  statistics: (projectId: string) =>
    [...assetExportKeys.all, "statistics", projectId] as const,
};

// Hook for single asset export
export const useAssetExport = () => {
  const [exportProgress, setExportProgress] = useState<
    Map<string, ExportProgress>
  >(new Map());
  const queryClient = useQueryClient();

  const exportMutation = useMutation({
    mutationFn: async (params: SingleExportParams): Promise<ExportedAsset> => {
      const progressId = `${params.designFileId}-${Date.now()}`;

      // Set initial progress
      setExportProgress((prev) =>
        new Map(prev).set(progressId, {
          id: progressId,
          status: "processing",
          progress: 0,
          currentStep: "Initializing export...",
        })
      );

      try {
        // Update progress
        setExportProgress((prev) =>
          new Map(prev).set(progressId, {
            id: progressId,
            status: "processing",
            progress: 25,
            currentStep: "Processing image...",
          })
        );

        const result = await assetExportService.exportAsset({
          designFileId: params.designFileId,
          imageUrl: params.imageUrl,
          name: params.name,
          format: params.config.format,
          scale: params.config.scale,
          quality: params.config.quality,
          cropArea: params.cropArea,
          maxSizeKB: params.config.maxSizeKB,
        });

        // Update progress to completed
        setExportProgress((prev) =>
          new Map(prev).set(progressId, {
            id: progressId,
            status: "completed",
            progress: 100,
            currentStep: "Export completed",
            result,
          })
        );

        return result;
      } catch (error) {
        // Update progress to failed
        setExportProgress((prev) =>
          new Map(prev).set(progressId, {
            id: progressId,
            status: "failed",
            progress: 0,
            error: error instanceof Error ? error.message : "Export failed",
          })
        );
        throw error;
      }
    },
    onSuccess: (data) => {
      // Invalidate and refetch assets for the design file
      queryClient.invalidateQueries({
        queryKey: assetExportKeys.assets(data.design_file_id),
      });
      queryClient.invalidateQueries({
        queryKey: assetExportKeys.projectAssets(data.project_id),
      });
    },
  });

  const clearProgress = useCallback((progressId: string) => {
    setExportProgress((prev) => {
      const next = new Map(prev);
      next.delete(progressId);
      return next;
    });
  }, []);

  const clearAllProgress = useCallback(() => {
    setExportProgress(new Map());
  }, []);

  return {
    exportAsset: exportMutation.mutateAsync,
    isExporting: exportMutation.isPending,
    error: exportMutation.error,
    exportProgress,
    clearProgress,
    clearAllProgress,
  };
};

// Hook for batch asset export
export const useBatchAssetExport = () => {
  const [batchProgress, setBatchProgress] = useState<
    Map<string, ExportProgress>
  >(new Map());
  const queryClient = useQueryClient();

  const batchExportMutation = useMutation({
    mutationFn: async (
      params: BatchExportParams
    ): Promise<BatchExportResult> => {
      const batchId = `batch-${params.designFileId}-${Date.now()}`;
      const totalConfigs = params.configs.length;

      // Set initial progress
      setBatchProgress((prev) =>
        new Map(prev).set(batchId, {
          id: batchId,
          status: "processing",
          progress: 0,
          currentStep: `Starting batch export (${totalConfigs} configurations)...`,
        })
      );

      try {
        const result = await assetExportService.batchExport({
          designFileId: params.designFileId,
          imageUrl: params.imageUrl,
          baseName: params.baseName,
          formats: params.configs.map((c) => c.format),
          scales: params.configs.map((c) => c.scale),
          quality: params.configs[0]?.quality,
          cropArea: params.cropArea,
        });

        // Update progress to completed
        setBatchProgress((prev) =>
          new Map(prev).set(batchId, {
            id: batchId,
            status: "completed",
            progress: 100,
            currentStep: `Batch export completed (${result.totalSuccessful}/${totalConfigs} successful)`,
          })
        );

        return result;
      } catch (error) {
        // Update progress to failed
        setBatchProgress((prev) =>
          new Map(prev).set(batchId, {
            id: batchId,
            status: "failed",
            progress: 0,
            error:
              error instanceof Error ? error.message : "Batch export failed",
          })
        );
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch assets
      queryClient.invalidateQueries({
        queryKey: assetExportKeys.assets(variables.designFileId),
      });
    },
  });

  return {
    batchExport: batchExportMutation.mutateAsync,
    isBatchExporting: batchExportMutation.isPending,
    error: batchExportMutation.error,
    batchProgress,
    clearBatchProgress: (batchId: string) => {
      setBatchProgress((prev) => {
        const next = new Map(prev);
        next.delete(batchId);
        return next;
      });
    },
  };
};

// Hook to fetch exported assets for a design file
export const useExportedAssets = (designFileId: string) => {
  return useQuery({
    queryKey: assetExportKeys.assets(designFileId),
    queryFn: () => assetExportService.getExportedAssets(designFileId),
    enabled: !!designFileId,
  });
};

// Hook to fetch all exported assets for a project
export const useProjectAssets = (projectId: string, filters?: AssetFilters) => {
  return useQuery({
    queryKey: [...assetExportKeys.projectAssets(projectId), filters],
    queryFn: async () => {
      const assets = await assetExportService.getProjectAssets(projectId);

      // Apply client-side filtering if filters are provided
      if (!filters) return assets;

      return assets.filter((asset) => {
        // Format filter
        if (
          filters.formats &&
          !filters.formats.includes(asset.format as ExportFormat)
        ) {
          return false;
        }

        // Scale filter
        if (
          filters.scales &&
          !filters.scales.includes(asset.scale as ResolutionScale)
        ) {
          return false;
        }

        // Date range filter
        if (filters.dateRange && asset.created_at) {
          const assetDate = new Date(asset.created_at);
          if (
            assetDate < filters.dateRange.start ||
            assetDate > filters.dateRange.end
          ) {
            return false;
          }
        }

        // Size range filter
        if (filters.sizeRange) {
          if (
            asset.file_size < filters.sizeRange.min ||
            asset.file_size > filters.sizeRange.max
          ) {
            return false;
          }
        }

        // Dimension range filter
        if (filters.dimensionRange) {
          if (
            asset.width < filters.dimensionRange.minWidth ||
            asset.width > filters.dimensionRange.maxWidth ||
            asset.height < filters.dimensionRange.minHeight ||
            asset.height > filters.dimensionRange.maxHeight
          ) {
            return false;
          }
        }

        // Created by filter
        if (filters.createdBy && asset.created_by !== filters.createdBy) {
          return false;
        }

        // Search term filter
        if (filters.searchTerm) {
          const searchLower = filters.searchTerm.toLowerCase();
          if (!asset.name.toLowerCase().includes(searchLower)) {
            return false;
          }
        }

        return true;
      });
    },
    enabled: !!projectId,
  });
};

// Hook to delete an exported asset
export const useDeleteExportedAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: assetExportService.deleteExportedAsset,
    onSuccess: () => {
      // Invalidate all asset queries
      queryClient.invalidateQueries({
        queryKey: assetExportKeys.all,
      });
    },
  });
};

// Hook for asset statistics (could be moved to a separate analytics hook)
export const useAssetStatistics = (projectId: string) => {
  return useQuery({
    queryKey: assetExportKeys.statistics(projectId),
    queryFn: async (): Promise<AssetStatistics> => {
      const assets = await assetExportService.getProjectAssets(projectId);

      const totalAssets = assets.length;
      const totalSizeMB =
        assets.reduce((sum, asset) => sum + asset.file_size, 0) / (1024 * 1024);

      const formatBreakdown = assets.reduce(
        (acc, asset) => {
          acc[asset.format] = (acc[asset.format] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      const scaleBreakdown = assets.reduce(
        (acc, asset) => {
          acc[asset.scale] = (acc[asset.scale] || 0) + 1;
          return acc;
        },
        {} as Record<number, number>
      );

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentExports = assets.filter(
        (asset) => asset.created_at && new Date(asset.created_at) > sevenDaysAgo
      ).length;

      const averageFileSize =
        totalAssets > 0
          ? assets.reduce((sum, asset) => sum + asset.file_size, 0) /
            totalAssets
          : 0;

      const popularFormats = Object.entries(formatBreakdown)
        .map(([format, count]) => ({ format: format as ExportFormat, count }))
        .sort((a, b) => b.count - a.count);

      return {
        totalAssets,
        totalSizeMB,
        formatBreakdown: formatBreakdown as Record<ExportFormat, number>,
        scaleBreakdown: scaleBreakdown as Record<ResolutionScale, number>,
        recentExports,
        averageFileSize,
        popularFormats,
      };
    },
    enabled: !!projectId,
  });
};

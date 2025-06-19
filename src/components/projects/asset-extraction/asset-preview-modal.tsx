"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from "@/components/retroui/Dialog";
import { Button } from "@/components/retroui/Button";
import { Input } from "@/components/retroui/Input";
import { Label } from "@/components/retroui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/retroui/Select";
import { Text } from "@/components/retroui/Text";
import { Badge } from "@/components/retroui/Badge";
import { Card } from "@/components/retroui/Card";
import { Download, X, Crop, Image as ImageIcon } from "lucide-react";
import {
  AssetSelection,
  AssetFormat,
  AssetExportOptions,
  //AssetPreviewData,
} from "@/lib/types/asset-extraction";
import {
  cropImageFromElement,
  downloadAsset,
  generateAssetFilename,
  boundsToPixels,
} from "@/lib/utils/asset-extraction";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

interface AssetPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  selection: AssetSelection;
  imageElement: HTMLImageElement;
  projectName?: string;
  onUpdateSelection?: (selection: AssetSelection) => void;
}

export default function AssetPreviewModal({
  isOpen,
  onClose,
  selection,
  imageElement,
  projectName,
  onUpdateSelection,
}: AssetPreviewModalProps) {
  const [assetName, setAssetName] = useState(selection.name || "");
  const [selectedFormat, setSelectedFormat] = useState<AssetFormat>(
    (selection.format as AssetFormat) || "png"
  );
  const [exportScale, setExportScale] = useState<number>(1);
  const [previewDataUrl, setPreviewDataUrl] = useState<string>("");
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const { toast } = useToast();

  // * Generate a preview of the cropped area
  const generatePreview = useCallback(async () => {
    if (!imageElement) return;

    setIsGeneratingPreview(true);
    try {
      const dataUrl = await cropImageFromElement(imageElement, selection, {
        format: "png", // Always use PNG for preview to maintain quality
        scale: 1,
      });
      setPreviewDataUrl(dataUrl);
    } catch (error) {
      console.error("Error generating preview:", error);

      // Provide specific error messages for different types of CORS errors
      let errorMessage = "Failed to generate asset preview";
      let errorDescription = "An unexpected error occurred";

      if (error instanceof Error) {
        if (
          error.message.includes("cross-origin") ||
          error.message.includes("tainted")
        ) {
          errorMessage = "Cross-Origin Image Error";
          errorDescription =
            "This image cannot be processed due to CORS restrictions. Try uploading the image to the project instead.";
        } else if (error.message.includes("CORS")) {
          errorMessage = "Image Access Error";
          errorDescription =
            "Unable to process this external image. Please upload it to your project.";
        } else {
          errorDescription = error.message;
        }
      }

      toast({
        message: errorMessage,
        description: errorDescription,
        variant: "error",
      });
    } finally {
      setIsGeneratingPreview(false);
    }
  }, [imageElement, selection, toast]);

  // * Generate preview when modal opens or selection changes
  useEffect(() => {
    if (isOpen && imageElement) {
      generatePreview();
    }
  }, [isOpen, generatePreview, imageElement]);

  // * Handle asset export and download
  const handleExportAsset = async () => {
    if (!imageElement || !assetName.trim()) return;

    setIsExporting(true);
    try {
      const exportOptions: AssetExportOptions = {
        format: selectedFormat,
        scale: exportScale,
        quality: selectedFormat === "jpeg" ? 0.9 : undefined,
      };

      const dataUrl = await cropImageFromElement(
        imageElement,
        selection,
        exportOptions
      );
      const filename = generateAssetFilename(
        assetName.trim(),
        selectedFormat,
        projectName
      );

      downloadAsset(dataUrl, filename);

      // Update selection with the name and format
      if (onUpdateSelection) {
        onUpdateSelection({
          ...selection,
          name: assetName.trim(),
          format: selectedFormat,
        });
      }

      toast({
        message: "Asset Exported",
        description: `Successfully exported ${filename}`,
        variant: "success",
      });

      onClose();
    } catch (error) {
      console.error("Error exporting asset:", error);

      // Provide specific error messages for export errors
      let errorMessage = "Export Error";
      let errorDescription = "Failed to export asset";

      if (error instanceof Error) {
        if (
          error.message.includes("cross-origin") ||
          error.message.includes("tainted")
        ) {
          errorMessage = "Cross-Origin Export Error";
          errorDescription =
            "Cannot export from external images due to CORS restrictions. Upload the image to your project first.";
        } else if (error.message.includes("CORS")) {
          errorMessage = "Image Access Error";
          errorDescription =
            "Unable to process this external image for export.";
        } else {
          errorDescription = error.message;
        }
      }

      toast({
        message: errorMessage,
        description: errorDescription,
        variant: "error",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // * Calculate asset dimensions in pixels
  const getAssetDimensions = () => {
    if (!imageElement) return { width: 0, height: 0 };

    const pixelBounds = boundsToPixels(
      selection.bounds,
      imageElement.naturalWidth,
      imageElement.naturalHeight
    );

    return {
      width: Math.round(pixelBounds.width * exportScale),
      height: Math.round(pixelBounds.height * exportScale),
    };
  };

  const dimensions = getAssetDimensions();

  return (
    <Dialog defaultOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl h-[80vh] rounded-lg flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <Text
              as="h2"
              className="text-xl font-bold font-pixel text-black dark:text-white"
            >
              Extract Asset
            </Text>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 flex gap-6 min-h-0">
          {/* Preview Section */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <Crop className="h-4 w-4" />
              <Text className="font-medium">Asset Preview</Text>
              <Badge variant="secondary" size="sm">
                {dimensions.width} × {dimensions.height}px
              </Badge>
            </div>

            <Card className="flex-1 p-4 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
              {isGeneratingPreview ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-black dark:border-white border-t-transparent"></div>
                  <Text className="text-sm text-gray-500">
                    Generating preview...
                  </Text>
                  <Text className="text-xs text-gray-400">
                    Processing cross-origin image if needed
                  </Text>
                </div>
              ) : previewDataUrl ? (
                <div className="max-w-full max-h-full flex items-center justify-center">
                  <Image
                    src={previewDataUrl}
                    alt="Asset preview"
                    className="max-w-full max-h-full object-contain border-2 border-black dark:border-white rounded"
                    style={{
                      imageRendering:
                        dimensions.width < 100 || dimensions.height < 100
                          ? "pixelated"
                          : "auto",
                    }}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-500">
                  <ImageIcon className="h-12 w-12" />
                  <Text>Preview not available</Text>
                </div>
              )}
            </Card>
          </div>

          {/* Export Settings */}
          <div className="w-80 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              <Text className="font-medium">Export Settings</Text>
            </div>

            <div className="space-y-4">
              {/* Asset Name */}
              <div className="space-y-2">
                <Label htmlFor="asset-name">Asset Name</Label>
                <Input
                  id="asset-name"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  placeholder="Enter asset name..."
                  className="font-mono"
                />
              </div>

              {/* Format Selection */}
              <div className="space-y-2">
                <Label htmlFor="asset-format">Format</Label>
                <Select
                  value={selectedFormat}
                  onValueChange={(value: AssetFormat) =>
                    setSelectedFormat(value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="png">PNG (Lossless)</SelectItem>
                    <SelectItem value="jpg">JPEG (Compressed)</SelectItem>
                    <SelectItem value="webp">WebP (Modern)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Export Scale */}
              <div className="space-y-2">
                <Label htmlFor="export-scale">Export Scale</Label>
                <Select
                  value={exportScale.toString()}
                  onValueChange={(value) => setExportScale(Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select scale" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.5">0.5x (Half size)</SelectItem>
                    <SelectItem value="1">1x (Original)</SelectItem>
                    <SelectItem value="2">2x (Double)</SelectItem>
                    <SelectItem value="3">3x (Triple)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Asset Info */}
              <Card className="p-3 bg-gray-50 dark:bg-gray-900">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <Text className="text-gray-600 dark:text-gray-400">
                      Dimensions:
                    </Text>
                    <Text className="font-mono">
                      {dimensions.width} × {dimensions.height}px
                    </Text>
                  </div>
                  <div className="flex justify-between">
                    <Text className="text-gray-600 dark:text-gray-400">
                      Format:
                    </Text>
                    <Text className="font-mono uppercase">
                      {selectedFormat}
                    </Text>
                  </div>
                  <div className="flex justify-between">
                    <Text className="text-gray-600 dark:text-gray-400">
                      Scale:
                    </Text>
                    <Text className="font-mono">{exportScale}x</Text>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        <DialogFooter>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleExportAsset}
              disabled={!assetName.trim() || isExporting}
              className="gap-2"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Export Asset
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

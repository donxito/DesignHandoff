"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/retroui/Button";
import { Badge } from "@/components/retroui/Badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/retroui/Card";
import { Separator } from "@/components/retroui/Separator";
import { Download, Crop, Eye, Info, FileImage, Package } from "lucide-react";
import { AssetExportDialog } from "@/components/assets/AssetExportDialog";
import { ExportedAssetsList } from "@/components/assets/ExportedAssetsList";
import { useExportedAssets } from "@/hooks/useAssetExport";
import type { DesignFile } from "@/lib/types/designFile";
import type { CropArea } from "@/lib/types/assetExport";

interface FileViewerWithExportProps {
  designFile: DesignFile;
  onClose?: () => void;
}

export function FileViewerWithExport({
  designFile,
  onClose,
}: FileViewerWithExportProps) {
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showExportedAssets, setShowExportedAssets] = useState(false);
  const [cropMode, setCropMode] = useState(false);
  const [cropArea, setCropArea] = useState<CropArea | undefined>();

  // Fetch existing exported assets
  const { data: exportedAssets = [], isLoading: isLoadingAssets } =
    useExportedAssets(designFile.id);

  const handleQuickExport = useCallback(() => {
    setShowExportDialog(true);
  }, []);

  const handleCropAndExport = useCallback(() => {
    setCropMode(true);
    // In a real implementation, this would enable a cropping overlay
    // For now, we'll simulate a crop area
    const simulatedCropArea: CropArea = {
      x: 50,
      y: 50,
      width: 200,
      height: 200,
    };
    setCropArea(simulatedCropArea);
    setShowExportDialog(true);
  }, []);

  const isImageFile =
    designFile.file_type?.startsWith("image/") ||
    ["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(
      designFile.file_name.split(".").pop()?.toLowerCase() || ""
    );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">{designFile.file_name}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline">{designFile.file_type || "Unknown"}</Badge>
            {designFile.file_size && (
              <Badge variant="outline">
                {(designFile.file_size / (1024 * 1024)).toFixed(1)} MB
              </Badge>
            )}
            {exportedAssets.length > 0 && (
              <Badge variant="secondary">
                {exportedAssets.length} exported asset
                {exportedAssets.length !== 1 ? "s" : ""}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Export Button */}
          {isImageFile && (
            <Button onClick={handleQuickExport}>
              <Download className="h-4 w-4 mr-2" />
              Export Asset
            </Button>
          )}

          {/* View Assets Button */}
          {isImageFile && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExportedAssets(!showExportedAssets)}
            >
              <Package className="h-4 w-4 mr-2" />
              Assets ({exportedAssets.length})
            </Button>
          )}

          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {/* File Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                File Preview
                {cropMode && <Badge variant="outline">Crop Mode Active</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isImageFile ? (
                <div className="relative max-w-full max-h-[600px] overflow-hidden rounded-lg border">
                  <Image
                    src={designFile.file_url}
                    alt={designFile.file_name}
                    width={800}
                    height={600}
                    className="object-contain w-full h-auto"
                    style={{ maxHeight: "600px" }}
                  />

                  {/* Crop Overlay (if in crop mode) */}
                  {cropMode && cropArea && (
                    <div
                      className="absolute border-2 border-blue-500 bg-blue-500/20"
                      style={{
                        left: `${cropArea.x}px`,
                        top: `${cropArea.y}px`,
                        width: `${cropArea.width}px`,
                        height: `${cropArea.height}px`,
                      }}
                    >
                      <div className="absolute top-0 left-0 bg-blue-500 text-white text-xs px-1">
                        Crop Area
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                  <FileImage className="h-16 w-16 mb-4" />
                  <p>Preview not available for this file type</p>
                  <p className="text-sm">File: {designFile.file_name}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Exported Assets List */}
          {showExportedAssets && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Exported Assets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ExportedAssetsList
                  assets={exportedAssets}
                  isLoading={isLoadingAssets}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* File Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                File Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm font-medium">Name</div>
                <div className="text-sm text-muted-foreground">
                  {designFile.file_name}
                </div>
              </div>

              <Separator />

              <div>
                <div className="text-sm font-medium">Type</div>
                <div className="text-sm text-muted-foreground">
                  {designFile.file_type || "Unknown"}
                </div>
              </div>

              {designFile.file_size && (
                <>
                  <Separator />
                  <div>
                    <div className="text-sm font-medium">Size</div>
                    <div className="text-sm text-muted-foreground">
                      {(designFile.file_size / (1024 * 1024)).toFixed(1)} MB
                    </div>
                  </div>
                </>
              )}

              <Separator />

              <div>
                <div className="text-sm font-medium">Uploaded</div>
                <div className="text-sm text-muted-foreground">
                  {designFile.created_at
                    ? new Date(designFile.created_at).toLocaleDateString()
                    : "Unknown"}
                </div>
              </div>

              {designFile.uploader && (
                <>
                  <Separator />
                  <div>
                    <div className="text-sm font-medium">Uploaded by</div>
                    <div className="text-sm text-muted-foreground">
                      {designFile.uploader.full_name ||
                        designFile.uploader.email}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Export Statistics */}
          {exportedAssets.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Export Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm font-medium">Total Exports</div>
                  <div className="text-sm text-muted-foreground">
                    {exportedAssets.length}
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="text-sm font-medium">Total Size</div>
                  <div className="text-sm text-muted-foreground">
                    {(
                      exportedAssets.reduce(
                        (sum, asset) => sum + asset.file_size,
                        0
                      ) /
                      (1024 * 1024)
                    ).toFixed(1)}{" "}
                    MB
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="text-sm font-medium">Formats</div>
                  <div className="flex gap-1 mt-1">
                    {[
                      ...new Set(exportedAssets.map((asset) => asset.format)),
                    ].map((format) => (
                      <Badge key={format} variant="outline" className="text-xs">
                        {format.toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="text-sm font-medium">Resolutions</div>
                  <div className="flex gap-1 mt-1">
                    {[
                      ...new Set(exportedAssets.map((asset) => asset.scale)),
                    ].map((scale) => (
                      <Badge key={scale} variant="outline" className="text-xs">
                        {scale}x
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          {isImageFile && (
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleQuickExport}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export as PNG
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    // Quick export as JPG
                    setShowExportDialog(true);
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export as JPG
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleCropAndExport}
                >
                  <Crop className="h-4 w-4 mr-2" />
                  Crop & Export
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Asset Export Dialog */}
      <AssetExportDialog
        isOpen={showExportDialog}
        onClose={() => {
          setShowExportDialog(false);
          setCropMode(false);
          setCropArea(undefined);
        }}
        designFileId={designFile.id}
        imageUrl={designFile.file_url}
        defaultName={designFile.file_name.replace(/\.[^/.]+$/, "")} // Remove extension
        cropArea={cropArea}
      />
    </div>
  );
}

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/retroui/Button";
import { Card } from "@/components/retroui/Card";
import { Text } from "@/components/retroui/Text";
import { Badge } from "@/components/retroui/Badge";
import {
  Ruler,
  Eye,
  X,
  //Copy,
  Palette,
  //Pipette,
  AlertCircle,
  Loader2,
  Type,
  FileDown,
  Crop,
  Package,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ColorPalettePanel from "@/components/projects/color-palette-panel";
import TypographyPanel from "@/components/projects/typography-panel";
import {
  ColorInfo,
  //extractColorFromCanvas,
  //areColorsSimilar,
} from "@/lib/utils/color-utils";
import {
  TypographyProperties,
  //generateSampleTypography,
} from "@/lib/utils/typography-utils";
import {
  createDesignSpecification,
  //exportComprehensiveSpec,
  generateDownloadableFile,
  downloadFile,
  PrintableSpecification,
} from "@/lib/utils/spec-export-utils";
import Image from "next/image";

// Import asset extraction components and types
import AssetSelectionOverlay from "./asset-extraction/asset-selection-overlay";
import AssetPreviewModal from "./asset-extraction/asset-preview-modal";
import { AssetSelection } from "@/lib/types/asset-extraction";

interface ColorWithPosition extends ColorInfo {
  position: Point;
  id: string;
}

interface Point {
  x: number;
  y: number;
}

interface Measurement {
  id: string;
  startPoint: Point;
  endPoint: Point;
  distance: number;
  angle: number;
}

interface DesignSpecViewerProps {
  imageUrl: string;
  imageName: string;
  projectName?: string;
  onClose?: () => void;
}

// Updated to include asset extraction mode
type InspectMode =
  | "measure"
  | "color"
  | "typography"
  | "spacing"
  | "grid"
  | "assets";

export default function DesignSpecViewer({
  imageUrl,
  imageName,
  projectName,
  onClose,
}: DesignSpecViewerProps) {
  const [isInspectMode, setIsInspectMode] = useState(false);
  const [activeMode, setActiveMode] = useState<InspectMode>("measure");
  const [measurements] = useState<Measurement[]>([]);
  const [extractedColors, setExtractedColors] = useState<ColorWithPosition[]>(
    []
  );
  const [extractedTypography, setExtractedTypography] = useState<
    TypographyProperties[]
  >([]);

  const [showExportOptions, setShowExportOptions] = useState(false);

  // Asset extraction states
  const [assetSelections, setAssetSelections] = useState<AssetSelection[]>([]);
  const [activeAssetSelection, setActiveAssetSelection] = useState<
    string | undefined
  >();
  const [showAssetPreview, setShowAssetPreview] = useState(false);
  const [selectedAssetForPreview, setSelectedAssetForPreview] =
    useState<AssetSelection | null>(null);

  // Image processing states
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageDimensions, setImageDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [corsProcessedImageUrl, setCorsProcessedImageUrl] = useState<
    string | null
  >(null);
  const [isProcessingCors, setIsProcessingCors] = useState(false);
  const [corsError, setCorsError] = useState(false);
  const [isCrossOriginImage, setIsCrossOriginImage] = useState(false);

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const { toast } = useToast();

  // Check if image is from different origin
  useEffect(() => {
    try {
      const imageUrlObj = new URL(imageUrl);
      const currentOrigin = window.location.origin;
      setIsCrossOriginImage(imageUrlObj.origin !== currentOrigin);
    } catch (error) {
      console.error("Error checking if image is cross-origin:", error);
      setIsCrossOriginImage(false);
    }
  }, [imageUrl]);

  // Process cross-origin images for color extraction
  const processCorsImage = useCallback(async () => {
    if (!isCrossOriginImage || corsProcessedImageUrl || isProcessingCors)
      return;

    setIsProcessingCors(true);
    setCorsError(false);

    try {
      const response = await fetch("/api/process-cors-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl }),
      });

      if (!response.ok) throw new Error("Failed to process image");

      const blob = await response.blob();
      const processedUrl = URL.createObjectURL(blob);
      setCorsProcessedImageUrl(processedUrl);
    } catch (error) {
      console.error("Error processing CORS image:", error);
      setCorsError(true);
    } finally {
      setIsProcessingCors(false);
    }
  }, [imageUrl, isCrossOriginImage, corsProcessedImageUrl, isProcessingCors]);

  // Setup canvas for color extraction
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img || !imageLoaded) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });

    try {
      ctx.drawImage(img, 0, 0);
    } catch (error) {
      console.error("Error drawing image to canvas:", error);
      if (isCrossOriginImage && !corsProcessedImageUrl) {
        processCorsImage();
      }
    }
  }, [
    imageLoaded,
    isCrossOriginImage,
    corsProcessedImageUrl,
    processCorsImage,
  ]);

  // Handle image load
  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // Setup canvas when image loads
  useEffect(() => {
    if (imageLoaded) {
      setupCanvas();
    }
  }, [imageLoaded, setupCanvas]);

  // Handle asset extraction preview
  const handleAssetPreview = (selection: AssetSelection) => {
    setSelectedAssetForPreview(selection);
    setShowAssetPreview(true);
  };

  // Handle double-click on asset selection to preview
  const handleAssetDoubleClick = (selectionId: string) => {
    const selection = assetSelections.find((s) => s.id === selectionId);
    if (selection) {
      handleAssetPreview(selection);
    }
  };

  // Clear all asset selections
  const clearAssetSelections = () => {
    setAssetSelections([]);
    setActiveAssetSelection(undefined);
  };

  // Print handler
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Design-Spec-${imageName}`,
    pageStyle: `
      @page {
        size: A4;
        margin: 20mm;
      }
    `,
  });

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="border-b-3 border-black dark:border-white bg-white dark:bg-gray-900 p-4">
        <div className="flex items-center justify-between">
          <div>
            <Text
              as="h1"
              className="text-2xl font-bold font-pixel text-black dark:text-white"
            >
              {imageName}
            </Text>
            {projectName && (
              <Text className="text-gray-600 dark:text-gray-400 mt-1">
                Project: {projectName}
              </Text>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Export options */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExportOptions(!showExportOptions)}
                className="gap-2"
              >
                <FileDown className="h-4 w-4" />
                Export
              </Button>

              {showExportOptions && (
                <div className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-800 border-2 border-black dark:border-white rounded-lg shadow-lg z-10 min-w-48">
                  <div className="p-2 space-y-1">
                    <Button
                      variant="link"
                      size="sm"
                      onClick={handlePrint}
                      className="w-full justify-start"
                    >
                      Print to PDF
                    </Button>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => {
                        const spec = createDesignSpecification(
                          imageName,
                          extractedColors,
                          extractedTypography,
                          measurements,
                          imageUrl,
                          projectName,
                          imageDimensions || undefined
                        );

                        const { content, filename } = generateDownloadableFile(
                          spec,
                          {
                            format: "pdf",
                            includeColors: true,
                            includeTypography: true,
                            includeMeasurements: true,
                            includeMetadata: true,
                          }
                        );

                        downloadFile(content, filename, "text/html");

                        toast({
                          message: "PDF specification exported",
                          description:
                            "HTML file downloaded - open and print to PDF",
                        });

                        setShowExportOptions(false);
                      }}
                      className="w-full justify-start"
                    >
                      PDF Report (HTML)
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Inspect mode toggle */}
            <Button
              variant={isInspectMode ? "primary" : "outline"}
              size="sm"
              onClick={() => setIsInspectMode(!isInspectMode)}
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              {isInspectMode ? "Exit Inspect" : "Inspect Mode"}
            </Button>

            {/* Close button */}
            {onClose && (
              <Button variant="outline" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Inspection mode controls */}
      {isInspectMode && (
        <div className="flex flex-col gap-3 p-3 border-b-3 border-black dark:border-white bg-gray-50 dark:bg-gray-800/50">
          {/* Main mode buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant={activeMode === "measure" ? "primary" : "outline"}
              size="sm"
              onClick={() => setActiveMode("measure")}
              className="gap-2"
            >
              <Ruler className="h-4 w-4" />
              Measure
            </Button>

            <Button
              variant={activeMode === "color" ? "primary" : "outline"}
              size="sm"
              onClick={() => setActiveMode("color")}
              className="gap-2"
            >
              <Palette className="h-4 w-4" />
              Colors
            </Button>

            <Button
              variant={activeMode === "typography" ? "primary" : "outline"}
              size="sm"
              onClick={() => setActiveMode("typography")}
              className="gap-2"
            >
              <Type className="h-4 w-4" />
              Typography
            </Button>

            <Button
              variant={activeMode === "assets" ? "primary" : "outline"}
              size="sm"
              onClick={() => setActiveMode("assets")}
              className="gap-2"
            >
              <Crop className="h-4 w-4" />
              <Package className="h-4 w-4" />
              Extract Assets
            </Button>
          </div>

          {/* Asset mode controls */}
          {activeMode === "assets" && (
            <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-900 border-2 border-black dark:border-white rounded">
              <Text className="text-sm font-medium">
                Draw rectangles to select assets for extraction
              </Text>
              {assetSelections.length > 0 && (
                <>
                  <Badge variant="secondary" size="sm">
                    {assetSelections.length} selected
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAssetSelections}
                    className="ml-auto"
                  >
                    Clear All
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex min-h-0">
        {/* Image container */}
        <div className="flex-1 relative bg-gray-100 dark:bg-gray-800 overflow-hidden">
          <div
            ref={containerRef}
            className="w-full h-full flex items-center justify-center relative"
          >
            {/* Main image */}
            <Image
              ref={imageRef}
              src={corsProcessedImageUrl || imageUrl}
              alt={imageName}
              fill
              className="object-contain"
              onLoad={handleImageLoad}
              unoptimized={isCrossOriginImage}
            />

            {/* Canvas for color extraction (hidden) */}
            <canvas
              ref={canvasRef}
              className="hidden"
              onError={(e) => {
                console.error("Canvas error:", e);
                if (isCrossOriginImage && !corsProcessedImageUrl) {
                  processCorsImage();
                }
              }}
            />

            {/* Asset Selection Overlay */}
            {isInspectMode && activeMode === "assets" && (
              <AssetSelectionOverlay
                imageElement={imageRef.current}
                containerElement={containerRef.current}
                selections={assetSelections}
                activeSelectionId={activeAssetSelection}
                onSelectionsChange={setAssetSelections}
                onActiveSelectionChange={setActiveAssetSelection}
                isEnabled={true}
              />
            )}

            {/* CORS processing indicator */}
            {isProcessingCors && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <Card className="p-4 flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <Text>Processing image for color extraction...</Text>
                </Card>
              </div>
            )}

            {/* CORS error indicator */}
            {corsError && (
              <div className="absolute top-4 right-4">
                <Card className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                    <Text className="text-sm text-yellow-700 dark:text-yellow-300">
                      Color extraction unavailable for this image
                    </Text>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* Side panels */}
        {isInspectMode && (
          <div className="w-80 border-l-3 border-black dark:border-white bg-white dark:bg-gray-900 overflow-y-auto">
            {/* Color palette panel */}
            {activeMode === "color" && (
              <ColorPalettePanel
                colors={extractedColors}
                onColorRemove={(colorId) => {
                  setExtractedColors((prev) =>
                    prev.filter((c) => c.id !== colorId.toString())
                  );
                }}
                onClearAll={() => setExtractedColors([])}
              />
            )}

            {/* Typography panel */}
            {activeMode === "typography" && (
              <TypographyPanel
                typography={extractedTypography}
                onTypographyRemove={(index) => {
                  setExtractedTypography((prev) =>
                    prev.filter((_, i) => i !== index)
                  );
                }}
                onClearAll={() => setExtractedTypography([])}
                onTypographyUpdate={() => {}}
              />
            )}

            {/* Asset extraction panel */}
            {activeMode === "assets" && (
              <div className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Crop className="h-5 w-5" />
                  <Text className="font-semibold">Asset Selections</Text>
                </div>

                {assetSelections.length === 0 ? (
                  <Card className="p-4 text-center">
                    <Package className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <Text className="text-sm text-gray-500 dark:text-gray-400">
                      No assets selected yet. Draw rectangles on the image to
                      select areas for extraction.
                    </Text>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {assetSelections.map((selection, index) => (
                      <Card
                        key={selection.id}
                        className={`p-3 cursor-pointer transition-colors ${
                          activeAssetSelection === selection.id
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                            : "hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                        onClick={() => setActiveAssetSelection(selection.id)}
                        onDoubleClick={() =>
                          handleAssetDoubleClick(selection.id)
                        }
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <Text className="font-medium">
                              {selection.name || `Asset ${index + 1}`}
                            </Text>
                            <Text className="text-xs text-gray-500 dark:text-gray-400">
                              {Math.round(selection.bounds.width)}% ×{" "}
                              {Math.round(selection.bounds.height)}%
                            </Text>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAssetPreview(selection);
                            }}
                          >
                            Preview
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Asset Preview Modal */}
      {showAssetPreview && selectedAssetForPreview && imageRef.current && (
        <AssetPreviewModal
          isOpen={showAssetPreview}
          onClose={() => {
            setShowAssetPreview(false);
            setSelectedAssetForPreview(null);
          }}
          selection={selectedAssetForPreview}
          imageElement={imageRef.current}
          projectName={projectName}
          onUpdateSelection={(updatedSelection) => {
            setAssetSelections((prev) =>
              prev.map((s) =>
                s.id === updatedSelection.id ? updatedSelection : s
              )
            );
          }}
        />
      )}

      {/* Hidden printable content */}
      <div ref={printRef} className="hidden">
        <PrintableSpecification
          spec={createDesignSpecification(
            imageName,
            extractedColors,
            extractedTypography,
            measurements,
            imageUrl,
            projectName,
            imageDimensions || undefined
          )}
        />
      </div>
    </div>
  );
}

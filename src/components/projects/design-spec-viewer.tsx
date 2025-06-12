"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/retroui/Button";
import { Card } from "@/components/retroui/Card";
import { Text } from "@/components/retroui/Text";
import { Badge } from "@/components/retroui/Badge";
import {
  Ruler,
  Eye,
  X,
  Copy,
  Palette,
  Pipette,
  AlertCircle,
  Loader2,
  Type,
  FileDown,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ColorPalettePanel from "@/components/projects/color-palette-panel";
import TypographyPanel from "@/components/projects/typography-panel";
import {
  ColorInfo,
  extractColorFromCanvas,
  areColorsSimilar,
} from "@/lib/utils/color-utils";
import {
  TypographyProperties,
  generateSampleTypography,
} from "@/lib/utils/typography-utils";
import {
  createDesignSpecification,
  exportComprehensiveSpec,
} from "@/lib/utils/spec-export-utils";
import Image from "next/image";

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

type InspectMode = "measure" | "color" | "typography";

export default function DesignSpecViewer({
  imageUrl,
  imageName,
  projectName,
  onClose,
}: DesignSpecViewerProps) {
  const [isInspectMode, setIsInspectMode] = useState(false);
  const [activeMode, setActiveMode] = useState<InspectMode>("measure");
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [extractedColors, setExtractedColors] = useState<ColorWithPosition[]>(
    []
  );
  const [extractedTypography, setExtractedTypography] = useState<
    TypographyProperties[]
  >([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [currentMousePos, setCurrentMousePos] = useState<Point | null>(null);
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [showTypographyPanel, setShowTypographyPanel] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);

  // * Image processing states
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

  // * Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { toast } = useToast();

  // * Check if image is from different origin
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

  // * Process cross-origin images for color extraction
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

  // * Setup canvas for color extraction
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

  useEffect(() => {
    setupCanvas();
  }, [setupCanvas]);

  useEffect(() => {
    if (corsProcessedImageUrl && imageLoaded) {
      setupCanvas();
    }
  }, [corsProcessedImageUrl, imageLoaded, setupCanvas]);

  // * Calculate distance between two points
  const calculateDistance = (point1: Point, point2: Point): number => {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.round(Math.sqrt(dx * dx + dy * dy));
  };

  // * Calculate angle between two points
  const calculateAngle = (point1: Point, point2: Point): number => {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.atan2(dy, dx) * (180 / Math.PI);
  };

  // * Get relative coordinates from mouse event
  const getRelativeCoordinates = (event: React.MouseEvent): Point | null => {
    const container = containerRef.current;
    if (!container) return null;

    const rect = container.getBoundingClientRect();
    const img = imageRef.current;
    if (!img) return null;

    const scaleX = img.naturalWidth / img.clientWidth;
    const scaleY = img.naturalHeight / img.clientHeight;

    return {
      x: Math.round((event.clientX - rect.left) * scaleX),
      y: Math.round((event.clientY - rect.top) * scaleY),
    };
  };

  // * Handle mouse events for different modes
  const handleMouseDown = (event: React.MouseEvent) => {
    if (!isInspectMode) return;

    const coords = getRelativeCoordinates(event);
    if (!coords) return;

    if (activeMode === "measure") {
      setIsDrawing(true);
      setStartPoint(coords);
      setCurrentMousePos(coords);
    } else if (activeMode === "color") {
      handleColorExtraction(coords);
    } else if (activeMode === "typography") {
      handleTypographyExtraction(coords);
    }
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!isInspectMode) return;

    const coords = getRelativeCoordinates(event);
    if (!coords) return;

    if (activeMode === "measure" && isDrawing && startPoint) {
      setCurrentMousePos(coords);
    }
  };

  const handleMouseUp = (event: React.MouseEvent) => {
    if (!isInspectMode || activeMode !== "measure" || !isDrawing || !startPoint)
      return;

    const coords = getRelativeCoordinates(event);
    if (!coords) return;

    const distance = calculateDistance(startPoint, coords);
    const angle = calculateAngle(startPoint, coords);

    if (distance > 5) {
      const newMeasurement: Measurement = {
        id: `measurement-${Date.now()}`,
        startPoint,
        endPoint: coords,
        distance,
        angle,
      };

      setMeasurements((prev) => [...prev, newMeasurement]);
    }

    setIsDrawing(false);
    setStartPoint(null);
    setCurrentMousePos(null);
  };

  // * Handle color extraction
  const handleColorExtraction = (coords: Point) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const colorInfo = extractColorFromCanvas(canvas, coords.x, coords.y);
    if (!colorInfo) {
      toast({
        message: "Color extraction failed",
        description: "Unable to extract color from this position",
        variant: "error",
      });
      return;
    }

    // Check for duplicates
    const isDuplicate = extractedColors.some((existingColor) =>
      areColorsSimilar(existingColor, colorInfo, 5)
    );

    if (isDuplicate) {
      toast({
        message: "Color already extracted",
        description: "This color is already in your palette",
        variant: "warning",
      });
      return;
    }

    // Create color with position data
    const colorWithPosition: ColorWithPosition = {
      ...colorInfo,
      position: coords,
      id: `color-${Date.now()}`,
    };

    setExtractedColors((prev) => [...prev, colorWithPosition]);
    setShowColorPalette(true);

    toast({
      message: "Color extracted",
      description: `Added ${colorInfo.hex.toUpperCase()} to palette`,
    });
  };

  // * Handle typography extraction (simulated)
  const handleTypographyExtraction = (coords: Point) => {
    const newTypography = generateSampleTypography(coords.x, coords.y);
    setExtractedTypography((prev) => [...prev, newTypography]);
    setShowTypographyPanel(true);

    toast({
      message: "Typography extracted",
      description: `Added ${newTypography.type} style to specifications`,
    });
  };

  // * Export functionality
  const handleExport = (format: "json" | "css" | "design-tokens" = "json") => {
    const spec = createDesignSpecification(
      imageName,
      extractedColors,
      extractedTypography,
      measurements,
      imageUrl,
      projectName,
      imageDimensions || undefined
    );

    exportComprehensiveSpec(spec, format);

    toast({
      message: "Specification exported",
      description: `${format.toUpperCase()} file downloaded successfully`,
    });
  };

  // * Panel management
  const activePanel = showColorPalette
    ? "color"
    : showTypographyPanel
      ? "typography"
      : null;

  const switchPanel = (panel: "color" | "typography" | null) => {
    setShowColorPalette(panel === "color");
    setShowTypographyPanel(panel === "typography");
  };

  // * Get display image URL
  const getDisplayImageUrl = () => {
    if (isCrossOriginImage && corsProcessedImageUrl) {
      return corsProcessedImageUrl;
    }
    return imageUrl;
  };

  // * Check if color mode should be disabled
  const isColorModeDisabled = corsError && isCrossOriginImage;

  return (
    <div className="flex flex-col h-full">
      {/* Hidden canvas for color sampling */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Header with controls */}
      <div className="flex items-center justify-between p-4 border-b-3 border-black dark:border-white">
        <div className="flex items-center gap-3">
          <Text
            as="h2"
            className="text-lg font-bold font-pixel text-black dark:text-white"
          >
            {imageName}
          </Text>
          <Badge variant="outline" size="sm">
            Design Specs
          </Badge>

          {/* Status badges */}
          {isProcessingCors && (
            <Badge variant="warning" size="sm" className="gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              Processing CORS
            </Badge>
          )}
          {corsError && (
            <Badge variant="danger" size="sm" className="gap-1">
              <AlertCircle className="h-3 w-3" />
              CORS Error
            </Badge>
          )}

          {/* Content badges */}
          {extractedColors.length > 0 && (
            <Badge variant="primary" size="sm">
              {extractedColors.length} Colors
            </Badge>
          )}
          {extractedTypography.length > 0 && (
            <Badge variant="success" size="sm">
              {extractedTypography.length} Typography
            </Badge>
          )}
          {measurements.length > 0 && (
            <Badge variant="default" size="sm">
              {measurements.length} Measurements
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Export dropdown */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExportOptions(!showExportOptions)}
              className="gap-2"
              disabled={
                extractedColors.length === 0 &&
                extractedTypography.length === 0 &&
                measurements.length === 0
              }
            >
              <FileDown className="h-4 w-4" />
              Export
            </Button>

            {showExportOptions && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 border-3 border-black dark:border-white shadow-lg z-50">
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => {
                    handleExport("json");
                    setShowExportOptions(false);
                  }}
                  className="w-full justify-start"
                >
                  JSON Specification
                </Button>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => {
                    handleExport("css");
                    setShowExportOptions(false);
                  }}
                  className="w-full justify-start"
                >
                  CSS Stylesheet
                </Button>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => {
                    handleExport("design-tokens");
                    setShowExportOptions(false);
                  }}
                  className="w-full justify-start"
                >
                  Design Tokens
                </Button>
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

      {/* Inspection mode controls */}
      {isInspectMode && (
        <div className="flex items-center gap-2 p-3 border-b-3 border-black dark:border-white bg-gray-50 dark:bg-gray-800/50">
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
            disabled={isColorModeDisabled}
            title={
              isColorModeDisabled
                ? "Color extraction unavailable due to CORS restrictions"
                : "Extract colors from design"
            }
          >
            <Pipette className="h-4 w-4" />
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

          <div className="flex-1" />

          {/* Panel toggles */}
          <div className="flex items-center gap-1">
            <Button
              variant={activePanel === "color" ? "primary" : "outline"}
              size="sm"
              onClick={() =>
                switchPanel(activePanel === "color" ? null : "color")
              }
              className="gap-2"
              disabled={extractedColors.length === 0}
            >
              <Palette className="h-4 w-4" />
              Colors ({extractedColors.length})
            </Button>

            <Button
              variant={activePanel === "typography" ? "primary" : "outline"}
              size="sm"
              onClick={() =>
                switchPanel(activePanel === "typography" ? null : "typography")
              }
              className="gap-2"
              disabled={extractedTypography.length === 0}
            >
              <Type className="h-4 w-4" />
              Typography ({extractedTypography.length})
            </Button>
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Image viewer */}
        <div className="flex-1 relative overflow-hidden">
          <div
            ref={containerRef}
            className="relative w-full h-full overflow-auto bg-gray-50 dark:bg-gray-900"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            style={{ cursor: isInspectMode ? "crosshair" : "default" }}
          >
            <Image
              ref={imageRef}
              src={getDisplayImageUrl()}
              alt={imageName}
              fill
              className="object-contain"
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                setImageLoaded(false);
                if (isCrossOriginImage) {
                  setCorsError(true);
                }
              }}
            />

            {/* Measurement overlays */}
            {isInspectMode && activeMode === "measure" && (
              <div className="absolute inset-0 pointer-events-none">
                <svg className="w-full h-full">
                  {/* Existing measurements */}
                  {measurements.map((measurement) => {
                    const img = imageRef.current;
                    if (!img) return null;

                    const scaleX = img.clientWidth / img.naturalWidth;
                    const scaleY = img.clientHeight / img.naturalHeight;

                    const startDisplay = {
                      x: measurement.startPoint.x * scaleX,
                      y: measurement.startPoint.y * scaleY,
                    };
                    const endDisplay = {
                      x: measurement.endPoint.x * scaleX,
                      y: measurement.endPoint.y * scaleY,
                    };

                    return (
                      <g key={measurement.id}>
                        <line
                          x1={startDisplay.x}
                          y1={startDisplay.y}
                          x2={endDisplay.x}
                          y2={endDisplay.y}
                          stroke="#4ade80"
                          strokeWidth="2"
                          markerEnd="url(#arrowhead)"
                        />
                        <circle
                          cx={startDisplay.x}
                          cy={startDisplay.y}
                          r="4"
                          fill="#4ade80"
                          stroke="#fff"
                          strokeWidth="2"
                        />
                        <circle
                          cx={endDisplay.x}
                          cy={endDisplay.y}
                          r="4"
                          fill="#4ade80"
                          stroke="#fff"
                          strokeWidth="2"
                        />
                        <text
                          x={(startDisplay.x + endDisplay.x) / 2}
                          y={(startDisplay.y + endDisplay.y) / 2 - 8}
                          fill="#4ade80"
                          fontSize="12"
                          fontFamily="monospace"
                          textAnchor="middle"
                          className="font-pixel"
                        >
                          {measurement.distance}px
                        </text>
                      </g>
                    );
                  })}

                  {/* Current measurement line (while drawing) */}
                  {isDrawing &&
                    startPoint &&
                    currentMousePos &&
                    (() => {
                      const img = imageRef.current;
                      if (!img) return null;

                      const scaleX = img.clientWidth / img.naturalWidth;
                      const scaleY = img.clientHeight / img.naturalHeight;

                      const startDisplay = {
                        x: startPoint.x * scaleX,
                        y: startPoint.y * scaleY,
                      };
                      const currentDisplay = {
                        x: currentMousePos.x * scaleX,
                        y: currentMousePos.y * scaleY,
                      };

                      const distance = calculateDistance(
                        startPoint,
                        currentMousePos
                      );

                      return (
                        <g>
                          <line
                            x1={startDisplay.x}
                            y1={startDisplay.y}
                            x2={currentDisplay.x}
                            y2={currentDisplay.y}
                            stroke="#4ade80"
                            strokeWidth="2"
                            strokeDasharray="5,5"
                            opacity="0.8"
                          />
                          <circle
                            cx={startDisplay.x}
                            cy={startDisplay.y}
                            r="4"
                            fill="#4ade80"
                            stroke="#fff"
                            strokeWidth="2"
                          />
                          <circle
                            cx={currentDisplay.x}
                            cy={currentDisplay.y}
                            r="4"
                            fill="#4ade80"
                            stroke="#fff"
                            strokeWidth="2"
                          />
                          <text
                            x={(startDisplay.x + currentDisplay.x) / 2}
                            y={(startDisplay.y + currentDisplay.y) / 2 - 8}
                            fill="#4ade80"
                            fontSize="12"
                            fontFamily="monospace"
                            textAnchor="middle"
                            className="font-pixel"
                          >
                            {distance}px
                          </text>
                        </g>
                      );
                    })()}

                  {/* Arrow marker definition */}
                  <defs>
                    <marker
                      id="arrowhead"
                      markerWidth="10"
                      markerHeight="7"
                      refX="9"
                      refY="3.5"
                      orient="auto"
                    >
                      <polygon points="0 0, 10 3.5, 0 7" fill="#4ade80" />
                    </marker>
                  </defs>
                </svg>
              </div>
            )}

            {/* Typography indicators */}
            {isInspectMode && extractedTypography.length > 0 && (
              <div className="absolute inset-0 pointer-events-none">
                {extractedTypography.map((typo) => {
                  const img = imageRef.current;
                  if (!img) return null;

                  const scaleX = img.clientWidth / img.naturalWidth;
                  const scaleY = img.clientHeight / img.naturalHeight;

                  const displayPos = {
                    x: typo.position.x * scaleX,
                    y: typo.position.y * scaleY,
                  };

                  return (
                    <div
                      key={typo.id}
                      className="absolute"
                      style={{
                        left: displayPos.x - 8,
                        top: displayPos.y - 8,
                      }}
                    >
                      <div className="w-4 h-4 bg-blue-500 border-2 border-white rounded-full flex items-center justify-center">
                        <Type className="w-2 h-2 text-white" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Color extraction indicators */}
            {isInspectMode && extractedColors.length > 0 && (
              <div className="absolute inset-0 pointer-events-none">
                {extractedColors.map((color) => {
                  const img = imageRef.current;
                  if (!img) return null;

                  const scaleX = img.clientWidth / img.naturalWidth;
                  const scaleY = img.clientHeight / img.naturalHeight;

                  const displayPos = {
                    x: color.position.x * scaleX,
                    y: color.position.y * scaleY,
                  };

                  return (
                    <div
                      key={color.id}
                      className="absolute"
                      style={{
                        left: displayPos.x - 8,
                        top: displayPos.y - 8,
                      }}
                    >
                      <div
                        className="w-4 h-4 border-2 border-white rounded-full shadow-lg"
                        style={{ backgroundColor: color.hex }}
                        title={`${color.hex.toUpperCase()}`}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Side panels */}
        {activePanel === "color" && extractedColors.length > 0 && (
          <div className="w-80 border-l-3 border-black dark:border-white">
            <ColorPalettePanel
              colors={extractedColors.map((color) => ({
                ...color,
                position: undefined,
                id: undefined,
              }))}
              onColorRemove={(index) => {
                setExtractedColors((prev) =>
                  prev.filter((_, i) => i !== index)
                );
              }}
              onClearAll={() => setExtractedColors([])}
            />
          </div>
        )}

        {activePanel === "typography" && extractedTypography.length > 0 && (
          <div className="w-80 border-l-3 border-black dark:border-white">
            <TypographyPanel
              typography={extractedTypography}
              onTypographyRemove={(index) => {
                setExtractedTypography((prev) =>
                  prev.filter((_, i) => i !== index)
                );
              }}
              onTypographyUpdate={(index, updated) => {
                setExtractedTypography((prev) =>
                  prev.map((typo, i) => (i === index ? updated : typo))
                );
              }}
              onClearAll={() => setExtractedTypography([])}
            />
          </div>
        )}
      </div>

      {/* Bottom measurements panel (when no side panels are shown) */}
      {!activePanel && measurements.length > 0 && (
        <div className="border-t-3 border-black dark:border-white p-4 max-h-48 overflow-y-auto">
          <div className="flex items-center gap-2 mb-3">
            <Ruler className="h-4 w-4" />
            <Text as="h3" className="font-pixel font-bold">
              Measurements ({measurements.length})
            </Text>
            <div className="flex-1" />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMeasurements([])}
              className="gap-1 text-red-500 hover:text-red-700"
            >
              <X className="h-3 w-3" />
              Clear All
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {measurements.map((measurement, index) => (
              <Card key={measurement.id} className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <Text className="font-medium text-sm">
                    Measurement {index + 1}
                  </Text>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => {
                      setMeasurements((prev) =>
                        prev.filter((m) => m.id !== measurement.id)
                      );
                    }}
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <Text className="text-gray-600 dark:text-gray-400">
                      Distance:
                    </Text>
                    <Text className="font-mono">{measurement.distance}px</Text>
                  </div>
                  <div className="flex justify-between">
                    <Text className="text-gray-600 dark:text-gray-400">
                      From:
                    </Text>
                    <Text className="font-mono">
                      ({measurement.startPoint.x}, {measurement.startPoint.y})
                    </Text>
                  </div>
                  <div className="flex justify-between">
                    <Text className="text-gray-600 dark:text-gray-400">
                      To:
                    </Text>
                    <Text className="font-mono">
                      ({measurement.endPoint.x}, {measurement.endPoint.y})
                    </Text>
                  </div>
                  <div className="flex justify-between">
                    <Text className="text-gray-600 dark:text-gray-400">
                      Angle:
                    </Text>
                    <Text className="font-mono">
                      {measurement.angle.toFixed(1)}°
                    </Text>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(
                        `${measurement.distance}px`
                      );
                      toast({
                        message: "Copied to clipboard",
                        description: `Distance ${measurement.distance}px copied`,
                      });
                    } catch (error) {
                      console.error("Error copying to clipboard:", error);
                      toast({
                        message: "Copy failed",
                        description: "Unable to copy to clipboard",
                        variant: "error",
                      });
                    }
                  }}
                  className="w-full mt-2 gap-1"
                >
                  <Copy className="h-3 w-3" />
                  Copy Distance
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Inspection instructions */}
      {isInspectMode && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800/50">
          <Text className="text-sm text-gray-600 dark:text-gray-400">
            {activeMode === "measure" &&
              "Click and drag to measure distances between elements"}
            {activeMode === "color" &&
              (isColorModeDisabled
                ? "Color extraction is unavailable for cross-origin images"
                : "Click on any part of the design to extract colors")}
            {activeMode === "typography" &&
              "Click on text elements to extract typography properties"}
          </Text>
        </div>
      )}

      {/* Export options overlay */}
      {showExportOptions && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setShowExportOptions(false)}
        />
      )}
    </div>
  );
}

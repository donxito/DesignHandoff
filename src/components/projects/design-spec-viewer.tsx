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
  generateDownloadableFile,
  downloadFile,
  PrintableSpecification,
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

interface SpacingMeasurement {
  id: string;
  points: Point[];
  measurements: {
    horizontal: number;
    vertical: number;
    diagonal: number;
  };
  type: "margin" | "padding" | "spacing";
  label?: string;
}

interface GridSettings {
  enabled: boolean;
  size: number;
  color: string;
  opacity: number;
  snapToGrid: boolean;
}

interface GuidelineSettings {
  enabled: boolean;
  showMargins: boolean;
  showPadding: boolean;
  marginColor: string;
  paddingColor: string;
}

interface DesignSpecViewerProps {
  imageUrl: string;
  imageName: string;
  projectName?: string;
  onClose?: () => void;
}

type InspectMode = "measure" | "color" | "typography" | "spacing" | "grid";

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
  const printRef = useRef<HTMLDivElement>(null);

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

  // * Measurement utilities
  const snapToGrid = (point: Point): Point => {
    if (!gridSettings.snapToGrid) return point;
    const { size } = gridSettings;
    return {
      x: Math.round(point.x / size) * size,
      y: Math.round(point.y / size) * size,
    };
  };

  // * Calculate spacing measurements
  const calculateSpacingMeasurements = (
    points: Point[]
  ): SpacingMeasurement["measurements"] => {
    if (points.length < 2) return { horizontal: 0, vertical: 0, diagonal: 0 };

    // Calculate bounding box
    const minX = Math.min(...points.map((p) => p.x));
    const maxX = Math.max(...points.map((p) => p.x));
    const minY = Math.min(...points.map((p) => p.y));
    const maxY = Math.max(...points.map((p) => p.y));

    return {
      horizontal: maxX - minX,
      vertical: maxY - minY,
      diagonal: Math.round(Math.sqrt((maxX - minX) ** 2 + (maxY - minY) ** 2)),
    };
  };

  // * Get constrained point
  const getConstrainedPoint = (
    point: Point,
    mode: "horizontal" | "vertical" | "free",
    anchor: Point
  ): Point => {
    if (mode === "horizontal") return { x: point.x, y: anchor.y };
    if (mode === "vertical") return { x: anchor.x, y: point.y };
    return point;
  };

  // * Detect spacing type
  const detectSpacingType = (
    points: Point[]
  ): "margin" | "padding" | "spacing" => {
    // Simple heuristic: if points form a rectangle, it's likely padding
    if (points.length === 4) return "padding";
    // If two points, it's basic spacing
    if (points.length === 2) return "spacing";
    // Otherwise, assume margin
    return "margin";
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

    // Apply grid snapping if enabled
    const snappedCoords = snapToGrid(coords);

    if (activeMode === "measure") {
      // Apply ruler constraints
      const constrainedCoords = startPoint
        ? getConstrainedPoint(snappedCoords, rulerMode, startPoint)
        : snappedCoords;

      setIsDrawing(true);
      setStartPoint(constrainedCoords);
      setCurrentMousePos(constrainedCoords);
    } else if (activeMode === "spacing") {
      // Multi-point spacing measurement
      if (isMultiPointMode) {
        setMultiPointMeasurement((prev) => [...prev, snappedCoords]);
      } else {
        setMultiPointMeasurement([snappedCoords]);
        setIsMultiPointMode(true);
      }
    } else if (activeMode === "grid") {
      // Grid mode - just show coordinates
      toast({
        message: "Grid coordinates",
        description: `Position: (${snappedCoords.x}, ${snappedCoords.y})`,
      });
    } else if (activeMode === "color") {
      handleColorExtraction(snappedCoords);
    } else if (activeMode === "typography") {
      handleTypographyExtraction(snappedCoords);
    }
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!isInspectMode) return;

    const coords = getRelativeCoordinates(event);
    if (!coords) return;

    const snappedCoords = snapToGrid(coords);

    if (activeMode === "measure" && isDrawing && startPoint) {
      const constrainedCoords = getConstrainedPoint(
        snappedCoords,
        rulerMode,
        startPoint
      );
      setCurrentMousePos(constrainedCoords);
    }
  };

  const handleMouseUp = (event: React.MouseEvent) => {
    if (!isInspectMode || !isDrawing || !startPoint) return;

    const coords = getRelativeCoordinates(event);
    if (!coords) return;

    const snappedCoords = snapToGrid(coords);

    if (activeMode === "measure") {
      const constrainedCoords = getConstrainedPoint(
        snappedCoords,
        rulerMode,
        startPoint
      );
      const distance = calculateDistance(startPoint, constrainedCoords);
      const angle = calculateAngle(startPoint, constrainedCoords);

      if (distance > 5) {
        const newMeasurement: Measurement = {
          id: `measurement-${Date.now()}`,
          startPoint,
          endPoint: constrainedCoords,
          distance,
          angle,
        };

        setMeasurements((prev) => [...prev, newMeasurement]);
      }

      setIsDrawing(false);
      setStartPoint(null);
      setCurrentMousePos(null);
    }
  };

  // * Complete multi-point spacing measurement
  const completeSpacingMeasurement = () => {
    if (multiPointMeasurement.length < 2) return;

    const measurements = calculateSpacingMeasurements(multiPointMeasurement);
    const type = detectSpacingType(multiPointMeasurement);

    const newSpacingMeasurement: SpacingMeasurement = {
      id: `spacing-${Date.now()}`,
      points: [...multiPointMeasurement],
      measurements,
      type,
      label: `${type.charAt(0).toUpperCase() + type.slice(1)} measurement`,
    };

    setSpacingMeasurements((prev) => [...prev, newSpacingMeasurement]);
    setMultiPointMeasurement([]);
    setIsMultiPointMode(false);

    toast({
      message: "Spacing measurement added",
      description: `${measurements.horizontal}×${measurements.vertical}px area measured`,
    });
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
      imageDimensions || undefined,
      spacingMeasurements,
      gridSettings,
      guidelineSettings
    );

    exportComprehensiveSpec(spec, format);

    toast({
      message: "Specification exported",
      description: `${format.toUpperCase()} file downloaded successfully`,
    });
  };

  // * React-to-Print functionality
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Design-Spec-${imageName}`,
    pageStyle: `
      @page {
        size: A4;
        margin: 20mm;
      }
      @media print {
        body { 
          -webkit-print-color-adjust: exact; 
          color-adjust: exact;
        }
      }
    `,
    onAfterPrint: () => {
      toast({
        message: "PDF printed successfully",
        description: "Design specification sent to printer",
      });
    },
  });

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

  // * Advanced measurement states
  const [spacingMeasurements, setSpacingMeasurements] = useState<
    SpacingMeasurement[]
  >([]);
  const [multiPointMeasurement, setMultiPointMeasurement] = useState<Point[]>(
    []
  );
  const [isMultiPointMode, setIsMultiPointMode] = useState(false);
  const [gridSettings, setGridSettings] = useState<GridSettings>({
    enabled: false,
    size: 24,
    color: "#3b82f6",
    opacity: 0.3,
    snapToGrid: false,
  });
  const [guidelineSettings, setGuidelineSettings] = useState<GuidelineSettings>(
    {
      enabled: false,
      showMargins: true,
      showPadding: true,
      marginColor: "#ef4444",
      paddingColor: "#10b981",
    }
  );
  const [rulerMode, setRulerMode] = useState<
    "horizontal" | "vertical" | "free"
  >("free");
  const [showAdvancedControls, setShowAdvancedControls] = useState(false);

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
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => {
                    handlePrint();
                    setShowExportOptions(false);
                  }}
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
              variant={activeMode === "spacing" ? "primary" : "outline"}
              size="sm"
              onClick={() => setActiveMode("spacing")}
              className="gap-2"
            >
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 border border-current"></div>
                <div className="w-2 h-2 border border-current"></div>
              </div>
              Spacing
            </Button>

            <Button
              variant={activeMode === "grid" ? "primary" : "outline"}
              size="sm"
              onClick={() => {
                setActiveMode("grid");
                setGridSettings((prev) => ({
                  ...prev,
                  enabled: !prev.enabled,
                }));
              }}
              className="gap-2"
            >
              <div className="grid grid-cols-2 gap-px w-3 h-3">
                <div className="bg-current opacity-60"></div>
                <div className="bg-current opacity-60"></div>
                <div className="bg-current opacity-60"></div>
                <div className="bg-current opacity-60"></div>
              </div>
              Grid
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

            {/* Advanced Controls Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedControls(!showAdvancedControls)}
              className="gap-2"
            >
              <div className="w-3 h-3 border border-current rounded-sm flex items-center justify-center">
                <div className="w-1 h-1 bg-current rounded-full"></div>
              </div>
              Advanced
            </Button>
          </div>

          {/* Advanced Controls Panel */}
          {showAdvancedControls && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Ruler Settings */}
                <div className="space-y-2">
                  <Text className="text-sm font-medium">Ruler Mode</Text>
                  <div className="flex gap-1">
                    <Button
                      variant={rulerMode === "free" ? "primary" : "outline"}
                      size="sm"
                      onClick={() => setRulerMode("free")}
                      className="text-xs px-2"
                    >
                      Free
                    </Button>
                    <Button
                      variant={
                        rulerMode === "horizontal" ? "primary" : "outline"
                      }
                      size="sm"
                      onClick={() => setRulerMode("horizontal")}
                      className="text-xs px-2"
                    >
                      H
                    </Button>
                    <Button
                      variant={rulerMode === "vertical" ? "primary" : "outline"}
                      size="sm"
                      onClick={() => setRulerMode("vertical")}
                      className="text-xs px-2"
                    >
                      V
                    </Button>
                  </div>
                </div>

                {/* Grid Settings */}
                <div className="space-y-2">
                  <Text className="text-sm font-medium">Grid Settings</Text>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={gridSettings.enabled ? "primary" : "outline"}
                      size="sm"
                      onClick={() =>
                        setGridSettings((prev) => ({
                          ...prev,
                          enabled: !prev.enabled,
                        }))
                      }
                      className="text-xs px-2"
                    >
                      Show
                    </Button>
                    <Button
                      variant={gridSettings.snapToGrid ? "primary" : "outline"}
                      size="sm"
                      onClick={() =>
                        setGridSettings((prev) => ({
                          ...prev,
                          snapToGrid: !prev.snapToGrid,
                        }))
                      }
                      className="text-xs px-2"
                    >
                      Snap
                    </Button>
                    <input
                      type="range"
                      min="8"
                      max="48"
                      value={gridSettings.size}
                      onChange={(e) =>
                        setGridSettings((prev) => ({
                          ...prev,
                          size: parseInt(e.target.value),
                        }))
                      }
                      className="w-16 h-2"
                    />
                    <Text className="text-xs">{gridSettings.size}px</Text>
                  </div>
                </div>

                {/* Guidelines Settings */}
                <div className="space-y-2">
                  <Text className="text-sm font-medium">Guidelines</Text>
                  <div className="flex gap-1">
                    <Button
                      variant={
                        guidelineSettings.enabled ? "primary" : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        setGuidelineSettings((prev) => ({
                          ...prev,
                          enabled: !prev.enabled,
                        }))
                      }
                      className="text-xs px-2"
                    >
                      Show
                    </Button>
                    <Button
                      variant={
                        guidelineSettings.showMargins ? "primary" : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        setGuidelineSettings((prev) => ({
                          ...prev,
                          showMargins: !prev.showMargins,
                        }))
                      }
                      className="text-xs px-2"
                    >
                      Margins
                    </Button>
                    <Button
                      variant={
                        guidelineSettings.showPadding ? "primary" : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        setGuidelineSettings((prev) => ({
                          ...prev,
                          showPadding: !prev.showPadding,
                        }))
                      }
                      className="text-xs px-2"
                    >
                      Padding
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Multi-point spacing controls */}
          {activeMode === "spacing" && isMultiPointMode && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
              <div className="flex items-center gap-2">
                <Text className="text-sm">
                  Points selected: {multiPointMeasurement.length}
                </Text>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={completeSpacingMeasurement}
                  disabled={multiPointMeasurement.length < 2}
                  className="gap-1"
                >
                  Complete Measurement
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setMultiPointMeasurement([]);
                    setIsMultiPointMode(false);
                  }}
                  className="gap-1"
                >
                  <X className="h-3 w-3" />
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Panel toggles */}
          <div className="flex items-center gap-1 border-t border-gray-200 dark:border-gray-700 pt-3">
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

            {spacingMeasurements.length > 0 && (
              <Badge variant="secondary" size="sm" className="ml-2">
                {spacingMeasurements.length} Spacing Measurements
              </Badge>
            )}
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

            {/* Grid Overlay */}
            {isInspectMode && gridSettings.enabled && (
              <div className="absolute inset-0 pointer-events-none">
                <svg className="w-full h-full">
                  <defs>
                    <pattern
                      id="grid"
                      width={
                        gridSettings.size *
                        (imageRef.current
                          ? imageRef.current.clientWidth /
                            imageRef.current.naturalWidth
                          : 1)
                      }
                      height={
                        gridSettings.size *
                        (imageRef.current
                          ? imageRef.current.clientHeight /
                            imageRef.current.naturalHeight
                          : 1)
                      }
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d={`M ${gridSettings.size * (imageRef.current ? imageRef.current.clientWidth / imageRef.current.naturalWidth : 1)} 0 L 0 0 0 ${gridSettings.size * (imageRef.current ? imageRef.current.clientHeight / imageRef.current.naturalHeight : 1)}`}
                        fill="none"
                        stroke={gridSettings.color}
                        strokeWidth="1"
                        opacity={gridSettings.opacity}
                      />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>
            )}

            {/* Spacing Measurement Overlays */}
            {isInspectMode && activeMode === "spacing" && (
              <div className="absolute inset-0 pointer-events-none">
                <svg className="w-full h-full">
                  {/* Multi-point measurement points */}
                  {multiPointMeasurement.map((point, index) => {
                    const img = imageRef.current;
                    if (!img) return null;

                    const scaleX = img.clientWidth / img.naturalWidth;
                    const scaleY = img.clientHeight / img.naturalHeight;

                    const displayPos = {
                      x: point.x * scaleX,
                      y: point.y * scaleY,
                    };

                    return (
                      <g key={`point-${index}`}>
                        <circle
                          cx={displayPos.x}
                          cy={displayPos.y}
                          r="6"
                          fill="#f59e0b"
                          stroke="#fff"
                          strokeWidth="2"
                        />
                        <text
                          x={displayPos.x}
                          y={displayPos.y - 12}
                          fill="#f59e0b"
                          fontSize="10"
                          fontFamily="monospace"
                          textAnchor="middle"
                          className="font-pixel"
                        >
                          {index + 1}
                        </text>
                      </g>
                    );
                  })}

                  {/* Spacing measurements */}
                  {spacingMeasurements.map((spacing) => {
                    const img = imageRef.current;
                    if (!img) return null;

                    const scaleX = img.clientWidth / img.naturalWidth;
                    const scaleY = img.clientHeight / img.naturalHeight;

                    // Calculate bounding box
                    const minX = Math.min(...spacing.points.map((p) => p.x));
                    const maxX = Math.max(...spacing.points.map((p) => p.x));
                    const minY = Math.min(...spacing.points.map((p) => p.y));
                    const maxY = Math.max(...spacing.points.map((p) => p.y));

                    const rectDisplay = {
                      x: minX * scaleX,
                      y: minY * scaleY,
                      width: (maxX - minX) * scaleX,
                      height: (maxY - minY) * scaleY,
                    };

                    const typeColor =
                      spacing.type === "margin"
                        ? "#ef4444"
                        : spacing.type === "padding"
                          ? "#10b981"
                          : "#8b5cf6";

                    return (
                      <g key={spacing.id}>
                        {/* Bounding rectangle */}
                        <rect
                          x={rectDisplay.x}
                          y={rectDisplay.y}
                          width={rectDisplay.width}
                          height={rectDisplay.height}
                          fill="none"
                          stroke={typeColor}
                          strokeWidth="2"
                          strokeDasharray="3,3"
                          opacity="0.8"
                        />

                        {/* Measurement labels */}
                        <text
                          x={rectDisplay.x + rectDisplay.width / 2}
                          y={rectDisplay.y - 5}
                          fill={typeColor}
                          fontSize="11"
                          fontFamily="monospace"
                          textAnchor="middle"
                          className="font-pixel"
                        >
                          {spacing.measurements.horizontal}px
                        </text>
                        <text
                          x={rectDisplay.x - 5}
                          y={rectDisplay.y + rectDisplay.height / 2}
                          fill={typeColor}
                          fontSize="11"
                          fontFamily="monospace"
                          textAnchor="middle"
                          className="font-pixel"
                          transform={`rotate(-90, ${rectDisplay.x - 5}, ${rectDisplay.y + rectDisplay.height / 2})`}
                        >
                          {spacing.measurements.vertical}px
                        </text>

                        {/* Type badge */}
                        <rect
                          x={rectDisplay.x + rectDisplay.width - 60}
                          y={rectDisplay.y + rectDisplay.height + 5}
                          width="55"
                          height="16"
                          fill={typeColor}
                          opacity="0.9"
                          rx="2"
                        />
                        <text
                          x={rectDisplay.x + rectDisplay.width - 32}
                          y={rectDisplay.y + rectDisplay.height + 16}
                          fill="white"
                          fontSize="9"
                          fontFamily="monospace"
                          textAnchor="middle"
                          className="font-pixel"
                        >
                          {spacing.type.toUpperCase()}
                        </text>
                      </g>
                    );
                  })}

                  {/* Arrow marker definition for spacing */}
                  <defs>
                    <marker
                      id="spacing-arrow"
                      markerWidth="8"
                      markerHeight="6"
                      refX="7"
                      refY="3"
                      orient="auto"
                    >
                      <polygon points="0 0, 8 3, 0 6" fill="#f59e0b" />
                    </marker>
                  </defs>
                </svg>
              </div>
            )}

            {/* Guidelines Overlay */}
            {isInspectMode && guidelineSettings.enabled && imageDimensions && (
              <div className="absolute inset-0 pointer-events-none">
                <svg className="w-full h-full">
                  {/* Margin guidelines */}
                  {guidelineSettings.showMargins && (
                    <g>
                      <line
                        x1="0"
                        y1="24"
                        x2="100%"
                        y2="24"
                        stroke={guidelineSettings.marginColor}
                        strokeWidth="1"
                        strokeDasharray="2,2"
                        opacity="0.6"
                      />
                      <line
                        x1="24"
                        y1="0"
                        x2="24"
                        y2="100%"
                        stroke={guidelineSettings.marginColor}
                        strokeWidth="1"
                        strokeDasharray="2,2"
                        opacity="0.6"
                      />
                      <text
                        x="26"
                        y="20"
                        fill={guidelineSettings.marginColor}
                        fontSize="10"
                        className="font-pixel"
                      >
                        24px margin
                      </text>
                    </g>
                  )}

                  {/* Padding guidelines */}
                  {guidelineSettings.showPadding && (
                    <g>
                      <line
                        x1="0"
                        y1="16"
                        x2="100%"
                        y2="16"
                        stroke={guidelineSettings.paddingColor}
                        strokeWidth="1"
                        strokeDasharray="1,1"
                        opacity="0.6"
                      />
                      <line
                        x1="16"
                        y1="0"
                        x2="16"
                        y2="100%"
                        stroke={guidelineSettings.paddingColor}
                        strokeWidth="1"
                        strokeDasharray="1,1"
                        opacity="0.6"
                      />
                      <text
                        x="18"
                        y="14"
                        fill={guidelineSettings.paddingColor}
                        fontSize="10"
                        className="font-pixel"
                      >
                        16px padding
                      </text>
                    </g>
                  )}
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

      {/* Hidden component for react-to-print */}
      <div style={{ display: "none" }}>
        <div ref={printRef}>
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
    </div>
  );
}

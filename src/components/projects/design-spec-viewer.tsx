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
  Download,
  Pipette,
  Target,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ColorPalettePanel from "@/components/projects/color-palette-panel";
import {
  ColorInfo,
  extractColorFromCanvas,
  areColorsSimilar,
} from "@/lib/utils/color-utils";
import Image from "next/image";

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
  onClose?: () => void;
}

export function DesignSpecViewer({
  imageUrl,
  imageName,
  onClose,
}: DesignSpecViewerProps) {
  const [isInspectMode, setIsInspectMode] = useState(false);
  const [activeMode, setActiveMode] = useState<"measure" | "color">("measure");
  const [mousePosition, setMousePosition] = useState<Point>({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [extractedColors, setExtractedColors] = useState<ColorInfo[]>([]);
  const [currentMeasurement, setCurrentMeasurement] = useState<Point | null>(
    null
  );
  const [hoverColor, setHoverColor] = useState<ColorInfo | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageNaturalSize, setImageNaturalSize] = useState({
    width: 0,
    height: 0,
  });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [showColorPalette, setShowColorPalette] = useState(false);

  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  // * Calculate scale factor between natural image size and displayed size
  const getScaleFactor = () => {
    if (!imageLoaded || !imageNaturalSize.width || !containerSize.width)
      return 1;

    const scaleX = containerSize.width / imageNaturalSize.width;
    const scaleY = containerSize.height / imageNaturalSize.height;

    return Math.min(scaleX, scaleY);
  };

  // * Convert display coordinates to actual image coordinates
  const displayToImageCoords = (displayX: number, displayY: number): Point => {
    const scaleFactor = getScaleFactor();
    const actualImageWidth = imageNaturalSize.width * scaleFactor;
    const actualImageHeight = imageNaturalSize.height * scaleFactor;

    const offsetX = (containerSize.width - actualImageWidth) / 2;
    const offsetY = (containerSize.height - actualImageHeight) / 2;

    const adjustedX = displayX - offsetX;
    const adjustedY = displayY - offsetY;

    return {
      x: Math.round(adjustedX / scaleFactor),
      y: Math.round(adjustedY / scaleFactor),
    };
  };

  // * Convert image coordinates back to display coordinates
  const imageToDisplayCoords = (imageX: number, imageY: number): Point => {
    const scaleFactor = getScaleFactor();
    const actualImageWidth = imageNaturalSize.width * scaleFactor;
    const actualImageHeight = imageNaturalSize.height * scaleFactor;

    const offsetX = (containerSize.width - actualImageWidth) / 2;
    const offsetY = (containerSize.height - actualImageHeight) / 2;

    return {
      x: imageX * scaleFactor + offsetX,
      y: imageY * scaleFactor + offsetY,
    };
  };

  // * Setup canvas for color extraction
  const setupCanvas = useCallback(() => {
    if (!canvasRef.current || !imageRef.current || !imageLoaded) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = imageNaturalSize.width;
    canvas.height = imageNaturalSize.height;

    // Draw the image onto the canvas
    ctx.drawImage(imageRef.current, 0, 0);
  }, [canvasRef, imageRef, imageLoaded, imageNaturalSize]);

  // * Extract color at position
  const extractColorAtPosition = (
    imageX: number,
    imageY: number
  ): ColorInfo | null => {
    if (!canvasRef.current) return null;

    return extractColorFromCanvas(canvasRef.current, imageX, imageY);
  };

  // * Handle mouse move over the overlay
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isInspectMode) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const displayCoords = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    const imageCoords = displayToImageCoords(displayCoords.x, displayCoords.y);

    // Ensure coordinates are within image bounds
    if (
      imageCoords.x >= 0 &&
      imageCoords.x < imageNaturalSize.width &&
      imageCoords.y >= 0 &&
      imageCoords.y < imageNaturalSize.height
    ) {
      setMousePosition(imageCoords);
      setIsHovering(true);

      // Extract color at hover position for preview in color mode
      if (activeMode === "color") {
        const color = extractColorAtPosition(imageCoords.x, imageCoords.y);
        setHoverColor(color);
      }
    } else {
      setIsHovering(false);
      setHoverColor(null);
    }
  };

  // * Handle mouse leave
  const handleMouseLeave = () => {
    setIsHovering(false);
    setHoverColor(null);
  };

  // * Handle click for measurement or color sampling
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isInspectMode || !isHovering) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const displayCoords = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    const imageCoords = displayToImageCoords(displayCoords.x, displayCoords.y);

    if (activeMode === "color") {
      // Color sampling mode
      const color = extractColorAtPosition(imageCoords.x, imageCoords.y);
      if (color) {
        // Check if this color is already in the palette (avoid duplicates)
        const isDuplicate = extractedColors.some((existingColor) =>
          areColorsSimilar(existingColor, color, 5)
        );

        if (!isDuplicate) {
          setExtractedColors([...extractedColors, color]);
          setShowColorPalette(true);

          toast({
            message: "Color extracted!",
            description: `${color.hex.toUpperCase()} added to palette`,
            variant: "success",
          });
        } else {
          toast({
            message: "Color already in palette",
            description: "Similar color already exists",
            variant: "info",
          });
        }
      }
    } else {
      // Measurement mode
      if (!currentMeasurement) {
        setCurrentMeasurement(imageCoords);
      } else {
        const startPoint = currentMeasurement;
        const endPoint = imageCoords;

        const distance = Math.sqrt(
          Math.pow(endPoint.x - startPoint.x, 2) +
            Math.pow(endPoint.y - startPoint.y, 2)
        );

        const angle =
          Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x) *
          (180 / Math.PI);

        const newMeasurement: Measurement = {
          id: Date.now().toString(),
          startPoint,
          endPoint,
          distance: Math.round(distance),
          angle: Math.round(angle),
        };

        setMeasurements([...measurements, newMeasurement]);
        setCurrentMeasurement(null);

        toast({
          message: "Measurement added",
          description: `${Math.round(distance)}px distance recorded`,
          variant: "success",
        });
      }
    }
  };

  // * Handle image load
  const handleImageLoad = () => {
    if (imageRef.current) {
      setImageNaturalSize({
        width: imageRef.current.naturalWidth,
        height: imageRef.current.naturalHeight,
      });
      setImageLoaded(true);
    }
  };

  // * Setup canvas when image loads
  useEffect(() => {
    if (imageLoaded) {
      setupCanvas();
    }
  }, [imageLoaded, setupCanvas]);

  // * Update container size on mount and resize
  useEffect(() => {
    const updateContainerSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({
          width: rect.width,
          height: rect.height,
        });
      }
    };

    updateContainerSize();
    window.addEventListener("resize", updateContainerSize);

    return () => window.removeEventListener("resize", updateContainerSize);
  }, []);

  // * Clear all data
  const clearAll = () => {
    setMeasurements([]);
    setExtractedColors([]);
    setCurrentMeasurement(null);
  };

  // * Remove specific color from palette
  const removeColor = (index: number) => {
    const newColors = [...extractedColors];
    newColors.splice(index, 1);
    setExtractedColors(newColors);
  };

  // * Copy coordinates to clipboard
  const copyCoordinates = async () => {
    const coordText = `X: ${mousePosition.x}px, Y: ${mousePosition.y}px`;
    try {
      await navigator.clipboard.writeText(coordText);
      toast({
        message: "Coordinates copied",
        variant: "success",
      });
    } catch (err) {
      console.error("Failed to copy coordinates:", err);
    }
  };

  // * Export specifications as JSON
  const exportSpecs = () => {
    const specs = {
      fileName: imageName,
      imageSize: imageNaturalSize,
      measurements: measurements.map((m) => ({
        distance: m.distance,
        angle: m.angle,
        startPoint: m.startPoint,
        endPoint: m.endPoint,
      })),
      colorPalette: extractedColors.map((c) => ({
        hex: c.hex,
        rgb: c.rgb,
        hsl: c.hsl,
        brightness: c.brightness,
        contrast: c.contrast,
      })),
      exportedAt: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(specs, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${imageName.replace(/\.[^/.]+$/, "")}-specs.json`;
    link.click();

    URL.revokeObjectURL(url);
  };

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
          {extractedColors.length > 0 && (
            <Badge variant="primary" size="sm">
              {extractedColors.length} Colors
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={isInspectMode ? "primary" : "outline"}
            size="sm"
            onClick={() => setIsInspectMode(!isInspectMode)}
            className="gap-2"
          >
            <Eye className="h-4 w-4" />
            {isInspectMode ? "Exit Inspect" : "Inspect Mode"}
          </Button>

          {isInspectMode && (
            <>
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
                <Pipette className="h-4 w-4" />
                Color
              </Button>
            </>
          )}

          {extractedColors.length > 0 && (
            <Button
              variant={showColorPalette ? "primary" : "outline"}
              size="sm"
              onClick={() => setShowColorPalette(!showColorPalette)}
              className="gap-2"
            >
              <Palette className="h-4 w-4" />
              Palette
            </Button>
          )}

          {(measurements.length > 0 || extractedColors.length > 0) && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={exportSpecs}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={clearAll}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
            </>
          )}

          {onClose && (
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex">
        {/* Image container with overlay */}
        <div className="flex-1 relative overflow-hidden">
          <div ref={containerRef} className="relative w-full h-full">
            {/* The actual image */}
            <Image
              ref={imageRef}
              src={imageUrl}
              alt={imageName}
              className="w-full h-full object-contain"
              onLoad={handleImageLoad}
              crossOrigin="anonymous"
            />

            {/* Interactive overlay */}
            {isInspectMode && (
              <div
                className={`absolute inset-0 ${
                  activeMode === "color"
                    ? "cursor-crosshair"
                    : "cursor-crosshair"
                }`}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onClick={handleClick}
              >
                {/* Mouse position tooltip */}
                {isHovering && (
                  <div
                    className="absolute pointer-events-none z-10"
                    style={{
                      left: Math.min(
                        imageToDisplayCoords(mousePosition.x, mousePosition.y)
                          .x + 15,
                        containerSize.width - 250
                      ),
                      top: Math.max(
                        imageToDisplayCoords(mousePosition.x, mousePosition.y)
                          .y - 80,
                        10
                      ),
                    }}
                  >
                    <Card className="px-3 py-2 bg-black dark:bg-white text-white dark:text-black border-2 border-white dark:border-black shadow-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Target className="h-3 w-3" />
                          <Text as="span" className="text-xs font-pixel">
                            X: {mousePosition.x}px, Y: {mousePosition.y}px
                          </Text>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyCoordinates();
                            }}
                            className="text-xs hover:opacity-70"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Color preview in color mode */}
                        {activeMode === "color" && hoverColor && (
                          <div className="flex items-center gap-2 pt-1 border-t border-gray-500">
                            <div
                              className="w-4 h-4 rounded border border-gray-300"
                              style={{ backgroundColor: hoverColor.hex }}
                            />
                            <Text as="span" className="text-xs font-pixel">
                              {hoverColor.hex.toUpperCase()}
                            </Text>
                            <Text as="span" className="text-xs">
                              RGB({hoverColor.rgb.r}, {hoverColor.rgb.g},{" "}
                              {hoverColor.rgb.b})
                            </Text>
                          </div>
                        )}
                      </div>
                    </Card>
                  </div>
                )}

                {/* Current measurement line */}
                {activeMode === "measure" &&
                  currentMeasurement &&
                  isHovering && (
                    <svg className="absolute inset-0 pointer-events-none">
                      <line
                        x1={
                          imageToDisplayCoords(
                            currentMeasurement.x,
                            currentMeasurement.y
                          ).x
                        }
                        y1={
                          imageToDisplayCoords(
                            currentMeasurement.x,
                            currentMeasurement.y
                          ).y
                        }
                        x2={
                          imageToDisplayCoords(mousePosition.x, mousePosition.y)
                            .x
                        }
                        y2={
                          imageToDisplayCoords(mousePosition.x, mousePosition.y)
                            .y
                        }
                        stroke="#ff6b6b"
                        strokeWidth="2"
                        strokeDasharray="5,5"
                      />
                    </svg>
                  )}

                {/* Completed measurements */}
                <svg className="absolute inset-0 pointer-events-none">
                  {measurements.map((measurement) => {
                    const startDisplay = imageToDisplayCoords(
                      measurement.startPoint.x,
                      measurement.startPoint.y
                    );
                    const endDisplay = imageToDisplayCoords(
                      measurement.endPoint.x,
                      measurement.endPoint.y
                    );

                    return (
                      <g key={measurement.id}>
                        <line
                          x1={startDisplay.x}
                          y1={startDisplay.y}
                          x2={endDisplay.x}
                          y2={endDisplay.y}
                          stroke="#4ade80"
                          strokeWidth="2"
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
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Color palette sidebar */}
        {showColorPalette && extractedColors.length > 0 && (
          <div className="w-80 border-l-3 border-black dark:border-white p-4 overflow-y-auto">
            <ColorPalettePanel
              colors={extractedColors}
              onColorRemove={removeColor}
              onClearAll={() => setExtractedColors([])}
            />
          </div>
        )}
      </div>

      {/* Measurements panel (when color palette is not shown) */}
      {!showColorPalette && measurements.length > 0 && (
        <div className="border-t-3 border-black dark:border-white p-4 max-h-48 overflow-y-auto">
          <div className="flex items-center gap-2 mb-3">
            <Ruler className="h-4 w-4" />
            <Text
              as="h3"
              className="font-pixel font-medium text-black dark:text-white"
            >
              Measurements ({measurements.length})
            </Text>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {measurements.map((measurement, index) => (
              <Card
                key={measurement.id}
                className="p-3 bg-gray-50 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600"
              >
                <div className="flex items-center justify-between text-sm">
                  <Text
                    as="span"
                    className="font-pixel text-black dark:text-white"
                  >
                    #{index + 1}
                  </Text>
                  <Text
                    as="span"
                    className="font-pixel text-green-600 dark:text-green-400"
                  >
                    {measurement.distance}px
                  </Text>
                </div>
                <Text
                  as="p"
                  className="text-xs text-gray-600 dark:text-gray-400 mt-1"
                >
                  ({measurement.startPoint.x}, {measurement.startPoint.y}) → (
                  {measurement.endPoint.x}, {measurement.endPoint.y})
                </Text>
                <Text
                  as="p"
                  className="text-xs text-gray-600 dark:text-gray-400"
                >
                  Angle: {measurement.angle}°
                </Text>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      {isInspectMode && (
        <div className="border-t-3 border-black dark:border-white p-4 bg-blue-50 dark:bg-blue-900/20">
          <Text
            as="p"
            className="text-xs font-pixel text-blue-800 dark:text-blue-200"
          >
            {activeMode === "measure"
              ? currentMeasurement
                ? "Click to complete measurement"
                : "Click to start measurement • Hover for coordinates"
              : "Click on design elements to extract colors • Hover for color preview"}
          </Text>
        </div>
      )}
    </div>
  );
}

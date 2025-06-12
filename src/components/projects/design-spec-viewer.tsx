"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/retroui/Button";
import { Card } from "@/components/retroui/Card";
import { Text } from "@/components/retroui/Text";
import { Badge } from "@/components/retroui/Badge";
import { Ruler, Eye, X, Copy, Palette, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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

interface ColorSample {
  id: string;
  position: Point;
  color: string;
  hex: string;
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
  const [colorSamples, setColorSamples] = useState<ColorSample[]>([]);
  const [currentMeasurement, setCurrentMeasurement] = useState<Point | null>(
    null
  );
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageNaturalSize, setImageNaturalSize] = useState({
    width: 0,
    height: 0,
  });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

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

    // Image uses object-contain, so use the smaller scale factor
    return Math.min(scaleX, scaleY);
  };

  // * Convert display coordinates to actual image coordinates
  const displayToImageCoords = (displayX: number, displayY: number): Point => {
    const scaleFactor = getScaleFactor();
    const actualImageWidth = imageNaturalSize.width * scaleFactor;
    const actualImageHeight = imageNaturalSize.height * scaleFactor;

    // Calculate offset due to centering (object-contain centers the image)
    const offsetX = (containerSize.width - actualImageWidth) / 2;
    const offsetY = (containerSize.height - actualImageHeight) / 2;

    // Adjust coordinates
    const adjustedX = displayX - offsetX;
    const adjustedY = displayY - offsetY;

    // Convert to natural image coordinates
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

  // * Get color at specific image coordinates
  const getColorAtPosition = (imageX: number, imageY: number): string => {
    if (!canvasRef.current || !imageRef.current) return "#000000";

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "#000000";

    // Set canvas size to match natural image size
    canvas.width = imageNaturalSize.width;
    canvas.height = imageNaturalSize.height;

    // Draw the image onto the canvas
    ctx.drawImage(imageRef.current, 0, 0);

    // Get pixel data
    const imageData = ctx.getImageData(imageX, imageY, 1, 1);
    const [r, g, b] = imageData.data;

    // Convert to hex
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
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
    } else {
      setIsHovering(false);
    }
  };

  // * Handle mouse leave
  const handleMouseLeave = () => {
    setIsHovering(false);
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
      const color = getColorAtPosition(imageCoords.x, imageCoords.y);
      const newColorSample: ColorSample = {
        id: Date.now().toString(),
        position: imageCoords,
        color,
        hex: color,
      };

      setColorSamples([...colorSamples, newColorSample]);

      toast({
        message: `Color sampled: ${color}`,
        variant: "success",
      });
    } else {
      // Measurement mode
      if (!currentMeasurement) {
        // Start a new measurement
        setCurrentMeasurement(imageCoords);
      } else {
        // Complete the measurement
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
          message: `Measurement added: ${Math.round(distance)}px`,
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
    setColorSamples([]);
    setCurrentMeasurement(null);
  };

  // * Copy coordinates to clipboard
  const copyCoordinates = async () => {
    const coordText = `X: ${mousePosition.x}px, Y: ${mousePosition.y}px`;
    try {
      await navigator.clipboard.writeText(coordText);
      toast({
        message: "Coordinates copied to clipboard",
        variant: "success",
      });
    } catch (err) {
      console.error("Failed to copy coordinates:", err);
    }
  };

  // * Copy color to clipboard
  const copyColor = async (color: string) => {
    try {
      await navigator.clipboard.writeText(color);
      toast({
        message: `Color ${color} copied to clipboard`,
        variant: "success",
      });
    } catch (err) {
      console.error("Failed to copy color:", err);
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
      colorSamples: colorSamples.map((c) => ({
        position: c.position,
        color: c.hex,
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
                <Palette className="h-4 w-4" />
                Color
              </Button>
            </>
          )}

          {(measurements.length > 0 || colorSamples.length > 0) && (
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
                activeMode === "color" ? "cursor-crosshair" : "cursor-crosshair"
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
                      imageToDisplayCoords(mousePosition.x, mousePosition.y).x +
                        10,
                      containerSize.width - 200
                    ),
                    top: Math.max(
                      imageToDisplayCoords(mousePosition.x, mousePosition.y).y -
                        50,
                      10
                    ),
                  }}
                >
                  <Card className="px-2 py-1 bg-black dark:bg-white text-white dark:text-black border-2 border-white dark:border-black shadow-lg">
                    <div className="flex items-center gap-2">
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
                  </Card>
                </div>
              )}

              {/* Current measurement line */}
              {activeMode === "measure" && currentMeasurement && isHovering && (
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
                      imageToDisplayCoords(mousePosition.x, mousePosition.y).x
                    }
                    y2={
                      imageToDisplayCoords(mousePosition.x, mousePosition.y).y
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
                      {/* Start point */}
                      <circle
                        cx={startDisplay.x}
                        cy={startDisplay.y}
                        r="4"
                        fill="#4ade80"
                        stroke="#fff"
                        strokeWidth="2"
                      />
                      {/* End point */}
                      <circle
                        cx={endDisplay.x}
                        cy={endDisplay.y}
                        r="4"
                        fill="#4ade80"
                        stroke="#fff"
                        strokeWidth="2"
                      />
                      {/* Distance label */}
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

                {/* Color sample points */}
                {colorSamples.map((sample) => {
                  const sampleDisplay = imageToDisplayCoords(
                    sample.position.x,
                    sample.position.y
                  );

                  return (
                    <g key={sample.id}>
                      <circle
                        cx={sampleDisplay.x}
                        cy={sampleDisplay.y}
                        r="6"
                        fill={sample.color}
                        stroke="#fff"
                        strokeWidth="2"
                      />
                      <circle
                        cx={sampleDisplay.x}
                        cy={sampleDisplay.y}
                        r="8"
                        fill="none"
                        stroke="#000"
                        strokeWidth="1"
                      />
                    </g>
                  );
                })}
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Specifications panel */}
      {(measurements.length > 0 || colorSamples.length > 0) && (
        <div className="border-t-3 border-black dark:border-white p-4 max-h-48 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Measurements */}
            {measurements.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Ruler className="h-4 w-4" />
                  <Text
                    as="h3"
                    className="font-pixel font-medium text-black dark:text-white"
                  >
                    Measurements ({measurements.length})
                  </Text>
                </div>

                <div className="space-y-2">
                  {measurements.map((measurement, index) => (
                    <Card
                      key={measurement.id}
                      className="p-2 bg-gray-50 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600"
                    >
                      <div className="flex items-center justify-between text-xs">
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
                        ({measurement.startPoint.x}, {measurement.startPoint.y})
                        → ({measurement.endPoint.x}, {measurement.endPoint.y})
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

            {/* Color Samples */}
            {colorSamples.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Palette className="h-4 w-4" />
                  <Text
                    as="h3"
                    className="font-pixel font-medium text-black dark:text-white"
                  >
                    Colors ({colorSamples.length})
                  </Text>
                </div>

                <div className="space-y-2">
                  {colorSamples.map((sample, index) => (
                    <Card
                      key={sample.id}
                      className="p-2 bg-gray-50 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded border border-black dark:border-white"
                            style={{ backgroundColor: sample.color }}
                          />
                          <Text
                            as="span"
                            className="font-pixel text-black dark:text-white text-xs"
                          >
                            #{index + 1}
                          </Text>
                        </div>
                        <button
                          onClick={() => copyColor(sample.hex)}
                          className="text-xs font-pixel text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {sample.hex}
                        </button>
                      </div>
                      <Text
                        as="p"
                        className="text-xs text-gray-600 dark:text-gray-400 mt-1"
                      >
                        Position: ({sample.position.x}, {sample.position.y})
                      </Text>
                    </Card>
                  ))}
                </div>
              </div>
            )}
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
              : "Click on colors to sample them • Hover for coordinates"}
          </Text>
        </div>
      )}
    </div>
  );
}

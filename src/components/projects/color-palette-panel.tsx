"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/retroui/Card";
import { Text } from "@/components/retroui/Text";
import { Button } from "@/components/retroui/Button";
import { Badge } from "@/components/retroui/Badge";
import { useToast } from "@/hooks/use-toast";
import {
  ColorInfo,
  formatColor,
  generateColorVariations,
  sortColorsByBrightness,
  sortColorsByHue,
} from "@/lib/utils/color-utils";
import { Palette, Copy, Download, Trash2, Sparkles, Info } from "lucide-react";

interface ColorPalettePanelProps {
  colors: ColorInfo[];
  onColorRemove: (index: number) => void;
  onClearAll: () => void;
  className?: string;
}

type ColorFormat = "hex" | "rgb" | "hsl" | "css";
type SortType = "extraction" | "brightness" | "hue";

export default function ColorPalettePanel({
  colors,
  onColorRemove,
  onClearAll,
  className = "",
}: ColorPalettePanelProps) {
  const [selectedColorIndex, setSelectedColorIndex] = useState<number | null>(
    null
  );
  const [copyFormat, setCopyFormat] = useState<ColorFormat>("hex");
  const [sortType, setSortType] = useState<SortType>("extraction");
  const [showVariations, setShowVariations] = useState(false);
  const { toast } = useToast();

  // * Sort colors based on selected sort type and maintain original indices
  const sortedColorsWithIndices = (() => {
    const colorsWithIndices = colors.map((color, originalIndex) => ({
      color,
      originalIndex,
    }));

    switch (sortType) {
      case "brightness":
        return colorsWithIndices.sort(
          (a, b) => a.color.brightness - b.color.brightness
        );
      case "hue":
        return colorsWithIndices.sort((a, b) => a.color.hsl.h - b.color.hsl.h);
      case "extraction":
      default:
        return colorsWithIndices;
    }
  })();

  const sortedColors = sortedColorsWithIndices.map((item) => item.color);

  // * Handle selectedColorIndex when colors array changes
  useEffect(() => {
    if (selectedColorIndex !== null) {
      // Check if selectedColorIndex is out of bounds
      if (selectedColorIndex >= sortedColors.length) {
        // Reset to null if index is out of bounds
        setSelectedColorIndex(null);
      } else if (sortedColors.length === 0) {
        // Reset if no colors left
        setSelectedColorIndex(null);
      }
    }
  }, [colors.length, selectedColorIndex, sortedColors.length]);

  // * Reset selectedColorIndex when sorting changes
  useEffect(() => {
    setSelectedColorIndex(null);
  }, [sortType]);

  // * Handle color removal with proper index management
  const handleColorRemove = (sortedIndex: number) => {
    if (sortedIndex < 0 || sortedIndex >= sortedColorsWithIndices.length) {
      console.error("Invalid color index for removal");
      return;
    }

    // Get the original index of the color to remove
    const originalIndex = sortedColorsWithIndices[sortedIndex].originalIndex;

    // Reset selectedColorIndex if we're removing the selected color
    if (selectedColorIndex === sortedIndex) {
      setSelectedColorIndex(null);
    } else if (
      selectedColorIndex !== null &&
      selectedColorIndex > sortedIndex
    ) {
      // Adjust selectedColorIndex if removing a color before the selected one
      setSelectedColorIndex(selectedColorIndex - 1);
    }

    // Remove the color using the original index
    onColorRemove(originalIndex);
  };

  // * Copy color to clipboard
  const copyColor = async (color: ColorInfo, format: ColorFormat) => {
    try {
      const formattedColor = formatColor(color, format);
      await navigator.clipboard.writeText(formattedColor);

      toast({
        message: "Color copied!",
        description: `${formattedColor} copied to clipboard`,
        variant: "success",
      });
    } catch (error) {
      console.error("Failed to copy color:", error);
      toast({
        message: "Failed to copy color",
        variant: "error",
      });
    }
  };

  // * Export palette as JSON
  const exportPalette = () => {
    const paletteData = {
      colors: colors.map((color, index) => ({
        id: index + 1,
        hex: color.hex,
        rgb: color.rgb,
        hsl: color.hsl,
        brightness: color.brightness,
        contrast: color.contrast,
      })),
      exportedAt: new Date().toISOString(),
      totalColors: colors.length,
    };

    const dataStr = JSON.stringify(paletteData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `color-palette-${Date.now()}.json`;
    link.click();

    URL.revokeObjectURL(url);

    toast({
      message: "Palette exported",
      description: `${colors.length} colors exported as JSON`,
      variant: "success",
    });
  };

  // * Get accessibility badge for contrast rating
  const getAccessibilityBadge = (rating: string) => {
    const badgeProps = {
      AAA: {
        variant: "primary" as const,
        label: "AAA",
        color: "text-green-600",
      },
      AA: { variant: "primary" as const, label: "AA", color: "text-blue-600" },
      A: { variant: "outline" as const, label: "A", color: "text-yellow-600" },
      Fail: {
        variant: "outline" as const,
        label: "Fail",
        color: "text-red-600",
      },
    };

    const props =
      badgeProps[rating as keyof typeof badgeProps] || badgeProps.Fail;

    return (
      <Badge
        variant={props.variant}
        size="sm"
        className={`${props.color} text-xs`}
      >
        {props.label}
      </Badge>
    );
  };

  // * Generate color variations for selected color
  const getColorVariations = (color: ColorInfo) => {
    if (!showVariations) return [];
    return generateColorVariations(color);
  };

  // * Get the currently selected color with bounds checking
  const getSelectedColor = (): ColorInfo | null => {
    if (
      selectedColorIndex === null ||
      selectedColorIndex < 0 ||
      selectedColorIndex >= sortedColors.length
    ) {
      return null;
    }
    return sortedColors[selectedColorIndex];
  };

  if (colors.length === 0) {
    return (
      <Card
        className={`p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 ${className}`}
      >
        <div className="text-center">
          <Palette className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <Text
            as="h3"
            className="font-medium font-pixel text-black dark:text-white mb-2"
          >
            No colors extracted yet
          </Text>
          <Text as="p" className="text-sm text-gray-600 dark:text-gray-400">
            Switch to color mode and click on the design to sample colors
          </Text>
        </div>
      </Card>
    );
  }

  const selectedColor = getSelectedColor();

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          <Text
            as="h3"
            className="font-pixel font-medium text-black dark:text-white"
          >
            Color Palette ({colors.length})
          </Text>
        </div>

        <div className="flex items-center gap-2">
          {/* Sort dropdown */}
          <select
            value={sortType}
            onChange={(e) => setSortType(e.target.value as SortType)}
            className="text-xs px-2 py-1 border-2 border-black dark:border-white rounded font-pixel bg-white dark:bg-gray-800"
          >
            <option value="extraction">Extraction Order</option>
            <option value="brightness">Brightness</option>
            <option value="hue">Hue</option>
          </select>

          {/* Format selector */}
          <select
            value={copyFormat}
            onChange={(e) => setCopyFormat(e.target.value as ColorFormat)}
            className="text-xs px-2 py-1 border-2 border-black dark:border-white rounded font-pixel bg-white dark:bg-gray-800"
          >
            <option value="hex">HEX</option>
            <option value="rgb">RGB</option>
            <option value="hsl">HSL</option>
            <option value="css">CSS</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={exportPalette}
            className="gap-1"
          >
            <Download className="h-3 w-3" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onClearAll}
            className="gap-1"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Color grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {sortedColors.map((color, index) => (
          <Card
            key={`${color.hex}-${sortedColorsWithIndices[index].originalIndex}`}
            className={`p-3 border-2 cursor-pointer transition-all ${
              selectedColorIndex === index
                ? "border-blue-500 shadow-lg"
                : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
            }`}
            onClick={() =>
              setSelectedColorIndex(selectedColorIndex === index ? null : index)
            }
          >
            {/* Color swatch */}
            <div
              className="w-full h-16 rounded border-2 border-black dark:border-white mb-2"
              style={{ backgroundColor: color.hex }}
            />

            {/* Color info */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Text
                  as="span"
                  className="text-xs font-pixel font-medium text-black dark:text-white"
                >
                  {color.hex.toUpperCase()}
                </Text>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    copyColor(color, copyFormat);
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <Copy className="h-3 w-3" />
                </button>
              </div>

              <Text as="p" className="text-xs text-gray-600 dark:text-gray-400">
                RGB({color.rgb.r}, {color.rgb.g}, {color.rgb.b})
              </Text>

              <div className="flex items-center justify-between">
                <Text
                  as="span"
                  className="text-xs text-gray-600 dark:text-gray-400"
                >
                  {color.hsl.h}°, {color.hsl.s}%, {color.hsl.l}%
                </Text>
                {getAccessibilityBadge(color.contrast.rating)}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Detailed color information for selected color */}
      {selectedColor && (
        <Card className="p-4 border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20">
          <div className="flex items-start gap-4">
            {/* Large color swatch */}
            <div
              className="w-20 h-20 rounded border-2 border-black dark:border-white flex-shrink-0"
              style={{ backgroundColor: selectedColor.hex }}
            />

            {/* Detailed info */}
            <div className="flex-1 space-y-3">
              <div>
                <Text
                  as="h4"
                  className="font-pixel font-medium text-black dark:text-white mb-2"
                >
                  Color Details
                </Text>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <Text
                      as="span"
                      className="font-medium text-gray-700 dark:text-gray-300"
                    >
                      Formats:
                    </Text>
                    <div className="mt-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span>HEX:</span>
                        <button
                          onClick={() => copyColor(selectedColor, "hex")}
                          className="font-mono hover:bg-gray-200 dark:hover:bg-gray-700 px-1 rounded"
                        >
                          {selectedColor.hex.toUpperCase()}
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>RGB:</span>
                        <button
                          onClick={() => copyColor(selectedColor, "rgb")}
                          className="font-mono hover:bg-gray-200 dark:hover:bg-gray-700 px-1 rounded"
                        >
                          {selectedColor.rgb.r}, {selectedColor.rgb.g},{" "}
                          {selectedColor.rgb.b}
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>HSL:</span>
                        <button
                          onClick={() => copyColor(selectedColor, "hsl")}
                          className="font-mono hover:bg-gray-200 dark:hover:bg-gray-700 px-1 rounded"
                        >
                          {selectedColor.hsl.h}°, {selectedColor.hsl.s}%,{" "}
                          {selectedColor.hsl.l}%
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Text
                      as="span"
                      className="font-medium text-gray-700 dark:text-gray-300"
                    >
                      Accessibility:
                    </Text>
                    <div className="mt-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span>vs White:</span>
                        <span className="font-mono">
                          {selectedColor.contrast.white}:1
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>vs Black:</span>
                        <span className="font-mono">
                          {selectedColor.contrast.black}:1
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Rating:</span>
                        {getAccessibilityBadge(selectedColor.contrast.rating)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyColor(selectedColor, "css")}
                  className="gap-1"
                >
                  <Copy className="h-3 w-3" />
                  Copy CSS
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowVariations(!showVariations)}
                  className="gap-1"
                >
                  <Sparkles className="h-3 w-3" />
                  {showVariations ? "Hide" : "Show"} Variations
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleColorRemove(selectedColorIndex!)}
                  className="gap-1 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                  Remove
                </Button>
              </div>
            </div>
          </div>

          {/* Color variations */}
          {showVariations && selectedColor && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Text
                as="h5"
                className="text-sm font-medium font-pixel text-black dark:text-white mb-2"
              >
                Color Variations
              </Text>
              <div className="grid grid-cols-7 gap-2">
                {getColorVariations(selectedColor).map((variation, vIndex) => (
                  <button
                    key={vIndex}
                    onClick={() => copyColor(variation, copyFormat)}
                    className="group relative"
                    title={`${variation.hex} (Click to copy)`}
                  >
                    <div
                      className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600 group-hover:border-black dark:group-hover:border-white transition-colors"
                      style={{ backgroundColor: variation.hex }}
                    />
                    <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                      {variation.hsl.l}%
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Accessibility info panel */}
      <Card className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-300 dark:border-yellow-700">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-yellow-600 mt-0.5" />
          <div>
            <Text
              as="h4"
              className="text-sm font-medium font-pixel text-yellow-800 dark:text-yellow-200 mb-1"
            >
              Accessibility Guidelines
            </Text>
            <Text
              as="p"
              className="text-xs text-yellow-700 dark:text-yellow-300"
            >
              <strong>AAA:</strong> 7:1 contrast (best) • <strong>AA:</strong>{" "}
              4.5:1 contrast (good) •<strong>A:</strong> 3:1 contrast (minimum)
              • <strong>Fail:</strong> Below 3:1 (poor)
            </Text>
          </div>
        </div>
      </Card>
    </div>
  );
}

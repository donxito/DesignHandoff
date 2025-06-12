"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/retroui/Card";
import { Text } from "@/components/retroui/Text";
import { Button } from "@/components/retroui/Button";
import { Badge } from "@/components/retroui/Badge";
import { Input } from "@/components/retroui/Input";
import { useToast } from "@/hooks/use-toast";
import {
  TypographyProperties,
  formatTypographyAsCSS,
  formatTypographyAsTailwind,
  formatTypographyAsCustomProperties,
  analyzeTypography,
  FONT_STACKS,
} from "@/lib/utils/typography-utils";
import { Type, Copy, Trash2, Edit3, Info, AlertCircle } from "lucide-react";

interface TypographyPanelProps {
  typography: TypographyProperties[];
  onTypographyRemove: (index: number) => void;
  onTypographyUpdate: (index: number, updated: TypographyProperties) => void;
  onClearAll: () => void;
  className?: string;
}

type CopyFormat = "css" | "tailwind" | "custom-properties";
type SortType = "creation" | "size" | "weight" | "type";

export default function TypographyPanel({
  typography,
  onTypographyRemove,
  onTypographyUpdate,
  onClearAll,
  className = "",
}: TypographyPanelProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [copyFormat, setCopyFormat] = useState<CopyFormat>("css");
  const [sortType, setSortType] = useState<SortType>("creation");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const { toast } = useToast();

  // * Sort typography based on selected sort type
  const sortedTypographyWithIndices = (() => {
    const typographyWithIndices = typography.map((typo, originalIndex) => ({
      typography: typo,
      originalIndex,
    }));

    switch (sortType) {
      case "size":
        return typographyWithIndices.sort(
          (a, b) => b.typography.fontSize - a.typography.fontSize
        );
      case "weight":
        return typographyWithIndices.sort((a, b) => {
          const aWeight =
            typeof a.typography.fontWeight === "number"
              ? a.typography.fontWeight
              : 400;
          const bWeight =
            typeof b.typography.fontWeight === "number"
              ? b.typography.fontWeight
              : 400;
          return bWeight - aWeight;
        });
      case "type":
        return typographyWithIndices.sort((a, b) =>
          a.typography.type.localeCompare(b.typography.type)
        );
      case "creation":
      default:
        return typographyWithIndices;
    }
  })();

  // * Handle selectedIndex when typography array changes
  useEffect(() => {
    if (selectedIndex !== null && selectedIndex >= typography.length) {
      setSelectedIndex(null);
    }
  }, [typography.length, selectedIndex]);

  // * Copy typography properties to clipboard
  const copyTypography = async (
    typo: TypographyProperties,
    format: CopyFormat
  ) => {
    let content = "";

    switch (format) {
      case "css":
        content = formatTypographyAsCSS(typo);
        break;
      case "tailwind":
        content = formatTypographyAsTailwind(typo);
        break;
      case "custom-properties":
        content = formatTypographyAsCustomProperties(typo);
        break;
    }

    try {
      await navigator.clipboard.writeText(content);
      toast({
        message: "Copied to clipboard",
        description: `${format.toUpperCase()} properties copied`,
      });
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      toast({
        message: "Copy failed",
        description: "Unable to copy to clipboard",
        variant: "error",
      });
    }
  };

  // * Update typography label
  const updateTypographyLabel = (index: number, newLabel: string) => {
    const originalIndex = sortedTypographyWithIndices[index].originalIndex;
    const updated = { ...typography[originalIndex], label: newLabel };
    onTypographyUpdate(originalIndex, updated);
    setEditingIndex(null);
  };

  // * Get type badge variant based on typography type
  const getTypeVariant = (type: string) => {
    switch (type) {
      case "heading":
        return "primary";
      case "body":
        return "secondary";
      case "button":
        return "success";
      case "caption":
        return "warning";
      case "code":
        return "solid";
      default:
        return "outline";
    }
  };

  // * Get readability badge variant
  const getReadabilityVariant = (readability: string) => {
    switch (readability) {
      case "excellent":
        return "success";
      case "good":
        return "primary";
      case "fair":
        return "warning";
      case "poor":
        return "danger";
      default:
        return "outline";
    }
  };

  if (typography.length === 0) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="text-center py-8">
          <Type className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
          <Text className="text-gray-500 dark:text-gray-400">
            Click on text elements to inspect typography
          </Text>
        </div>
      </div>
    );
  }

  const selectedTypography =
    selectedIndex !== null
      ? sortedTypographyWithIndices[selectedIndex]?.typography
      : null;

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="p-4 border-b-3 border-black dark:border-white">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Type className="h-5 w-5" />
            <Text as="h3" className="font-pixel font-bold">
              Typography ({typography.length})
            </Text>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAnalysis(!showAnalysis)}
              className="gap-1"
            >
              <Info className="h-3 w-3" />
              {showAnalysis ? "Hide" : "Show"} Analysis
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onClearAll}
              className="gap-1 text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-3 w-3" />
              Clear All
            </Button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <Text className="text-sm font-pixel">Sort:</Text>
          <select
            value={sortType}
            onChange={(e) => setSortType(e.target.value as SortType)}
            className="px-2 py-1 text-xs border-2 border-black dark:border-white rounded-none bg-white dark:bg-gray-800"
          >
            <option value="creation">Creation Order</option>
            <option value="size">Font Size</option>
            <option value="weight">Font Weight</option>
            <option value="type">Type</option>
          </select>

          <Text className="text-sm font-pixel ml-2">Format:</Text>
          <select
            value={copyFormat}
            onChange={(e) => setCopyFormat(e.target.value as CopyFormat)}
            className="px-2 py-1 text-xs border-2 border-black dark:border-white rounded-none bg-white dark:bg-gray-800"
          >
            <option value="css">CSS</option>
            <option value="tailwind">Tailwind</option>
            <option value="custom-properties">CSS Variables</option>
          </select>
        </div>
      </div>

      {/* Typography List */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-2 p-4">
          {sortedTypographyWithIndices.map(
            ({ typography: typo, originalIndex }, sortedIndex) => {
              const analysis = showAnalysis ? analyzeTypography(typo) : null;
              const isSelected = selectedIndex === sortedIndex;
              const isEditing = editingIndex === sortedIndex;

              return (
                <Card
                  key={typo.id}
                  className={`p-3 cursor-pointer transition-all ${
                    isSelected
                      ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  }`}
                  onClick={() =>
                    setSelectedIndex(isSelected ? null : sortedIndex)
                  }
                >
                  {/* Typography Preview */}
                  <div className="mb-3">
                    <div
                      className="font-pixel text-black dark:text-white"
                      style={{
                        fontFamily: typo.fontFamily,
                        fontSize: `${Math.min(typo.fontSize, 24)}px`,
                        fontWeight: typo.fontWeight,
                        lineHeight: typo.lineHeight,
                        color: typo.color,
                        letterSpacing: `${typo.letterSpacing}px`,
                      }}
                    >
                      {typo.label || `Sample ${typo.type} text`}
                    </div>
                  </div>

                  {/* Typography Info */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <Input
                          value={typo.label || ""}
                          onChange={(e) =>
                            updateTypographyLabel(sortedIndex, e.target.value)
                          }
                          onBlur={() => setEditingIndex(null)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              updateTypographyLabel(
                                sortedIndex,
                                (e.target as HTMLInputElement).value
                              );
                            } else if (e.key === "Escape") {
                              setEditingIndex(null);
                            }
                          }}
                          className="h-6 text-xs"
                          autoFocus
                        />
                      ) : (
                        <>
                          <Text className="font-medium text-sm">
                            {typo.label || `${typo.type} ${sortedIndex + 1}`}
                          </Text>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingIndex(sortedIndex);
                            }}
                            className="h-6 w-6 p-0"
                          >
                            <Edit3 className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge variant={getTypeVariant(typo.type)} size="sm">
                        {typo.type}
                      </Badge>
                      {showAnalysis && analysis && (
                        <Badge
                          variant={getReadabilityVariant(analysis.readability)}
                          size="sm"
                        >
                          {analysis.readability}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Typography Properties */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <Text className="text-gray-600 dark:text-gray-400">
                        Font
                      </Text>
                      <Text className="font-mono">{typo.fontFamily}</Text>
                    </div>
                    <div>
                      <Text className="text-gray-600 dark:text-gray-400">
                        Size
                      </Text>
                      <Text className="font-mono">{typo.fontSize}px</Text>
                    </div>
                    <div>
                      <Text className="text-gray-600 dark:text-gray-400">
                        Weight
                      </Text>
                      <Text className="font-mono">{typo.fontWeight}</Text>
                    </div>
                    <div>
                      <Text className="text-gray-600 dark:text-gray-400">
                        Line Height
                      </Text>
                      <Text className="font-mono">{typo.lineHeight}</Text>
                    </div>
                  </div>

                  {/* Color Preview */}
                  <div className="flex items-center gap-2 mt-2">
                    <div
                      className="w-4 h-4 rounded border-2 border-black dark:border-white"
                      style={{ backgroundColor: typo.color }}
                    />
                    <Text className="font-mono text-xs">
                      {typo.color.toUpperCase()}
                    </Text>
                  </div>

                  {/* Analysis (if enabled) */}
                  {showAnalysis &&
                    analysis &&
                    analysis.recommendations.length > 0 && (
                      <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                        <div className="flex items-center gap-1 mb-1">
                          <AlertCircle className="h-3 w-3 text-yellow-600" />
                          <Text className="text-xs font-medium text-yellow-800 dark:text-yellow-200">
                            Recommendations
                          </Text>
                        </div>
                        {analysis.recommendations.map((rec, i) => (
                          <Text
                            key={i}
                            className="text-xs text-yellow-700 dark:text-yellow-300"
                          >
                            • {rec}
                          </Text>
                        ))}
                      </div>
                    )}

                  {/* Actions */}
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyTypography(typo, copyFormat);
                      }}
                      className="gap-1 text-xs"
                    >
                      <Copy className="h-3 w-3" />
                      Copy {copyFormat.toUpperCase()}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTypographyRemove(originalIndex);
                      }}
                      className="gap-1 text-xs text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                      Remove
                    </Button>
                  </div>
                </Card>
              );
            }
          )}
        </div>
      </div>

      {/* Selected Typography Details */}
      {selectedTypography && (
        <div className="border-t-3 border-black dark:border-white p-4 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center gap-2 mb-3">
            <Type className="h-4 w-4" />
            <Text className="font-pixel font-bold">
              {selectedTypography.label || "Typography Details"}
            </Text>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Text className="text-gray-600 dark:text-gray-400 mb-1">
                Font Stack
              </Text>
              <Text className="font-mono text-xs">
                {FONT_STACKS[selectedTypography.fontFamily]?.fallbacks.join(
                  ", "
                ) || "No fallbacks defined"}
              </Text>
            </div>
            <div>
              <Text className="text-gray-600 dark:text-gray-400 mb-1">
                Position
              </Text>
              <Text className="font-mono text-xs">
                x: {selectedTypography.position.x}, y:{" "}
                {selectedTypography.position.y}
              </Text>
            </div>
            <div>
              <Text className="text-gray-600 dark:text-gray-400 mb-1">
                Letter Spacing
              </Text>
              <Text className="font-mono text-xs">
                {selectedTypography.letterSpacing}px
              </Text>
            </div>
            <div>
              <Text className="text-gray-600 dark:text-gray-400 mb-1">
                Text Transform
              </Text>
              <Text className="font-mono text-xs">
                {selectedTypography.textTransform}
              </Text>
            </div>
          </div>

          {showAnalysis &&
            (() => {
              const analysis = analyzeTypography(selectedTypography);
              return (
                <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <Text className="font-medium mb-2">Readability Analysis</Text>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant={getReadabilityVariant(analysis.readability)}
                    >
                      {analysis.readability}
                    </Badge>
                    <Text className="text-xs text-gray-600 dark:text-gray-400">
                      Line height: {analysis.metrics.lineHeightPx}px
                    </Text>
                  </div>
                  {analysis.recommendations.length > 0 && (
                    <div className="space-y-1">
                      {analysis.recommendations.map((rec, i) => (
                        <Text
                          key={i}
                          className="text-xs text-gray-700 dark:text-gray-300"
                        >
                          • {rec}
                        </Text>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/retroui/Button";
import { Badge } from "@/components/retroui/Badge";
import { Card, CardContent } from "@/components/retroui/Card";
import { Input } from "@/components/retroui/Input";
import { Label } from "@/components/retroui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/retroui/Select";
import {
  Download,
  Trash2,
  Search,
  Filter,
  Grid,
  List,
  Calendar,
  FileImage,
  Package2,
} from "lucide-react";
import { useDeleteExportedAsset } from "@/hooks/useAssetExport";
import type {
  ExportedAsset,
  ExportFormat,
  ResolutionScale,
} from "@/lib/types/assetExport";

interface ExportedAssetsListProps {
  assets: ExportedAsset[];
  isLoading?: boolean;
  showFilters?: boolean;
  defaultView?: "grid" | "list";
}

type SortOption = "newest" | "oldest" | "name" | "size" | "format";

export function ExportedAssetsList({
  assets,
  isLoading = false,
  showFilters = true,
  defaultView = "grid",
}: ExportedAssetsListProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">(defaultView);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterFormat, setFilterFormat] = useState<ExportFormat | "all">("all");
  const [filterScale, setFilterScale] = useState<ResolutionScale | "all">(
    "all"
  );
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  const { mutateAsync: deleteAsset } = useDeleteExportedAsset();

  // Filter and sort assets
  const filteredAssets = assets
    .filter((asset) => {
      // Search filter
      if (
        searchTerm &&
        !asset.name.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }

      // Format filter
      if (filterFormat !== "all" && asset.format !== filterFormat) {
        return false;
      }

      // Scale filter
      if (filterScale !== "all" && asset.scale !== filterScale) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.created_at || "").getTime() -
            new Date(a.created_at || "").getTime()
          );
        case "oldest":
          return (
            new Date(a.created_at || "").getTime() -
            new Date(b.created_at || "").getTime()
          );
        case "name":
          return a.name.localeCompare(b.name);
        case "size":
          return b.file_size - a.file_size;
        case "format":
          return a.format.localeCompare(b.format);
        default:
          return 0;
      }
    });

  const handleDownload = (asset: ExportedAsset) => {
    const link = document.createElement("a");
    link.href = asset.file_url;
    link.download = `${asset.name}.${asset.format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (asset: ExportedAsset) => {
    if (
      confirm(
        `Are you sure you want to delete "${asset.name}.${asset.format}"?`
      )
    ) {
      try {
        await deleteAsset(asset.id);
      } catch (error) {
        console.error("Failed to delete asset:", error);
        // You might want to show an error toast here
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-muted rounded w-1/3"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div className="text-center py-8">
        <Package2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No exported assets</h3>
        <p className="text-muted-foreground">
          Export your first asset to see it listed here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters and Controls */}
      {showFilters && (
        <div className="space-y-4">
          {/* Search and View Toggle */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search assets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex items-center gap-1 border rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 text-sm">
            <Label className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters:
            </Label>

            <Select
              value={filterFormat}
              onValueChange={(value: string) =>
                setFilterFormat(value as ExportFormat | "all")
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All formats</SelectItem>
                <SelectItem value="png">PNG</SelectItem>
                <SelectItem value="jpg">JPG</SelectItem>
                <SelectItem value="webp">WebP</SelectItem>
                <SelectItem value="svg">SVG</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filterScale.toString()}
              onValueChange={(value: string) =>
                setFilterScale(
                  value === "all" ? "all" : (parseInt(value) as ResolutionScale)
                )
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Resolution" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All scales</SelectItem>
                <SelectItem value="1">1x</SelectItem>
                <SelectItem value="2">2x</SelectItem>
                <SelectItem value="3">3x</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={sortBy}
              onValueChange={(value: SortOption) => setSortBy(value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="size">Size</SelectItem>
                <SelectItem value="format">Format</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="h-px bg-border w-full"></div>
        </div>
      )}

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredAssets.length} of {assets.length} assets
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAssets.map((asset) => (
          <Card key={asset.id} className="overflow-hidden">
            <CardContent className="p-0">
              {/* Asset Preview */}
              <div className="aspect-square relative bg-muted">
                {asset.format !== "svg" ? (
                  <Image
                    src={asset.file_url}
                    alt={asset.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <FileImage className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}

                {/* Quick Actions Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="sm" onClick={() => handleDownload(asset)}>
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(asset)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Asset Info */}
              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm truncate">{asset.name}</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(asset)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {asset.format.toUpperCase()}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {asset.scale}x
                  </Badge>
                </div>

                <div className="text-xs text-muted-foreground space-y-1">
                  <div>
                    {asset.width} × {asset.height}px
                  </div>
                  <div>{formatFileSize(asset.file_size)}</div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {asset.created_at
                      ? new Date(asset.created_at).toLocaleDateString()
                      : "Unknown"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {filteredAssets.length === 0 && assets.length > 0 && (
        <div className="text-center py-8">
          <Search className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">
            No assets match your current filters.
          </p>
          <Button
            variant="outline"
            className="mt-2"
            onClick={() => {
              setSearchTerm("");
              setFilterFormat("all");
              setFilterScale("all");
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}

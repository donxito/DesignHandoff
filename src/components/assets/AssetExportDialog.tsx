"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Download, Loader2 } from "lucide-react";

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface AssetExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  designFileId: string;
  imageUrl: string;
  defaultName: string;
  cropArea?: CropArea;
}

export function AssetExportDialog({
  isOpen,
  onClose,
  imageUrl,
  defaultName,
}: AssetExportDialogProps) {
  const [assetName, setAssetName] = useState(defaultName);
  const [format, setFormat] = useState("png");
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      // Create a simple download link
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = `${assetName}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Close after short delay
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog>
      {isOpen && (
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Export Asset</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="asset-name">Asset Name</Label>
              <Input
                id="asset-name"
                value={assetName}
                onChange={(e) => setAssetName(e.target.value)}
                placeholder="Enter asset name"
              />
            </div>

            <div className="space-y-2">
              <Label>Format</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="png">PNG</SelectItem>
                  <SelectItem value="jpg">JPG</SelectItem>
                  <SelectItem value="webp">WebP</SelectItem>
                  <SelectItem value="svg">SVG</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isExporting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleExport}
                disabled={isExporting || !assetName.trim()}
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export Asset
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}

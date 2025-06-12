"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/retroui/Button";
import { Card } from "@/components/retroui/Card";
import { Text } from "@/components/retroui/Text";
import { Badge } from "@/components/retroui/Badge";
import { Printer, FileText, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  DesignSpecification,
  createDesignSpecification,
  PrintableSpecification,
} from "@/lib/utils/spec-export-utils";
import { DesignFile } from "@/lib/types/designFile";

interface BatchPDFExportProps {
  isOpen: boolean;
  onClose: () => void;
  imageFiles: DesignFile[];
  projectName?: string;
}

interface SpecWithFile {
  file: DesignFile;
  spec: DesignSpecification;
  selected: boolean;
}

interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
}

const Checkbox = ({
  checked,
  onCheckedChange,
  onClick,
  className = "",
}: CheckboxProps) => {
  return (
    <button
      type="button"
      onClick={(e) => {
        onCheckedChange(!checked);
        onClick?.(e);
      }}
      className={`
        w-5 h-5 border-2 border-black dark:border-white 
        bg-white dark:bg-gray-800 
        flex items-center justify-center 
        hover:bg-gray-50 dark:hover:bg-gray-700 
        transition-colors duration-200
        ${className}
      `}
    >
      {checked && <Check className="h-3 w-3 text-black dark:text-white" />}
    </button>
  );
};

export function BatchPDFExport({
  isOpen,
  onClose,
  imageFiles,
  projectName,
}: BatchPDFExportProps) {
  const [selectedSpecs, setSelectedSpecs] = useState<SpecWithFile[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // * Initialize specs when dialog opens
  const initializeSpecs = useCallback(() => {
    const specs: SpecWithFile[] = imageFiles.map((file) => ({
      file,
      spec: createDesignSpecification(
        file.file_name,
        [], // ? Colors would come from actual extraction
        [], // ? Typography would come from actual extraction
        [], // ? Measurements would come from actual extraction
        file.file_url,
        projectName,
        undefined
      ),
      selected: true,
    }));
    setSelectedSpecs(specs);
  }, [imageFiles, projectName]);

  // * Initialize on open
  useEffect(() => {
    if (isOpen && imageFiles.length > 0) {
      initializeSpecs();
    }
  }, [isOpen, imageFiles, projectName, initializeSpecs]);

  // * Handle individual spec selection
  const toggleSpecSelection = (index: number) => {
    setSelectedSpecs((prev) =>
      prev.map((spec, i) =>
        i === index ? { ...spec, selected: !spec.selected } : spec
      )
    );
  };

  // * Handle select all/none
  const toggleSelectAll = () => {
    const allSelected = selectedSpecs.every((spec) => spec.selected);
    setSelectedSpecs((prev) =>
      prev.map((spec) => ({ ...spec, selected: !allSelected }))
    );
  };

  // * React-to-print configuration
  const handleBatchPrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Design-Specifications-${projectName || "Batch"}`,
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
        .page-break {
          page-break-before: always;
        }
      }
    `,
    onBeforePrint: async () => {
      setIsGenerating(true);
    },
    onAfterPrint: async () => {
      setIsGenerating(false);
      toast({
        message: "Batch PDF generated successfully",
        description: `${selectedSpecs.filter((s) => s.selected).length} design specifications printed`,
      });
      onClose();
    },
  });

  const selectedCount = selectedSpecs.filter((spec) => spec.selected).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative bg-white p-6 max-w-4xl w-full h-[80vh] border-3 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:bg-gray-900 dark:border-white dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.5)] rounded-lg flex flex-col">
        <div className="mb-6 pb-4 text-center border-b-3 border-black bg-gradient-to-r from-yellow-300 to-yellow-400 -mx-6 -mt-6 p-4">
          <div className="flex items-center justify-between">
            <div>
              <Text
                as="h2"
                className="text-xl font-bold font-pixel text-black dark:text-white"
              >
                Batch PDF Export
              </Text>
              <Text className="text-gray-600 dark:text-gray-400 mt-1">
                Generate PDF specifications for multiple design files
              </Text>
            </div>
            <Badge variant="primary" size="sm">
              {selectedCount} of {selectedSpecs.length} selected
            </Badge>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {/* Select All Controls */}
          <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-black dark:border-white">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedSpecs.every((spec) => spec.selected)}
                onCheckedChange={toggleSelectAll}
              />
              <Text className="font-medium">Select All Design Files</Text>
            </div>
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              {selectedCount} file{selectedCount !== 1 ? "s" : ""} will be
              included in the PDF
            </Text>
          </div>

          {/* File List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedSpecs.map((specWithFile, index) => (
              <Card
                key={specWithFile.file.id}
                className={`p-4 cursor-pointer transition-all ${
                  specWithFile.selected
                    ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "hover:shadow-md"
                }`}
                onClick={() => toggleSpecSelection(index)}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={specWithFile.selected}
                    onCheckedChange={() => toggleSpecSelection(index)}
                    onClick={(e) => e.stopPropagation()}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <Text className="font-medium truncate">
                        {specWithFile.file.file_name}
                      </Text>
                    </div>

                    <Text className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Size:{" "}
                      {(
                        (specWithFile.file.file_size || 0) /
                        (1024 * 1024)
                      ).toFixed(2)}{" "}
                      MB
                    </Text>

                    {/* Preview of what will be included */}
                    <div className="flex items-center gap-1 text-xs">
                      <Badge variant="outline" size="sm">
                        Metadata
                      </Badge>
                      <Badge variant="outline" size="sm">
                        Image Info
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {selectedSpecs.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <Text className="text-gray-500">
                No image files available for export
              </Text>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3 pt-4 border-t-3 border-black -mx-6 -mb-6 p-4 bg-gray-100">
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleBatchPrint}
              disabled={selectedCount === 0 || isGenerating}
              className="gap-2"
            >
              <Printer className="h-4 w-4" />
              {isGenerating
                ? "Generating..."
                : `Print ${selectedCount} Specification${selectedCount !== 1 ? "s" : ""}`}
            </Button>
          </div>
        </div>

        {/* Close button */}
        <button
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-red-500 text-white font-bold border-2 border-black hover:bg-red-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        {/* Hidden printable content */}
        <div style={{ display: "none" }}>
          <div ref={printRef}>
            {selectedSpecs
              .filter((specWithFile) => specWithFile.selected)
              .map((specWithFile, index) => (
                <div key={specWithFile.file.id}>
                  {index > 0 && <div className="page-break" />}
                  <PrintableSpecification spec={specWithFile.spec} />
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

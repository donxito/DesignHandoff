"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/retroui/Button";
import { X, Move } from "lucide-react";
import {
  AssetSelection,
  Point,
  ResizeHandle,
} from "@/lib/types/asset-extraction";
import {
  boundsToPixels,
  imageToScreenCoords,
  //screenToImageCoords,
  pixelsToBounds,
  clampSelectionBounds,
  generateResizeHandles,
} from "@/lib/utils/asset-extraction";

interface SelectionRectangleProps {
  selection: AssetSelection;
  imageElement: HTMLImageElement;
  containerElement: HTMLElement;
  isActive: boolean;
  onUpdate: (selection: AssetSelection) => void;
  onDelete: (selectionId: string) => void;
  onSelect: () => void;
}

export default function SelectionRectangle({
  selection,
  imageElement,
  containerElement,
  isActive,
  onUpdate,
  onDelete,
  onSelect,
}: SelectionRectangleProps) {
  const [isResizing, setIsResizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [activeHandle, setActiveHandle] = useState<ResizeHandle | null>(null);
  const [dragStartPoint, setDragStartPoint] = useState<Point | null>(null);
  const [originalBounds, setOriginalBounds] = useState(selection.bounds);

  // * Calculate screen position and dimensions
  const getScreenBounds = () => {
    const pixelBounds = boundsToPixels(
      selection.bounds,
      imageElement.naturalWidth,
      imageElement.naturalHeight
    );

    const topLeft = imageToScreenCoords(
      { x: pixelBounds.x, y: pixelBounds.y },
      imageElement,
      containerElement
    );

    const bottomRight = imageToScreenCoords(
      {
        x: pixelBounds.x + pixelBounds.width,
        y: pixelBounds.y + pixelBounds.height,
      },
      imageElement,
      containerElement
    );

    const containerRect = containerElement.getBoundingClientRect();

    return {
      left: topLeft.x - containerRect.left,
      top: topLeft.y - containerRect.top,
      width: bottomRight.x - topLeft.x,
      height: bottomRight.y - topLeft.y,
    };
  };

  const screenBounds = getScreenBounds();

  // * Handle resize handle mouse down
  const handleResizeStart = (e: React.MouseEvent, handle: ResizeHandle) => {
    e.stopPropagation();
    setIsResizing(true);
    setActiveHandle(handle);
    setDragStartPoint({ x: e.clientX, y: e.clientY });
    setOriginalBounds(selection.bounds);
    onSelect();
  };

  // * Handle selection move start
  const handleMoveStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    setDragStartPoint({ x: e.clientX, y: e.clientY });
    setOriginalBounds(selection.bounds);
    onSelect();
  };

  // * Handle mouse move for resizing or dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragStartPoint) return;

      const deltaX = e.clientX - dragStartPoint.x;
      const deltaY = e.clientY - dragStartPoint.y;

      if (isResizing && activeHandle) {
        handleResize(deltaX, deltaY);
      } else if (isDragging) {
        handleMove(deltaX, deltaY);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setIsDragging(false);
      setActiveHandle(null);
      setDragStartPoint(null);
    };

    if (isResizing || isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isResizing, isDragging, activeHandle, dragStartPoint, originalBounds]);

  // * Handle resize logic
  const handleResize = (deltaX: number, deltaY: number) => {
    if (!activeHandle) return;

    // Convert screen deltas to image coordinate deltas
    const scaleX = imageElement.naturalWidth / imageElement.clientWidth;
    const scaleY = imageElement.naturalHeight / imageElement.clientHeight;
    const imageDeltaX = deltaX * scaleX;
    const imageDeltaY = deltaY * scaleY;

    // Calculate new bounds based on handle type
    let newBounds = { ...originalBounds };
    const originalPixelBounds = boundsToPixels(
      originalBounds,
      imageElement.naturalWidth,
      imageElement.naturalHeight
    );

    switch (activeHandle.type) {
      case "nw":
        newBounds = pixelsToBounds(
          {
            x: originalPixelBounds.x + imageDeltaX,
            y: originalPixelBounds.y + imageDeltaY,
            width: originalPixelBounds.width - imageDeltaX,
            height: originalPixelBounds.height - imageDeltaY,
          },
          imageElement.naturalWidth,
          imageElement.naturalHeight
        );
        break;
      case "ne":
        newBounds = pixelsToBounds(
          {
            x: originalPixelBounds.x,
            y: originalPixelBounds.y + imageDeltaY,
            width: originalPixelBounds.width + imageDeltaX,
            height: originalPixelBounds.height - imageDeltaY,
          },
          imageElement.naturalWidth,
          imageElement.naturalHeight
        );
        break;
      case "sw":
        newBounds = pixelsToBounds(
          {
            x: originalPixelBounds.x + imageDeltaX,
            y: originalPixelBounds.y,
            width: originalPixelBounds.width - imageDeltaX,
            height: originalPixelBounds.height + imageDeltaY,
          },
          imageElement.naturalWidth,
          imageElement.naturalHeight
        );
        break;
      case "se":
        newBounds = pixelsToBounds(
          {
            x: originalPixelBounds.x,
            y: originalPixelBounds.y,
            width: originalPixelBounds.width + imageDeltaX,
            height: originalPixelBounds.height + imageDeltaY,
          },
          imageElement.naturalWidth,
          imageElement.naturalHeight
        );
        break;
      case "n":
        newBounds = pixelsToBounds(
          {
            x: originalPixelBounds.x,
            y: originalPixelBounds.y + imageDeltaY,
            width: originalPixelBounds.width,
            height: originalPixelBounds.height - imageDeltaY,
          },
          imageElement.naturalWidth,
          imageElement.naturalHeight
        );
        break;
      case "e":
        newBounds = pixelsToBounds(
          {
            x: originalPixelBounds.x,
            y: originalPixelBounds.y,
            width: originalPixelBounds.width + imageDeltaX,
            height: originalPixelBounds.height,
          },
          imageElement.naturalWidth,
          imageElement.naturalHeight
        );
        break;
      case "s":
        newBounds = pixelsToBounds(
          {
            x: originalPixelBounds.x,
            y: originalPixelBounds.y,
            width: originalPixelBounds.width,
            height: originalPixelBounds.height + imageDeltaY,
          },
          imageElement.naturalWidth,
          imageElement.naturalHeight
        );
        break;
      case "w":
        newBounds = pixelsToBounds(
          {
            x: originalPixelBounds.x + imageDeltaX,
            y: originalPixelBounds.y,
            width: originalPixelBounds.width - imageDeltaX,
            height: originalPixelBounds.height,
          },
          imageElement.naturalWidth,
          imageElement.naturalHeight
        );
        break;
    }

    // Ensure minimum size and clamp to image bounds
    if (newBounds.width > 1 && newBounds.height > 1) {
      const clampedBounds = clampSelectionBounds(newBounds);
      onUpdate({ ...selection, bounds: clampedBounds });
    }
  };

  // * Handle move logic
  const handleMove = (deltaX: number, deltaY: number) => {
    // Convert screen deltas to image coordinate deltas
    const scaleX = imageElement.naturalWidth / imageElement.clientWidth;
    const scaleY = imageElement.naturalHeight / imageElement.clientHeight;
    const imageDeltaX = deltaX * scaleX;
    const imageDeltaY = deltaY * scaleY;

    const originalPixelBounds = boundsToPixels(
      originalBounds,
      imageElement.naturalWidth,
      imageElement.naturalHeight
    );

    const newBounds = pixelsToBounds(
      {
        x: originalPixelBounds.x + imageDeltaX,
        y: originalPixelBounds.y + imageDeltaY,
        width: originalPixelBounds.width,
        height: originalPixelBounds.height,
      },
      imageElement.naturalWidth,
      imageElement.naturalHeight
    );

    const clampedBounds = clampSelectionBounds(newBounds);
    onUpdate({ ...selection, bounds: clampedBounds });
  };

  // * Generate resize handles
  const pixelBounds = boundsToPixels(
    selection.bounds,
    imageElement.naturalWidth,
    imageElement.naturalHeight
  );
  const handles = generateResizeHandles(pixelBounds);

  return (
    <div
      className={`absolute border-2 ${
        isActive
          ? "border-blue-500 bg-blue-500/10"
          : "border-green-500 bg-green-500/10"
      } transition-colors group`}
      style={{
        left: screenBounds.left,
        top: screenBounds.top,
        width: screenBounds.width,
        height: screenBounds.height,
        cursor: isDragging ? "grabbing" : "grab",
      }}
      onMouseDown={handleMoveStart}
    >
      {/* Selection info label */}
      <div
        className={`absolute -top-6 left-0 px-2 py-1 text-xs font-mono rounded text-white ${
          isActive ? "bg-blue-500" : "bg-green-500"
        }`}
      >
        {selection.name ||
          `${Math.round(screenBounds.width)} × ${Math.round(screenBounds.height)}`}
      </div>

      {/* Controls - only show when active */}
      {isActive && (
        <div className="absolute -top-8 right-0 flex items-center gap-1">
          <Button
            size="sm"
            variant="outline"
            className="h-6 w-6 p-0 bg-red-500 hover:bg-red-600 text-white"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(selection.id);
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Resize handles - only show when active */}
      {isActive &&
        handles.map((handle, index) => {
          const handleScreenPos = imageToScreenCoords(
            handle.position,
            imageElement,
            containerElement
          );
          const containerRect = containerElement.getBoundingClientRect();

          return (
            <div
              key={`${handle.type}-${index}`}
              className="absolute w-3 h-3 bg-blue-500 border border-white rounded-sm"
              style={{
                left:
                  handleScreenPos.x -
                  containerRect.left -
                  screenBounds.left -
                  6,
                top:
                  handleScreenPos.y - containerRect.top - screenBounds.top - 6,
                cursor: handle.cursor,
              }}
              onMouseDown={(e) => handleResizeStart(e, handle)}
            />
          );
        })}

      {/* Center move handle when active */}
      {isActive && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white">
            <Move className="h-3 w-3" />
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useRef } from "react";
import { AssetSelection, Point } from "@/lib/types/asset-extraction";
import {
  screenToImageCoords,
  //imageToScreenCoords,
  pixelsToBounds,
  boundsToPixels,
  clampSelectionBounds,
} from "@/lib/utils/asset-extraction";
import SelectionRectangle from "./selection-rectangle";

interface AssetSelectionOverlayProps {
  imageElement: HTMLImageElement | null;
  containerElement: HTMLElement | null;
  selections: AssetSelection[];
  activeSelectionId?: string;
  onSelectionsChange: (selections: AssetSelection[]) => void;
  onActiveSelectionChange: (id: string | undefined) => void;
  isEnabled: boolean;
}

export default function AssetSelectionOverlay({
  imageElement,
  containerElement,
  selections,
  activeSelectionId,
  onSelectionsChange,
  onActiveSelectionChange,
  isEnabled,
}: AssetSelectionOverlayProps) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [currentPoint, setCurrentPoint] = useState<Point | null>(null);
  const [draggedSelectionId, setDraggedSelectionId] = useState<string | null>(
    null
  );
  const [isDragging, setIsDragging] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  // * Handle mouse down - start drawing new selection or dragging existing one
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isEnabled || !imageElement || !containerElement) return;

    const point = { x: e.clientX, y: e.clientY };
    const imageCoords = screenToImageCoords(
      point,
      imageElement,
      containerElement
    );

    // Check if clicking on existing selection
    const clickedSelection = selections.find((selection) => {
      const pixelBounds = boundsToPixels(
        selection.bounds,
        imageElement.naturalWidth,
        imageElement.naturalHeight
      );
      return (
        imageCoords.x >= pixelBounds.x &&
        imageCoords.x <= pixelBounds.x + pixelBounds.width &&
        imageCoords.y >= pixelBounds.y &&
        imageCoords.y <= pixelBounds.y + pixelBounds.height
      );
    });

    if (clickedSelection) {
      // Start dragging existing selection
      setDraggedSelectionId(clickedSelection.id);
      setIsDragging(true);
      onActiveSelectionChange(clickedSelection.id);
    } else {
      // Start drawing new selection
      setIsDrawing(true);
      setStartPoint(point);
      setCurrentPoint(point);
      onActiveSelectionChange(undefined);
    }

    e.preventDefault();
  };

  // * Handle mouse move - update current drawing or drag position
  const handleMouseMove = (_e: React.MouseEvent) => {
    if (!isEnabled || !imageElement || !containerElement) return;

    const point = { x: _e.clientX, y: _e.clientY };

    if (isDrawing && startPoint) {
      setCurrentPoint(point);
    } else if (isDragging && draggedSelectionId) {
      // TODO: Handle dragging logic
    }
  };

  // * Handle mouse up - finalize selection or drag
  const handleMouseUp = () => {
    if (!isEnabled || !imageElement || !containerElement) return;

    if (isDrawing && startPoint && currentPoint) {
      const startImageCoords = screenToImageCoords(
        startPoint,
        imageElement,
        containerElement
      );
      const endImageCoords = screenToImageCoords(
        currentPoint,
        imageElement,
        containerElement
      );

      // Calculate bounds
      const left = Math.min(startImageCoords.x, endImageCoords.x);
      const top = Math.min(startImageCoords.y, endImageCoords.y);
      const width = Math.abs(endImageCoords.x - startImageCoords.x);
      const height = Math.abs(endImageCoords.y - startImageCoords.y);

      // Only create selection if it has meaningful size
      if (width > 10 && height > 10) {
        const bounds = pixelsToBounds(
          { x: left, y: top, width, height },
          imageElement.naturalWidth,
          imageElement.naturalHeight
        );

        const clampedBounds = clampSelectionBounds(bounds);

        const newSelection: AssetSelection = {
          id: `selection-${Date.now()}`,
          bounds: clampedBounds,
          createdAt: new Date().toISOString(),
        };

        onSelectionsChange([...selections, newSelection]);
        onActiveSelectionChange(newSelection.id);
      }
    }

    // Reset states
    setIsDrawing(false);
    setIsDragging(false);
    setStartPoint(null);
    setCurrentPoint(null);
    setDraggedSelectionId(null);
  };

  // * Handle selection deletion
  const handleDeleteSelection = (selectionId: string) => {
    const updatedSelections = selections.filter((s) => s.id !== selectionId);
    onSelectionsChange(updatedSelections);
    if (activeSelectionId === selectionId) {
      onActiveSelectionChange(undefined);
    }
  };

  // * Handle selection update
  const handleUpdateSelection = (updatedSelection: AssetSelection) => {
    const updatedSelections = selections.map((s) =>
      s.id === updatedSelection.id ? updatedSelection : s
    );
    onSelectionsChange(updatedSelections);
  };

  // * Convert screen drawing to display coordinates
  const getDrawingRectangle = () => {
    if (!isDrawing || !startPoint || !currentPoint || !containerElement)
      return null;

    const containerRect = containerElement.getBoundingClientRect();

    const left = Math.min(startPoint.x, currentPoint.x) - containerRect.left;
    const top = Math.min(startPoint.y, currentPoint.y) - containerRect.top;
    const width = Math.abs(currentPoint.x - startPoint.x);
    const height = Math.abs(currentPoint.y - startPoint.y);

    return { left, top, width, height };
  };

  const drawingRect = getDrawingRectangle();

  return (
    <div
      ref={overlayRef}
      className="absolute inset-0 pointer-events-auto"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ cursor: isEnabled ? "crosshair" : "default" }}
    >
      {/* Existing selections */}
      {isEnabled &&
        imageElement &&
        containerElement &&
        selections.map((selection) => (
          <SelectionRectangle
            key={selection.id}
            selection={selection}
            imageElement={imageElement}
            containerElement={containerElement}
            isActive={activeSelectionId === selection.id}
            onUpdate={handleUpdateSelection}
            onDelete={handleDeleteSelection}
            onSelect={() => onActiveSelectionChange(selection.id)}
          />
        ))}

      {/* Current drawing rectangle */}
      {isDrawing && drawingRect && (
        <div
          className="absolute border-2 border-dashed border-blue-500 bg-blue-500/20 pointer-events-none"
          style={{
            left: drawingRect.left,
            top: drawingRect.top,
            width: drawingRect.width,
            height: drawingRect.height,
          }}
        >
          <div className="absolute -top-6 left-0 bg-blue-500 text-white px-2 py-1 text-xs font-mono rounded">
            {Math.round(drawingRect.width)} × {Math.round(drawingRect.height)}
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { usePatternStore } from '@/store/patternStore';
import GridCell from './GridCell';
import Toolbar from './Toolbar';
import StatusBar from './StatusBar';

const ZOOM_LEVELS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];
const DEFAULT_ZOOM_INDEX = 3; // 100%

export default function PatternGrid() {
  const rows = usePatternStore((state) => state.pattern.content.rows);
  const selectedRow = usePatternStore((state) => state.ui.selectedRow);
  const setSelectedRow = usePatternStore((state) => state.setSelectedRow);
  const structureType = usePatternStore((state) => state.pattern.structure.type);
  const selectedStitch = usePatternStore((state) => state.ui.selectedStitch);

  const [isDragging, setIsDragging] = useState(false);
  const [isRightDragging, setIsRightDragging] = useState(false);
  const [zoomIndex, setZoomIndex] = useState(DEFAULT_ZOOM_INDEX);
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);

  const zoom = ZOOM_LEVELS[zoomIndex];

  // Calculate cell span for the selected stitch
  const getStitchSpan = (stitch: string): number => {
    if (stitch.startsWith('c')) {
      const match = stitch.match(/\d+/);
      return match ? parseInt(match[0]) : 1;
    }
    // Decreases that consume multiple stitches but only occupy 1 cell
    return 1;
  };

  const selectedStitchSpan = getStitchSpan(selectedStitch);

  // Circular means all rows are RS (worked in the round)
  const isCircularKnitting = structureType === 'circular';

  // Global mouse up handler to catch mouse release anywhere
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
      setIsRightDragging(false);
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  const handleRowNumberClick = (rowNumber: number) => {
    setSelectedRow(selectedRow === rowNumber ? null : rowNumber);
  };

  const handleZoomIn = () => {
    if (zoomIndex < ZOOM_LEVELS.length - 1) {
      setZoomIndex(zoomIndex + 1);
    }
  };

  const handleZoomOut = () => {
    if (zoomIndex > 0) {
      setZoomIndex(zoomIndex - 1);
    }
  };

  const handleResetZoom = () => {
    setZoomIndex(DEFAULT_ZOOM_INDEX);
  };

  // Check if a cell should be highlighted (part of multi-cell stitch preview)
  const isCellHighlighted = (rowIndex: number, colIndex: number): boolean => {
    if (!hoveredCell || selectedStitchSpan <= 1) return false;
    if (hoveredCell.row !== rowIndex) return false;

    const startCol = hoveredCell.col;
    const endCol = startCol + selectedStitchSpan - 1;

    return colIndex >= startCol && colIndex <= endCol;
  };

  // Check if the entire placement would overflow (for coloring all highlighted cells)
  const wouldPlacementOverflow = (rowIndex: number, totalStitchesInRow: number): boolean => {
    if (!hoveredCell || selectedStitchSpan <= 1) return false;
    if (hoveredCell.row !== rowIndex) return false;

    return hoveredCell.col + selectedStitchSpan > totalStitchesInRow;
  };

  return (
    <div
      className="flex flex-col h-full select-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Toolbar */}
      <Toolbar />

      {/* Zoom Controls */}
      <div className="bg-surface border-b border-border px-6 py-2 flex items-center gap-4">
        <span className="text-sm font-medium text-text-secondary">Zoom:</span>
        <div className="flex items-center gap-1">
          <button
            onClick={handleZoomOut}
            disabled={zoomIndex === 0}
            className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded text-lg font-bold transition-colors"
          >
            −
          </button>
          <button
            onClick={handleResetZoom}
            className="px-3 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded text-sm font-mono transition-colors min-w-[60px]"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            onClick={handleZoomIn}
            disabled={zoomIndex === ZOOM_LEVELS.length - 1}
            className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded text-lg font-bold transition-colors"
          >
            +
          </button>
        </div>
        <span className="text-xs text-text-secondary">
          (Scroll with Ctrl+Wheel to zoom)
        </span>
      </div>

      {/* Grid Container */}
      <div
        className="flex-1 overflow-auto bg-white rounded-lg shadow-sm border border-border p-8"
        onWheel={(e) => {
          if (e.ctrlKey) {
            e.preventDefault();
            if (e.deltaY < 0) {
              handleZoomIn();
            } else {
              handleZoomOut();
            }
          }
        }}
      >
        <div
          className="inline-block origin-top-left transition-transform"
          style={{ transform: `scale(${zoom})` }}
        >
          {/* Grid */}
          <div className="space-y-0">
            {/* Render rows in reverse order (bottom to top) */}
            {[...rows].reverse().map((row, reversedIndex) => {
              const rowIndex = rows.length - 1 - reversedIndex;
              const isSelected = selectedRow === row.rowNumber;
              // In circular knitting, all rows are RS; in flat knitting, use row's isRightSide
              const isRightSide = isCircularKnitting ? true : row.isRightSide;
              const sideLabel = isCircularKnitting ? 'Rnd' : (isRightSide ? 'RS' : 'WS');

              return (
                <div
                  key={row.rowNumber}
                  className={`flex items-center ${
                    isSelected ? 'bg-warning bg-opacity-10' : ''
                  }`}
                >
                  {/* Left side - Row number for WS (flat knitting only), empty space otherwise */}
                  <div className="flex items-center mr-1 w-[50px] justify-end">
                    {!isRightSide ? (
                      <button
                        onClick={() => handleRowNumberClick(row.rowNumber)}
                        className="h-[24px] px-1.5 flex items-center gap-1 text-xs font-mono bg-gray-100 hover:bg-gray-200 rounded cursor-pointer transition-colors"
                      >
                        <span className="font-semibold">{row.rowNumber}</span>
                        <span className="text-text-secondary">{sideLabel}</span>
                      </button>
                    ) : null}
                  </div>

                  {/* Grid Cells */}
                  <div className="flex">
                    {row.stitches.map((stitch, colIndex) => (
                      <GridCell
                        key={`${rowIndex}-${colIndex}`}
                        rowIndex={rowIndex}
                        colIndex={colIndex}
                        stitch={stitch}
                        isDragging={isDragging}
                        isRightDragging={isRightDragging}
                        isRowSelected={isSelected}
                        setIsDragging={setIsDragging}
                        setIsRightDragging={setIsRightDragging}
                        onHover={(row, col) => setHoveredCell({ row, col })}
                        onHoverEnd={() => setHoveredCell(null)}
                        isHighlighted={isCellHighlighted(rowIndex, colIndex)}
                        wouldPlacementOverflow={wouldPlacementOverflow(rowIndex, row.stitches.length)}
                      />
                    ))}
                  </div>

                  {/* Right side - Row number for RS or circular, empty space for WS */}
                  <div className="flex items-center ml-1 w-[50px]">
                    {isRightSide ? (
                      <button
                        onClick={() => handleRowNumberClick(row.rowNumber)}
                        className="h-[24px] px-1.5 flex items-center gap-1 text-xs font-mono bg-gray-100 hover:bg-gray-200 rounded cursor-pointer transition-colors"
                      >
                        <span className="text-text-secondary">{sideLabel}</span>
                        <span className="font-semibold">{row.rowNumber}</span>
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <StatusBar />
    </div>
  );
}

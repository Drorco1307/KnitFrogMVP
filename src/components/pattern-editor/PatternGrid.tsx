import { useState, useEffect } from 'react';
import { usePatternStore } from '@/store/patternStore';
import GridCell from './GridCell';
import Toolbar from './Toolbar';
import StatusBar from './StatusBar';

export default function PatternGrid() {
  const rows = usePatternStore((state) => state.pattern.content.rows);
  const selectedRow = usePatternStore((state) => state.ui.selectedRow);
  const setSelectedRow = usePatternStore((state) => state.setSelectedRow);
  const addRow = usePatternStore((state) => state.addRow);
  const deleteRow = usePatternStore((state) => state.deleteRow);
  const needleType = usePatternStore((state) => state.pattern.metadata.needleSize.type);

  const [isDragging, setIsDragging] = useState(false);
  const [isRightDragging, setIsRightDragging] = useState(false);

  // Circular or DPN means all rows are RS (worked in the round)
  const isCircularKnitting = needleType === 'circular' || needleType === 'dpn';

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

  const handleAddRow = () => {
    addRow();
  };

  const handleDeleteRow = () => {
    if (selectedRow !== null) {
      const rowIndex = rows.findIndex(r => r.rowNumber === selectedRow);
      if (rowIndex !== -1) {
        deleteRow(rowIndex);
        setSelectedRow(null);
      }
    }
  };

  return (
    <div
      className="flex flex-col h-full select-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Toolbar */}
      <Toolbar />

      {/* Grid Container */}
      <div className="flex-1 overflow-auto bg-white rounded-lg shadow-sm border border-border p-8">
        <div className="inline-block">
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

          {/* Row Controls */}
          <div className="mt-4 flex gap-2">
            <button onClick={handleAddRow} className="btn-primary">
              + Add Row
            </button>
            {selectedRow !== null && (
              <button onClick={handleDeleteRow} className="btn-danger">
                Delete Row {selectedRow}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <StatusBar />
    </div>
  );
}

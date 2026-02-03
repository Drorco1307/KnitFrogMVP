import { useState } from 'react';
import { usePatternStore } from '@/store/patternStore';
import GridCell from './GridCell';
import StitchPalette from './StitchPalette';
import ColorPalette from './ColorPalette';
import Toolbar from './Toolbar';
import StatusBar from './StatusBar';

export default function PatternGrid() {
  const rows = usePatternStore((state) => state.pattern.content.rows);
  const selectedRow = usePatternStore((state) => state.ui.selectedRow);
  const setSelectedRow = usePatternStore((state) => state.setSelectedRow);
  const addRow = usePatternStore((state) => state.addRow);
  const deleteRow = usePatternStore((state) => state.deleteRow);
  
  const [isDragging, setIsDragging] = useState(false);
  const [isRightDragging, setIsRightDragging] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true);
    } else if (e.button === 2) {
      setIsRightDragging(true);
      e.preventDefault();
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsRightDragging(false);
  };

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
      className="flex flex-col h-full"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Toolbar */}
      <Toolbar />

      {/* Grid Container */}
      <div className="flex-1 overflow-auto bg-white rounded-lg shadow-sm border border-border p-8">
        <div 
          className="inline-block"
          onMouseDown={handleMouseDown}
        >
          {/* Grid */}
          <div className="space-y-0">
            {/* Render rows in reverse order (bottom to top) */}
            {[...rows].reverse().map((row, reversedIndex) => {
              const rowIndex = rows.length - 1 - reversedIndex;
              const isSelected = selectedRow === row.rowNumber;
              const isRightSide = row.isRightSide;

              return (
                <div
                  key={row.rowNumber}
                  className={`flex items-center gap-2 ${
                    isSelected ? 'bg-warning bg-opacity-10' : ''
                  }`}
                >
                  {/* Row number on right for RS, left for WS */}
                  {!isRightSide && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRowNumberClick(row.rowNumber)}
                        className="w-12 h-8 flex items-center justify-center text-sm font-mono bg-gray-100 hover:bg-gray-200 rounded cursor-pointer transition-colors"
                      >
                        {row.rowNumber}
                      </button>
                      <span className="text-xs text-text-secondary w-6">WS</span>
                    </div>
                  )}

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
                      />
                    ))}
                  </div>

                  {/* Row number on right for RS */}
                  {isRightSide && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-text-secondary w-6">RS</span>
                      <button
                        onClick={() => handleRowNumberClick(row.rowNumber)}
                        className="w-12 h-8 flex items-center justify-center text-sm font-mono bg-gray-100 hover:bg-gray-200 rounded cursor-pointer transition-colors"
                      >
                        {row.rowNumber}
                      </button>
                    </div>
                  )}
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

import { useState, useRef, useEffect } from 'react';
import { usePatternStore } from '@/store/patternStore';
import PatternGrid from './PatternGrid';
import TextInputPanel from './TextInputPanel';
import RowTextEditor from './RowTextEditor';

export default function UnifiedEditor() {
  const rows = usePatternStore((state) => state.pattern.content.rows);
  const structureType = usePatternStore((state) => state.pattern.structure.type);
  const abbreviateRepeats = usePatternStore((state) => state.ui.abbreviateRepeats);
  const toggleAbbreviateRepeats = usePatternStore((state) => state.toggleAbbreviateRepeats);

  const isCircular = structureType === 'circular';

  const [showGrid, setShowGrid] = useState(true);
  const [showText, setShowText] = useState(true);
  const [gridWidth, setGridWidth] = useState(50); // Percentage
  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event from reaching grid cells
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      e.preventDefault();
      e.stopPropagation(); // Prevent grid from receiving mouse events

      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;

      // Constrain between 20% and 80%
      setGridWidth(Math.min(Math.max(newWidth, 20), 80));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove, true); // Use capture phase
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove, true);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // If both are hidden, show grid
  useEffect(() => {
    if (!showGrid && !showText) {
      setShowGrid(true);
    }
  }, [showGrid, showText]);

  const bothVisible = showGrid && showText;

  return (
    <div className="flex flex-col h-full">
      {/* View Controls */}
      <div className="bg-surface border-b border-border px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-text-secondary">Show:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setShowGrid(!showGrid)}
                className={`px-4 py-1.5 text-sm font-medium rounded transition-colors ${
                  showGrid
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                Grid View
              </button>
              <button
                onClick={() => setShowText(!showText)}
                className={`px-4 py-1.5 text-sm font-medium rounded transition-colors ${
                  showText
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                Text View
              </button>
            </div>
            {bothVisible && (
              <span className="text-xs text-text-secondary ml-2">
                Drag the divider to resize panels
              </span>
            )}
          </div>

          {/* Text View Options */}
          {showText && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-text-secondary">Text Options:</span>
              <button
                onClick={toggleAbbreviateRepeats}
                className={`px-4 py-1.5 text-sm font-medium rounded transition-colors ${
                  abbreviateRepeats
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                Abbreviate Repeats
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Editor Content */}
      <div ref={containerRef} className="flex h-full gap-0 p-4 relative">
        {/* Left Panel - Grid View */}
        {showGrid && (
          <div
            className="flex flex-col min-w-0"
            style={{
              width: bothVisible ? `${gridWidth}%` : '100%',
              pointerEvents: isDragging ? 'none' : 'auto'
            }}
          >
            <div className="bg-surface border-b border-border px-4 py-2 rounded-t-lg">
              <h2 className="text-lg font-semibold text-text-primary">Grid View</h2>
              <p className="text-xs text-text-secondary">Click cells to edit stitches</p>
            </div>
            <div className="flex-1 overflow-hidden border border-t-0 border-border rounded-b-lg">
              <PatternGrid />
            </div>
          </div>
        )}

        {/* Resizable Divider */}
        {bothVisible && (
          <div
            className={`w-2 cursor-col-resize hover:bg-primary hover:bg-opacity-20 transition-colors relative flex items-center justify-center ${
              isDragging ? 'bg-primary bg-opacity-30' : ''
            }`}
            onMouseDown={handleMouseDown}
          >
            <div className="w-1 h-16 bg-gray-300 rounded-full"></div>
          </div>
        )}

        {/* Right Panel - Text View */}
        {showText && (
          <div
            className="flex flex-col min-w-0 overflow-hidden"
            style={{
              width: bothVisible ? `${100 - gridWidth}%` : '100%',
              pointerEvents: isDragging ? 'none' : 'auto'
            }}
          >
            <div className="bg-surface border-b border-border px-4 py-2 rounded-t-lg">
              <h2 className="text-lg font-semibold text-text-primary">Text View</h2>
              <p className="text-xs text-text-secondary">Edit pattern rows as text notation</p>
            </div>
            <div className="flex-1 overflow-auto border border-t-0 border-border rounded-b-lg p-4">
              <div className="space-y-6">
                {/* Display current pattern as editable text rows */}
                <div>
                  <h3 className="text-sm font-semibold text-text-primary mb-3">
                    Pattern Rows
                    <span className="ml-2 text-xs font-normal text-text-secondary">
                      (Hover and click "Edit")
                    </span>
                  </h3>
                  <div className="space-y-1">
                    {rows
                      .filter(row => row.stitches.length > 0 && row.stitches.some(s => s.type))
                      .map((row, index) => {
                        // Find the original index in the full rows array
                        const originalIndex = rows.findIndex(r => r.rowNumber === row.rowNumber);
                        const isRightSide = isCircular ? true : row.isRightSide;
                        const sideLabel = isCircular ? 'Rnd' : (isRightSide ? 'RS' : 'WS');

                        return (
                          <RowTextEditor
                            key={row.rowNumber}
                            rowIndex={originalIndex}
                            rowNumber={row.rowNumber}
                            sideLabel={sideLabel}
                          />
                        );
                      })}
                    {rows.filter(row => row.stitches.length > 0 && row.stitches.some(s => s.type)).length === 0 && (
                      <p className="text-sm text-text-secondary italic">
                        No rows yet. Add rows using the form below.
                      </p>
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-border"></div>

                {/* Text Input Panel for adding new rows */}
                <div>
                  <h3 className="text-sm font-semibold text-text-primary mb-3">
                    Add New Rows
                  </h3>
                  <TextInputPanel />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

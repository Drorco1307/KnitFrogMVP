import { useState, useRef, useEffect } from 'react';
import { usePatternStore } from '@/store/patternStore';
import { parseTextInstruction } from '@/utils/textParser';
import { ParseResult } from '@/types/pattern.types';

interface RowInput {
  id: string;
  text: string;
  parseResult: ParseResult | null;
}

export default function TextInputPanel() {
  const [rowInputs, setRowInputs] = useState<RowInput[]>([
    { id: '1', text: '', parseResult: null }
  ]);
  const [startsOnRS, setStartsOnRS] = useState(true);
  const [showExamples, setShowExamples] = useState(false);
  const textareaRefs = useRef<{ [key: string]: HTMLTextAreaElement | null }>({});

  // Zustand store hooks
  const rows = usePatternStore(state => state.pattern.content.rows);
  const colorPalette = usePatternStore(state => state.pattern.content.colorPalette);
  const setRowFromText = usePatternStore(state => state.setRowFromText);
  const structureType = usePatternStore(state => state.pattern.structure.type);
  const updateStructure = usePatternStore(state => state.updateStructure);

  const isCircular = structureType === 'circular';

  // Determine row side based on starting side
  const getRowSide = (rowIndex: number) => {
    if (isCircular) return 'Rnd';
    // If starts on RS: even indices (0, 2, 4...) are RS, odd are WS
    // If starts on WS: even indices are WS, odd are RS
    const isEvenIndex = rowIndex % 2 === 0;
    return (startsOnRS ? isEvenIndex : !isEvenIndex) ? 'RS' : 'WS';
  };

  const handleAddRow = () => {
    const newId = Date.now().toString();
    setRowInputs([...rowInputs, { id: newId, text: '', parseResult: null }]);

    // Focus the new textarea after it's rendered
    setTimeout(() => {
      textareaRefs.current[newId]?.focus();
    }, 0);
  };

  const handleRemoveRow = (id: string) => {
    setRowInputs(rowInputs.filter(row => row.id !== id));
  };

  const handleTextChange = (id: string, text: string) => {
    // Parse in real-time as user types
    let parseResult: ParseResult | null = null;

    if (text.trim()) {
      // Try all delimiters
      const delimiters: ('comma' | 'period' | 'pipe')[] = ['comma', 'period', 'pipe'];

      for (const delimiter of delimiters) {
        const parsed = parseTextInstruction(text, delimiter, colorPalette);
        if (parsed.success || parsed.errors.length < (parseResult?.errors.length || Infinity)) {
          parseResult = parsed;
          if (parsed.success) break; // Found successful parse
        }
      }
    }

    setRowInputs(rowInputs.map(row =>
      row.id === id ? { ...row, text, parseResult } : row
    ));
  };


  const handleApplyAll = () => {
    // Update structure if needed
    updateStructure({ startsOnRS });

    let currentRowIndex = 0;

    for (let i = 0; i < rowInputs.length; i++) {
      const rowInput = rowInputs[i];
      if (rowInput.parseResult?.success && rowInput.parseResult.stitches.length > 0) {
        // Find the next available row
        if (currentRowIndex < rows.length) {
          setRowFromText(currentRowIndex, rowInput.parseResult.stitches, rowInput.text);
          currentRowIndex++;
        }
      }
    }

    // Clear all inputs after applying
    setRowInputs([{ id: Date.now().toString(), text: '', parseResult: null }]);
  };

  const handleCancel = (id: string) => {
    setRowInputs(rowInputs.map(row =>
      row.id === id ? { ...row, parseResult: null } : row
    ));
  };


  const allParsed = rowInputs.every(row => !row.text || row.parseResult !== null);
  const anySuccess = rowInputs.some(row => row.parseResult?.success);

  return (
    <div className="flex flex-col h-full gap-6 max-w-4xl mx-auto">
      {/* Starting Side Selector */}
      {!isCircular && (
        <div className="bg-surface border border-border rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-text-primary">
              First row starts on:
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setStartsOnRS(true)}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  startsOnRS
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Right Side (RS)
              </button>
              <button
                onClick={() => setStartsOnRS(false)}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  !startsOnRS
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Wrong Side (WS)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Row Inputs */}
      {rowInputs.map((rowInput, index) => (
        <div key={rowInput.id} className="bg-surface border border-border rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-semibold text-text-primary">
                Row {index + 1} ({getRowSide(index)})
              </h3>
              {rowInput.parseResult?.success && (
                <span className="text-xs text-success font-medium">
                  ✓ {rowInput.parseResult.totalStitchCount} stitches
                </span>
              )}
            </div>
            {rowInputs.length > 1 && (
              <button
                onClick={() => handleRemoveRow(rowInput.id)}
                className="text-sm text-error hover:text-red-700"
              >
                Remove
              </button>
            )}
          </div>

          <textarea
            ref={(el) => textareaRefs.current[rowInput.id] = el}
            value={rowInput.text}
            onChange={(e) => handleTextChange(rowInput.id, e.target.value)}
            placeholder='e.g., k2, p2, *k2tog, yo* x5, k2 MC'
            className="input-field w-full h-24 font-mono text-sm mb-3"
          />

          {/* Inline error message */}
          {rowInput.parseResult && !rowInput.parseResult.success && rowInput.text.trim() && (
            <div className="mt-3 border border-error bg-error bg-opacity-5 rounded p-3">
              <p className="text-sm text-error">
                {rowInput.parseResult.errors.map((error, idx) => (
                  <span key={idx}>
                    {error.message}
                    {error.token && <code className="ml-2 bg-error bg-opacity-20 px-2 py-1 rounded text-xs">"{error.token}"</code>}
                  </span>
                ))}
              </p>
            </div>
          )}

          {/* Success Preview */}
          {rowInput.parseResult?.success && rowInput.parseResult.stitches.length > 0 && (
            <div className="mt-3 border border-success bg-success bg-opacity-5 rounded p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-sm text-success">
                  ✓ {rowInput.parseResult.totalStitchCount} stitches parsed
                </h4>
                <button
                  onClick={() => handleCancel(rowInput.id)}
                  className="text-sm text-text-secondary hover:text-text-primary"
                >
                  Clear
                </button>
              </div>

              {/* Warnings */}
              {rowInput.parseResult.warnings.length > 0 && (
                <div className="mb-3">
                  <ul className="list-disc list-inside space-y-1">
                    {rowInput.parseResult.warnings.map((warning, idx) => (
                      <li key={idx} className="text-sm text-warning">
                        {warning.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Parsed Stitches Preview */}
              <div className="flex flex-wrap gap-1">
                {rowInput.parseResult.stitches.slice(0, 20).map((stitch, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono"
                    style={{
                      backgroundColor: stitch.colorId && stitch.colorId !== 'none'
                        ? colorPalette.find(c => c.id === stitch.colorId)?.hex + '40'
                        : undefined
                    }}
                  >
                    {stitch.type.toUpperCase()}
                    {stitch.colorId && stitch.colorId !== 'none' && (
                      <span className="ml-1 text-gray-500 text-xs">({stitch.colorId})</span>
                    )}
                  </span>
                ))}
                {rowInput.parseResult.stitches.length > 20 && (
                  <span className="text-xs text-text-secondary self-center">
                    +{rowInput.parseResult.stitches.length - 20} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Add Row Button */}
      <div className="flex gap-3">
        <button
          onClick={handleAddRow}
          className="btn-secondary flex items-center gap-2"
        >
          <span className="text-lg">+</span>
          Add Another Row
        </button>

        {/* Apply All Button */}
        {allParsed && anySuccess && (
          <button
            onClick={handleApplyAll}
            className="btn-primary"
          >
            Apply All Rows to Pattern
          </button>
        )}
      </div>

      {/* Format Hint */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>Supported formats:</strong> Use comma (,), period (.), or pipe (|) to separate stitches.
          Examples: <code className="bg-white px-2 py-1 rounded text-xs">k2, p2</code> or <code className="bg-white px-2 py-1 rounded text-xs">k2. p2</code> or <code className="bg-white px-2 py-1 rounded text-xs">k2 | p2</code>
        </p>
      </div>

      {/* Examples Section */}
      <div className="bg-surface border border-border rounded-lg p-6 shadow-sm">
        <button
          onClick={() => setShowExamples(!showExamples)}
          className="flex items-center justify-between w-full text-left"
        >
          <h3 className="text-base font-semibold text-text-primary">
            Examples
          </h3>
          <span className="text-text-secondary">
            {showExamples ? '▼' : '▶'}
          </span>
        </button>

        {showExamples && (
          <div className="mt-4 space-y-3 text-sm">
            <div>
              <code className="block bg-gray-100 p-2 rounded text-xs">
                k2, p2, k2tog, yo, k10
              </code>
              <p className="text-text-secondary mt-1 text-xs">
                Basic stitches with multiplier
              </p>
            </div>

            <div>
              <code className="block bg-gray-100 p-2 rounded text-xs">
                *k2, p2* repeat 5 times
              </code>
              <p className="text-text-secondary mt-1 text-xs">
                Multi-stitch repeat: <code className="bg-gray-100 px-1 rounded">*k2, p2* x5</code> or <code className="bg-gray-100 px-1 rounded">(k2, p2) twice</code>
              </p>
            </div>

            <div>
              <code className="block bg-gray-100 p-2 rounded text-xs">
                k2, c4f twice, p6
              </code>
              <p className="text-text-secondary mt-1 text-xs">
                Single stitch repeat: <code className="bg-gray-100 px-1 rounded">c4f twice</code> or <code className="bg-gray-100 px-1 rounded">k2 x3</code>
              </p>
            </div>

            <div>
              <code className="block bg-gray-100 p-2 rounded text-xs">
                k2 MC, p2 CC1, k2 CC2
              </code>
              <p className="text-text-secondary mt-1 text-xs">
                With colors (MC, CC1-CC6)
              </p>
            </div>

            <div>
              <code className="block bg-gray-100 p-2 rounded text-xs">
                k2, c4f, p2, c6b, k2
              </code>
              <p className="text-text-secondary mt-1 text-xs">
                Cable stitches (automatically span multiple cells)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

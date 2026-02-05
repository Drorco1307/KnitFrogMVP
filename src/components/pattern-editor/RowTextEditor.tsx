import { useState, useEffect } from 'react';
import { usePatternStore } from '@/store/patternStore';
import { parseTextInstruction } from '@/utils/textParser';
import { stitchesToText } from '@/utils/stitchToText';
import { ParseResult } from '@/types/pattern.types';

interface RowTextEditorProps {
  rowIndex: number;
  rowNumber: number;
  sideLabel: string;
}

export default function RowTextEditor({ rowIndex, rowNumber, sideLabel }: RowTextEditorProps) {
  const row = usePatternStore((state) => state.pattern.content.rows[rowIndex]);
  const colorPalette = usePatternStore((state) => state.pattern.content.colorPalette);
  const setRowFromText = usePatternStore((state) => state.setRowFromText);
  const abbreviateRepeats = usePatternStore((state) => state.ui.abbreviateRepeats);

  const [isEditing, setIsEditing] = useState(false);
  const [textValue, setTextValue] = useState('');
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);

  // Generate text from stitches
  const { text: currentText, hasGaps } = stitchesToText(row.stitches, row.isRightSide, abbreviateRepeats);

  useEffect(() => {
    if (isEditing) {
      setTextValue(currentText);
    }
  }, [isEditing, currentText]);

  const handleTextChange = (text: string) => {
    setTextValue(text);

    // Parse in real-time
    if (text.trim()) {
      const delimiters: ('comma' | 'period' | 'pipe')[] = ['comma', 'period', 'pipe'];
      let result: ParseResult | null = null;

      for (const delimiter of delimiters) {
        const parsed = parseTextInstruction(text, delimiter, colorPalette);
        if (parsed.success || parsed.errors.length < (result?.errors.length || Infinity)) {
          result = parsed;
          if (parsed.success) break;
        }
      }

      setParseResult(result);
    } else {
      setParseResult(null);
    }
  };

  const handleSave = () => {
    if (parseResult?.success && parseResult.stitches.length > 0) {
      setRowFromText(rowIndex, parseResult.stitches, textValue);
      setIsEditing(false);
      setParseResult(null);
      setTextValue('');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setParseResult(null);
    setTextValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && parseResult?.success) {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex gap-3 items-start py-2 px-3 bg-blue-50 border border-blue-200 rounded">
        <span className="text-xs font-mono font-semibold text-text-secondary min-w-[60px] pt-2">
          Row {rowNumber} ({sideLabel}):
        </span>
        <div className="flex-1">
          <input
            type="text"
            value={textValue}
            onChange={(e) => handleTextChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full px-2 py-1 text-sm font-mono border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="e.g., k2, p2, c4f twice"
            autoFocus
          />

          {/* Parse feedback */}
          {parseResult && !parseResult.success && (
            <div className="mt-1 text-xs text-error">
              {parseResult.errors[0]?.message}
            </div>
          )}
          {parseResult?.success && (
            <div className="mt-1 text-xs text-success">
              ✓ {parseResult.totalStitchCount} stitches parsed
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-2 flex gap-2">
            <button
              onClick={handleSave}
              disabled={!parseResult?.success}
              className="px-3 py-1 text-xs font-medium bg-primary text-white rounded hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="px-3 py-1 text-xs font-medium bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 items-center px-3 py-1 hover:bg-gray-50 rounded group">
      <div className="flex items-center gap-2">
        <span className="text-sm font-mono font-semibold text-text-secondary">
          Row {rowNumber} ({sideLabel}):
        </span>
        <button
          onClick={() => setIsEditing(true)}
          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-primary transition-opacity p-0.5"
          title="Edit row"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            <path d="m15 5 4 4" />
          </svg>
        </button>
      </div>
      <div className="flex-1">
        <code className="text-sm font-mono text-text-primary">
          {currentText || '(empty)'}
        </code>
        {hasGaps && currentText && (
          <div className="mt-1 text-xs text-warning flex items-center gap-1">
            <span>⚠</span>
            <span>Pattern has gaps (empty cells) - text may not reflect actual layout</span>
          </div>
        )}
      </div>
    </div>
  );
}

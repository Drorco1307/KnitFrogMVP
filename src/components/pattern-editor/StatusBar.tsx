import { usePatternStore } from '@/store/patternStore';
import { calculateStitchesCreated } from '@/utils/stitchEffects';

export default function StatusBar() {
  const rows = usePatternStore((state) => state.pattern.content.rows);
  const selectedRow = usePatternStore((state) => state.ui.selectedRow);

  // Calculate stats
  const totalRows = rows.length;
  const currentRowData = selectedRow ? rows.find(r => r.rowNumber === selectedRow) : null;
  
  let currentStitchCount = 0;
  if (currentRowData) {
    currentStitchCount = calculateStitchesCreated(
      currentRowData.stitches.map(s => s.type)
    );
  }

  // Check for warnings
  const hasWarnings = rows.some(row => row.warnings && row.warnings.length > 0);
  const firstWarning = rows.find(row => row.warnings && row.warnings.length > 0)?.warnings?.[0];

  return (
    <div className="bg-surface border-t border-border px-6 py-3 flex items-center justify-between text-sm">
      <div className="flex items-center gap-6">
        {selectedRow !== null && currentRowData ? (
          <>
            <div className="flex items-center gap-2">
              <span className="font-medium text-text-secondary">Current Row:</span>
              <span className="font-mono font-semibold text-primary">
                {selectedRow} ({currentRowData.isRightSide ? 'RS' : 'WS'})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-text-secondary">Stitch Count:</span>
              <span className="font-mono font-semibold">
                {currentStitchCount} / {currentRowData.expectedStitchCount}
              </span>
            </div>
          </>
        ) : (
          <div className="text-text-secondary">
            Click a row number to select a row
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="font-medium text-text-secondary">Total Rows:</span>
          <span className="font-mono font-semibold">{totalRows}</span>
        </div>

        {hasWarnings ? (
          <div className="flex items-center gap-2 text-warning">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-medium">Warnings</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-success">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-medium">Valid</span>
          </div>
        )}
      </div>

      {firstWarning && (
        <div className="absolute bottom-full left-0 right-0 bg-warning bg-opacity-10 border-t border-warning px-6 py-2 text-sm">
          <span className="font-medium text-warning">⚠ Warning:</span> {firstWarning}
        </div>
      )}
    </div>
  );
}

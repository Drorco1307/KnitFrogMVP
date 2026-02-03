import { usePatternStore } from '@/store/patternStore';
import { StitchCell } from '@/types/pattern.types';
import { getStitchBackgroundColor } from '@/utils/stitchData';

interface GridCellProps {
  rowIndex: number;
  colIndex: number;
  stitch: StitchCell;
  isDragging: boolean;
  isRightDragging: boolean;
  isRowSelected: boolean;
}

export default function GridCell({
  rowIndex,
  colIndex,
  stitch,
  isDragging,
  isRightDragging,
  isRowSelected,
}: GridCellProps) {
  const selectedStitch = usePatternStore((state) => state.ui.selectedStitch);
  const selectedColor = usePatternStore((state) => state.ui.selectedColor);
  const setStitchAt = usePatternStore((state) => state.setStitchAt);
  const clearCell = usePatternStore((state) => state.clearCell);
  const colorPalette = usePatternStore((state) => state.pattern.content.colorPalette);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.button === 0) {
      // Left click - place stitch
      if (!stitch.isPartOfCable) {
        setStitchAt(rowIndex, colIndex, selectedStitch, selectedColor);
      }
    } else if (e.button === 2) {
      // Right click - delete stitch
      clearCell(rowIndex, colIndex);
    }
  };

  const handleMouseEnter = () => {
    if (isDragging && !stitch.isPartOfCable) {
      setStitchAt(rowIndex, colIndex, selectedStitch, selectedColor);
    } else if (isRightDragging) {
      clearCell(rowIndex, colIndex);
    }
  };

  // Get background color
  let backgroundColor = getStitchBackgroundColor(stitch.type);
  
  // Apply color overlay if stitch has a color
  if (stitch.colorId && stitch.type) {
    const color = colorPalette.find(c => c.id === stitch.colorId);
    if (color) {
      // Mix the stitch type color with the yarn color
      backgroundColor = color.hex;
    }
  }

  // If part of cable, show lighter background
  if (stitch.isPartOfCable) {
    backgroundColor = '#FFE6F0';
  }

  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseEnter={handleMouseEnter}
      className={`
        w-[30px] h-[30px] 
        border border-border 
        flex items-center justify-center
        font-mono text-xs
        cursor-pointer
        transition-all
        hover:border-primary hover:scale-105 hover:z-10
        ${isRowSelected ? 'ring-2 ring-warning ring-opacity-50' : ''}
        ${stitch.isPartOfCable ? 'cursor-not-allowed opacity-70' : ''}
      `}
      style={{ backgroundColor }}
      title={stitch.type ? `${stitch.type}${stitch.colorId ? ` (${stitch.colorId})` : ''}` : 'Empty'}
    >
      {!stitch.isPartOfCable && stitch.type && (
        <span className="text-[10px] font-semibold select-none">
          {stitch.type.toUpperCase()}
        </span>
      )}
    </div>
  );
}

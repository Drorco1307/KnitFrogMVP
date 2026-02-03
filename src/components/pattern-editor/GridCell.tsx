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
  setIsDragging: (value: boolean) => void;
  setIsRightDragging: (value: boolean) => void;
  onHover: (rowIndex: number, colIndex: number) => void;
  onHoverEnd: () => void;
  isHighlighted: boolean;
  wouldPlacementOverflow: boolean;
}

export default function GridCell({
  rowIndex,
  colIndex,
  stitch,
  isDragging,
  isRightDragging,
  isRowSelected,
  setIsDragging,
  setIsRightDragging,
  onHover,
  onHoverEnd,
  isHighlighted,
  wouldPlacementOverflow,
}: GridCellProps) {
  const selectedStitch = usePatternStore((state) => state.ui.selectedStitch);
  const selectedColor = usePatternStore((state) => state.ui.selectedColor);
  const setStitchAt = usePatternStore((state) => state.setStitchAt);
  const clearCell = usePatternStore((state) => state.clearCell);
  const colorPalette = usePatternStore((state) => state.pattern.content.colorPalette);

  // Check if this is a non-existent cell (for shaping)
  const isNoStitch = stitch.type === 'no-stitch';

  const handleMouseDown = (e: React.MouseEvent) => {
    // Don't allow interaction with no-stitch cells
    if (isNoStitch) return;

    e.preventDefault();
    e.stopPropagation();

    if (e.button === 0) {
      // Left click - start dragging and place stitch
      setIsDragging(true);
      if (!stitch.isPartOfCable) {
        setStitchAt(rowIndex, colIndex, selectedStitch, selectedColor);
      }
    } else if (e.button === 2) {
      // Right click - start right dragging and delete stitch
      setIsRightDragging(true);
      clearCell(rowIndex, colIndex);
    }
  };

  const handleMouseEnter = (e: React.MouseEvent) => {
    // Always trigger hover for highlighting, even on no-stitch cells
    onHover(rowIndex, colIndex);

    // Don't allow interaction with no-stitch cells
    if (isNoStitch) return;

    // Check if mouse buttons are pressed during enter
    const leftPressed = (e.buttons & 1) === 1;
    const rightPressed = (e.buttons & 2) === 2;

    if ((isDragging || leftPressed) && !stitch.isPartOfCable) {
      setStitchAt(rowIndex, colIndex, selectedStitch, selectedColor);
    } else if (isRightDragging || rightPressed) {
      clearCell(rowIndex, colIndex);
    }
  };

  const handleMouseLeave = () => {
    onHoverEnd();
  };

  // Determine background color
  let backgroundColor: string;

  // Check if "no color" is selected (colorId is null, undefined, or 'none')
  const hasNoColor = !stitch.colorId || stitch.colorId === 'none';

  if (isNoStitch) {
    // Non-existent cell (for shaping) - black background
    backgroundColor = '#1a1a1a';
  } else if (stitch.isPartOfCable) {
    // Cable continuation cells
    backgroundColor = '#FFE6F0';
  } else if (hasNoColor || !stitch.type) {
    // No color selected OR empty cell - use stitch type background
    backgroundColor = getStitchBackgroundColor(stitch.type);
  } else {
    // Color is selected - use yarn color
    const color = colorPalette.find(c => c.id === stitch.colorId);
    if (color) {
      backgroundColor = color.hex;
    } else {
      backgroundColor = getStitchBackgroundColor(stitch.type);
    }
  }

  // Determine text color based on background brightness
  const getTextColor = (hexColor: string) => {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#2D3748' : '#FFFFFF';
  };

  const textColor = getTextColor(backgroundColor);

  // For no-stitch cells, render a non-interactive black cell
  if (isNoStitch) {
    const noStitchHighlightStyle = isHighlighted
      ? wouldPlacementOverflow
        ? 'ring-2 ring-red-500 ring-opacity-75'
        : 'ring-2 ring-primary ring-opacity-75'
      : '';
    return (
      <div
        className={`w-[30px] h-[30px] border border-gray-800 ${noStitchHighlightStyle}`}
        style={{ backgroundColor }}
        title="No stitch"
        onMouseEnter={() => onHover(rowIndex, colIndex)}
        onMouseLeave={handleMouseLeave}
      />
    );
  }

  // Determine highlight style - all cells in the placement are the same color
  // Blue if placement is valid, red if any cell would overflow
  const getHighlightStyle = () => {
    if (!isHighlighted) return '';
    if (wouldPlacementOverflow) {
      return 'ring-2 ring-red-500 ring-opacity-75 z-20'; // Red for invalid placement
    }
    return 'ring-2 ring-primary ring-opacity-75 z-20'; // Blue for valid placement
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onContextMenu={(e) => e.preventDefault()}
      className={`
        w-[30px] h-[30px]
        border border-border
        flex items-center justify-center
        font-mono text-xs
        cursor-pointer
        transition-all
        ${!isHighlighted ? 'hover:border-primary hover:scale-105 hover:z-10' : ''}
        ${isRowSelected ? 'ring-2 ring-warning ring-opacity-50' : ''}
        ${stitch.isPartOfCable ? 'cursor-not-allowed opacity-70' : ''}
        ${getHighlightStyle()}
      `}
      style={{ backgroundColor }}
      title={stitch.type ? `${stitch.type}${stitch.colorId && stitch.colorId !== 'none' ? ` (${stitch.colorId})` : ''}` : 'Empty'}
    >
      {!stitch.isPartOfCable && stitch.type && (
        <span
          className="text-[10px] font-semibold select-none"
          style={{ color: textColor }}
        >
          {stitch.type.toUpperCase()}
        </span>
      )}
    </div>
  );
}

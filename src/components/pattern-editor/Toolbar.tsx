import StitchPalette from './StitchPalette';
import ColorPalette from './ColorPalette';

export default function Toolbar() {
  return (
    <div className="bg-surface border-b border-border px-6 py-4 flex items-center gap-4 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-text-secondary">Stitch:</span>
        <StitchPalette />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-text-secondary">Color:</span>
        <ColorPalette />
      </div>

      <div className="ml-auto text-sm text-text-secondary">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-stitch-knit border border-border" />
            <span>Knit</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-stitch-purl border border-border" />
            <span>Purl</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-stitch-cable border border-border" />
            <span>Cable</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-stitch-increase border border-border" />
            <span>Increase</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-stitch-decrease border border-border" />
            <span>Decrease</span>
          </div>
        </div>
      </div>
    </div>
  );
}

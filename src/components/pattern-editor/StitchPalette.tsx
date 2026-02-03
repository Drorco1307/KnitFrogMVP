import { useState, useRef, useEffect } from 'react';
import { usePatternStore } from '@/store/patternStore';
import { STITCH_CATEGORIES } from '@/utils/stitchData';

export default function StitchPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const selectedStitch = usePatternStore((state) => state.ui.selectedStitch);
  const setSelectedStitch = usePatternStore((state) => state.setSelectedStitch);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (abbreviation: string) => {
    setSelectedStitch(abbreviation as any);
    setIsOpen(false);
  };

  // Find current stitch info
  const currentStitchInfo = STITCH_CATEGORIES.flatMap(cat => cat.stitches)
    .find(s => s.abbreviation === selectedStitch);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-secondary flex items-center gap-2 min-w-[200px] justify-between"
      >
        <div>
          <div className="font-mono font-semibold">{selectedStitch.toUpperCase() || 'Select'}</div>
          {currentStitchInfo && (
            <div className="text-xs text-text-secondary">{currentStitchInfo.fullName}</div>
          )}
        </div>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 bg-surface border border-border rounded-lg shadow-lg z-50 w-80 max-h-[400px] overflow-y-auto">
          {STITCH_CATEGORIES.map((category, idx) => (
            <div key={category.name}>
              {idx > 0 && <div className="border-t border-border" />}
              
              <div className="p-3">
                <div className="text-sm font-semibold text-text-secondary mb-2">
                  {category.name}
                </div>
                
                <div className="space-y-1">
                  {category.stitches.map((stitch) => (
                    <button
                      key={stitch.abbreviation}
                      onClick={() => handleSelect(stitch.abbreviation)}
                      className={`
                        w-full text-left px-3 py-2 rounded transition-colors
                        ${selectedStitch === stitch.abbreviation 
                          ? 'bg-primary text-white' 
                          : 'hover:bg-gray-100'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold w-16">
                          {stitch.abbreviation.toUpperCase()}
                        </span>
                        <div className="flex-1">
                          <div className="text-sm font-medium">{stitch.fullName}</div>
                          <div className="text-xs opacity-70">{stitch.description}</div>
                        </div>
                        {stitch.spansCells && stitch.spansCells > 1 && (
                          <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                            {stitch.spansCells} cells
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

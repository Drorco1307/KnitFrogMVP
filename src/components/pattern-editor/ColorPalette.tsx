import { useState, useRef, useEffect } from 'react';
import { usePatternStore } from '@/store/patternStore';

export default function ColorPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const colorPalette = usePatternStore((state) => state.pattern.content.colorPalette);
  const selectedColor = usePatternStore((state) => state.ui.selectedColor);
  const setSelectedColor = usePatternStore((state) => state.setSelectedColor);

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

  const handleSelect = (colorId: string) => {
    setSelectedColor(colorId);
    setIsOpen(false);
  };

  const isNoColor = selectedColor === 'none';
  const currentColor = isNoColor ? null : colorPalette.find(c => c.id === selectedColor);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-secondary flex items-center gap-3 min-w-[180px] justify-between"
      >
        <div className="flex items-center gap-2">
          {isNoColor ? (
            <>
              <div className="w-6 h-6 rounded border border-border bg-white relative overflow-hidden">
                {/* Diagonal line to indicate "no color" */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-[2px] bg-red-500 rotate-45 transform origin-center" />
                </div>
              </div>
              <div>
                <div className="font-medium text-sm">None</div>
                <div className="text-xs text-text-secondary">No Color</div>
              </div>
            </>
          ) : (
            <>
              <div
                className="w-6 h-6 rounded border border-border"
                style={{ backgroundColor: currentColor?.hex || '#4A90E2' }}
              />
              <div>
                <div className="font-medium text-sm">{currentColor?.id || 'MC'}</div>
                <div className="text-xs text-text-secondary">{currentColor?.name || 'Main Color'}</div>
              </div>
            </>
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
        <div className="absolute top-full mt-2 bg-surface border border-border rounded-lg shadow-lg z-50 w-64 p-3">
          {/* No Color Option */}
          <button
            onClick={() => handleSelect('none')}
            className={`
              w-full flex items-center gap-2 p-2 rounded transition-colors mb-2
              ${selectedColor === 'none'
                ? 'bg-primary bg-opacity-10 border-2 border-primary'
                : 'border-2 border-transparent hover:bg-gray-100'
              }
            `}
          >
            <div className="w-8 h-8 rounded border border-border bg-white relative overflow-hidden flex-shrink-0">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-[2px] bg-red-500 rotate-45 transform origin-center" />
              </div>
            </div>
            <div className="text-left flex-1 min-w-0">
              <div className="font-medium text-sm">None</div>
              <div className="text-xs text-text-secondary">Use stitch type colors</div>
            </div>
          </button>

          <div className="border-t border-border my-2" />

          {/* Color Options */}
          <div className="grid grid-cols-2 gap-2">
            {colorPalette.map((color) => (
              <button
                key={color.id}
                onClick={() => handleSelect(color.id)}
                className={`
                  flex items-center gap-2 p-2 rounded transition-colors
                  ${selectedColor === color.id
                    ? 'bg-primary bg-opacity-10 border-2 border-primary'
                    : 'border-2 border-transparent hover:bg-gray-100'
                  }
                `}
              >
                <div
                  className="w-8 h-8 rounded border border-border flex-shrink-0"
                  style={{ backgroundColor: color.hex }}
                />
                <div className="text-left flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{color.id}</div>
                  <div className="text-xs text-text-secondary truncate">{color.name}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

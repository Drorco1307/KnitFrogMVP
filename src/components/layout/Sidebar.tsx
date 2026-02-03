import { usePatternStore } from '@/store/patternStore';

export default function Sidebar() {
  const pattern = usePatternStore((state) => state.pattern);
  const updateMetadata = usePatternStore((state) => state.updateMetadata);
  const updateStructure = usePatternStore((state) => state.updateStructure);
  const resizeGrid = usePatternStore((state) => state.resizeGrid);

  const currentWidth = pattern.content.rows[0]?.stitches.filter(s => s.type !== 'no-stitch').length || 0;
  const currentHeight = pattern.content.rows.length;

  const handleWidthChange = (delta: number) => {
    const newWidth = Math.max(1, Math.min(200, currentWidth + delta));
    resizeGrid(newWidth, currentHeight);
  };

  const handleHeightChange = (delta: number) => {
    const newHeight = Math.max(1, Math.min(500, currentHeight + delta));
    resizeGrid(currentWidth, newHeight);
  };

  return (
    <aside className="w-80 bg-surface border-r border-border overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Knitting Style Section - Most important, at the top */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Knitting Style</h2>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Working Method</label>
              <select
                value={pattern.structure.type}
                onChange={(e) => updateStructure({ type: e.target.value as 'flat' | 'circular' })}
                className="input-field w-full"
              >
                <option value="flat">Flat (Back & Forth)</option>
                <option value="circular">In the Round</option>
              </select>
            </div>

            {pattern.structure.type === 'flat' && (
              <div>
                <label className="block text-sm font-medium mb-1">Row 1 Starts On</label>
                <select
                  value={pattern.structure.startsOnRS ? 'rs' : 'ws'}
                  onChange={(e) => updateStructure({ startsOnRS: e.target.value === 'rs' })}
                  className="input-field w-full"
                >
                  <option value="rs">Right Side (RS)</option>
                  <option value="ws">Wrong Side (WS)</option>
                </select>
              </div>
            )}
          </div>
        </section>

        {/* Grid Size Section */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Grid Size</h2>

          <div className="space-y-3">
            {/* Stitch Count (Width) */}
            <div>
              <label className="block text-sm font-medium mb-1">Stitches (Width)</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleWidthChange(-1)}
                  className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded text-lg font-bold transition-colors"
                >
                  −
                </button>
                <input
                  type="number"
                  value={currentWidth}
                  onChange={(e) => {
                    const newWidth = Math.max(1, Math.min(200, parseInt(e.target.value) || 1));
                    resizeGrid(newWidth, currentHeight);
                  }}
                  className="input-field w-20 text-center"
                  min="1"
                  max="200"
                />
                <button
                  onClick={() => handleWidthChange(1)}
                  className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded text-lg font-bold transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Row Count (Height) */}
            <div>
              <label className="block text-sm font-medium mb-1">Rows (Height)</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleHeightChange(-1)}
                  className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded text-lg font-bold transition-colors"
                >
                  −
                </button>
                <input
                  type="number"
                  value={currentHeight}
                  onChange={(e) => {
                    const newHeight = Math.max(1, Math.min(500, parseInt(e.target.value) || 1));
                    resizeGrid(currentWidth, newHeight);
                  }}
                  className="input-field w-20 text-center"
                  min="1"
                  max="500"
                />
                <button
                  onClick={() => handleHeightChange(1)}
                  className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded text-lg font-bold transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Pattern Info Section */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Pattern Info</h2>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={pattern.metadata.description || ''}
                onChange={(e) => updateMetadata({ description: e.target.value })}
                className="input-field w-full h-20 resize-none"
                placeholder="Pattern description..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Author</label>
              <input
                type="text"
                value={pattern.metadata.author || ''}
                onChange={(e) => updateMetadata({ author: e.target.value })}
                className="input-field w-full"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Difficulty</label>
              <select
                value={pattern.metadata.difficulty || 'intermediate'}
                onChange={(e) => updateMetadata({ difficulty: e.target.value as any })}
                className="input-field w-full"
              >
                <option value="beginner">Beginner</option>
                <option value="easy">Easy</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
            </div>
          </div>
        </section>

        {/* Gauge Section */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Gauge</h2>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Stitches per inch</label>
              <input
                type="number"
                step="0.5"
                value={pattern.metadata.gauge.stitchesPerInch}
                onChange={(e) => updateMetadata({
                  gauge: { ...pattern.metadata.gauge, stitchesPerInch: parseFloat(e.target.value) }
                })}
                className="input-field w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Rows per inch</label>
              <input
                type="number"
                step="0.5"
                value={pattern.metadata.gauge.rowsPerInch}
                onChange={(e) => updateMetadata({
                  gauge: { ...pattern.metadata.gauge, rowsPerInch: parseFloat(e.target.value) }
                })}
                className="input-field w-full"
              />
            </div>
          </div>
        </section>

        {/* Needle Size Section */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Needle Size</h2>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">US Size</label>
              <input
                type="number"
                value={pattern.metadata.needleSize.us || ''}
                onChange={(e) => updateMetadata({
                  needleSize: { ...pattern.metadata.needleSize, us: parseInt(e.target.value) }
                })}
                className="input-field w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Metric (mm)</label>
              <input
                type="number"
                step="0.5"
                value={pattern.metadata.needleSize.metric || ''}
                onChange={(e) => updateMetadata({
                  needleSize: { ...pattern.metadata.needleSize, metric: parseFloat(e.target.value) }
                })}
                className="input-field w-full"
              />
            </div>
          </div>
        </section>

        {/* Yarn Weight Section */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Yarn Weight</h2>
          <select
            value={pattern.metadata.yarnWeight}
            onChange={(e) => updateMetadata({ yarnWeight: e.target.value as any })}
            className="input-field w-full"
          >
            <option value="lace">Lace</option>
            <option value="fingering">Fingering</option>
            <option value="sport">Sport</option>
            <option value="DK">DK</option>
            <option value="worsted">Worsted</option>
            <option value="aran">Aran</option>
            <option value="bulky">Bulky</option>
            <option value="super-bulky">Super Bulky</option>
            <option value="jumbo">Jumbo</option>
          </select>
        </section>
      </div>
    </aside>
  );
}

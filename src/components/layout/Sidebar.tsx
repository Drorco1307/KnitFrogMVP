import { usePatternStore } from '@/store/patternStore';

export default function Sidebar() {
  const pattern = usePatternStore((state) => state.pattern);
  const updateMetadata = usePatternStore((state) => state.updateMetadata);
  const resizeGrid = usePatternStore((state) => state.resizeGrid);

  const handleGridResize = () => {
    const width = prompt('Enter grid width (stitches):', '20');
    const height = prompt('Enter grid height (rows):', '10');
    
    if (width && height) {
      resizeGrid(parseInt(width), parseInt(height));
    }
  };

  return (
    <aside className="w-80 bg-surface border-r border-border overflow-y-auto">
      <div className="p-6 space-y-6">
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

        {/* Grid Size Section */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Grid Size</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Width: {pattern.content.rows[0]?.stitches.length || 0} stitches</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Height: {pattern.content.rows.length} rows</span>
            </div>
            <button onClick={handleGridResize} className="btn-secondary w-full mt-2">
              Resize Grid
            </button>
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

            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                value={pattern.metadata.needleSize.type || 'straight'}
                onChange={(e) => updateMetadata({
                  needleSize: { ...pattern.metadata.needleSize, type: e.target.value as any }
                })}
                className="input-field w-full"
              >
                <option value="straight">Straight</option>
                <option value="circular">Circular</option>
                <option value="dpn">Double Pointed (DPN)</option>
              </select>
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

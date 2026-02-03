import { usePatternStore } from '@/store/patternStore';

export default function Header() {
  const patternName = usePatternStore((state) => state.pattern.metadata.name);
  const setPatternName = usePatternStore((state) => state.setPatternName);

  const handleSave = () => {
    console.log('Save pattern');
    // TODO: Implement save functionality
  };

  const handleLoad = () => {
    console.log('Load pattern');
    // TODO: Implement load functionality
  };

  const handleExport = () => {
    console.log('Export pattern');
    // TODO: Implement export functionality
  };

  return (
    <header className="bg-surface border-b border-border px-6 py-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold text-primary">Knitting Pattern Editor</h1>
        
        <input
          type="text"
          value={patternName}
          onChange={(e) => setPatternName(e.target.value)}
          className="input-field text-lg font-medium min-w-[300px]"
          placeholder="Pattern name..."
        />
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-text-secondary">
          Last saved: Never
        </span>
        
        <button onClick={handleSave} className="btn-primary">
          Save
        </button>
        
        <button onClick={handleLoad} className="btn-secondary">
          Load
        </button>
        
        <button onClick={handleExport} className="btn-secondary">
          Export
        </button>
      </div>
    </header>
  );
}

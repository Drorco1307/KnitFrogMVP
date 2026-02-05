import { usePatternStore } from '@/store/patternStore';
import UnifiedEditor from '@/components/pattern-editor/UnifiedEditor';

export default function MainContent() {
  const activeTab = usePatternStore((state) => state.ui.activeTab);
  const setActiveTab = usePatternStore((state) => state.setActiveTab);

  return (
    <main className="flex-1 flex flex-col overflow-hidden">
      {/* Tab Bar */}
      <div className="bg-surface border-b border-border px-6">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('grid')}
            className={`px-6 py-3 font-medium transition-colors relative ${
              activeTab === 'grid'
                ? 'text-primary border-b-2 border-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Pattern Editor
          </button>

          <button
            onClick={() => setActiveTab('3d')}
            className={`px-6 py-3 font-medium transition-colors relative ${
              activeTab === '3d'
                ? 'text-primary border-b-2 border-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            3D Preview
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'grid' && <UnifiedEditor />}
        {activeTab === '3d' && (
          <div className="flex items-center justify-center h-full text-text-secondary">
            3D preview coming soon...
          </div>
        )}
      </div>
    </main>
  );
}

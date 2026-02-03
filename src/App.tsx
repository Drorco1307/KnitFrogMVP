import { usePatternStore } from './store/patternStore';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import MainContent from './components/layout/MainContent';

function App() {
  const activeTab = usePatternStore((state) => state.ui.activeTab);

  return (
    <div className="h-screen flex flex-col bg-background">
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <MainContent />
      </div>
    </div>
  );
}

export default App;

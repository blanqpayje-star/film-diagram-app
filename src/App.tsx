import { useEffect } from 'react';
import { useDiagramStore } from './store';
import { Header } from './components/Header';
import { Toolbar } from './components/Toolbar';
import { Canvas } from './components/Canvas';
import { PropertiesPanel } from './components/PropertiesPanel';
import './index.css';

function App() {
  const { scenes, currentSceneId, setCurrentScene, darkMode, leftPanelCollapsed, rightPanelCollapsed } = useDiagramStore();

  // Set initial scene on mount
  useEffect(() => {
    if (!currentSceneId && scenes.length > 0) {
      setCurrentScene(scenes[0].id);
    }
  }, [currentSceneId, scenes, setCurrentScene]);

  // Apply dark mode class to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="h-screen flex flex-col bg-[#E8ECD7] dark:bg-neutral-900 overflow-hidden">
      <Header />

      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Toolbar */}
        <div className={`flex-shrink-0 overflow-y-auto transition-all duration-300 ${
          leftPanelCollapsed ? 'w-16' : 'w-64'
        }`}>
          <Toolbar collapsed={leftPanelCollapsed} />
        </div>

        {/* Main Canvas - Scrollable */}
        <div className="flex-1 overflow-auto p-4 bg-neutral-100 dark:bg-neutral-800">
          <div className="inline-block shadow-2xl canvas-container">
            <Canvas />
          </div>
        </div>

        {/* Right Properties Panel */}
        <div className={`flex-shrink-0 overflow-y-auto transition-all duration-300 ${
          rightPanelCollapsed ? 'w-16' : 'w-80'
        }`}>
          <PropertiesPanel collapsed={rightPanelCollapsed} />
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#1F4529] dark:bg-black text-[#E8ECD7] dark:text-neutral-400 text-xs px-4 py-2 flex items-center justify-between flex-shrink-0 border-t border-[#47663B]">
        <div className="font-medium">
          Film Diagram Studio - Free lighting & camera pre-visualization tool
        </div>
        <div className="flex items-center gap-4 font-semibold">
          <span>
            Elements: {useDiagramStore.getState().getCurrentScene()?.elements.length || 0}
          </span>
          <span>•</span>
          <span>Scenes: {scenes.length}</span>
        </div>
      </footer>
    </div>
  );
}

export default App;

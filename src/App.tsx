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
    <div className="app-shell h-screen flex flex-col overflow-hidden">
      <Header />

      <div className="app-workspace flex-1 flex overflow-hidden min-h-0">
        {/* Left Toolbar */}
        <div className={`tool-dock flex-shrink-0 overflow-y-auto transition-all duration-300 ${
          leftPanelCollapsed ? 'w-16' : 'w-64'
        }`}>
          <Toolbar collapsed={leftPanelCollapsed} />
        </div>

        {/* Main Canvas - Scrollable */}
        <div className="canvas-stage flex-1 overflow-auto p-5">
          <div className="inline-block canvas-container">
            <Canvas />
          </div>
        </div>

        {/* Right Properties Panel */}
        <div className={`inspector-dock flex-shrink-0 overflow-y-auto transition-all duration-300 ${
          rightPanelCollapsed ? 'w-16' : 'w-80'
        }`}>
          <PropertiesPanel collapsed={rightPanelCollapsed} />
        </div>
      </div>

      {/* Footer */}
      <footer className="app-footer text-xs px-5 py-2.5 flex items-center justify-between flex-shrink-0">
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

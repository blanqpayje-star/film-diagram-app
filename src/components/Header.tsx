import React, { useState } from 'react';
import { useDiagramStore } from '../store';
import { exportToPNG, exportToPDF } from '../utils/export';
import {
  Plus,
  Upload,
  Download,
  Grid3x3,
  Magnet,
  Film,
  Settings,
  Copy,
  Trash2,
  FileImage,
  FileText,
  Sun,
  Moon,
  Image,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    scenes,
    currentSceneId,
    addScene,
    setCurrentScene,
    deleteScene,
    duplicateScene,
    getCurrentScene,
    exportScene,
    importScene,
    gridEnabled,
    toggleGrid,
    snapToGrid,
    toggleSnapToGrid,
    measurementUnit,
    setMeasurementUnit,
    darkMode,
    toggleDarkMode,
    canvasBackground,
    setCanvasBackground,
    canvasBackgroundImage,
    setCanvasBackgroundImage,
  } = useDiagramStore();

  const [showNewSceneInput, setShowNewSceneInput] = useState(false);
  const [newSceneName, setNewSceneName] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showCanvasBackground, setShowCanvasBackground] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const currentScene = getCurrentScene();

  const handleAddScene = () => {
    if (newSceneName.trim()) {
      addScene(newSceneName.trim());
      setNewSceneName('');
      setShowNewSceneInput(false);
    }
  };

  const handleExportJSON = () => {
    const data = exportScene();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentScene?.name || 'scene'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPNG = async () => {
    const canvas = document.querySelector('.canvas-container > div') as HTMLElement;
    if (!canvas) {
      alert('Canvas not found');
      return;
    }

    setIsExporting(true);
    try {
      await exportToPNG(canvas, currentScene?.name || 'scene');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export PNG');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    const canvas = document.querySelector('.canvas-container > div') as HTMLElement;
    if (!canvas) {
      alert('Canvas not found');
      return;
    }

    setIsExporting(true);
    try {
      await exportToPDF(canvas, currentScene?.name || 'scene', 'landscape');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export PDF');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = event.target?.result as string;
      importScene(data);
    };
    reader.readAsText(file);
  };

  const handleBackgroundImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target?.result as string;
      setCanvasBackgroundImage(imageData);
    };
    reader.readAsDataURL(file);
  };

  const handleBackgroundColorChange = (color: string) => {
    setCanvasBackground(color);
    setCanvasBackgroundImage(undefined);
  };

  const clearBackgroundImage = () => {
    setCanvasBackgroundImage(undefined);
  };

  return (
    <header className="bg-blue-900 text-blue-100 shadow-lg flex-shrink-0 z-10 border-b border-blue-700">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Film className="text-blue-200" size={28} />
          <div>
            <h1 className="text-lg font-bold tracking-wide text-white">Film Diagram Studio</h1>
            <p className="text-xs text-blue-200 opacity-80 font-medium">Lighting & Camera Pre-viz</p>
          </div>
        </div>

        {/* Scene Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-blue-100">Scene:</label>
            <select
              value={currentSceneId || ''}
              onChange={(e) => setCurrentScene(e.target.value)}
              className="px-3 py-1.5 bg-blue-800 text-white font-medium border border-blue-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              {scenes.map((scene) => (
                <option key={scene.id} value={scene.id} className="bg-blue-900 text-white">
                  {scene.name}
                </option>
              ))}
            </select>
          </div>

          {showNewSceneInput ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newSceneName}
                onChange={(e) => setNewSceneName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddScene()}
                placeholder="Scene name..."
                autoFocus
                className="px-3 py-1.5 bg-blue-800 text-white placeholder-blue-300 border border-blue-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <button
                onClick={handleAddScene}
                className="px-3 py-1.5 bg-blue-200 text-blue-900 font-bold rounded-lg hover:bg-blue-100 text-sm transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowNewSceneInput(false);
                  setNewSceneName('');
                }}
                className="px-3 py-1.5 bg-blue-800 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowNewSceneInput(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-800 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors text-sm border border-blue-600"
            >
              <Plus size={16} />
              New Scene
            </button>
          )}

          {currentSceneId && (
            <>
              <button
                onClick={() => duplicateScene(currentSceneId)}
                className="p-2 bg-blue-800 text-white rounded-lg hover:bg-blue-700 transition-colors"
                title="Duplicate Scene"
              >
                <Copy size={16} />
              </button>
              {scenes.length > 1 && (
                <button
                  onClick={() => {
                    if (
                      confirm(
                        `Delete scene "${currentScene?.name}"? This cannot be undone.`
                      )
                    ) {
                      deleteScene(currentSceneId);
                    }
                  }}
                  className="p-2 bg-red-800 text-white rounded-lg hover:bg-red-700 transition-colors"
                  title="Delete Scene"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 bg-blue-800 text-blue-200 rounded-lg hover:bg-blue-700 transition-colors"
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <div className="h-6 w-px bg-blue-700 mx-1" />

          <button
            onClick={toggleGrid}
            className={`p-2 rounded-lg font-bold transition-colors ${
              gridEnabled
                ? 'bg-blue-300 text-blue-900'
                : 'bg-blue-800 text-blue-100 hover:bg-blue-700'
            }`}
            title="Toggle Grid"
          >
            <Grid3x3 size={18} />
          </button>

          <button
            onClick={toggleSnapToGrid}
            className={`p-2 rounded-lg font-bold transition-colors ${
              snapToGrid
                ? 'bg-blue-300 text-blue-900'
                : 'bg-blue-800 text-blue-100 hover:bg-blue-700'
            }`}
            title="Snap to Grid"
          >
            <Magnet size={18} />
          </button>

          <div className="h-6 w-px bg-blue-700 mx-1" />

          {/* Canvas Background */}
          <div className="relative group">
            <button
              onClick={() => setShowCanvasBackground(!showCanvasBackground)}
              className="p-2 bg-blue-800 text-white rounded-lg hover:bg-blue-700 transition-colors"
              title="Canvas Background"
            >
              <Image size={18} />
            </button>
            <div className="absolute right-0 mt-1 w-64 bg-blue-900 border border-blue-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-3">
              <h4 className="text-xs font-bold text-blue-300 mb-2 uppercase tracking-wider">Canvas Background</h4>
              
              {/* Background Color */}
              <div className="mb-3">
                <label className="block text-xs font-semibold text-blue-200 mb-1">Solid Color</label>
                <input
                  type="color"
                  value={canvasBackground}
                  onChange={(e) => handleBackgroundColorChange(e.target.value)}
                  className="w-full h-8 rounded border border-blue-700 bg-transparent cursor-pointer"
                />
              </div>

              {/* Background Image */}
              <div className="mb-3">
                <label className="block text-xs font-semibold text-blue-200 mb-1">Texture / Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBackgroundImageUpload}
                  className="w-full text-xs text-blue-200"
                />
                {canvasBackgroundImage && (
                  <button
                    onClick={clearBackgroundImage}
                    className="mt-1 text-xs text-red-400 hover:text-red-300"
                  >
                    Remove Background Image
                  </button>
                )}
              </div>

              {/* Quick Presets */}
              <div>
                <label className="block text-xs font-semibold text-blue-200 mb-1">Quick Colors</label>
                <div className="flex flex-wrap gap-1">
                  {['#FFFFFF', '#F8FAFC', '#E0E7FF', '#DBEAFE', '#BFDBFE', '#93C5FD', '#60A5FA', '#3B82F6', '#2563EB', '#1D4ED8', '#1E40AF', '#1E3A8A', '#000000'].map((color) => (
                    <button
                      key={color}
                      onClick={() => handleBackgroundColorChange(color)}
                      className={`w-6 h-6 rounded border-2 ${
                        canvasBackground === color && !canvasBackgroundImage ? 'border-white' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="h-6 w-px bg-blue-700 mx-1" />

          {/* Export Menu */}
          <div className="relative group">
            <button
              className="flex items-center gap-2 px-3 py-2 bg-blue-800 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors text-sm border border-blue-600"
              disabled={isExporting}
            >
              <Download size={16} />
              {isExporting ? 'Exporting...' : 'Export'}
            </button>
            <div className="absolute right-0 mt-1 w-48 bg-blue-900 border border-blue-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <button
                onClick={handleExportPNG}
                disabled={isExporting}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 rounded-t-lg transition-colors"
              >
                <FileImage size={16} />
                Export as PNG
              </button>
              <button
                onClick={handleExportPDF}
                disabled={isExporting}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 transition-colors"
              >
                <FileText size={16} />
                Export as PDF
              </button>
              <button
                onClick={handleExportJSON}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 rounded-b-lg transition-colors"
              >
                <Download size={16} />
                Export as JSON
              </button>
            </div>
          </div>

          <label className="flex items-center gap-2 px-3 py-2 bg-blue-800 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors text-sm border border-blue-600 cursor-pointer">
            <Upload size={16} />
            Import
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 bg-blue-800 text-white rounded-lg hover:bg-blue-700 transition-colors"
            title="Settings"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="border-t border-blue-700 px-4 py-3 bg-blue-950 text-blue-100">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold text-blue-100">Canvas Size:</label>
              <input
                type="number"
                value={useDiagramStore.getState().canvasWidth}
                onChange={(e) =>
                  useDiagramStore
                    .getState()
                    .setCanvasSize(
                      parseInt(e.target.value),
                      useDiagramStore.getState().canvasHeight
                    )
                }
                className="w-20 px-2 py-1 bg-blue-800 border border-blue-600 rounded text-sm text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Width"
              />
              <span className="text-blue-300 font-bold">×</span>
              <input
                type="number"
                value={useDiagramStore.getState().canvasHeight}
                onChange={(e) =>
                  useDiagramStore
                    .getState()
                    .setCanvasSize(
                      useDiagramStore.getState().canvasWidth,
                      parseInt(e.target.value)
                    )
                }
                className="w-20 px-2 py-1 bg-blue-800 border border-blue-600 rounded text-sm text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Height"
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold text-blue-100">Grid Size:</label>
              <input
                type="number"
                value={useDiagramStore.getState().gridSize}
                onChange={(e) =>
                  useDiagramStore.getState().setGridSize(parseInt(e.target.value))
                }
                className="w-20 px-2 py-1 bg-blue-800 border border-blue-600 rounded text-sm text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-400"
                min="10"
                max="100"
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold text-blue-100">Measurement Unit:</label>
              <select
                value={measurementUnit}
                onChange={(e) => setMeasurementUnit(e.target.value as 'ft' | 'm' | 'in')}
                className="px-3 py-1 bg-blue-800 border border-blue-600 rounded text-sm text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="ft" className="bg-blue-900">Feet (ft)</option>
                <option value="m" className="bg-blue-900">Meters (m)</option>
                <option value="in" className="bg-blue-900">Inches (in)</option>
              </select>
            </div>

            <button
              onClick={() => setShowSettings(false)}
              className="ml-auto px-3 py-1 bg-blue-300 text-blue-900 font-bold rounded hover:bg-blue-200 text-sm transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Canvas Background Quick Panel */}
      {showCanvasBackground && (
        <div className="border-t border-blue-700 px-4 py-2 bg-blue-950 text-blue-100">
          <div className="flex items-center gap-4 flex-wrap">
            <input
              type="color"
              value={canvasBackground}
              onChange={(e) => handleBackgroundColorChange(e.target.value)}
              className="w-10 h-10 rounded border border-blue-600 cursor-pointer"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleBackgroundImageUpload}
              className="text-xs text-blue-200"
            />
            {canvasBackgroundImage && (
              <button
                onClick={clearBackgroundImage}
                className="text-xs text-red-400 hover:text-red-300"
              >
                Remove Image
              </button>
            )}
            <button
              onClick={() => setShowCanvasBackground(false)}
              className="ml-auto px-3 py-1 bg-blue-800 text-white rounded hover:bg-blue-700 text-sm transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

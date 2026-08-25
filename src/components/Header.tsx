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
    <header className="app-header flex-shrink-0 z-10">
      <div className="app-header__bar flex items-center justify-between px-5 py-3">
        {/* Logo */}
        <div className="app-brand flex items-center gap-3">
          <Film className="app-brand__mark" size={25} />
          <div>
            <h1 className="text-lg font-bold tracking-wide">Film Diagram Studio</h1>
            <p className="text-xs font-medium">Lighting &amp; camera pre-viz</p>
          </div>
        </div>

        {/* Scene Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-[var(--on-binder-muted)]">Scene:</label>
            <select
              value={currentSceneId || ''}
              onChange={(e) => setCurrentScene(e.target.value)}
              className="px-3 py-1.5 bg-[var(--binder)] text-[var(--ink-strong)] font-medium border border-[var(--line)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            >
              {scenes.map((scene) => (
                <option key={scene.id} value={scene.id} className="bg-[var(--control)] text-[var(--ink-strong)]">
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
                className="px-3 py-1.5 bg-[var(--binder)] text-[var(--ink-strong)] placeholder-[var(--ink-muted)] border border-[var(--line)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              />
              <button
                onClick={handleAddScene}
                className="px-3 py-1.5 bg-[var(--accent)] text-[var(--accent-ink)] font-bold rounded-lg hover:bg-[var(--accent)]/90 text-sm transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowNewSceneInput(false);
                  setNewSceneName('');
                }}
                className="px-3 py-1.5 bg-[var(--binder)] text-[var(--on-binder)] rounded-lg hover:bg-[var(--control-hover)] hover:text-[var(--ink-strong)] text-sm font-semibold"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowNewSceneInput(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-[var(--binder)] text-[var(--ink-strong)] font-bold rounded-lg hover:bg-[var(--binder)] transition-colors text-sm border border-[var(--line)]"
            >
              <Plus size={16} />
              New Scene
            </button>
          )}

          {currentSceneId && (
            <>
              <button
                onClick={() => duplicateScene(currentSceneId)}
                className="p-2 bg-[var(--binder)] text-[var(--ink-strong)] rounded-lg hover:bg-[var(--binder)] transition-colors"
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
                  className="p-2 bg-red-800 text-[#fff7ec] rounded-lg hover:bg-red-700 transition-colors"
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
              className="p-2 bg-[var(--binder)] text-[var(--on-binder-muted)] rounded-lg hover:bg-[var(--control-hover)] hover:text-[var(--ink-strong)] transition-colors"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <div className="h-6 w-px bg-[var(--line)] mx-1" />

          <button
            onClick={toggleGrid}
            className={`p-2 rounded-lg font-bold transition-colors ${
              gridEnabled
                ? 'bg-[var(--accent)] text-[var(--accent-ink)]'
                : 'bg-[var(--binder)] text-[var(--on-binder-muted)] hover:bg-[var(--control-hover)]'
            }`}
            title="Toggle Grid"
          >
            <Grid3x3 size={18} />
          </button>

          <button
            onClick={toggleSnapToGrid}
            className={`p-2 rounded-lg font-bold transition-colors ${
              snapToGrid
                ? 'bg-[var(--accent)] text-[var(--accent-ink)]'
                : 'bg-[var(--binder)] text-[var(--on-binder-muted)] hover:bg-[var(--control-hover)]'
            }`}
            title="Snap to Grid"
          >
            <Magnet size={18} />
          </button>

          <div className="h-6 w-px bg-[var(--line)] mx-1" />

          {/* Canvas Background */}
          <div className="relative group">
            <button
              onClick={() => setShowCanvasBackground(!showCanvasBackground)}
              className="p-2 bg-[var(--binder)] text-[var(--ink-strong)] rounded-lg hover:bg-[var(--binder)] transition-colors"
              title="Canvas Background"
            >
              <Image size={18} />
            </button>
            <div className="absolute right-0 mt-1 w-64 bg-[var(--binder)] border border-[var(--line)] rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-3">
              <h4 className="text-xs font-bold text-[var(--on-binder-muted)] mb-2 uppercase tracking-wider">Canvas Background</h4>
              
              {/* Background Color */}
              <div className="mb-3">
                <label className="block text-xs font-semibold text-[var(--on-binder-muted)] mb-1">Solid Color</label>
                <input
                  type="color"
                  value={canvasBackground}
                  onChange={(e) => handleBackgroundColorChange(e.target.value)}
                  className="w-full h-8 rounded border border-[var(--line)] bg-transparent cursor-pointer"
                />
              </div>

              {/* Background Image */}
              <div className="mb-3">
                <label className="block text-xs font-semibold text-[var(--on-binder-muted)] mb-1">Texture / Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBackgroundImageUpload}
                  className="w-full text-xs text-[var(--on-binder-muted)]"
                />
                {canvasBackgroundImage && (
                  <button
                    onClick={clearBackgroundImage}
                    className="mt-1 text-xs text-[var(--danger)] hover:text-[var(--danger)]/80"
                  >
                    Remove Background Image
                  </button>
                )}
              </div>

              {/* Quick Presets */}
              <div>
                <label className="block text-xs font-semibold text-[var(--on-binder-muted)] mb-1">Quick Colors</label>
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

          <div className="h-6 w-px bg-[var(--line)] mx-1" />

          {/* Export Menu */}
          <div className="relative group">
            <button
              className="flex items-center gap-2 px-3 py-2 bg-[var(--binder)] text-[var(--ink-strong)] font-bold rounded-lg hover:bg-[var(--binder)] transition-colors text-sm border border-[var(--line)]"
              disabled={isExporting}
            >
              <Download size={16} />
              {isExporting ? 'Exporting...' : 'Export'}
            </button>
            <div className="absolute right-0 mt-1 w-48 bg-[var(--binder)] border border-[var(--line)] rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <button
                onClick={handleExportPNG}
                disabled={isExporting}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[var(--on-binder)] hover:bg-[var(--control-hover)] hover:text-[var(--ink-strong)] rounded-t-lg transition-colors"
              >
                <FileImage size={16} />
                Export as PNG
              </button>
              <button
                onClick={handleExportPDF}
                disabled={isExporting}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[var(--on-binder)] hover:bg-[var(--control-hover)] hover:text-[var(--ink-strong)] transition-colors"
              >
                <FileText size={16} />
                Export as PDF
              </button>
              <button
                onClick={handleExportJSON}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[var(--on-binder)] hover:bg-[var(--control-hover)] hover:text-[var(--ink-strong)] rounded-b-lg transition-colors"
              >
                <Download size={16} />
                Export as JSON
              </button>
            </div>
          </div>

          <label className="flex items-center gap-2 px-3 py-2 bg-[var(--binder)] text-[var(--ink-strong)] font-bold rounded-lg hover:bg-[var(--binder)] transition-colors text-sm border border-[var(--line)] cursor-pointer">
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
            className="p-2 bg-[var(--binder)] text-[var(--ink-strong)] rounded-lg hover:bg-[var(--binder)] transition-colors"
            title="Settings"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="border-t border-[var(--line)] px-4 py-3 bg-[var(--binder)] text-[var(--on-binder-muted)]">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold text-[var(--on-binder-muted)]">Canvas Size:</label>
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
                className="w-20 px-2 py-1 bg-[var(--binder)] border border-[var(--line)] rounded text-sm text-[var(--ink-strong)] font-medium focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                placeholder="Width"
              />
              <span className="text-[var(--on-binder-muted)] font-bold">×</span>
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
                className="w-20 px-2 py-1 bg-[var(--binder)] border border-[var(--line)] rounded text-sm text-[var(--ink-strong)] font-medium focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                placeholder="Height"
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold text-[var(--on-binder-muted)]">Grid Size:</label>
              <input
                type="number"
                value={useDiagramStore.getState().gridSize}
                onChange={(e) =>
                  useDiagramStore.getState().setGridSize(parseInt(e.target.value))
                }
                className="w-20 px-2 py-1 bg-[var(--binder)] border border-[var(--line)] rounded text-sm text-[var(--ink-strong)] font-medium focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                min="10"
                max="100"
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold text-[var(--on-binder-muted)]">Measurement Unit:</label>
              <select
                value={measurementUnit}
                onChange={(e) => setMeasurementUnit(e.target.value as 'ft' | 'm' | 'in')}
                className="px-3 py-1 bg-[var(--binder)] border border-[var(--line)] rounded text-sm text-[var(--ink-strong)] font-medium focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              >
                <option value="ft" className="bg-[var(--binder)]">Feet (ft)</option>
                <option value="m" className="bg-[var(--binder)]">Meters (m)</option>
                <option value="in" className="bg-[var(--binder)]">Inches (in)</option>
              </select>
            </div>

            <button
              onClick={() => setShowSettings(false)}
              className="ml-auto px-3 py-1 bg-[var(--accent)] text-[var(--accent-ink)] font-bold rounded hover:bg-[var(--accent)]/90 text-sm transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Canvas Background Quick Panel */}
      {showCanvasBackground && (
        <div className="border-t border-[var(--line)] px-4 py-2 bg-[var(--binder)] text-[var(--on-binder-muted)]">
          <div className="flex items-center gap-4 flex-wrap">
            <input
              type="color"
              value={canvasBackground}
              onChange={(e) => handleBackgroundColorChange(e.target.value)}
              className="w-10 h-10 rounded border border-[var(--line)] cursor-pointer"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleBackgroundImageUpload}
              className="text-xs text-[var(--on-binder-muted)]"
            />
            {canvasBackgroundImage && (
              <button
                onClick={clearBackgroundImage}
                className="text-xs text-[var(--danger)] hover:text-[var(--danger)]/80"
              >
                Remove Image
              </button>
            )}
            <button
              onClick={() => setShowCanvasBackground(false)}
              className="ml-auto px-3 py-1 bg-[var(--binder)] text-[var(--on-binder)] rounded hover:bg-[var(--control-hover)] hover:text-[var(--ink-strong)] text-sm transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

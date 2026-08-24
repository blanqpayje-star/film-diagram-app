import React from 'react';
import { useDiagramStore } from '../store';
import type { ElementType } from '../types';
import {
  Camera,
  Lightbulb,
  User,
  Box,
  Square,
  DoorOpen,
  Maximize,
  Armchair,
  Ruler,
  MousePointer,
  RectangleHorizontal,
  Minus,
} from 'lucide-react';

const elementTypes: {
  type: ElementType;
  label: string;
  icon?: React.ReactNode;
  category: 'equipment' | 'set' | 'tools';
}[] = [
  { type: 'camera', label: 'Camera', icon: <Camera size={20} />, category: 'equipment' },
  { type: 'light-softbox', label: 'Softbox', icon: <Lightbulb size={20} />, category: 'equipment' },
  { type: 'light-umbrella', label: 'Umbrella', icon: <Lightbulb size={20} />, category: 'equipment' },
  { type: 'light-fresnel', label: 'Fresnel', icon: <Lightbulb size={20} />, category: 'equipment' },
  { type: 'light-led-panel', label: 'LED Panel', icon: <Lightbulb size={20} />, category: 'equipment' },
  { type: 'light-kino', label: 'Kino Flo', icon: <Lightbulb size={20} />, category: 'equipment' },
  { type: 'light-practical', label: 'Practical', icon: <Lightbulb size={20} />, category: 'equipment' },
  { type: 'actor', label: 'Actor', icon: <User size={20} />, category: 'equipment' },
  { type: 'prop', label: 'Prop', icon: <Box size={20} />, category: 'set' },
  { type: 'wall', label: 'Wall', icon: <Square size={20} />, category: 'set' },
  { type: 'door', label: 'Door', icon: <DoorOpen size={20} />, category: 'set' },
  { type: 'window', label: 'Window', icon: <Maximize size={20} />, category: 'set' },
  { type: 'furniture', label: 'Furniture', icon: <Armchair size={20} />, category: 'set' },
];

const drawingTools: {
  mode: 'select' | 'cad-rectangle' | 'cad-line' | 'measurement';
  label: string;
  icon: React.ReactNode;
}[] = [
  { mode: 'select', label: 'Select', icon: <MousePointer size={20} /> },
  { mode: 'cad-rectangle', label: 'Draw CAD Box', icon: <RectangleHorizontal size={20} /> },
  { mode: 'cad-line', label: 'Draw CAD Wall', icon: <Minus size={20} /> },
  { mode: 'measurement', label: 'Measure Line', icon: <Ruler size={20} /> },
];

export const Toolbar: React.FC = () => {
  const { addElement, canvasWidth, canvasHeight, drawingMode, setDrawingMode, darkMode } = useDiagramStore();

  const handleAddElement = (type: ElementType) => {
    setDrawingMode('select');
    addElement({
      type,
      x: canvasWidth / 2 - 30,
      y: canvasHeight / 2 - 30,
      rotation: 0,
      scale: 1,
      label: '',
      color: getDefaultColor(type),
      ...(type === 'camera' && {
        cameraSettings: {
          sensorSize: 'full-frame',
          focalLength: 50,
          showFOV: false,
          fovOpacity: 0.3,
        },
      }),
      ...(type.startsWith('light-') && {
        lightSettings: {
          showSpread: false,
          spreadAngle: 45,
          spreadDistance: 200,
          spreadOpacity: 0.3,
          colorMode: 'kelvin' as const,
          kelvin: 5600,
          rgbColor: '#FFFFFF',
        },
      }),
    });
  };

  const getDefaultColor = (type: ElementType): string => {
    switch (type) {
      case 'camera':
        return '#1E40AF';
      case 'light-softbox':
        return '#3B82F6';
      case 'light-umbrella':
        return '#3B82F6';
      case 'light-fresnel':
        return '#1E40AF';
      case 'light-led-panel':
        return '#3B82F6';
      case 'light-kino':
        return '#1E40AF';
      case 'light-practical':
        return '#60A5FA';
      case 'actor':
        return '#1E40AF';
      case 'prop':
        return '#3B82F6';
      case 'wall':
        return '#1E40AF';
      case 'door':
        return '#3B82F6';
      case 'window':
        return '#3B82F6';
      case 'furniture':
        return '#1E40AF';
      default:
        return '#3B82F6';
    }
  };

  return (
    <div className={`p-4 border-r overflow-y-auto h-full ${
      darkMode ? 'bg-gray-900 border-gray-800 text-gray-100' : 'bg-blue-50 border-blue-100 text-gray-900'
    }`}>
      {/* Drawing Tools */}
      <div className="mb-6">
        <h3 className={`text-xs font-bold mb-3 uppercase tracking-wider ${darkMode ? 'text-blue-300' : 'text-blue-900'}`}>
          Interactive Tools
        </h3>
        <div className="space-y-2">
          {drawingTools.map(({ mode, label, icon }) => (
            <button
              key={mode}
              onClick={() => setDrawingMode(mode)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-lg transition-colors border shadow-sm ${
                drawingMode === mode
                  ? 'bg-blue-900 text-white border-blue-900'
                  : darkMode
                  ? 'bg-gray-800 text-gray-200 border-gray-700 hover:bg-gray-700'
                  : 'bg-white text-blue-900 border-blue-200 hover:bg-blue-50'
              }`}
            >
              <div className="flex-shrink-0 text-blue-600 dark:text-blue-400">{icon}</div>
              <span className="flex-1 text-left">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Equipment */}
      <div className="mb-6">
        <h3 className={`text-xs font-bold mb-3 uppercase tracking-wider ${darkMode ? 'text-blue-300' : 'text-blue-900'}`}>
          Equipment
        </h3>
        <div className="space-y-2">
          {elementTypes
            .filter((el) => el.category === 'equipment')
            .map(({ type, label, icon }) => (
              <button
                key={type}
                onClick={() => handleAddElement(type)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors border shadow-sm ${
                  darkMode
                    ? 'bg-gray-800 text-gray-200 border-gray-700 hover:bg-gray-700 hover:text-white'
                    : 'bg-white text-gray-800 border-blue-200 hover:bg-blue-50'
                }`}
              >
                <div className="flex-shrink-0 text-blue-600 dark:text-blue-400">{icon}</div>
                <span className="flex-1 text-left">{label}</span>
              </button>
            ))}
        </div>
      </div>

      {/* Set Elements */}
      <div className="mb-6">
        <h3 className={`text-xs font-bold mb-3 uppercase tracking-wider ${darkMode ? 'text-blue-300' : 'text-blue-900'}`}>
          Set & Props
        </h3>
        <div className="space-y-2">
          {elementTypes
            .filter((el) => el.category === 'set')
            .map(({ type, label, icon }) => (
              <button
                key={type}
                onClick={() => handleAddElement(type)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors border shadow-sm ${
                  darkMode
                    ? 'bg-gray-800 text-gray-200 border-gray-700 hover:bg-gray-700 hover:text-white'
                    : 'bg-white text-gray-800 border-blue-200 hover:bg-blue-50'
                }`}
              >
                <div className="flex-shrink-0 text-blue-600 dark:text-blue-400">{icon}</div>
                <span className="flex-1 text-left">{label}</span>
              </button>
            ))}
        </div>
      </div>
    </div>
  );
};

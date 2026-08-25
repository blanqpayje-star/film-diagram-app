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
  Ruler,
  MousePointer,
  RectangleHorizontal,
  Minus,
  Type,
  Columns,
  LayoutDashboard,
  ChevronLeft,
  Armchair,
  Circle,
  Sun,
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
  { type: 'stairs', label: 'Stairs', icon: <LayoutDashboard size={20} />, category: 'set' },
  { type: 'column', label: 'Column', icon: <Columns size={20} />, category: 'set' },
  { type: 'table-dining', label: 'Dining Table', icon: <Box size={20} />, category: 'set' },
  { type: 'table-coffee', label: 'Coffee Table', icon: <Box size={20} />, category: 'set' },
  { type: 'table-side', label: 'Side Table', icon: <Circle size={20} />, category: 'set' },
  { type: 'chair-armchair', label: 'Armchair', icon: <Armchair size={20} />, category: 'set' },
  { type: 'chair-dining', label: 'Dining Chair', icon: <User size={20} />, category: 'set' },
  { type: 'chair-office', label: 'Office Chair', icon: <MousePointer size={20} />, category: 'set' },
  { type: 'sofa', label: 'Sofa', icon: <Sun size={20} />, category: 'set' },
  { type: 'bed', label: 'Bed', icon: <Maximize size={20} />, category: 'set' },
  { type: 'nightstand', label: 'Nightstand', icon: <Square size={20} />, category: 'set' },
  { type: 'desk', label: 'Desk', icon: <LayoutDashboard size={20} />, category: 'set' },
  { type: 'text', label: 'Text', icon: <Type size={20} />, category: 'tools' },
];

const drawingTools: {
  mode: 'select' | 'cad-rectangle' | 'cad-line' | 'measurement' | 'text';
  label: string;
  icon: React.ReactNode;
}[] = [
  { mode: 'select', label: 'Select', icon: <MousePointer size={20} /> },
  { mode: 'cad-rectangle', label: 'Draw CAD Box', icon: <RectangleHorizontal size={20} /> },
  { mode: 'cad-line', label: 'Draw CAD Wall', icon: <Minus size={20} /> },
  { mode: 'measurement', label: 'Measure Line', icon: <Ruler size={20} /> },
  { mode: 'text', label: 'Add Text', icon: <Type size={20} /> },
];

const ToggleButton = ({ onClick, icon, title }: { onClick: () => void; icon: React.ReactNode; title: string }) => (
  <div className="relative group mb-4">
    <button
      onClick={onClick}
      className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium rounded-lg transition-colors border shadow-sm bg-[var(--control)] text-[var(--ink-strong)] border-[var(--line)] hover:bg-[var(--control-hover)]"
    >
      <div className="text-[var(--accent)]">{icon}</div>
    </button>
    <div className="absolute left-full top-0 ml-2 px-2 py-1 text-xs font-medium bg-[var(--binder)] text-[var(--ink-strong)] rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-10">
      {title}
    </div>
  </div>
);

interface ToolbarProps {
  collapsed?: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({ collapsed = false }) => {
  const { addElement, canvasWidth, canvasHeight, drawingMode, setDrawingMode, darkMode, toggleLeftPanel, leftPanelCollapsed } = useDiagramStore();

  const handleAddElement = (type: ElementType) => {
    setDrawingMode('select');
    addElement({
      type,
      x: canvasWidth / 2 - 30,
      y: canvasHeight / 2 - 30,
      rotation: 0,
      scale: 1,
      label: type === 'text' ? 'Double-click to edit' : '',
      color: getDefaultColor(type),
      width: type === 'text' ? 200 : undefined,
      fontFamily: type === 'text' ? 'Inter' : undefined,
      fontSize: type === 'text' ? 16 : undefined,
      fontWeight: type === 'text' ? '400' : undefined,
      fontStyle: type === 'text' ? 'normal' : undefined,
      textAlign: type === 'text' ? 'left' : undefined,
      lineHeight: type === 'text' ? 1.5 : undefined,
      letterSpacing: type === 'text' ? 0 : undefined,
      linkedScale: true,
      ...(type === 'camera' && {
        cameraSettings: {
          sensorSize: 'full-frame',
          focalLength: 50,
          showFOV: true,
          fovOpacity: 0.4,
          fovDistance: 300,
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
          modifier: 'none' as const,
          modifierIntensity: 0,
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
      case 'stairs':
        return '#1E40AF';
      case 'column':
        return '#1E40AF';
      case 'table-dining':
        return '#8B5CF6';
      case 'table-coffee':
        return '#8B5CF6';
      case 'table-side':
        return '#8B5CF6';
      case 'chair-armchair':
        return '#8B5CF6';
      case 'chair-dining':
        return '#8B5CF6';
      case 'chair-office':
        return '#8B5CF6';
      case 'sofa':
        return '#8B5CF6';
      case 'bed':
        return '#8B5CF6';
      case 'nightstand':
        return '#8B5CF6';
      case 'desk':
        return '#8B5CF6';
      case 'text':
        return '#1E40AF';
      default:
        return '#3B82F6';
    }
  };

  const renderButton = ({ label, icon, isActive, onClick }: { label: string; icon: React.ReactNode; isActive: boolean; onClick: () => void }) => {
    if (collapsed) {
      return (
        <div className="relative group">
          <button
            onClick={onClick}
            className={`w-full flex items-center justify-center px-3 py-2.5 text-sm font-semibold rounded-lg transition-colors border shadow-sm ${
              isActive
                ? 'bg-[var(--binder)] text-[var(--ink-strong)] border-[var(--line)]'
                : darkMode
                ? 'bg-[var(--control)] text-[var(--ink-strong)] border-[var(--line)] hover:bg-[var(--control-hover)]'
                : 'bg-[var(--control)] text-[var(--ink-strong)] border-[var(--line)] hover:bg-[var(--control-hover)]'
            }`}
          >
            <div className="text-[var(--accent)]">{icon}</div>
          </button>
          <div className="absolute left-full top-0 ml-2 px-2 py-1 text-xs font-medium bg-[var(--binder)] text-[var(--ink-strong)] rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-10">
            {label}
          </div>
        </div>
      );
    }
    return (
      <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-lg transition-colors border shadow-sm ${
          isActive
            ? 'bg-[var(--binder)] text-[var(--ink-strong)] border-[var(--line)]'
            : darkMode
            ? 'bg-[var(--control)] text-[var(--ink-strong)] border-[var(--line)] hover:bg-[var(--control-hover)]'
            : 'bg-[var(--control)] text-[var(--ink-strong)] border-[var(--line)] hover:bg-[var(--control-hover)]'
        }`}
      >
        <div className="flex-shrink-0 text-[var(--accent)]">{icon}</div>
        <span className="flex-1 text-left">{label}</span>
      </button>
    );
  };

  const renderElementButton = ({ type, label, icon }: { type: string; label: string; icon: React.ReactNode }) => {
    if (collapsed) {
      return (
        <div className="relative group">
          <button
            onClick={() => handleAddElement(type as ElementType)}
            className={`w-full flex items-center justify-center px-3 py-2 text-sm font-medium rounded-lg transition-colors border shadow-sm ${
              darkMode
                ? 'bg-[var(--control)] text-[var(--ink-strong)] border-[var(--line)] hover:bg-[var(--control-hover)] hover:text-[var(--ink-strong)]'
                : 'bg-[var(--control)] text-[var(--ink-strong)] border-[var(--line)] hover:bg-[var(--control-hover)]'
            }`}
          >
            <div className="flex-shrink-0 text-[var(--accent)]">{icon}</div>
          </button>
          <div className="absolute left-full top-0 ml-2 px-2 py-1 text-xs font-medium bg-[var(--binder)] text-[var(--ink-strong)] rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-10">
            {label}
          </div>
        </div>
      );
    }
    return (
      <button
        onClick={() => handleAddElement(type as ElementType)}
        className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors border shadow-sm ${
          darkMode
                ? 'bg-[var(--control)] text-[var(--ink-strong)] border-[var(--line)] hover:bg-[var(--control-hover)] hover:text-[var(--ink-strong)]'
                : 'bg-[var(--control)] text-[var(--ink-strong)] border-[var(--line)] hover:bg-[var(--control-hover)]'
        }`}
      >
        <div className="flex-shrink-0 text-[var(--accent)]">{icon}</div>
        <span className="flex-1 text-left">{label}</span>
      </button>
    );
  };

  return (
    <div className={`tool-panel p-4 overflow-y-auto h-full transition-all duration-300 ${
      darkMode ? 'bg-[var(--binder)] border-[var(--line)] text-[var(--ink-strong)]' : 'bg-[var(--binder)] border-[var(--line)] text-[var(--ink-strong)]'
    }`}>
      <ToggleButton onClick={toggleLeftPanel} icon={<ChevronLeft size={20} />} title={leftPanelCollapsed ? 'Expand Toolbar' : 'Collapse Toolbar'} />

      {/* Drawing Tools */}
      {!collapsed && <h3 className={`text-xs font-bold mb-3 uppercase tracking-wider ${darkMode ? 'text-[var(--ink-muted)]' : 'text-[var(--ink-muted)]'}`}>Interactive Tools</h3>}
      <div className="space-y-2">
        {drawingTools.map(({ mode, label, icon }) => (
          <div key={mode}>
            {renderButton({ label, icon, isActive: drawingMode === mode, onClick: () => setDrawingMode(mode) })}
          </div>
        ))}
      </div>

      {/* Equipment */}
      {!collapsed && <h3 className={`text-xs font-bold mb-3 uppercase tracking-wider ${darkMode ? 'text-[var(--ink-muted)]' : 'text-[var(--ink-muted)]'}`} style={{marginTop: '1.5rem'}}>Equipment</h3>}
      <div className="space-y-2">
        {elementTypes
          .filter((el) => el.category === 'equipment')
          .map(({ type, label, icon }) => (
            <div key={type}>
              {renderElementButton({ type, label, icon })}
            </div>
          ))}
      </div>

      {/* Set Elements */}
      {!collapsed && <h3 className={`text-xs font-bold mb-3 uppercase tracking-wider ${darkMode ? 'text-[var(--ink-muted)]' : 'text-[var(--ink-muted)]'}`} style={{marginTop: '1.5rem'}}>Set & Props</h3>}
      <div className="space-y-2">
        {elementTypes
          .filter((el) => el.category === 'set')
          .map(({ type, label, icon }) => (
            <div key={type}>
              {renderElementButton({ type, label, icon })}
            </div>
          ))}
      </div>
    </div>
  );
};

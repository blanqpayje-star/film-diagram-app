import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useDiagramStore } from '../store';
import type { DiagramElement } from '../types';
import { ElementIcon } from './ElementIcon';
import { calculateHorizontalFOV } from '../utils/camera';
import { kelvinToRGB } from '../utils/color';
import {
  RotateCcw,
} from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

interface HandlePosition {
  x: number;
  y: number;
  cursor: string;
  type: 'resize' | 'rotate';
  position: 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w' | 'rotate';
  handleType?: 'resize' | 'rotate';
}

export const Canvas: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDrawingCAD, setIsDrawingCAD] = useState(false);
  const [cadStart, setCadStart] = useState<Point | null>(null);
  const [cadPreview, setCadPreview] = useState<Point | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<HandlePosition | null>(null);
  const [resizeStart, setResizeStart] = useState<Point | null>(null);
  const [elementStart, setElementStart] = useState<DiagramElement | null>(null);
  const [rotateStartAngle, setRotateStartAngle] = useState(0);
  const [elementCenter, setElementCenter] = useState<Point | null>(null);
  const [showTextInput, setShowTextInput] = useState<string | null>(null);
  const [textInputValue, setTextInputValue] = useState('');
  const textInputRef = useRef<HTMLInputElement>(null);

  const {
    getCurrentScene,
    updateElement,
    selectElement,
    selectedElementId,
    gridEnabled,
    snapToGrid,
    gridSize,
    canvasWidth,
    canvasHeight,
    drawingMode,
    measurementUnit,
    darkMode,
    canvasBackground,
    canvasBackgroundImage,
    copyElement,
    pasteElement,
    undo,
    redo,
    canUndo,
    canRedo,
    setDrawingMode,
    deleteElement,
  } = useDiagramStore();

  const scene = getCurrentScene();

  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modifierKey = isMac ? 'metaKey' : 'ctrlKey';

  const snapToGridFn = (value: number) => {
    if (!snapToGrid) return value;
    return Math.round(value / gridSize) * gridSize;
  };

  // Constrain position within canvas boundaries
  const constrainPosition = useCallback(
    (x: number, y: number, elementWidth = 60, elementHeight = 60) => {
      const minX = 0;
      const minY = 0;
      const maxX = Math.max(0, canvasWidth - elementWidth);
      const maxY = Math.max(0, canvasHeight - elementHeight);

      return {
        x: Math.min(Math.max(x, minX), maxX),
        y: Math.min(Math.max(y, minY), maxY),
      };
    },
    [canvasWidth, canvasHeight]
  );

  const getCanvasCoords = (e: React.MouseEvent): Point => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleElementMouseDown = (
    e: React.MouseEvent,
    element: DiagramElement
  ) => {
    e.stopPropagation();

    if (drawingMode !== 'select') return;

    selectElement(element.id);

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    setIsDragging(true);
    setDragOffset({
      x: e.clientX - rect.left - element.x,
      y: e.clientY - rect.top - element.y,
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target !== canvasRef.current) return;

    const coords = getCanvasCoords(e);

    if (drawingMode === 'text') {
      // Create new text element
      const store = useDiagramStore.getState();
      store.addElement({
        type: 'text',
        x: snapToGridFn(coords.x),
        y: snapToGridFn(coords.y),
        rotation: 0,
        scale: 1,
        label: 'Double-click to edit',
        color: '#1E40AF',
        fontFamily: 'Inter',
        fontSize: 16,
        fontWeight: 'normal',
        fontStyle: 'normal',
        textAlign: 'left',
      });
      setDrawingMode('select');
      return;
    }

    if (drawingMode === 'cad-rectangle' || drawingMode === 'cad-line' || drawingMode === 'measurement') {
      setIsDrawingCAD(true);
      const clampedX = Math.min(Math.max(coords.x, 0), canvasWidth);
      const clampedY = Math.min(Math.max(coords.y, 0), canvasHeight);
      setCadStart({ x: snapToGridFn(clampedX), y: snapToGridFn(clampedY) });
      setCadPreview({ x: snapToGridFn(clampedX), y: snapToGridFn(clampedY) });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && selectedElementId && drawingMode === 'select') {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const rawX = snapToGridFn(e.clientX - rect.left - dragOffset.x);
      const rawY = snapToGridFn(e.clientY - rect.top - dragOffset.y);

      const element = scene?.elements.find((el) => el.id === selectedElementId);
      const scaleX = element?.linkedScale !== false ? element?.scale || 1 : element?.scaleX || element?.scale || 1;
      const scaleY = element?.linkedScale !== false ? element?.scale || 1 : element?.scaleY || element?.scale || 1;
      const elWidth = (element?.width || 60) * scaleX;
      const elHeight = (element?.height || 60) * scaleY;

      const constrained = constrainPosition(rawX, rawY, elWidth, elHeight);

      updateElement(selectedElementId, { x: constrained.x, y: constrained.y });
    } else if (isResizing && resizeHandle && elementStart && resizeStart) {
      const coords = getCanvasCoords(e);
      const dx = coords.x - resizeStart.x;
      const dy = coords.y - resizeStart.y;

      const angleRad = (elementStart.rotation * Math.PI) / 180;
      const cos = Math.cos(angleRad);
      const sin = Math.sin(angleRad);
      const localDx = dx * cos + dy * sin;
      const localDy = -dx * sin + dy * cos;

      if (resizeHandle.type === 'resize') {
        const baseWidth = elementStart.width || 60;
        const baseHeight = elementStart.height || 60;
        const startScaleX = elementStart.linkedScale !== false
          ? elementStart.scale
          : elementStart.scaleX || elementStart.scale;
        const startScaleY = elementStart.linkedScale !== false
          ? elementStart.scale
          : elementStart.scaleY || elementStart.scale;
        const affectsX = ['nw', 'ne', 'sw', 'se', 'e', 'w'].includes(resizeHandle.position);
        const affectsY = ['nw', 'ne', 'sw', 'se', 'n', 's'].includes(resizeHandle.position);
        const xDirection = ['nw', 'sw', 'w'].includes(resizeHandle.position) ? -1 : 1;
        const yDirection = ['nw', 'ne', 'n'].includes(resizeHandle.position) ? -1 : 1;
        const xDelta = affectsX ? (xDirection * localDx) / baseWidth : 0;
        const yDelta = affectsY ? (yDirection * localDy) / baseHeight : 0;

        if (elementStart.linkedScale !== false) {
          const delta = Math.abs(xDelta) >= Math.abs(yDelta) ? xDelta : yDelta;
          updateElement(elementStart.id, { scale: Math.max(0.25, startScaleX + delta), scaleX: undefined, scaleY: undefined });
        } else {
          updateElement(elementStart.id, {
            scaleX: Math.max(0.25, startScaleX + xDelta),
            scaleY: Math.max(0.25, startScaleY + yDelta),
          });
        }
      } else if (resizeHandle.type === 'rotate') {
        const centerX = elementCenter?.x || elementStart.x + (elementStart.width || 60) / 2;
        const centerY = elementCenter?.y || elementStart.y + (elementStart.height || 60) / 2;
        const angle = Math.atan2(coords.y - centerY, coords.x - centerX) * (180 / Math.PI);
        const newRotation = Math.round((angle - rotateStartAngle) / 15) * 15;
        updateElement(elementStart.id, { rotation: newRotation });
      }
    } else if (isDrawingCAD && cadStart) {
      const coords = getCanvasCoords(e);
      const clampedX = Math.min(Math.max(coords.x, 0), canvasWidth);
      const clampedY = Math.min(Math.max(coords.y, 0), canvasHeight);
      // Check if Shift is held for grid snapping
      const shiftHeld = e.shiftKey;
      setCadPreview({
        x: shiftHeld ? snapToGridFn(clampedX) : clampedX,
        y: shiftHeld ? snapToGridFn(clampedY) : clampedY
      });
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (isDrawingCAD && cadStart && cadPreview) {
      const coords = getCanvasCoords(e);
      const clampedX = Math.min(Math.max(coords.x, 0), canvasWidth);
      const clampedY = Math.min(Math.max(coords.y, 0), canvasHeight);
      const endX = snapToGridFn(clampedX);
      const endY = snapToGridFn(clampedY);

      // Don't create if too small
      if (Math.abs(endX - cadStart.x) > 5 || Math.abs(endY - cadStart.y) > 5) {
        const store = useDiagramStore.getState();

        if (drawingMode === 'cad-rectangle') {
          store.addElement({
            type: 'cad-rectangle',
            x: Math.min(cadStart.x, endX),
            y: Math.min(cadStart.y, endY),
            width: Math.abs(endX - cadStart.x),
            height: Math.abs(endY - cadStart.y),
            rotation: 0,
            scale: 1,
            label: '',
            color: '#2563EB',
          });
        } else if (drawingMode === 'cad-line') {
          store.addElement({
            type: 'cad-line',
            x: cadStart.x,
            y: cadStart.y,
            endX: endX,
            endY: endY,
            rotation: 0,
            scale: 1,
            label: '',
            color: '#1E40AF',
          });
        } else if (drawingMode === 'measurement') {
          const distance = Math.sqrt(
            Math.pow(endX - cadStart.x, 2) + Math.pow(endY - cadStart.y, 2)
          );
          store.addElement({
            type: 'measurement',
            x: cadStart.x,
            y: cadStart.y,
            endX: endX,
            endY: endY,
            rotation: 0,
            scale: 1,
            label: `${(distance / 20).toFixed(1)}${measurementUnit}`,
            color: '#3B82F6',
            measurementUnit: measurementUnit,
          });
        }
      }

      setIsDrawingCAD(false);
      setCadStart(null);
      setCadPreview(null);
    }

    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
    setResizeStart(null);
    setElementStart(null);
    setRotateStartAngle(0);
    setElementCenter(null);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current && drawingMode === 'select') {
      selectElement(null);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (selectedElementId && e.target !== canvasRef.current) {
      const element = scene?.elements.find((el) => el.id === selectedElementId);
      if (element?.type === 'text') {
        setShowTextInput(selectedElementId);
        setTextInputValue(element.label);
        setTimeout(() => textInputRef.current?.focus(), 0);
      }
    }
  };

  const handleTextInputBlur = () => {
    if (showTextInput) {
      updateElement(showTextInput, { label: textInputValue });
      setShowTextInput(null);
    }
  };

  const handleTextInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTextInputBlur();
    } else if (e.key === 'Escape') {
      setShowTextInput(null);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle shortcuts if typing in an input
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        showTextInput
      ) {
        return;
      }

      const isModifierPressed = e[modifierKey as keyof KeyboardEvent];
      const isShiftPressed = e.shiftKey;

      // Copy: Ctrl/Cmd + C
      if (isModifierPressed && e.key.toLowerCase() === 'c' && selectedElementId) {
        e.preventDefault();
        copyElement(selectedElementId);
        return;
      }

      // Paste: Ctrl/Cmd + V
      if (isModifierPressed && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        pasteElement();
        return;
      }

      // Undo: Ctrl/Cmd + Z
      if (isModifierPressed && e.key.toLowerCase() === 'z' && !isShiftPressed) {
        e.preventDefault();
        if (canUndo) undo();
        return;
      }

      // Redo: Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y
      if ((isModifierPressed && isShiftPressed && e.key.toLowerCase() === 'z') ||
          (isModifierPressed && e.key.toLowerCase() === 'y')) {
        e.preventDefault();
        if (canRedo) redo();
        return;
      }

      // Element-specific shortcuts
      if (selectedElementId) {
        const element = scene?.elements.find((el) => el.id === selectedElementId);
        if (!element) return;

        const step = isShiftPressed ? gridSize : 1;
        let newX = element.x;
        let newY = element.y;

        switch (e.key) {
          case 'ArrowLeft':
            e.preventDefault();
            newX = element.x - step;
            break;
          case 'ArrowRight':
            e.preventDefault();
            newX = element.x + step;
            break;
          case 'ArrowUp':
            e.preventDefault();
            newY = element.y - step;
            break;
          case 'ArrowDown':
            e.preventDefault();
            newY = element.y + step;
            break;
          case 'Delete':
            // Only delete on Delete key (not Backspace) to avoid text input issues
            if (!isModifierPressed) {
              e.preventDefault();
              deleteElement(selectedElementId);
              return;
            }
            break;
          case 'Backspace':
            // Only delete with modifier on Mac (Cmd+Backspace) or with Ctrl on Windows
            if (isModifierPressed) {
              e.preventDefault();
              deleteElement(selectedElementId);
              return;
            }
            break;
          case 'Escape':
            e.preventDefault();
            selectElement(null);
            useDiagramStore.getState().setDrawingMode('select');
            return;
          case 'd':
            // Duplicate: Ctrl/Cmd + D
            if (isModifierPressed) {
              e.preventDefault();
              useDiagramStore.getState().duplicateElement(selectedElementId);
              return;
            }
            break;
        }

        const elWidth = element.width || 60;
        const elHeight = element.height || 60;
        const constrained = constrainPosition(newX, newY, elWidth, elHeight);

        updateElement(selectedElementId, { x: constrained.x, y: constrained.y });
      } else if (e.key === 'Escape') {
        useDiagramStore.getState().setDrawingMode('select');
        setIsDrawingCAD(false);
        setCadStart(null);
        setCadPreview(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedElementId,
    scene,
    gridSize,
    canvasWidth,
    canvasHeight,
    modifierKey,
    updateElement,
    selectElement,
    constrainPosition,
    copyElement,
    pasteElement,
    undo,
    redo,
    canUndo,
    canRedo,
    setDrawingMode,
    deleteElement,
    showTextInput,
  ]);

  if (!scene) {
    return (
      <div className="flex items-center justify-center h-full text-neutral-500">
        No scene selected
      </div>
    );
  }

  const getLightColor = (element: DiagramElement): string => {
    if (!element.lightSettings) return element.color;
    if (element.lightSettings.colorMode === 'kelvin') {
      return kelvinToRGB(element.lightSettings.kelvin);
    }
    return element.lightSettings.rgbColor || element.color;
  };

  const getElementCenter = (element: DiagramElement): Point => {
    const scaleX = element.linkedScale !== false ? element.scale : element.scaleX || element.scale;
    const scaleY = element.linkedScale !== false ? element.scale : element.scaleY || element.scale;
    return {
      x: element.x + ((element.width || 60) * scaleX) / 2,
      y: element.y + ((element.height || 60) * scaleY) / 2,
    };
  };

  const renderFOVCone = (element: DiagramElement) => {
    if (element.type !== 'camera' || !element.cameraSettings?.showFOV) return null;

    const { sensorSize, focalLength, fovOpacity = 0.4 } = element.cameraSettings;
    const fovAngle = calculateHorizontalFOV(sensorSize, focalLength);
    const coneLength = element.cameraSettings.fovDistance ?? 300;

    const angleRad = (element.rotation * Math.PI) / 180;
    const halfFOV = (fovAngle / 2) * (Math.PI / 180);

    const { x: centerX, y: centerY } = getElementCenter(element);

    const leftX = centerX + coneLength * Math.cos(angleRad - halfFOV);
    const leftY = centerY + coneLength * Math.sin(angleRad - halfFOV);

    const rightX = centerX + coneLength * Math.cos(angleRad + halfFOV);
    const rightY = centerY + coneLength * Math.sin(angleRad + halfFOV);

    return (
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        <defs>
          <linearGradient id={`fov-gradient-${element.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: element.color, stopOpacity: fovOpacity }} />
            <stop offset="100%" style={{ stopColor: element.color, stopOpacity: 0 }} />
          </linearGradient>
        </defs>
        <polygon
          points={`${centerX},${centerY} ${leftX},${leftY} ${rightX},${rightY}`}
          fill={`url(#fov-gradient-${element.id})`}
          stroke={element.color}
          strokeWidth="2"
          strokeOpacity={fovOpacity}
          strokeDasharray="5,5"
        />
      </svg>
    );
  };

  const renderLightSpread = (element: DiagramElement) => {
    if (!element.lightSettings?.showSpread) return null;

    const { spreadAngle, spreadDistance, spreadOpacity } = element.lightSettings;
    const lightColor = getLightColor(element);

    const angleRad = (element.rotation * Math.PI) / 180;
    const halfSpread = (spreadAngle / 2) * (Math.PI / 180);

    const { x: centerX, y: centerY } = getElementCenter(element);

    const leftX = centerX + spreadDistance * Math.cos(angleRad - halfSpread);
    const leftY = centerY + spreadDistance * Math.sin(angleRad - halfSpread);

    const rightX = centerX + spreadDistance * Math.cos(angleRad + halfSpread);
    const rightY = centerY + spreadDistance * Math.sin(angleRad + halfSpread);

    return (
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        <defs>
          <radialGradient id={`light-spread-${element.id}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" style={{ stopColor: lightColor, stopOpacity: spreadOpacity }} />
            <stop offset="70%" style={{ stopColor: lightColor, stopOpacity: spreadOpacity * 0.3 }} />
            <stop offset="100%" style={{ stopColor: lightColor, stopOpacity: 0 }} />
          </radialGradient>
        </defs>
        <polygon
          points={`${centerX},${centerY} ${leftX},${leftY} ${rightX},${rightY}`}
          fill={`url(#light-spread-${element.id})`}
          stroke={lightColor}
          strokeWidth="2"
          strokeOpacity={spreadOpacity}
          strokeDasharray="8,4"
        />
        {/* Center hotspot */}
        <circle
          cx={centerX}
          cy={centerY}
          r="15"
          fill={lightColor}
          fillOpacity={spreadOpacity * 0.5}
        />
      </svg>
    );
  };

  const renderCADElement = (element: DiagramElement) => {
    if (element.type === 'cad-rectangle' && element.width && element.height) {
      return (
        <div
          key={element.id}
          className={`absolute border-2 border-dashed ${
            selectedElementId === element.id ? 'ring-2 ring-blue-600 dark:ring-blue-400' : ''
          }`}
          style={{
            left: element.x,
            top: element.y,
            width: element.width,
            height: element.height,
            backgroundColor: element.color,
            opacity: 0.4,
            borderColor: element.color,
            pointerEvents: 'auto',
            cursor: 'move',
          }}
          onMouseDown={(e) => handleElementMouseDown(e, element)}
        >
          {element.cadIcon && (
            <div className="absolute inset-0 flex items-center justify-center p-2 opacity-80">
              <img src={element.cadIcon} alt="CAD Icon" className="max-w-full max-h-full object-contain" />
            </div>
          )}
          {element.label && (
            <div className="absolute top-1 left-1 text-xs font-semibold text-white dark:text-gray-900 bg-blue-900 dark:bg-blue-200 px-2 py-0.5 rounded shadow-sm border border-blue-700 dark:border-blue-400">
              {element.label}
            </div>
          )}
        </div>
      );
    } else if ((element.type === 'cad-line' || element.type === 'measurement') && element.endX !== undefined && element.endY !== undefined) {
      return (
        <svg
          key={element.id}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        >
          <line
            x1={element.x}
            y1={element.y}
            x2={element.endX}
            y2={element.endY}
            stroke={element.color}
            strokeWidth={element.type === 'measurement' ? 2 : 3}
            strokeDasharray={element.type === 'measurement' ? '0' : '5,5'}
          />
          {element.type === 'measurement' && (
            <>
              <line x1={element.x} y1={element.y - 5} x2={element.x} y2={element.y + 5} stroke={element.color} strokeWidth="2" />
              <line x1={element.endX} y1={element.endY - 5} x2={element.endX} y2={element.endY + 5} stroke={element.color} strokeWidth="2" />
              <text
                x={(element.x + element.endX) / 2}
                y={(element.y + element.endY) / 2 - 5}
                fill={darkMode ? '#93C5FD' : '#1E40AF'}
                fontSize="12"
                fontWeight="bold"
                textAnchor="middle"
                style={{ pointerEvents: 'none' }}
              >
                {element.label}
              </text>
            </>
          )}
        </svg>
      );
    }
    return null;
  };

  const renderTextElement = (element: DiagramElement) => {
    const isSelected = selectedElementId === element.id;
    const fontFamily = element.fontFamily || 'Inter';
    const fontSize = element.fontSize || 16;
    const fontWeight = element.fontWeight || 'normal';
    const fontStyle = element.fontStyle || 'normal';
    const textAlign = element.textAlign || 'left';
    const lineHeight = element.lineHeight || 1.5;
    const letterSpacing = element.letterSpacing || 0;

    const textStyle: React.CSSProperties = {
      position: 'absolute',
      left: element.x,
      top: element.y,
      transform: `rotate(${element.rotation}deg)`,
      transformOrigin: 'left top',
      fontFamily,
      fontSize: `${fontSize}px`,
      fontWeight,
      fontStyle,
      textAlign,
      lineHeight,
      letterSpacing: `${letterSpacing}px`,
      color: element.color,
      whiteSpace: 'pre-wrap',
      width: element.width || 'auto',
      maxWidth: element.width || 'none',
      cursor: isSelected ? 'text' : 'default',
      pointerEvents: 'auto',
      userSelect: isSelected ? 'text' : 'none',
      zIndex: 2,
      outline: isSelected ? '2px solid #3B82F6' : 'none',
      outlineOffset: '4px',
      padding: isSelected ? '4px' : '0',
      backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
      borderRadius: '2px',
    };

    if (showTextInput === element.id) {
      return (
        <div
          key={element.id}
          style={{
            position: 'absolute',
            left: element.x,
            top: element.y,
            transform: `rotate(${element.rotation}deg)`,
            transformOrigin: 'left top',
            zIndex: 10,
          }}
        >
          <input
            ref={textInputRef}
            type="text"
            value={textInputValue}
            onChange={(e) => setTextInputValue(e.target.value)}
            onBlur={handleTextInputBlur}
            onKeyDown={handleTextInputKeyDown}
            style={{
              fontFamily,
              fontSize: `${fontSize}px`,
              fontWeight,
              fontStyle,
              textAlign,
              lineHeight,
              letterSpacing: `${letterSpacing}px`,
              color: element.color,
              backgroundColor: darkMode ? '#1f2937' : 'white',
              border: '2px solid #3B82F6',
              borderRadius: '4px',
              padding: '4px 8px',
              outline: 'none',
              minWidth: '100px',
              width: element.width || 'auto',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
            autoFocus
          />
        </div>
      );
    }

    return (
      <div
        key={element.id}
        style={textStyle}
        onMouseDown={(e) => handleElementMouseDown(e, element)}
        onDoubleClick={handleDoubleClick}
      >
        {element.label}
      </div>
    );
  };

  const getResizeHandles = (element: DiagramElement): HandlePosition[] => {
    const scaleX = element.linkedScale !== false ? element.scale : element.scaleX || element.scale;
    const scaleY = element.linkedScale !== false ? element.scale : element.scaleY || element.scale;
    const w = (element.width || 60) * scaleX;
    const h = (element.height || 60) * scaleY;

    const corners = [
      { x: -8, y: -8, pos: 'nw' as const, cursor: 'nwse-resize' },
      { x: w + 8, y: -8, pos: 'ne' as const, cursor: 'nesw-resize' },
      { x: -8, y: h + 8, pos: 'sw' as const, cursor: 'nesw-resize' },
      { x: w + 8, y: h + 8, pos: 'se' as const, cursor: 'nwse-resize' },
      { x: w / 2, y: -8, pos: 'n' as const, cursor: 'ns-resize' },
      { x: w / 2, y: h + 8, pos: 's' as const, cursor: 'ns-resize' },
      { x: -8, y: h / 2, pos: 'w' as const, cursor: 'ew-resize' },
      { x: w + 8, y: h / 2, pos: 'e' as const, cursor: 'ew-resize' },
    ];

    const handles: HandlePosition[] = corners.map(c => {
      return {
        x: c.x,
        y: c.y,
        cursor: c.cursor,
        type: 'resize' as const,
        position: c.pos,
      };
    });

    // Rotation handle - above the element
    handles.push({
      x: w / 2,
      y: -35,
      cursor: 'crosshair',
      type: 'rotate',
      position: 'rotate',
      handleType: 'rotate',
    });

    return handles;
  };

  const handleHandleMouseDown = (e: React.MouseEvent, handle: HandlePosition, element: DiagramElement) => {
    e.stopPropagation();
    e.preventDefault();

    const coords = getCanvasCoords(e);

    if (handle.type === 'resize') {
      setIsResizing(true);
      setResizeHandle(handle);
      setResizeStart(coords);
      setElementStart(element);
    } else if (handle.type === 'rotate') {
      const scaleX = element.linkedScale !== false ? element.scale : element.scaleX || element.scale;
      const scaleY = element.linkedScale !== false ? element.scale : element.scaleY || element.scale;
      const centerX = element.x + ((element.width || 60) * scaleX) / 2;
      const centerY = element.y + ((element.height || 60) * scaleY) / 2;
      const angle = Math.atan2(coords.y - centerY, coords.x - centerX) * (180 / Math.PI);

      setResizeHandle(handle);
      setResizeStart(coords);
      setElementStart(element);
      setElementCenter({ x: centerX, y: centerY });
      setRotateStartAngle(angle - element.rotation);
    }
  };

  const gridLineColor = darkMode ? '#374151' : '#BFDBFE';

  // Canvas background style
  const canvasBackgroundStyle = {
    backgroundColor: canvasBackgroundImage ? 'transparent' : canvasBackground,
    backgroundImage: canvasBackgroundImage ? `url(${canvasBackgroundImage})` : 'none',
    backgroundSize: canvasBackgroundImage ? 'cover' : 'auto',
    backgroundPosition: canvasBackgroundImage ? 'center' : 'center',
    backgroundRepeat: canvasBackgroundImage ? 'no-repeat' : 'no-repeat',
  };

  return (
    <div
      ref={canvasRef}
      className={`relative overflow-hidden transition-colors ${
        darkMode ? 'bg-gray-900' : 'bg-white'
      }`}
      style={{
        width: canvasWidth,
        height: canvasHeight,
        ...canvasBackgroundStyle,
        backgroundImage: gridEnabled
          ? `${canvasBackgroundImage ? `url(${canvasBackgroundImage}), ` : ''}repeating-linear-gradient(
              0deg,
              ${gridLineColor} 0px,
              ${gridLineColor} 1px,
              transparent 1px,
              transparent ${gridSize}px
            ),
            repeating-linear-gradient(
              90deg,
              ${gridLineColor} 0px,
              ${gridLineColor} 1px,
              transparent 1px,
              transparent ${gridSize}px
            )`
          : canvasBackgroundImage ? `url(${canvasBackgroundImage})` : 'none',
        backgroundSize: canvasBackgroundImage ? 'cover' : 'auto',
        backgroundPosition: canvasBackgroundImage ? 'center' : 'center',
        backgroundRepeat: canvasBackgroundImage ? 'no-repeat' : 'no-repeat',
        backgroundColor: canvasBackgroundImage ? 'transparent' : canvasBackground,
        cursor: drawingMode === 'select' ? 'default' : 'crosshair',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleCanvasClick}
      onDoubleClick={handleDoubleClick}
    >
      {/* Keyboard shortcuts hint */}
      <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-50 hover:opacity-100 transition-opacity pointer-events-none">
        <div className="bg-gray-900/80 dark:bg-gray-100/80 text-white dark:text-gray-900 px-2 py-1 rounded text-xs font-mono flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-gray-700 dark:bg-gray-300 rounded">⌘</kbd>
          <kbd className="px-1.5 py-0.5 bg-gray-700 dark:bg-gray-300 rounded">Z</kbd>
          <span>Undo</span>
        </div>
        <div className="bg-gray-900/80 dark:bg-gray-100/80 text-white dark:text-gray-900 px-2 py-1 rounded text-xs font-mono flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-gray-700 dark:bg-gray-300 rounded">⌘</kbd>
          <kbd className="px-1.5 py-0.5 bg-gray-700 dark:bg-gray-300 rounded">⇧</kbd>
          <kbd className="px-1.5 py-0.5 bg-gray-700 dark:bg-gray-300 rounded">Z</kbd>
          <span>Redo</span>
        </div>
        <div className="bg-gray-900/80 dark:bg-gray-100/80 text-white dark:text-gray-900 px-2 py-1 rounded text-xs font-mono flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-gray-700 dark:bg-gray-300 rounded">⌘</kbd>
          <kbd className="px-1.5 py-0.5 bg-gray-700 dark:bg-gray-300 rounded">C</kbd>
          <span>Copy</span>
        </div>
        <div className="bg-gray-900/80 dark:bg-gray-100/80 text-white dark:text-gray-900 px-2 py-1 rounded text-xs font-mono flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-gray-700 dark:bg-gray-300 rounded">⌘</kbd>
          <kbd className="px-1.5 py-0.5 bg-gray-700 dark:bg-gray-300 rounded">V</kbd>
          <span>Paste</span>
        </div>
        <div className="bg-gray-900/80 dark:bg-gray-100/80 text-white dark:text-gray-900 px-2 py-1 rounded text-xs font-mono flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-gray-700 dark:bg-gray-300 rounded">⌘</kbd>
          <kbd className="px-1.5 py-0.5 bg-gray-700 dark:bg-gray-300 rounded">D</kbd>
          <span>Duplicate</span>
        </div>
        <div className="bg-gray-900/80 dark:bg-gray-100/80 text-white dark:text-gray-900 px-2 py-1 rounded text-xs font-mono flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-gray-700 dark:bg-gray-300 rounded">Del</kbd>
          <span>Delete</span>
        </div>
        <div className="bg-gray-900/80 dark:bg-gray-100/80 text-white dark:text-gray-900 px-2 py-1 rounded text-xs font-mono flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-gray-700 dark:bg-gray-300 rounded">⌘</kbd>
          <kbd className="px-1.5 py-0.5 bg-gray-700 dark:bg-gray-300 rounded">Del</kbd>
          <span>Force Delete</span>
        </div>
      </div>

      {/* FOV Cones (behind elements) */}
      {scene.elements.map((element) => renderFOVCone(element))}

      {/* Light Spreads (behind elements) */}
      {scene.elements
        .filter((el) => el.type.startsWith('light-'))
        .map((element) => renderLightSpread(element))}

      {/* CAD Elements */}
      {scene.elements.map((element) => {
        if (element.type === 'cad-rectangle' || element.type === 'cad-line' || element.type === 'measurement') {
          return renderCADElement(element);
        }
        return null;
      })}

      {/* Text Elements */}
      {scene.elements.map((element) => {
        if (element.type === 'text') {
          return renderTextElement(element);
        }
        return null;
      })}

      {/* Regular Elements */}
      {scene.elements.map((element) => {
        if (element.type === 'cad-rectangle' || element.type === 'cad-line' || element.type === 'measurement' || element.type === 'text') {
          return null;
        }

        const isSelected = selectedElementId === element.id;
        const scaleX = element.linkedScale !== false ? element.scale : element.scaleX || element.scale;
        const scaleY = element.linkedScale !== false ? element.scale : element.scaleY || element.scale;
        const baseWidth = element.width || 60;
        const baseHeight = element.height || 60;
        const frameWidth = baseWidth * scaleX;
        const frameHeight = baseHeight * scaleY;
        const handles = isSelected && drawingMode === 'select' ? getResizeHandles(element) : [];

        return (
          <div
            key={element.id}
            className={`absolute cursor-move select-none ${
              isSelected ? 'ring-2 ring-blue-600 dark:ring-blue-400 ring-offset-2' : ''
            }`}
            style={{
              left: element.x,
              top: element.y,
              width: frameWidth,
              height: frameHeight,
              transform: `rotate(${element.rotation}deg)`,
              transformOrigin: 'center',
              zIndex: 2,
            }}
            onMouseDown={(e) => handleElementMouseDown(e, element)}
          >
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: `translate(-50%, -50%) scale(${scaleX}, ${scaleY})`,
                transformOrigin: 'center',
              }}
            >
              <ElementIcon
                type={element.type}
                color={element.color}
                size={baseWidth}
                customIcon={element.customIcon}
              />
            </div>
            {element.label && (
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 text-xs font-semibold text-white dark:text-gray-900 bg-blue-900 dark:bg-blue-200 px-2 py-0.5 rounded shadow border border-blue-700 dark:border-blue-400 whitespace-nowrap">
                {element.label}
              </div>
            )}

            {/* Resize/Rotate Handles */}
            {handles.map((handle) => (
              <div
                key={handle.position}
                className="absolute w-4 h-4 bg-blue-600 border-2 border-white dark:border-gray-900 rounded pointer-events-auto"
                style={{
                  left: handle.x - 8,
                  top: handle.y - 8,
                  cursor: handle.cursor,
                  zIndex: 10,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                }}
                onMouseDown={(e) => handleHandleMouseDown(e, handle, element)}
              >
                {handle.position === 'rotate' && (
                  <RotateCcw size={12} className="text-white -ml-0.5 -mt-0.5" />
                )}
              </div>
            ))}
          </div>
        );
      })}

      {/* CAD Drawing Preview */}
      {isDrawingCAD && cadStart && cadPreview && (
        <>
          {drawingMode === 'cad-rectangle' && (
            <div
              className="absolute border-2 border-dashed border-blue-500"
              style={{
                left: Math.min(cadStart.x, cadPreview.x),
                top: Math.min(cadStart.y, cadPreview.y),
                width: Math.abs(cadPreview.x - cadStart.x),
                height: Math.abs(cadPreview.y - cadStart.y),
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                pointerEvents: 'none',
              }}
            />
          )}
          {(drawingMode === 'cad-line' || drawingMode === 'measurement') && (
            <svg
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
              }}
            >
              <line
                x1={cadStart.x}
                y1={cadStart.y}
                x2={cadPreview.x}
                y2={cadPreview.y}
                stroke={drawingMode === 'measurement' ? '#3B82F6' : '#1E40AF'}
                strokeWidth="2"
                strokeDasharray="5,5"
              />
              {/* Shift hint */}
              <text
                x={(cadStart.x + cadPreview.x) / 2}
                y={(cadStart.y + cadPreview.y) / 2 - 15}
                fill="#3B82F6"
                fontSize="11"
                fontWeight="bold"
                textAnchor="middle"
                style={{ pointerEvents: 'none', fontFamily: 'monospace' }}
              >
                Hold Shift to snap
              </text>
            </svg>
          )}
        </>
      )}
    </div>
  );
};

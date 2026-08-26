import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useDiagramStore } from '../store';
import type { DiagramElement } from '../types';
import { ElementIcon } from './ElementIcon';
import { calculateHorizontalFOV } from '../utils/camera';
import { diagramIconSizes } from '../assets/icons';
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

const CAD_ORTHO_HINT = '⇧ Shift = Ortho · Keep drawing to chain walls · Esc to stop';

export const Canvas: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDrawingCAD, setIsDrawingCAD] = useState(false);
  const [cadStart, setCadStart] = useState<Point | null>(null);
  const [cadPreview, setCadPreview] = useState<Point | null>(null);
  // CAD polyline chaining: remembers the last vertex so the wall tool can
  // continue a connected polyline (like AutoCAD's LINE / PLINE flow).
  const [chainVertex, setChainVertex] = useState<Point | null>(null);
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
    gridColor,
    gridOpacity,
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

  // AutoCAD-style Ortho / Polar tracking: when Shift is held, constrain the
  // new point to the dominant axis (horizontal or vertical) relative to start.
  const applyOrtho = (start: Point, p: Point, enabled: boolean): Point => {
    if (!enabled) return p;
    const dx = Math.abs(p.x - start.x);
    const dy = Math.abs(p.y - start.y);
    if (dx >= dy) return { x: p.x, y: start.y };
    return { x: start.x, y: p.y };
  };

  // Formats a distance in px as a readable length using the active unit.
  const formatCADLength = (px: number): string => {
    if (measurementUnit === 'ft') return (px / 20).toFixed(1) + ' ft';
    if (measurementUnit === 'in') return (px * (12 / 20)).toFixed(0) + ' in';
    return (px / 20).toFixed(1) + ' m';
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
        color: '#C8102E',
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
      const snapped = { x: snapToGridFn(clampedX), y: snapToGridFn(clampedY) };
      // The wall tool continues from the previous vertex (polyline chain).
      if (drawingMode === 'cad-line' && chainVertex) {
        setCadStart(chainVertex);
        setCadPreview(chainVertex);
      } else {
        setCadStart(snapped);
        setCadPreview(e.shiftKey ? applyOrtho(snapped, snapped, true) : snapped);
      }
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
      // Grid snap by default; holding Shift locks the axis (AutoCAD Ortho).
      const snapX = snapToGridFn(clampedX);
      const snapY = snapToGridFn(clampedY);
      const ortho = applyOrtho(cadStart, { x: snapX, y: snapY }, e.shiftKey);
      setCadPreview({ x: ortho.x, y: ortho.y });
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (isDrawingCAD && cadStart && cadPreview) {
      const coords = getCanvasCoords(e);
      const clampedX = Math.min(Math.max(coords.x, 0), canvasWidth);
      const clampedY = Math.min(Math.max(coords.y, 0), canvasHeight);
      const snapX = snapToGridFn(clampedX);
      const snapY = snapToGridFn(clampedY);
      const ortho = applyOrtho(cadStart, { x: snapX, y: snapY }, e.shiftKey);
      const endX = ortho.x;
      const endY = ortho.y;

      // Don't create if too small
      if (Math.abs(endX - cadStart.x) > 1 || Math.abs(endY - cadStart.y) > 1) {
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
            color: '#D21F2B',
            // Skip the tiny <1px box for a pure click
            cadFill: Math.abs(endX - cadStart.x) < 2 || Math.abs(endY - cadStart.y) < 2 ? 'none' : 'solid',
          });
        } else if (drawingMode === 'cad-line') {
          const dist = Math.sqrt((endX - cadStart.x) ** 2 + (endY - cadStart.y) ** 2);
          store.addElement({
            type: 'cad-line',
            x: cadStart.x,
            y: cadStart.y,
            endX: endX,
            endY: endY,
            rotation: 0,
            scale: 1,
            label: dist > 1.5 ? formatCADLength(dist) : '',
            color: '#A3121D',
            thickness: 10,
          });
          // Continue the polyline from the endpoint (chain).
          if (dist > 1.5) setChainVertex({ x: endX, y: endY });
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
            color: '#E0353F',
            measurementUnit: measurementUnit,
          });
          setChainVertex(null);
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

  // Reset the CAD polyline chain whenever the active tool changes.
  useEffect(() => {
    setChainVertex(null);
    setIsDrawingCAD(false);
    setCadStart(null);
    setCadPreview(null);
  }, [drawingMode]);

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

  // Anchors the cone at the device's FRONT FACE rather than its bounding-box
  // center. The icon artwork (camera lens / light emitter) faces +X when the
  // rotation is 0° (same convention the cones use), so the cone origin is the
  // center projected outward to the artwork's emitting edge. Diagram icons are
  // letterboxed inside their square frame by object-fit: contain, and each
  // artwork emits along a different local axis (cameras face +X; upright light
  // artwork emits from its bottom edge, which the -90° icon rotation maps to
  // +X), so the radius is derived from the icon's intrinsic size along that
  // axis. This keeps cameras & lights visually locked to their FOV / spread
  // cone with no gap or overlap.
  const getFrontEmissionPoint = (element: DiagramElement): Point => {
    const scaleX = element.linkedScale !== false ? element.scale : element.scaleX || element.scale;
    const center = getElementCenter(element);
    const angleRad = (element.rotation * Math.PI) / 180;
    const frameSize = element.width || 60;
    const iconSize = diagramIconSizes[element.type];
    let frontRadius = (frameSize * scaleX) / 2;
    if (iconSize) {
      const containScale = Math.min(frameSize / iconSize.width, frameSize / iconSize.height);
      const extentAlongFacingAxis = element.type.startsWith('light-')
        ? iconSize.height * containScale
        : iconSize.width * containScale;
      frontRadius = (extentAlongFacingAxis / 2) * scaleX;
    }
    return {
      x: center.x + Math.cos(angleRad) * frontRadius,
      y: center.y + Math.sin(angleRad) * frontRadius,
    };
  };

  const renderFOVCone = (element: DiagramElement) => {
    if (element.type !== 'camera' || !element.cameraSettings?.showFOV) return null;

    const { sensorSize, focalLength, fovOpacity = 0.4 } = element.cameraSettings;
    const fovAngle = calculateHorizontalFOV(sensorSize, focalLength);
    const coneLength = element.cameraSettings.fovDistance ?? 300;

    const angleRad = (element.rotation * Math.PI) / 180;
    const halfFOV = (fovAngle / 2) * (Math.PI / 180);

    const { x: centerX, y: centerY } = getFrontEmissionPoint(element);

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
          <linearGradient
            id={`fov-gradient-${element.id}`}
            gradientUnits="userSpaceOnUse"
            x1={centerX}
            y1={centerY}
            x2={centerX + coneLength * Math.cos(angleRad)}
            y2={centerY + coneLength * Math.sin(angleRad)}
          >
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

    const { x: centerX, y: centerY } = getFrontEmissionPoint(element);

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
          <radialGradient
            id={`light-spread-${element.id}`}
            gradientUnits="userSpaceOnUse"
            cx={centerX}
            cy={centerY}
            r={spreadDistance}
          >
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
      const fill = element.cadFill ?? 'solid';
      const background =
        fill === 'solid'
          ? `${element.color}22`
          : fill === 'hatch'
          ? `repeating-linear-gradient(45deg, ${element.color}30 0 4px, transparent 4px 8px)`
          : 'rgba(210, 31, 43, 0.06)';
      return (
        <div
          key={element.id}
          className={`absolute border-2 ${
            selectedElementId === element.id ? 'ring-2 ring-red-600 dark:ring-red-400' : ''
          }`}
          style={{
            left: element.x,
            top: element.y,
            width: element.width,
            height: element.height,
            backgroundColor: fill === 'solid' ? background : fill === 'hatch' ? 'rgba(210,31,43,0.05)' : 'transparent',
            backgroundImage: fill === 'hatch' ? background : undefined,
            borderColor: element.color,
            borderStyle: 'solid',
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
            <div className="absolute top-1 left-1 text-xs font-semibold text-[var(--on-binder)] bg-[var(--binder)] px-2 py-0.5 rounded shadow-sm border-[var(--line)]">
              {element.label}
            </div>
          )}
        </div>
      );
    } else if ((element.type === 'cad-line' || element.type === 'measurement') && element.endX !== undefined && element.endY !== undefined) {
      const x1 = element.x;
      const y1 = element.y;
      const x2 = element.endX;
      const y2 = element.endY;
      const dx = x2 - x1;
      const dy = y2 - y1;
      const len = Math.hypot(dx, dy);

      if (element.type === 'measurement') {
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
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={element.color} strokeWidth="2" />
            <line x1={x1} y1={y1 - 5} x2={x1} y2={y1 + 5} stroke={element.color} strokeWidth="2" />
            <line x1={x2} y1={y2 - 5} x2={x2} y2={y2 + 5} stroke={element.color} strokeWidth="2" />
            <text
              x={(x1 + x2) / 2}
              y={(y1 + y2) / 2 - 6}
              fill={darkMode ? '#FF6B6B' : '#C8102E'}
              fontSize="12"
              fontWeight="bold"
              textAnchor="middle"
              style={{ pointerEvents: 'none' }}
            >
              {element.label}
            </text>
          </svg>
        );
      }

      // Wall slab: a real architectural wall with thickness (filled mass
      // between two parallel faces + square end caps), like AutoCAD's MLINE.
      const thickness = element.thickness ?? 10;
      const color = element.color;
      // Unit perpendicular for the wall offset.
      const hw = thickness / 2;
      const nx = len > 0 ? -dy / len : 0;
      const ny = len > 0 ? dx / len : 0;
      const p1 = `${x1 + nx * hw},${y1 + ny * hw}`;
      const p2 = `${x2 + nx * hw},${y2 + ny * hw}`;
      const p3 = `${x2 - nx * hw},${y2 - ny * hw}`;
      const p4 = `${x1 - nx * hw},${y1 - ny * hw}`;
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
            overflow: 'visible',
          }}
        >
          <g className="cad-wall" pointerEvents="auto" cursor="move" onMouseDown={(e) => handleElementMouseDown(e, element)}>
            <polygon
              points={`${p1} ${p2} ${p3} ${p4}`}
              fill={color}
              fillOpacity="0.85"
              stroke={darkMode ? '#7f1d1d' : '#7a1015'}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            {/* subtle interior centerline, common on construction drawings */}
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="rgba(255,255,255,0.35)"
              strokeWidth="1"
              strokeDasharray="4,4"
            />
            {selectedElementId === element.id && (
              <rect
                x={Math.min(x1, x2) - 8}
                y={Math.min(y1, y2) - 8}
                width={Math.abs(x2 - x1) + 16}
                height={Math.abs(y2 - y1) + 16}
                fill="none"
                stroke="#D21F2B"
                strokeWidth="1.5"
                strokeDasharray="4,4"
                rx="3"
                pointerEvents="none"
              />
            )}
            {element.label && len > 0 && (
              <text
                x={(x1 + x2) / 2 + nx * 16}
                y={(y1 + y2) / 2 + ny * 16}
                fill={darkMode ? '#ff6b6b' : '#a3121d'}
                fontSize="11"
                fontWeight="bold"
                textAnchor="middle"
                stroke="none"
                style={{ pointerEvents: 'none', fontFamily: 'ui-monospace, monospace' }}
              >
                {element.label}
              </text>
            )}
          </g>
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
      outline: isSelected ? '2px solid #D21F2B' : 'none',
      outlineOffset: '4px',
      padding: isSelected ? '4px' : '0',
      backgroundColor: isSelected ? 'rgba(210, 31, 43, 0.1)' : 'transparent',
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
              backgroundColor: darkMode ? '#1a1a1a' : '#ffffff',
              border: '2px solid #D21F2B',
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

      setIsResizing(true);
      setResizeHandle(handle);
      setResizeStart(coords);
      setElementStart(element);
      setElementCenter({ x: centerX, y: centerY });
      setRotateStartAngle(angle - element.rotation);
    }
  };

  // Grid line color: user-customizable, falls back to theme default
  const defaultGridLineColor = darkMode ? '#3A3A3A' : '#BFBFBF';
  const baseGridColor = /^#[0-9A-Fa-f]{6}$/.test(gridColor || '') ? gridColor! : defaultGridLineColor;
  const opacity = typeof gridOpacity === 'number' ? Math.min(1, Math.max(0, gridOpacity)) : 1;
  const r = parseInt(baseGridColor.slice(1, 3), 16);
  const g = parseInt(baseGridColor.slice(3, 5), 16);
  const b = parseInt(baseGridColor.slice(5, 7), 16);
  const gridLineColor = `rgba(${r}, ${g}, ${b}, ${opacity})`;

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
      className={`lighting-plot-canvas relative overflow-hidden transition-colors ${
        darkMode ? 'bg-[var(--field)]' : 'bg-[var(--field)]'
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
        <div className="bg-[var(--control)]/80 dark:bg-[var(--inspector)]/80 text-[var(--ink-strong)] dark:text-[var(--ink-muted)] px-2 py-1 rounded text-xs font-mono flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-[var(--control)] dark:bg-[var(--control-hover)] rounded">⌘</kbd>
          <kbd className="px-1.5 py-0.5 bg-[var(--control)] dark:bg-[var(--control-hover)] rounded">Z</kbd>
          <span>Undo</span>
        </div>
        <div className="bg-[var(--control)]/80 dark:bg-[var(--inspector)]/80 text-[var(--ink-strong)] dark:text-[var(--ink-muted)] px-2 py-1 rounded text-xs font-mono flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-[var(--control)] dark:bg-[var(--control-hover)] rounded">⌘</kbd>
          <kbd className="px-1.5 py-0.5 bg-[var(--control)] dark:bg-[var(--control-hover)] rounded">⇧</kbd>
          <kbd className="px-1.5 py-0.5 bg-[var(--control)] dark:bg-[var(--control-hover)] rounded">Z</kbd>
          <span>Redo</span>
        </div>
        <div className="bg-[var(--control)]/80 dark:bg-[var(--inspector)]/80 text-[var(--ink-strong)] dark:text-[var(--ink-muted)] px-2 py-1 rounded text-xs font-mono flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-[var(--control)] dark:bg-[var(--control-hover)] rounded">⌘</kbd>
          <kbd className="px-1.5 py-0.5 bg-[var(--control)] dark:bg-[var(--control-hover)] rounded">C</kbd>
          <span>Copy</span>
        </div>
        <div className="bg-[var(--control)]/80 dark:bg-[var(--inspector)]/80 text-[var(--ink-strong)] dark:text-[var(--ink-muted)] px-2 py-1 rounded text-xs font-mono flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-[var(--control)] dark:bg-[var(--control-hover)] rounded">⌘</kbd>
          <kbd className="px-1.5 py-0.5 bg-[var(--control)] dark:bg-[var(--control-hover)] rounded">V</kbd>
          <span>Paste</span>
        </div>
        <div className="bg-[var(--control)]/80 dark:bg-[var(--inspector)]/80 text-[var(--ink-strong)] dark:text-[var(--ink-muted)] px-2 py-1 rounded text-xs font-mono flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-[var(--control)] dark:bg-[var(--control-hover)] rounded">⌘</kbd>
          <kbd className="px-1.5 py-0.5 bg-[var(--control)] dark:bg-[var(--control-hover)] rounded">D</kbd>
          <span>Duplicate</span>
        </div>
        <div className="bg-[var(--control)]/80 dark:bg-[var(--inspector)]/80 text-[var(--ink-strong)] dark:text-[var(--ink-muted)] px-2 py-1 rounded text-xs font-mono flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-[var(--control)] dark:bg-[var(--control-hover)] rounded">Del</kbd>
          <span>Delete</span>
        </div>
        <div className="bg-[var(--control)]/80 dark:bg-[var(--inspector)]/80 text-[var(--ink-strong)] dark:text-[var(--ink-muted)] px-2 py-1 rounded text-xs font-mono flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-[var(--control)] dark:bg-[var(--control-hover)] rounded">⌘</kbd>
          <kbd className="px-1.5 py-0.5 bg-[var(--control)] dark:bg-[var(--control-hover)] rounded">Del</kbd>
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
              isSelected ? 'ring-2 ring-red-600 dark:ring-red-400 ring-offset-2' : ''
            }`}
            style={{
              left: element.x,
              top: element.y,
              width: frameWidth,
              height: frameHeight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: `rotate(${element.rotation}deg)`,
              transformOrigin: 'center',
              zIndex: 2,
            }}
            onMouseDown={(e) => handleElementMouseDown(e, element)}
          >
            <div
              style={{
                flex: '0 0 auto',
                transform: `scale(${scaleX}, ${scaleY})`,
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
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 text-xs font-semibold text-[var(--on-binder)] bg-[var(--binder)] px-2 py-0.5 rounded shadow border-[var(--line)] whitespace-nowrap">
                {element.label}
              </div>
            )}

            {/* Resize/Rotate Handles */}
            {handles.map((handle) => (
              <div
                key={handle.position}
                className="absolute w-4 h-4 bg-[var(--accent)] border-2 border-[var(--ink-strong)] rounded pointer-events-auto rounded pointer-events-auto"
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
              className="absolute border-2 border-dashed border-[var(--line)]"
              style={{
                left: Math.min(cadStart.x, cadPreview.x),
                top: Math.min(cadStart.y, cadPreview.y),
                width: Math.abs(cadPreview.x - cadStart.x),
                height: Math.abs(cadPreview.y - cadStart.y),
                backgroundColor: 'rgba(210, 31, 43, 0.2)',
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
                stroke={drawingMode === 'measurement' ? '#E0353F' : '#A3121D'}
                strokeWidth={drawingMode === 'cad-line' ? 8 : 2}
                strokeOpacity={drawingMode === 'cad-line' ? 0.85 : 1}
                strokeLinecap="round"
                strokeDasharray={drawingMode === 'cad-line' ? '0' : '5,5'}
              />
              {(() => {
                const d = Math.hypot(cadPreview.x - cadStart.x, cadPreview.y - cadStart.y);
                if (d < 1) return null;
                const ang = (Math.atan2(cadPreview.y - cadStart.y, cadPreview.x - cadStart.x) * 180) / Math.PI;
                const live = `${formatCADLength(d)}  •  ${Math.abs(ang % 180).toFixed(1)}°`;
                return (
                  <text
                    x={(cadStart.x + cadPreview.x) / 2}
                    y={(cadStart.y + cadPreview.y) / 2 - 16}
                    fill="#D21F2B"
                    fontSize="12"
                    fontWeight="bold"
                    textAnchor="middle"
                    style={{ pointerEvents: 'none', fontFamily: 'ui-monospace, monospace' }}
                  >
                    {live}
                  </text>
                );
              })()}
              <text
                x={(cadStart.x + cadPreview.x) / 2}
                y={(cadStart.y + cadPreview.y) / 2 - 34}
                fill="#8a8a8a"
                fontSize="10"
                textAnchor="middle"
                style={{ pointerEvents: 'none', fontFamily: 'ui-monospace, monospace' }}
              >
                {CAD_ORTHO_HINT}
              </text>
            </svg>
          )}
        </>
      )}
    </div>
  );
};

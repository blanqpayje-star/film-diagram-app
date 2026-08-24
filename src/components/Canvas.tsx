import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useDiagramStore } from '../store';
import type { DiagramElement } from '../types';
import { ElementIcon } from './ElementIcon';
import { calculateHorizontalFOV } from '../utils/camera';
import { kelvinToRGB } from '../utils/color';

interface Point {
  x: number;
  y: number;
}

export const Canvas: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDrawingCAD, setIsDrawingCAD] = useState(false);
  const [cadStart, setCadStart] = useState<Point | null>(null);
  const [cadPreview, setCadPreview] = useState<Point | null>(null);

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
  } = useDiagramStore();

  const scene = getCurrentScene();

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
      const elWidth = element?.width || 60;
      const elHeight = element?.height || 60;

      const constrained = constrainPosition(rawX, rawY, elWidth, elHeight);

      updateElement(selectedElementId, { x: constrained.x, y: constrained.y });
    } else if (isDrawingCAD && cadStart) {
      const coords = getCanvasCoords(e);
      const clampedX = Math.min(Math.max(coords.x, 0), canvasWidth);
      const clampedY = Math.min(Math.max(coords.y, 0), canvasHeight);
      setCadPreview({ x: snapToGridFn(clampedX), y: snapToGridFn(clampedY) });
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
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current && drawingMode === 'select') {
      selectElement(null);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedElementId) {
        const element = scene?.elements.find((el) => el.id === selectedElementId);
        if (!element) return;

        const step = e.shiftKey ? gridSize : 1;
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
          case 'Backspace':
            e.preventDefault();
            useDiagramStore.getState().deleteElement(selectedElementId);
            return;
          case 'Escape':
            e.preventDefault();
            selectElement(null);
            useDiagramStore.getState().setDrawingMode('select');
            return;
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
  }, [selectedElementId, scene, gridSize, canvasWidth, canvasHeight, updateElement, selectElement, constrainPosition]);

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

  const renderFOVCone = (element: DiagramElement) => {
    if (element.type !== 'camera' || !element.cameraSettings?.showFOV) return null;

    const { sensorSize, focalLength, fovOpacity } = element.cameraSettings;
    const fovAngle = calculateHorizontalFOV(sensorSize, focalLength);
    const coneLength = 300;

    const angleRad = (element.rotation * Math.PI) / 180;
    const halfFOV = (fovAngle / 2) * (Math.PI / 180);

    const centerX = element.x + 30;
    const centerY = element.y + 30;

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

    const centerX = element.x + 30;
    const centerY = element.y + 30;

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
    >
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

      {/* Regular Elements */}
      {scene.elements.map((element) => {
        if (element.type === 'cad-rectangle' || element.type === 'cad-line' || element.type === 'measurement') {
          return null;
        }

        return (
          <div
            key={element.id}
            className={`absolute cursor-move select-none ${
              selectedElementId === element.id
                ? 'ring-2 ring-blue-600 dark:ring-blue-400 ring-offset-2'
                : ''
            }`}
            style={{
              left: element.x,
              top: element.y,
              transform: `scale(${element.scale})`,
              transformOrigin: 'center',
              zIndex: 2,
            }}
            onMouseDown={(e) => handleElementMouseDown(e, element)}
          >
            <ElementIcon
              type={element.type}
              color={element.color}
              rotation={element.rotation}
              size={60}
              customIcon={element.customIcon}
            />
            {element.label && (
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 text-xs font-semibold text-white dark:text-gray-900 bg-blue-900 dark:bg-blue-200 px-2 py-0.5 rounded shadow border border-blue-700 dark:border-blue-400 whitespace-nowrap">
                {element.label}
              </div>
            )}
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
            </svg>
          )}
        </>
      )}
    </div>
  );
};

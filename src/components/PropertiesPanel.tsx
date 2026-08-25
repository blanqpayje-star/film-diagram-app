import React, { useRef } from 'react';
import { useDiagramStore } from '../store';
import { HexColorPicker } from 'react-colorful';
import imageCompression from 'browser-image-compression';
import {
  Trash2,
  Copy,
  RotateCw,
  Minus,
  Plus,
  Tag,
  Camera,
  Eye,
  EyeOff,
  ImagePlus,
  Lightbulb,
  Sun,
  Palette,
  ChevronRight,
  Type,
  Text,
  Filter,
  Link2,
  Link2Off,
} from 'lucide-react';
import { SENSOR_SIZES, calculateHorizontalFOV } from '../utils/camera';
import { kelvinToRGB, KELVIN_PRESETS, getKelvinName } from '../utils/color';
import type { LightModifierType } from '../types';

interface PropertiesPanelProps {
  collapsed?: boolean;
}

const ToggleButton = ({ onClick, icon, title }: { onClick: () => void; icon: React.ReactNode; title: string }) => (
  <div className="relative group mb-4">
    <button
      onClick={onClick}
      className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium rounded-lg transition-colors border shadow-sm bg-blue-50 dark:bg-gray-800 text-blue-900 dark:text-gray-200 border-blue-200 dark:border-gray-700 hover:bg-blue-100 dark:hover:bg-gray-700"
    >
      <div className="text-blue-600 dark:text-blue-400">{icon}</div>
    </button>
    <div className="absolute left-full top-0 ml-2 px-2 py-1 text-xs font-medium bg-gray-900 text-white rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-10">
      {title}
    </div>
  </div>
);

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ collapsed = false }) => {
  const {
    getCurrentScene,
    selectedElementId,
    updateElement,
    deleteElement,
    duplicateElement,
    darkMode,
    toggleRightPanel,
    rightPanelCollapsed,
  } = useDiagramStore();

  const customIconInputRef = useRef<HTMLInputElement>(null);
  const cadIconInputRef = useRef<HTMLInputElement>(null);

  const scene = getCurrentScene();
  const selectedElement = scene?.elements.find(
    (el) => el.id === selectedElementId
  );

  const isCamera = selectedElement?.type === 'camera';
  const isLight = selectedElement?.type?.startsWith('light-');
  const isCAD = selectedElement?.type === 'cad-rectangle' || selectedElement?.type === 'cad-line';
  const cameraSettings = selectedElement?.cameraSettings;
  const lightSettings = selectedElement?.lightSettings;

  const handleCustomIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedElement) return;

    try {
      const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 512,
        useWebWorker: true,
      };

      const compressedFile = await imageCompression(file, options);
      const reader = new FileReader();

      reader.onload = (event) => {
        const imageData = event.target?.result as string;
        updateElement(selectedElement.id, { customIcon: imageData });
      };

      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error('Failed to upload custom icon:', error);
      alert('Failed to upload image. Please try a smaller file.');
    }

    if (customIconInputRef.current) {
      customIconInputRef.current.value = '';
    }
  };

  const handleCADIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedElement) return;

    try {
      const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 512,
        useWebWorker: true,
      };

      const compressedFile = await imageCompression(file, options);
      const reader = new FileReader();

      reader.onload = (event) => {
        const imageData = event.target?.result as string;
        updateElement(selectedElement.id, { cadIcon: imageData });
      };

      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error('Failed to upload CAD icon:', error);
      alert('Failed to upload image. Please try a smaller file.');
    }

    if (cadIconInputRef.current) {
      cadIconInputRef.current.value = '';
    }
  };

  if (!selectedElement) {
    return (
      <div className={`p-4 border-l h-full flex flex-col justify-center items-center ${
        darkMode ? 'bg-gray-900 border-gray-800 text-gray-400' : 'bg-blue-50 border-blue-100 text-gray-600'
      }`}>
        <div className="text-center text-sm font-medium">
          Select an element on the canvas to edit its properties
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 border-l h-full overflow-y-auto ${
      darkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-blue-50 border-blue-100 text-gray-900'
    }`}>
      {collapsed && (
        <ToggleButton
          onClick={toggleRightPanel}
          icon={<ChevronRight size={20} />}
          title={rightPanelCollapsed ? 'Expand Properties' : 'Collapse Properties'}
        />
      )}
      {!collapsed && (
        <h3 className={`text-xs font-bold mb-4 uppercase tracking-wider ${darkMode ? 'text-blue-300' : 'text-blue-900'}`}>
          Properties
        </h3>
      )}

      {/* Custom Icon Upload - For all element types */}
      <div className="mb-4 p-3 bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h4 className="text-xs font-bold text-blue-900 dark:text-blue-200 mb-2 flex items-center gap-1">
          <ImagePlus size={14} />
          Custom Icon
        </h4>
        <input
          ref={customIconInputRef}
          type="file"
          accept="image/*"
          onChange={handleCustomIconUpload}
          className="hidden"
        />
        <div className="flex gap-2">
          <button
            onClick={() => customIconInputRef.current?.click()}
            className="flex-1 py-1.5 px-3 text-xs font-bold bg-blue-900 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Upload Custom Icon
          </button>
          {selectedElement.customIcon && (
            <button
              onClick={() => updateElement(selectedElement.id, { customIcon: undefined })}
              className="py-1.5 px-3 text-xs font-bold bg-red-800 text-white rounded hover:bg-red-700 transition-colors"
            >
              Remove
            </button>
          )}
        </div>
        <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">Compressed to max 512px / 500KB</p>
      </div>

      {/* Label */}
      <div className="mb-4">
        <label className="block text-xs font-bold mb-2 flex items-center gap-1">
          <Tag size={14} />
          Label
        </label>
        <input
          type="text"
          value={selectedElement.label}
          onChange={(e) =>
            updateElement(selectedElement.id, { label: e.target.value })
          }
          placeholder="Add label..."
          className={`w-full px-3 py-2 text-sm font-medium border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 ${
            darkMode
              ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
          }`}
        />
      </div>

      {/* CAD Specific Icon Customization */}
      {isCAD && (
        <div className="mb-4 p-3 bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h4 className="text-xs font-bold text-blue-900 dark:text-blue-200 mb-2 flex items-center gap-1">
            <ImagePlus size={14} />
            CAD Icon Overlay
          </h4>
          <input
            ref={cadIconInputRef}
            type="file"
            accept="image/*"
            onChange={handleCADIconUpload}
            className="hidden"
          />
          <div className="flex gap-2">
            <button
              onClick={() => cadIconInputRef.current?.click()}
              className="flex-1 py-1.5 px-3 text-xs font-bold bg-blue-900 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Upload Icon
            </button>
            {selectedElement.cadIcon && (
              <button
                onClick={() => updateElement(selectedElement.id, { cadIcon: undefined })}
                className="py-1.5 px-3 text-xs font-bold bg-red-800 text-white rounded hover:bg-red-700 transition-colors"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      )}

      {/* Camera-specific controls */}
      {isCamera && cameraSettings && (
        <div className="mb-4 p-3 bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-blue-900 dark:text-blue-200 flex items-center gap-2">
              <Camera size={16} />
              Camera Settings
            </h4>
            <button
              onClick={() =>
                updateElement(selectedElement.id, {
                  cameraSettings: {
                    ...cameraSettings,
                    showFOV: !cameraSettings.showFOV,
                  },
                })
              }
              className={`p-1.5 rounded transition-colors ${
                cameraSettings.showFOV
                  ? 'bg-blue-900 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700'
              }`}
              title={cameraSettings.showFOV ? 'Hide FOV' : 'Show FOV'}
            >
              {cameraSettings.showFOV ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          </div>

          <div className="space-y-3">
            {/* Sensor Size */}
            <div>
              <label className="block text-xs font-semibold mb-1">
                Sensor Size
              </label>
              <select
                value={cameraSettings.sensorSize}
                onChange={(e) =>
                  updateElement(selectedElement.id, {
                    cameraSettings: {
                      ...cameraSettings,
                      sensorSize: e.target.value as any,
                    },
                  })
                }
                className={`w-full px-2 py-1.5 text-xs font-medium border rounded focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                  darkMode
                    ? 'bg-gray-800 border-gray-700 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                {Object.entries(SENSOR_SIZES).map(([key, { name }]) => (
                  <option key={key} value={key} className={darkMode ? 'bg-gray-900' : 'bg-white'}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            {/* Focal Length */}
            <div>
              <label className="block text-xs font-semibold mb-1">
                Focal Length: {cameraSettings.focalLength}mm
              </label>
              <input
                type="range"
                min="14"
                max="200"
                value={cameraSettings.focalLength}
                onChange={(e) =>
                  updateElement(selectedElement.id, {
                    cameraSettings: {
                      ...cameraSettings,
                      focalLength: parseInt(e.target.value),
                    },
                  })
                }
                className="w-full accent-blue-600"
              />
              <div className="flex gap-1 mt-2 flex-wrap">
                {[24, 35, 50, 85].map((focal) => (
                  <button
                    key={focal}
                    onClick={() =>
                      updateElement(selectedElement.id, {
                        cameraSettings: {
                          ...cameraSettings,
                          focalLength: focal,
                        },
                      })
                    }
                    className={`px-2 py-1 text-xs font-bold rounded border ${
                      darkMode
                        ? 'bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700'
                        : 'bg-white border-gray-300 text-gray-800 hover:bg-gray-100'
                    }`}
                  >
                    {focal}mm
                  </button>
                ))}
              </div>
            </div>

            {/* FOV Display */}
            {cameraSettings.showFOV && (
              <>
                <div className={`text-xs font-semibold p-2 rounded border ${
                  darkMode ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-white border-gray-300 text-gray-800'
                }`}>
                  <strong>Horizontal FOV:</strong>{' '}
                  {calculateHorizontalFOV(
                    cameraSettings.sensorSize,
                    cameraSettings.focalLength
                  ).toFixed(1)}
                  °
                </div>

                {/* FOV Opacity */}
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    FOV Opacity: {(cameraSettings.fovOpacity * 100).toFixed(0)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={cameraSettings.fovOpacity}
                    onChange={(e) =>
                      updateElement(selectedElement.id, {
                        cameraSettings: {
                          ...cameraSettings,
                          fovOpacity: parseFloat(e.target.value),
                        },
                      })
                    }
                    className="w-full accent-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">
                    FOV Distance: {cameraSettings.fovDistance ?? 300}px
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="500"
                    step="10"
                    value={cameraSettings.fovDistance ?? 300}
                    onChange={(e) =>
                      updateElement(selectedElement.id, {
                        cameraSettings: {
                          ...cameraSettings,
                          fovDistance: parseInt(e.target.value),
                        },
                      })
                    }
                    className="w-full accent-blue-600"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Light-specific controls */}
      {isLight && lightSettings && (
        <div className="mb-4 p-3 bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2">
              <Lightbulb size={16} />
              Light Settings
            </h4>
            <button
              onClick={() =>
                updateElement(selectedElement.id, {
                  lightSettings: {
                    ...lightSettings,
                    showSpread: !lightSettings.showSpread,
                  },
                })
              }
              className={`p-1.5 rounded transition-colors ${
                lightSettings.showSpread
                  ? 'bg-amber-900 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700'
              }`}
              title={lightSettings.showSpread ? 'Hide Spread' : 'Show Spread'}
            >
              {lightSettings.showSpread ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          </div>

          <div className="space-y-3">
            {/* Light Spread Angle */}
            <div>
              <label className="block text-xs font-semibold mb-1">
                Spread Angle: {lightSettings.spreadAngle}°
              </label>
              <input
                type="range"
                min="15"
                max="120"
                value={lightSettings.spreadAngle}
                onChange={(e) =>
                  updateElement(selectedElement.id, {
                    lightSettings: {
                      ...lightSettings,
                      spreadAngle: parseInt(e.target.value),
                    },
                  })
                }
                className="w-full accent-amber-600"
              />
            </div>

            {/* Spread Distance */}
            <div>
              <label className="block text-xs font-semibold mb-1">
                Spread Distance: {lightSettings.spreadDistance}px
              </label>
              <input
                type="range"
                min="50"
                max="500"
                value={lightSettings.spreadDistance}
                onChange={(e) =>
                  updateElement(selectedElement.id, {
                    lightSettings: {
                      ...lightSettings,
                      spreadDistance: parseInt(e.target.value),
                    },
                  })
                }
                className="w-full accent-amber-600"
              />
            </div>

            {/* Spread Opacity */}
            <div>
              <label className="block text-xs font-semibold mb-1">
                Spread Opacity: {(lightSettings.spreadOpacity * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={lightSettings.spreadOpacity}
                onChange={(e) =>
                  updateElement(selectedElement.id, {
                    lightSettings: {
                      ...lightSettings,
                      spreadOpacity: parseFloat(e.target.value),
                    },
                  })
                }
                className="w-full accent-amber-600"
              />
            </div>

            {/* Color Mode Toggle */}
            <div>
              <label className="block text-xs font-semibold mb-2">
                <Palette size={14} className="inline mr-1" />
                Color Mode
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    updateElement(selectedElement.id, {
                      lightSettings: {
                        ...lightSettings,
                        colorMode: 'kelvin',
                      },
                    })
                  }
                  className={`flex-1 px-3 py-2 text-xs font-bold rounded border ${
                    lightSettings.colorMode === 'kelvin'
                      ? 'bg-amber-600 text-white border-amber-600'
                      : darkMode
                      ? 'bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700'
                      : 'bg-white border-gray-300 text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  <Sun size={14} className="inline mr-1" /> Kelvin
                </button>
                <button
                  onClick={() =>
                    updateElement(selectedElement.id, {
                      lightSettings: {
                        ...lightSettings,
                        colorMode: 'rgb',
                      },
                    })
                  }
                  className={`flex-1 px-3 py-2 text-xs font-bold rounded border ${
                    lightSettings.colorMode === 'rgb'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : darkMode
                      ? 'bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700'
                      : 'bg-white border-gray-300 text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  <Palette size={14} className="inline mr-1" /> RGB
                </button>
              </div>
            </div>

            {/* Kelvin Controls */}
            {lightSettings.colorMode === 'kelvin' && (
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Color Temperature: {lightSettings.kelvin}K ({getKelvinName(lightSettings.kelvin)})
                  </label>
                  <input
                    type="range"
                    min="2700"
                    max="6500"
                    step="50"
                    value={lightSettings.kelvin}
                    onChange={(e) =>
                      updateElement(selectedElement.id, {
                        lightSettings: {
                          ...lightSettings,
                          kelvin: parseInt(e.target.value),
                        },
                      })
                    }
                    className="w-full accent-amber-600"
                  />
                </div>
                <div className="flex gap-1 flex-wrap">
                  {KELVIN_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() =>
                        updateElement(selectedElement.id, {
                          lightSettings: {
                            ...lightSettings,
                            kelvin: preset.value,
                          },
                        })
                      }
                      className={`px-2 py-1 text-xs font-bold rounded border ${
                        lightSettings.kelvin === preset.value
                          ? 'bg-amber-600 text-white border-amber-600'
                          : darkMode
                          ? 'bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700'
                          : 'bg-white border-gray-300 text-gray-800 hover:bg-gray-100'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                <div className={`text-xs p-2 rounded border ${
                  darkMode ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-white border-gray-300 text-gray-800'
                }`}>
                  <strong>Preview Color:</strong>{' '}
                  <span
                    style={{
                      display: 'inline-block',
                      width: '20px',
                      height: '12px',
                      backgroundColor: kelvinToRGB(lightSettings.kelvin),
                      border: '1px solid #000',
                      borderRadius: '2px',
                      verticalAlign: 'middle',
                      marginLeft: '4px',
                    }}
                  />
                </div>
              </div>
            )}

            {/* RGB Controls */}
            {lightSettings.colorMode === 'rgb' && (
              <div>
                <label className="block text-xs font-semibold mb-2">
                  RGB Color
                </label>
                <div className="space-y-2">
                  <HexColorPicker
                    color={lightSettings.rgbColor || '#FFFFFF'}
                    onChange={(color) =>
                      updateElement(selectedElement.id, {
                        lightSettings: {
                          ...lightSettings,
                          rgbColor: color,
                        },
                      })
                    }
                    style={{ width: '100%' }}
                  />
                  <input
                    type="text"
                    value={lightSettings.rgbColor || '#FFFFFF'}
                    onChange={(e) =>
                      updateElement(selectedElement.id, {
                        lightSettings: {
                          ...lightSettings,
                          rgbColor: e.target.value,
                        },
                      })
                    }
                    className={`w-full px-3 py-2 text-xs font-mono font-bold border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                      darkMode
                        ? 'bg-gray-800 border-gray-700 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Color (for non-light elements) */}
      {(!isLight || selectedElement.type === 'custom') && (
        <div className="mb-4">
          <label className="block text-xs font-bold mb-2">
            Color
          </label>
          <div className="space-y-2">
            <HexColorPicker
              color={selectedElement.color}
              onChange={(color) =>
                updateElement(selectedElement.id, { color })
              }
              style={{ width: '100%' }}
            />
            <input
              type="text"
              value={selectedElement.color}
              onChange={(e) =>
                updateElement(selectedElement.id, { color: e.target.value })
              }
              className={`w-full px-3 py-2 text-xs font-mono font-bold border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                darkMode
                  ? 'bg-gray-800 border-gray-700 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
        </div>
      )}

      {/* Text Customization - for text elements */}
      {selectedElement.type === 'text' && (
        <div className="mb-4 p-3 bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-lg">
          <h4 className="text-xs font-bold text-purple-900 dark:text-purple-200 mb-3 flex items-center gap-2">
            <Type size={16} />
            Text Formatting
          </h4>

          {/* Font Family */}
          <div className="mb-3">
            <label className="block text-xs font-semibold mb-1 flex items-center gap-1">
              <Text size={14} />
              Font Family
            </label>
            <select
              value={selectedElement.fontFamily || 'Inter'}
              onChange={(e) =>
                updateElement(selectedElement.id, { fontFamily: e.target.value })
              }
              className={`w-full px-3 py-2 text-sm font-medium border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 ${
                darkMode
                  ? 'bg-gray-800 border-gray-700 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="Inter" className={darkMode ? 'bg-gray-900' : 'bg-white'}>Inter (Default)</option>
              <option value="Geist" className={darkMode ? 'bg-gray-900' : 'bg-white'}>Geist</option>
              <option value="Cabinet Grotesk" className={darkMode ? 'bg-gray-900' : 'bg-white'}>Cabinet Grotesk</option>
              <option value="Outfit" className={darkMode ? 'bg-gray-900' : 'bg-white'}>Outfit</option>
              <option value="Satoshi" className={darkMode ? 'bg-gray-900' : 'bg-white'}>Satoshi</option>
              <option value="Space Grotesk" className={darkMode ? 'bg-gray-900' : 'bg-white'}>Space Grotesk</option>
              <option value="DM Sans" className={darkMode ? 'bg-gray-900' : 'bg-white'}>DM Sans</option>
              <option value="Plus Jakarta Sans" className={darkMode ? 'bg-gray-900' : 'bg-white'}>Plus Jakarta Sans</option>
              <option value="Work Sans" className={darkMode ? 'bg-gray-900' : 'bg-white'}>Work Sans</option>
              <option value="Instrument Sans" className={darkMode ? 'bg-gray-900' : 'bg-white'}>Instrument Sans</option>
              <option value="system-ui" className={darkMode ? 'bg-gray-900' : 'bg-white'}>System UI</option>
              <option value="Georgia" className={darkMode ? 'bg-gray-900' : 'bg-white'}>Georgia (Serif)</option>
              <option value="Times New Roman" className={darkMode ? 'bg-gray-900' : 'bg-white'}>Times New Roman (Serif)</option>
            </select>
          </div>

          {/* Font Weight */}
          <div className="mb-3">
            <label className="block text-xs font-semibold mb-2">
              Font Weight
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { value: '100', label: 'Thin' },
                { value: '200', label: 'Extra Light' },
                { value: '300', label: 'Light' },
                { value: '400', label: 'Normal' },
                { value: '500', label: 'Medium' },
                { value: '600', label: 'Semi Bold' },
                { value: '700', label: 'Bold' },
                { value: '800', label: 'Extra Bold' },
                { value: '900', label: 'Black' },
              ].map((weight) => (
                <button
                  key={weight.value}
                  onClick={() =>
                    updateElement(selectedElement.id, { fontWeight: weight.value })
                  }
                  className={`px-2 py-1.5 text-xs font-bold rounded border transition-colors ${
                    selectedElement.fontWeight === weight.value
                      ? 'bg-purple-600 text-white border-purple-600'
                      : darkMode
                      ? 'bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700'
                      : 'bg-white border-gray-300 text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  {weight.label}
                </button>
              ))}
            </div>
          </div>

          {/* Font Style */}
          <div className="mb-3">
            <label className="block text-xs font-semibold mb-2">
              Font Style
            </label>
            <div className="flex gap-2">
              {[
                { value: 'normal', label: 'Normal', icon: <span style={{fontStyle: 'normal'}}>Aa</span> },
                { value: 'italic', label: 'Italic', icon: <span style={{fontStyle: 'italic'}}>Aa</span> },
                { value: 'oblique', label: 'Oblique', icon: <span style={{fontStyle: 'oblique'}}>Aa</span> },
              ].map((style) => (
                <button
                  key={style.value}
                  onClick={() =>
                    updateElement(selectedElement.id, { fontStyle: style.value })
                  }
                  className={`flex-1 px-3 py-2 text-xs font-bold rounded border transition-colors flex items-center justify-center gap-1 ${
                    selectedElement.fontStyle === style.value
                      ? 'bg-purple-600 text-white border-purple-600'
                      : darkMode
                      ? 'bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700'
                      : 'bg-white border-gray-300 text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  {style.icon}
                  <span>{style.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Text Alignment */}
          <div className="mb-3">
            <label className="block text-xs font-semibold mb-2">
              Text Alignment
            </label>
            <div className="flex gap-2">
              {[
                { value: 'left', label: 'Left', icon: <span>◀</span> },
                { value: 'center', label: 'Center', icon: <span>⬛</span> },
                { value: 'right', label: 'Right', icon: <span>▶</span> },
              ].map((align) => (
                <button
                  key={align.value}
                  onClick={() =>
                    updateElement(selectedElement.id, { textAlign: align.value as any })
                  }
                  className={`flex-1 px-3 py-2 text-xs font-bold rounded border transition-colors flex items-center justify-center gap-1 ${
                    selectedElement.textAlign === align.value
                      ? 'bg-purple-600 text-white border-purple-600'
                      : darkMode
                      ? 'bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700'
                      : 'bg-white border-gray-300 text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  {align.icon}
                  <span>{align.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Line Height */}
          <div className="mb-3">
            <label className="block text-xs font-semibold mb-1">
              Line Height: {(selectedElement.lineHeight || 1.5).toFixed(1)}
            </label>
            <input
              type="range"
              min="1"
              max="3"
              step="0.1"
              value={selectedElement.lineHeight || 1.5}
              onChange={(e) =>
                updateElement(selectedElement.id, {
                  lineHeight: parseFloat(e.target.value),
                })
              }
              className="w-full accent-purple-600"
            />
          </div>

          {/* Letter Spacing */}
          <div>
            <label className="block text-xs font-semibold mb-1">
              Letter Spacing: {(selectedElement.letterSpacing || 0).toFixed(1)}px
            </label>
            <input
              type="range"
              min="-2"
              max="10"
              step="0.5"
              value={selectedElement.letterSpacing || 0}
              onChange={(e) =>
                updateElement(selectedElement.id, {
                  letterSpacing: parseFloat(e.target.value),
                })
              }
              className="w-full accent-purple-600"
            />
          </div>
        </div>
      )}

      {/* Light Modifiers - for light elements */}
      {isLight && (
        <div className="mb-4 p-3 bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-lg">
          <h4 className="text-xs font-bold text-purple-900 dark:text-purple-200 mb-3 flex items-center gap-2">
            <Filter size={14} />
            Light Modifiers
          </h4>

          {/* Modifier Type */}
          <div className="mb-3">
            <label className="block text-xs font-semibold mb-1">
              Modifier Type
            </label>
            <select
              value={lightSettings?.modifier || 'none'}
              onChange={(e) =>
                updateElement(selectedElement.id, {
                  lightSettings: {
                    ...lightSettings,
                    showSpread: lightSettings?.showSpread ?? false,
                    spreadAngle: lightSettings?.spreadAngle ?? 45,
                    spreadDistance: lightSettings?.spreadDistance ?? 200,
                    spreadOpacity: lightSettings?.spreadOpacity ?? 0.3,
                    colorMode: lightSettings?.colorMode ?? 'kelvin',
                    kelvin: lightSettings?.kelvin ?? 5600,
                    rgbColor: lightSettings?.rgbColor ?? '#FFFFFF',
                    modifier: e.target.value as LightModifierType,
                    modifierIntensity: lightSettings?.modifierIntensity ?? 0,
                  },
                })
              }
              className={`w-full px-3 py-2 text-sm font-medium border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 ${
                darkMode
                  ? 'bg-gray-800 border-gray-700 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="none">None</option>
              <option value="diffusion-full">Diffusion Full</option>
              <option value="diffusion-half">Diffusion Half</option>
              <option value="diffusion-quarter">Diffusion Quarter</option>
              <option value="diffusion-eighth">Diffusion Eighth</option>
              <option value="grid-10">Grid 10%</option>
              <option value="grid-20">Grid 20%</option>
              <option value="grid-30">Grid 30%</option>
              <option value="grid-40">Grid 40%</option>
              <option value="grid-60">Grid 60%</option>
              <option value="barn-doors">Barn Doors</option>
              <option value="negative-solid">Negative Solid</option>
              <option value="negative-net">Negative Net</option>
              <option value="bounce-white">Bounce White</option>
              <option value="bounce-silver">Bounce Silver</option>
              <option value="bounce-gold">Bounce Gold</option>
              <option value="scrim-single">Scrim Single</option>
              <option value="scrim-double">Scrim Double</option>
              <option value="flag-solid">Flag Solid</option>
              <option value="flag-cutter">Flag Cutter</option>
              <option value="flag-finger">Flag Finger</option>
              <option value="dot">Dot</option>
              <option value="finger">Finger</option>
            </select>
          </div>

          {/* Modifier Intensity */}
          <div className="mb-3">
            <label className="block text-xs font-semibold mb-1">
              Modifier Intensity: {(lightSettings?.modifierIntensity || 0).toFixed(1)}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={lightSettings?.modifierIntensity || 0}
              onChange={(e) =>
                updateElement(selectedElement.id, {
                  lightSettings: {
                    ...lightSettings,
                    showSpread: lightSettings?.showSpread ?? false,
                    spreadAngle: lightSettings?.spreadAngle ?? 45,
                    spreadDistance: lightSettings?.spreadDistance ?? 200,
                    spreadOpacity: lightSettings?.spreadOpacity ?? 0.3,
                    colorMode: lightSettings?.colorMode ?? 'kelvin',
                    kelvin: lightSettings?.kelvin ?? 5600,
                    rgbColor: lightSettings?.rgbColor ?? '#FFFFFF',
                    modifier: lightSettings?.modifier ?? 'none' as LightModifierType,
                    modifierIntensity: parseFloat(e.target.value),
                  },
                })
              }
              className="w-full accent-purple-600"
            />
          </div>
        </div>
      )}

      {/* Rotation */}
      <div className="mb-4">
        <label className="block text-xs font-bold mb-2">
          <RotateCw size={14} className="inline mr-1" />
          Rotation: {selectedElement.rotation}°
        </label>
        <input
          type="range"
          min="0"
          max="360"
          value={selectedElement.rotation}
          onChange={(e) =>
            updateElement(selectedElement.id, {
              rotation: parseInt(e.target.value),
            })
          }
          className="w-full accent-blue-600"
        />
        <div className="flex gap-2 mt-2">
          <button
            onClick={() =>
              updateElement(selectedElement.id, {
                rotation: (selectedElement.rotation - 15) % 360,
              })
            }
            className={`flex-1 px-2 py-1 text-xs font-semibold border rounded ${
              darkMode ? 'bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700' : 'bg-white border-gray-300 text-gray-800 hover:bg-gray-100'
            }`}
          >
            -15°
          </button>
          <button
            onClick={() =>
              updateElement(selectedElement.id, { rotation: 0 })
            }
            className={`flex-1 px-2 py-1 text-xs font-semibold border rounded ${
              darkMode ? 'bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700' : 'bg-white border-gray-300 text-gray-800 hover:bg-gray-100'
            }`}
          >
            Reset
          </button>
          <button
            onClick={() =>
              updateElement(selectedElement.id, {
                rotation: (selectedElement.rotation + 15) % 360,
              })
            }
            className={`flex-1 px-2 py-1 text-xs font-semibold border rounded ${
              darkMode ? 'bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700' : 'bg-white border-gray-300 text-gray-800 hover:bg-gray-100'
            }`}
          >
            +15°
          </button>
        </div>
      </div>

      {/* Scale */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-bold mb-0">
            <Minus size={14} className="inline mr-1" />
            Scale: {selectedElement.linkedScale !== false ? selectedElement.scale.toFixed(2) + 'x' : 'Unlinked'}
          </label>
          <button
            onClick={() =>
              updateElement(selectedElement.id, {
                linkedScale: !selectedElement.linkedScale,
                ...(!selectedElement.linkedScale ? { scale: Math.max(selectedElement.scaleX || selectedElement.scale, selectedElement.scaleY || selectedElement.scale) } : {})
              })
            }
            className={`flex items-center gap-1 px-2 py-1 text-xs font-semibold border rounded transition-colors ${
              selectedElement.linkedScale !== false
                ? 'bg-blue-600 text-white border-blue-600'
                : darkMode
                ? 'bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700'
                : 'bg-white border-gray-300 text-gray-800 hover:bg-gray-100'
            }`}
            title={selectedElement.linkedScale !== false ? 'Click to unlink scale (non-uniform)' : 'Click to link scale (uniform)'}
          >
            {selectedElement.linkedScale !== false ? <Link2 size={12} /> : <Link2Off size={12} />}
            <span className="hidden sm:inline">{selectedElement.linkedScale !== false ? 'Linked' : 'Unlinked'}</span>
          </button>
        </div>

        {selectedElement.linkedScale !== false ? (
          // Linked scale (uniform)
          <>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={selectedElement.scale}
              onChange={(e) =>
                updateElement(selectedElement.id, {
                  scale: parseFloat(e.target.value),
                  scaleX: undefined,
                  scaleY: undefined,
                })
              }
              className="w-full accent-blue-600"
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={() =>
                  updateElement(selectedElement.id, {
                    scale: Math.max(0.5, selectedElement.scale - 0.1),
                  })
                }
                className={`flex-1 px-2 py-1 text-xs font-semibold border rounded flex items-center justify-center ${
                  darkMode ? 'bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700' : 'bg-white border-gray-300 text-gray-800 hover:bg-gray-100'
                }`}
              >
                <Minus size={12} />
              </button>
              <button
                onClick={() =>
                  updateElement(selectedElement.id, { scale: 1, scaleX: undefined, scaleY: undefined })
                }
                className={`flex-1 px-2 py-1 text-xs font-semibold border rounded ${
                  darkMode ? 'bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700' : 'bg-white border-gray-300 text-gray-800 hover:bg-gray-100'
                }`}
              >
                Reset
              </button>
              <button
                onClick={() =>
                  updateElement(selectedElement.id, {
                    scale: Math.min(3, selectedElement.scale + 0.1),
                  })
                }
                className={`flex-1 px-2 py-1 text-xs font-semibold border rounded flex items-center justify-center ${
                  darkMode ? 'bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700' : 'bg-white border-gray-300 text-gray-800 hover:bg-gray-100'
                }`}
              >
                <Plus size={12} />
              </button>
            </div>
          </>
        ) : (
          // Unlinked scale (non-uniform)
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold mb-1">
                Scale X: {(selectedElement.scaleX || selectedElement.scale).toFixed(2)}x
              </label>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={selectedElement.scaleX || selectedElement.scale}
                onChange={(e) =>
                  updateElement(selectedElement.id, {
                    scaleX: parseFloat(e.target.value),
                  })
                }
                className="w-full accent-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">
                Scale Y: {(selectedElement.scaleY || selectedElement.scale).toFixed(2)}x
              </label>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={selectedElement.scaleY || selectedElement.scale}
                onChange={(e) =>
                  updateElement(selectedElement.id, {
                    scaleY: parseFloat(e.target.value),
                  })
                }
                className="w-full accent-blue-600"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  updateElement(selectedElement.id, {
                    scaleX: 1,
                    scaleY: 1,
                  })
                }
                className={`flex-1 px-2 py-1 text-xs font-semibold border rounded ${
                  darkMode ? 'bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700' : 'bg-white border-gray-300 text-gray-800 hover:bg-gray-100'
                }`}
              >
                Reset Both
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Position */}
      <div className="mb-4">
        <label className="block text-xs font-bold mb-2">
          Position (X, Y)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">X</label>
            <input
              type="number"
              value={Math.round(selectedElement.x)}
              onChange={(e) =>
                updateElement(selectedElement.id, {
                  x: parseInt(e.target.value) || 0,
                })
              }
              className={`w-full px-2 py-1 text-xs font-bold border rounded focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                darkMode
                  ? 'bg-gray-800 border-gray-700 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Y</label>
            <input
              type="number"
              value={Math.round(selectedElement.y)}
              onChange={(e) =>
                updateElement(selectedElement.id, {
                  y: parseInt(e.target.value) || 0,
                })
              }
              className={`w-full px-2 py-1 text-xs font-bold border rounded focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                darkMode
                  ? 'bg-gray-800 border-gray-700 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="pt-4 border-t border-gray-300 dark:border-gray-800 space-y-2">
        <button
          onClick={() => duplicateElement(selectedElement.id)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-bold bg-blue-900 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Copy size={16} />
          Duplicate
        </button>
        <button
          onClick={() => deleteElement(selectedElement.id)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-bold bg-red-800 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm"
        >
          <Trash2 size={16} />
          Delete
        </button>
      </div>
    </div>
  );
};

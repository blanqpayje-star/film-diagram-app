export type ElementType =
  | 'camera'
  | 'light-softbox'
  | 'light-umbrella'
  | 'light-fresnel'
  | 'light-led-panel'
  | 'light-practical'
  | 'light-kino'
  | 'actor'
  | 'prop'
  | 'wall'
  | 'door'
  | 'window'
  | 'furniture'
  | 'custom'
  | 'cad-rectangle'
  | 'cad-line'
  | 'measurement';

export type LightModifier = 'softbox' | 'umbrella' | 'fresnel' | 'led-panel' | 'kino' | 'practical';

export type CameraSensorSize =
  | 'super35'
  | 'full-frame'
  | 'aps-c'
  | 'micro-43'
  | 'medium-format'
  | 'super16';

export type ColorMode = 'kelvin' | 'rgb';

export interface CameraSettings {
  sensorSize: CameraSensorSize;
  focalLength: number; // in mm
  showFOV: boolean;
  fovOpacity: number;
}

export interface LightSettings {
  showSpread: boolean;
  spreadAngle: number; // degrees (15-120)
  spreadDistance: number; // pixels (100-500)
  spreadOpacity: number;
  colorMode: ColorMode;
  kelvin: number; // 2700K - 6500K
  rgbColor: string; // hex color
}

export interface DiagramElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  label: string;
  color: string;
  customIcon?: string;

  // Camera-specific
  cameraSettings?: CameraSettings;

  // Light-specific
  lightSettings?: LightSettings;

  // CAD-specific
  width?: number;
  height?: number;
  endX?: number;
  endY?: number;
  cadIcon?: string;

  // Measurement-specific
  measurementUnit?: 'ft' | 'm' | 'in';
}

export interface Scene {
  id: string;
  name: string;
  elements: DiagramElement[];
  notes: string;
  createdAt: number;
  updatedAt: number;
}

export interface AppState {
  scenes: Scene[];
  currentSceneId: string | null;
  selectedElementId: string | null;
  gridEnabled: boolean;
  snapToGrid: boolean;
  gridSize: number;
  canvasWidth: number;
  canvasHeight: number;
  drawingMode: 'select' | 'cad-rectangle' | 'cad-line' | 'measurement';
  measurementUnit: 'ft' | 'm' | 'in';
  darkMode: boolean;
  canvasBackground: string; // color or 'none'
  canvasBackgroundImage?: string; // base64 image data
}

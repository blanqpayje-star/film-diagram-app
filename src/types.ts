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
  | 'stairs'
  | 'column'
  | 'table-dining'
  | 'table-coffee'
  | 'table-side'
  | 'chair-armchair'
  | 'chair-dining'
  | 'chair-office'
  | 'sofa'
  | 'bed'
  | 'nightstand'
  | 'desk'
  | 'custom'
  | 'cad-rectangle'
  | 'cad-line'
  | 'measurement'
  | 'text';

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
  fovDistance?: number; // pixels (50-500)
}

export type LightModifierType =
  | 'none'
  | 'diffusion-full'
  | 'diffusion-half'
  | 'diffusion-quarter'
  | 'diffusion-eighth'
  | 'grid-10'
  | 'grid-20'
  | 'grid-30'
  | 'grid-40'
  | 'grid-60'
  | 'barn-doors'
  | 'negative-solid'
  | 'negative-net'
  | 'bounce-white'
  | 'bounce-silver'
  | 'bounce-gold'
  | 'scrim-single'
  | 'scrim-double'
  | 'flag-solid'
  | 'flag-cutter'
  | 'flag-finger'
  | 'dot'
  | 'finger';

export interface LightSettings {
  showSpread: boolean;
  spreadAngle: number; // degrees (15-120)
  spreadDistance: number; // pixels (100-500)
  spreadOpacity: number;
  colorMode: ColorMode;
  kelvin: number; // 2700K - 6500K
  rgbColor: string; // hex color
  modifier: LightModifierType; // Light modifier
  modifierIntensity: number; // 0-1 intensity of modifier effect
}

export interface DiagramElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  scaleX?: number; // For unlinked scale (overrides scale when set)
  scaleY?: number; // For unlinked scale (overrides scale when set)
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

  // Text-specific
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  fontStyle?: string;
  textAlign?: 'left' | 'center' | 'right';
  lineHeight?: number;
  letterSpacing?: number;

  // Transform toggle
  linkedScale?: boolean; // When true (default), scale is uniform; when false, scaleX/scaleY are independent
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
  drawingMode: 'select' | 'cad-rectangle' | 'cad-line' | 'measurement' | 'text';
  measurementUnit: 'ft' | 'm' | 'in';
  darkMode: boolean;
  canvasBackground: string; // color or 'none'
  canvasBackgroundImage?: string; // base64 image data
  leftPanelCollapsed: boolean;
  rightPanelCollapsed: boolean;
}

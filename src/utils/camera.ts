import type { CameraSensorSize } from '../types';

// Sensor dimensions in mm (width x height)
export const SENSOR_SIZES: Record<CameraSensorSize, { width: number; height: number; name: string }> = {
  'super35': { width: 24.89, height: 18.66, name: 'Super 35mm' },
  'full-frame': { width: 36, height: 24, name: 'Full Frame (35mm)' },
  'aps-c': { width: 23.5, height: 15.6, name: 'APS-C' },
  'micro-43': { width: 17.3, height: 13, name: 'Micro Four Thirds' },
  'medium-format': { width: 43.8, height: 32.9, name: 'Medium Format' },
  'super16': { width: 12.52, height: 7.41, name: 'Super 16mm' },
};

// Calculate horizontal FOV angle in degrees
export function calculateHorizontalFOV(sensorSize: CameraSensorSize, focalLength: number): number {
  const sensor = SENSOR_SIZES[sensorSize];
  const fovRadians = 2 * Math.atan(sensor.width / (2 * focalLength));
  return (fovRadians * 180) / Math.PI;
}

// Calculate vertical FOV angle in degrees
export function calculateVerticalFOV(sensorSize: CameraSensorSize, focalLength: number): number {
  const sensor = SENSOR_SIZES[sensorSize];
  const fovRadians = 2 * Math.atan(sensor.height / (2 * focalLength));
  return (fovRadians * 180) / Math.PI;
}

// Common focal lengths with their typical uses
export const COMMON_FOCAL_LENGTHS = [
  { value: 14, label: '14mm - Ultra Wide' },
  { value: 18, label: '18mm - Wide' },
  { value: 24, label: '24mm - Wide' },
  { value: 28, label: '28mm - Wide' },
  { value: 35, label: '35mm - Standard Wide' },
  { value: 50, label: '50mm - Standard' },
  { value: 85, label: '85mm - Portrait' },
  { value: 100, label: '100mm - Portrait/Medium Tele' },
  { value: 135, label: '135mm - Telephoto' },
  { value: 200, label: '200mm - Telephoto' },
];

// Calculate distance scale for measurement tools
export function calculatePixelsPerUnit(_unit: 'ft' | 'm' | 'in', canvasWidth: number, sceneWidth: number): number {
  // Assume canvas represents sceneWidth in the given unit
  // Default: 20 units wide
  return canvasWidth / sceneWidth;
}

// Convert between units
export function convertUnits(value: number, from: 'ft' | 'm' | 'in', to: 'ft' | 'm' | 'in'): number {
  // Convert to meters first
  let meters: number;
  switch (from) {
    case 'ft':
      meters = value * 0.3048;
      break;
    case 'in':
      meters = value * 0.0254;
      break;
    default:
      meters = value;
  }

  // Convert to target unit
  switch (to) {
    case 'ft':
      return meters / 0.3048;
    case 'in':
      return meters / 0.0254;
    default:
      return meters;
  }
}

// Calculate distance between two points
export function calculateDistance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

// Format distance with unit
export function formatDistance(pixels: number, pixelsPerUnit: number, unit: 'ft' | 'm' | 'in'): string {
  const distance = pixels / pixelsPerUnit;
  return `${distance.toFixed(2)}${unit}`;
}

// Convert Kelvin temperature (2700K-6500K) to RGB hex color
export function kelvinToRGB(kelvin: number): string {
  // Clamp kelvin between 2700 and 6500
  const temp = Math.max(2700, Math.min(6500, kelvin)) / 100;

  let r, g, b;

  // Calculate red
  if (temp <= 66) {
    r = 255;
  } else {
    r = temp - 60;
    r = 329.698727446 * Math.pow(r, -0.1332047592);
    r = Math.max(0, Math.min(255, r));
  }

  // Calculate green
  if (temp <= 66) {
    g = temp;
    g = 99.4708025861 * Math.log(g) - 161.1195681661;
  } else {
    g = temp - 60;
    g = 288.1221695283 * Math.pow(g, -0.0755148492);
  }
  g = Math.max(0, Math.min(255, g));

  // Calculate blue
  if (temp >= 66) {
    b = 255;
  } else if (temp <= 19) {
    b = 0;
  } else {
    b = temp - 10;
    b = 138.5177312231 * Math.log(b) - 305.0447927307;
    b = Math.max(0, Math.min(255, b));
  }

  // Convert to hex
  const toHex = (val: number) => {
    const hex = Math.round(val).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Get color name for Kelvin temperature
export function getKelvinName(kelvin: number): string {
  if (kelvin < 3000) return 'Warm (Tungsten)';
  if (kelvin < 3500) return 'Warm White';
  if (kelvin < 4500) return 'Neutral';
  if (kelvin < 5500) return 'Cool White';
  if (kelvin < 6000) return 'Daylight';
  return 'Cool (Overcast)';
}

// Common Kelvin presets for film lighting
export const KELVIN_PRESETS = [
  { value: 2700, label: '2700K - Tungsten' },
  { value: 3200, label: '3200K - Tungsten Studio' },
  { value: 4300, label: '4300K - Fluorescent' },
  { value: 5600, label: '5600K - Daylight' },
  { value: 6500, label: '6500K - Overcast' },
];

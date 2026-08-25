import type { ElementType } from '../../types';

// High-quality base icons sourced from game-icons.net (CC BY 3.0).
// Each SVG is imported as raw markup so the element color can be injected
// at render time (the source art uses a black background path plus white
// foreground paths, which we strip/recolor).
import camera from './camera.svg?raw';
import lightSoftbox from './light-softbox.svg?raw';
import lightUmbrella from './light-umbrella.svg?raw';
import lightFresnel from './light-fresnel.svg?raw';
import lightLedPanel from './light-led-panel.svg?raw';
import lightKino from './light-kino.svg?raw';
import lightPractical from './light-practical.svg?raw';
import actor from './actor.svg?raw';
import prop from './prop.svg?raw';
import wall from './wall.svg?raw';
import door from './door.svg?raw';
import windowIcon from './window.svg?raw';
import stairs from './stairs.svg?raw';
import column from './column.svg?raw';
import tableDining from './table-dining.svg?raw';
import tableCoffee from './table-coffee.svg?raw';
import tableSide from './table-side.svg?raw';
import chairArmchair from './chair-armchair.svg?raw';
import chairDining from './chair-dining.svg?raw';
import chairOffice from './chair-office.svg?raw';
import sofa from './sofa.svg?raw';
import bed from './bed.svg?raw';
import nightstand from './nightstand.svg?raw';
import desk from './desk.svg?raw';
import measurement from './measurement.svg?raw';

export const downloadedIcons: Partial<Record<ElementType, string>> = {
  camera,
  'light-softbox': lightSoftbox,
  'light-umbrella': lightUmbrella,
  'light-fresnel': lightFresnel,
  'light-led-panel': lightLedPanel,
  'light-kino': lightKino,
  'light-practical': lightPractical,
  actor,
  prop,
  wall,
  door,
  window: windowIcon,
  stairs,
  column,
  'table-dining': tableDining,
  'table-coffee': tableCoffee,
  'table-side': tableSide,
  'chair-armchair': chairArmchair,
  'chair-dining': chairDining,
  'chair-office': chairOffice,
  sofa,
  bed,
  nightstand,
  desk,
  measurement,
};

const BACKGROUND_PATH = /<path d="M0 0h512v512H0z"\s*\/>/;

/**
 * Returns the raw SVG markup for a downloaded icon, recolored to the given
 * element color. Returns null when no downloaded icon exists for the type.
 */
export const getDownloadedIconSvg = (
  type: ElementType,
  color: string
): string | null => {
  const raw = downloadedIcons[type];
  if (!raw) return null;
  return raw
    .replace(BACKGROUND_PATH, '')
    .replace(/fill="#fff"/g, `fill="${color}"`)
    .replace('<svg ', '<svg width="100%" height="100%" ');
};
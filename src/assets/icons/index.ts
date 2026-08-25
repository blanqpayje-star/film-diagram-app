import type { ElementType } from '../../types';

// Authentic top-down lighting-diagram icons sourced from
// lightingdiagrams.com (camera + lighting equipment). These are fixed-color
// artwork rendered as images.
import cameraDiagram from './camera.png';
import lightSoftboxDiagram from './light-softbox.png';
import lightUmbrellaDiagram from './light-umbrella.png';
import lightFresnelDiagram from './light-fresnel.png';
import lightLedPanelDiagram from './light-led-panel.png';
import lightKinoDiagram from './light-kino.png';
import lightPracticalDiagram from './light-practical.png';
import actorDiagram from './actor.png';

// High-quality monochrome SVGs sourced from game-icons.net (CC BY 3.0).
// Each SVG is imported as raw markup so the element color can be injected
// at render time (the source art uses a black background path plus white
// foreground paths, which we strip/recolor).
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

/**
 * Fixed-color diagram icons (lightingdiagrams.com style) used for camera
 * and lighting equipment. Rendered as images, not recolored.
 */
export const diagramIcons: Partial<Record<ElementType, string>> = {
  camera: cameraDiagram,
  actor: actorDiagram,
  'light-softbox': lightSoftboxDiagram,
  'light-umbrella': lightUmbrellaDiagram,
  'light-fresnel': lightFresnelDiagram,
  'light-led-panel': lightLedPanelDiagram,
  'light-kino': lightKinoDiagram,
  'light-practical': lightPracticalDiagram,
};

/** Recolorable monochrome SVG icons (game-icons.net) for set pieces. */
const downloadedIcons: Partial<Record<ElementType, string>> = {
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

/** Returns the image URL of a fixed-color diagram icon, if one exists. */
export const getDiagramIconUrl = (type: ElementType): string | null => {
  return diagramIcons[type] ?? null;
};
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
// Set & prop icons are now authored directly in ElementIcon.tsx as detailed,
// recolorable top-down floor-plan art, so these legacy raw imports are unused.

/**
 * Intrinsic pixel dimensions of the fixed-color diagram icons. The icons are
 * letterboxed inside their square frame by object-fit: contain, so the canvas
 * uses these to anchor FOV / spread cones at the artwork's actual emitting
 * edge instead of the frame edge.
 */
export const diagramIconSizes: Partial<Record<ElementType, { width: number; height: number }>> = {
  camera: { width: 48, height: 37 },
  actor: { width: 48, height: 23 },
  'light-softbox': { width: 48, height: 24 },
  'light-umbrella': { width: 48, height: 33 },
  'light-fresnel': { width: 31, height: 48 },
  'light-led-panel': { width: 48, height: 38 },
  'light-kino': { width: 19, height: 48 },
  'light-practical': { width: 48, height: 47 },
};

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

/**
 * Recolorable monochrome SVG icons.
 * Set & props now render as detailed top-down floor-plan artwork inside
 * ElementIcon.tsx, so this map is intentionally empty (returns null → fallback).
 */
const downloadedIcons: Partial<Record<ElementType, string>> = {};

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
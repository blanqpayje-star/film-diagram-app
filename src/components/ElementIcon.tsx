import React from 'react';
import type { ElementType } from '../types';
import { getDownloadedIconSvg, getDiagramIconUrl } from '../assets/icons';

interface IconProps {
  type: ElementType;
  size?: number;
  color?: string;
  rotation?: number;
  customIcon?: string;
  // Text element properties
  label?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  fontStyle?: string;
  textAlign?: 'left' | 'center' | 'right';
}

// Cones use 0° as the direction pointing right. The light SVGs are drawn
// upright (their emitting side points up), so shift their visual baseline to
// the same coordinate system before applying the element's rotation.
const LIGHT_TYPES = new Set<ElementType>([
  'light-softbox',
  'light-umbrella',
  'light-fresnel',
  'light-led-panel',
  'light-kino',
  'light-practical',
]);

// Some fixed-color artworks are drawn facing -X (the camera photo's lens
// points left). Cones emit toward +X at 0° rotation, so mirror those icons
// so the equipment visually faces its own FOV / spread cone.
const FLIP_X_TYPES = new Set<ElementType>(['camera']);

// Fixed-color artworks are drawn in their natural orientation. Cones emit
// toward +X at 0° rotation, so give each type a base rotation that aligns
// its facing with +X before applying the element's rotation: the top-down
// camera artwork points up, so rotate it 90° clockwise (to the right).
const BASE_ICON_ROTATION: Partial<Record<ElementType, number>> = {
  camera: 90,
};

export const ElementIcon: React.FC<IconProps> = ({
  type,
  size = 40,
  color = '#000000',
  rotation = 0,
  customIcon,
  label,
  fontFamily,
  fontSize,
  fontWeight,
  fontStyle,
}) => {
  const iconRotation =
    rotation + (LIGHT_TYPES.has(type) ? -90 : BASE_ICON_ROTATION[type] ?? 0);
  const style = {
    width: size,
    height: size,
    transform: `rotate(${iconRotation}deg)`,
    transformOrigin: 'center',
  };

  // Use custom icon if provided
  if (customIcon && type === 'custom') {
    return (
      <div className="element-icon" style={style}>
        <img src={customIcon} alt="Custom" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </div>
    );
  }

  // Use authentic lighting-diagram icon (fixed-color artwork) when available
  const diagramIconUrl = getDiagramIconUrl(type);
  if (diagramIconUrl) {
    const iconStyle = FLIP_X_TYPES.has(type)
      ? { ...style, transform: `${style.transform} scaleX(-1)` }
      : style;
    return (
      <div className="element-icon" style={iconStyle}>
        <img
          src={diagramIconUrl}
          alt={type}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          draggable={false}
        />
      </div>
    );
  }

  // Use downloaded high-quality base icon when available for this type
  const downloadedSvg = getDownloadedIconSvg(type, color);
  if (downloadedSvg) {
    return (
      <div
        className="element-icon"
        style={style}
        dangerouslySetInnerHTML={{ __html: downloadedSvg }}
      />
    );
  }

  const renderIcon = () => {
    switch (type) {
      case 'camera':
        return (
          <svg viewBox="0 0 100 100" style={style}>
            {/* Camera body - facing right towards the cone */}
            <path
              d="M20 30 L50 30 L60 20 L70 20 L70 80 L20 80 Z"
              fill={color}
              stroke="#333"
              strokeWidth="2"
            />
            {/* Lens - on the right side facing the cone */}
            <circle cx="58" cy="55" r="14" fill="none" stroke="#333" strokeWidth="2" />
            <circle cx="58" cy="55" r="10" fill="none" stroke="#333" strokeWidth="1.5" />
            {/* Viewfinder on top left */}
            <rect x="25" y="22" width="12" height="10" fill="#333" rx="1" />
            {/* Red recording indicator on the right side */}
            <circle cx="72" cy="32" r="5" fill="#ff0000" />
          </svg>
        );

      case 'light-softbox':
        return (
          <svg viewBox="0 0 100 100" style={style}>
            {/* Softbox body */}
            <rect x="25" y="20" width="50" height="35" rx="3" fill={color} stroke="#333" strokeWidth="2" />
            {/* Grid pattern */}
            <line x1="50" y1="20" x2="50" y2="55" stroke="#333" strokeWidth="1" opacity="0.4" />
            <line x1="25" y1="37.5" x2="75" y2="37.5" stroke="#333" strokeWidth="1" opacity="0.4" />
            {/* Stand */}
            <line x1="50" y1="55" x2="50" y2="75" stroke="#333" strokeWidth="3" />
            <polygon points="40,75 60,75 55,85 45,85" fill="#333" />
          </svg>
        );

      case 'light-umbrella':
        return (
          <svg viewBox="0 0 100 100" style={style}>
            {/* Umbrella arc */}
            <path
              d="M 25 45 Q 50 25 75 45"
              fill={color}
              stroke="#333"
              strokeWidth="2"
            />
            {/* Umbrella ribs */}
            <line x1="50" y1="27" x2="50" y2="45" stroke="#333" strokeWidth="1.5" />
            <line x1="35" y1="35" x2="50" y2="45" stroke="#333" strokeWidth="1" />
            <line x1="65" y1="35" x2="50" y2="45" stroke="#333" strokeWidth="1" />
            {/* Stand */}
            <line x1="50" y1="45" x2="50" y2="75" stroke="#333" strokeWidth="3" />
            <polygon points="40,75 60,75 55,85 45,85" fill="#333" />
          </svg>
        );

      case 'light-fresnel':
        return (
          <svg viewBox="0 0 100 100" style={style}>
            {/* Fresnel body - cylindrical */}
            <ellipse cx="50" cy="30" rx="18" ry="8" fill={color} stroke="#333" strokeWidth="2" />
            <rect x="32" y="30" width="36" height="25" fill={color} stroke="#333" strokeWidth="2" />
            <ellipse cx="50" cy="55" rx="18" ry="8" fill={color} stroke="#333" strokeWidth="2" />
            {/* Lens rings */}
            <ellipse cx="50" cy="42.5" rx="14" ry="6" fill="none" stroke="#333" strokeWidth="1" opacity="0.5" />
            {/* Barn doors */}
            <rect x="28" y="35" width="3" height="15" fill="#333" />
            <rect x="69" y="35" width="3" height="15" fill="#333" />
            {/* Stand */}
            <line x1="50" y1="55" x2="50" y2="75" stroke="#333" strokeWidth="3" />
            <polygon points="40,75 60,75 55,85 45,85" fill="#333" />
          </svg>
        );

      case 'light-led-panel':
        return (
          <svg viewBox="0 0 100 100" style={style}>
            {/* LED Panel */}
            <rect x="20" y="25" width="60" height="35" rx="2" fill={color} stroke="#333" strokeWidth="2" />
            {/* LED grid */}
            {[0, 1, 2, 3, 4].map((row) =>
              [0, 1, 2, 3, 4, 5].map((col) => (
                <circle
                  key={`${row}-${col}`}
                  cx={25 + col * 10}
                  cy={30 + row * 7}
                  r="1.5"
                  fill="#333"
                  opacity="0.3"
                />
              ))
            )}
            {/* Stand */}
            <line x1="50" y1="60" x2="50" y2="75" stroke="#333" strokeWidth="3" />
            <polygon points="40,75 60,75 55,85 45,85" fill="#333" />
          </svg>
        );

      case 'light-kino':
        return (
          <svg viewBox="0 0 100 100" style={style}>
            {/* Kino Flo housing */}
            <rect x="15" y="30" width="70" height="25" rx="2" fill={color} stroke="#333" strokeWidth="2" />
            {/* Tubes */}
            <rect x="18" y="35" width="64" height="5" rx="2" fill="#fff" stroke="#333" strokeWidth="1" />
            <rect x="18" y="42" width="64" height="5" rx="2" fill="#fff" stroke="#333" strokeWidth="1" />
            <rect x="18" y="49" width="64" height="5" rx="2" fill="#fff" stroke="#333" strokeWidth="1" />
            {/* Mount */}
            <rect x="45" y="55" width="10" height="8" fill="#333" />
            <line x1="50" y1="63" x2="50" y2="75" stroke="#333" strokeWidth="3" />
            <polygon points="40,75 60,75 55,85 45,85" fill="#333" />
          </svg>
        );

      case 'light-practical':
        return (
          <svg viewBox="0 0 100 100" style={style}>
            <circle cx="50" cy="40" r="15" fill={color} stroke="#333" strokeWidth="2" />
            <line x1="50" y1="55" x2="50" y2="75" stroke="#333" strokeWidth="2" />
            <rect x="40" y="75" width="20" height="8" fill={color} stroke="#333" strokeWidth="2" />
          </svg>
        );

      case 'actor':
        return (
          <svg viewBox="0 0 100 100" style={style}>
            <circle cx="50" cy="30" r="12" fill={color} stroke="#333" strokeWidth="2" />
            <line x1="50" y1="42" x2="50" y2="65" stroke="#333" strokeWidth="3" />
            <line x1="50" y1="50" x2="35" y2="60" stroke="#333" strokeWidth="3" />
            <line x1="50" y1="50" x2="65" y2="60" stroke="#333" strokeWidth="3" />
            <line x1="50" y1="65" x2="38" y2="85" stroke="#333" strokeWidth="3" />
            <line x1="50" y1="65" x2="62" y2="85" stroke="#333" strokeWidth="3" />
          </svg>
        );

      case 'prop':
        return (
          <svg viewBox="0 0 100 100" style={style}>
            {/* Shipping/production crate, top-down */}
            <rect x="24" y="24" width="52" height="52" rx="4" fill={color} stroke="#333" strokeWidth="2" />
            <rect x="31" y="31" width="38" height="38" rx="2" fill="none" stroke="#333" strokeOpacity="0.45" strokeWidth="1.2" />
            <line x1="31" y1="31" x2="69" y2="69" stroke="#333" strokeOpacity="0.35" strokeWidth="1" />
            <line x1="69" y1="31" x2="31" y2="69" stroke="#333" strokeOpacity="0.35" strokeWidth="1" />
            {/* Handling cleats on the top */}
            <rect x="46" y="24" width="8" height="6" rx="1.5" fill={color} stroke="#333" strokeWidth="1" />
            <rect x="46" y="70" width="8" height="6" rx="1.5" fill={color} stroke="#333" strokeWidth="1" />
            <circle cx="50" cy="34" r="2.5" fill="#333" />
            <circle cx="50" cy="66" r="2.5" fill="#333" />
          </svg>
        );

      case 'wall':
        return (
          <svg viewBox="0 0 100 100" style={style}>
            <defs>
              <pattern id="wallHatch" width="7" height="7" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2="0" y2="7" stroke="#ffffff" strokeOpacity="0.6" strokeWidth="1" />
              </pattern>
            </defs>
            {/* Wall mass with section hatching (like a plan section hatched in CAD) */}
            <rect x="6" y="36" width="88" height="28" fill={color} stroke="#333" strokeWidth="2" />
            <rect x="6" y="36" width="88" height="28" fill="url(#wallHatch)" stroke="none" />
            {/* face lines */}
            <line x1="6" y1="40" x2="94" y2="40" stroke="#fff" strokeOpacity="0.35" strokeWidth="1" />
            <line x1="6" y1="60" x2="94" y2="60" stroke="#fff" strokeOpacity="0.35" strokeWidth="1" />
          </svg>
        );

      case 'door':
        return (
          <svg viewBox="0 0 100 100" style={style}>
            {/* Wall runs horizontally with a door opening */}
            <rect x="8" y="42" width="22" height="16" fill={color} stroke="#333" strokeWidth="2" />
            <rect x="70" y="42" width="22" height="16" fill={color} stroke="#333" strokeWidth="2" />
            {/* Door jambs */}
            <line x1="30" y1="42" x2="30" y2="58" stroke="#333" strokeWidth="2" />
            <line x1="70" y1="42" x2="70" y2="58" stroke="#333" strokeWidth="2" />
            {/* Closed leaf across the opening */}
            <rect x="30" y="47" width="40" height="6" rx="1" fill={color} stroke="#333" strokeWidth="1.5" />
            {/* Swing arc (radius = leaf length) */}
            <path d="M32 50 A40 40 0 0 0 66 16" fill="none" stroke="#333" strokeWidth="1.5" strokeDasharray="4,3" />
            {/* Hinge */}
            <circle cx="30" cy="51" r="2.5" fill="#333" />
          </svg>
        );

      case 'window':
        return (
          <svg viewBox="0 0 100 100" style={style}>
            {/* Wall with an in-wall glazing reveal */}
            <rect x="8" y="36" width="84" height="28" fill={color} stroke="#333" strokeWidth="2" />
            <rect x="8" y="43" width="84" height="14" fill="rgba(255,255,255,0.12)" stroke="none" />
            {/* Glass plane lines */}
            <line x1="10" y1="47" x2="90" y2="47" stroke="#ffffff" strokeWidth="1.6" />
            <line x1="10" y1="53" x2="90" y2="53" stroke="#ffffff" strokeWidth="1.6" />
            {/* Mullions / vertical sections */}
            <line x1="34" y1="40" x2="34" y2="60" stroke="#ffffff" strokeWidth="1.6" />
            <line x1="50" y1="40" x2="50" y2="60" stroke="#ffffff" strokeWidth="1.6" />
            <line x1="66" y1="40" x2="66" y2="60" stroke="#ffffff" strokeWidth="1.6" />
          </svg>
        );

      case 'table-dining':
        return (
          <svg viewBox="0 0 100 100" style={style}>
            {/* Round dining table with 4 chairs, top-down */}
            <circle cx="50" cy="50" r="26" fill={color} stroke="#333" strokeWidth="2" />
            <circle cx="50" cy="50" r="19" fill="none" stroke="#333" strokeWidth="1" opacity="0.5" />
            <circle cx="50" cy="50" r="4" fill="#333" />
            {/* Chairs around the table */}
            <rect x="43" y="8" width="14" height="12" rx="3" fill={color} stroke="#333" strokeWidth="1.6" />
            <rect x="43" y="80" width="14" height="12" rx="3" fill={color} stroke="#333" strokeWidth="1.6" />
            <rect x="8" y="44" width="12" height="12" rx="3" fill={color} stroke="#333" strokeWidth="1.6" />
            <rect x="80" y="44" width="12" height="12" rx="3" fill={color} stroke="#333" strokeWidth="1.6" />
          </svg>
        );

      case 'table-coffee':
        return (
          <svg viewBox="0 0 100 100" style={style}>
            {/* Long low coffee table, top-down */}
            <rect x="14" y="32" width="72" height="36" rx="10" fill={color} stroke="#333" strokeWidth="2" />
            <line x1="26" y1="50" x2="74" y2="50" stroke="#333" strokeWidth="1" opacity="0.35" />
            <line x1="50" y1="36" x2="50" y2="64" stroke="#333" strokeWidth="1" opacity="0.35" />
            {/* Legs */}
            <circle cx="26" cy="42" r="3" fill="#333" />
            <circle cx="74" cy="42" r="3" fill="#333" />
            <circle cx="26" cy="58" r="3" fill="#333" />
            <circle cx="74" cy="58" r="3" fill="#333" />
          </svg>
        );

      case 'table-side':
        return (
          <svg viewBox="0 0 100 100" style={style}>
            {/* Round side table, top-down */}
            <circle cx="50" cy="50" r="24" fill={color} stroke="#333" strokeWidth="2" />
            <circle cx="50" cy="50" r="16" fill="none" stroke="#333" strokeWidth="1" opacity="0.5" />
            <line x1="30" y1="34" x2="70" y2="66" stroke="#333" strokeWidth="1" opacity="0.3" />
            <circle cx="50" cy="50" r="3.5" fill="#333" />
          </svg>
        );

      case 'chair-armchair':
        return (
          <svg viewBox="0 0 100 100" style={style}>
            {/* Armchair, top-down: back, seat, two arms */}
            <rect x="24" y="14" width="52" height="12" rx="5" fill={color} stroke="#333" strokeWidth="2" />
            <rect x="24" y="26" width="52" height="34" rx="7" fill={color} stroke="#333" strokeWidth="2" />
            <rect x="14" y="28" width="12" height="30" rx="5" fill={color} stroke="#333" strokeWidth="2" />
            <rect x="74" y="28" width="12" height="30" rx="5" fill={color} stroke="#333" strokeWidth="2" />
            <rect x="30" y="31" width="40" height="23" rx="5" fill="rgba(255,255,255,0.28)" stroke="#333" strokeOpacity="0.45" strokeWidth="1" />
            <line x1="50" y1="31" x2="50" y2="54" stroke="#333" strokeWidth="1" opacity="0.4" />
          </svg>
        );

      case 'chair-dining':
        return (
          <svg viewBox="0 0 100 100" style={style}>
            {/* Dining chair, top-down: seat + 4 legs */}
            <rect x="28" y="28" width="44" height="44" rx="7" fill={color} stroke="#333" strokeWidth="2" />
            <rect x="34" y="34" width="32" height="32" rx="3" fill="none" stroke="#333" strokeWidth="1" opacity="0.45" />
            <circle cx="28" cy="28" r="3" fill="#333" />
            <circle cx="72" cy="28" r="3" fill="#333" />
            <circle cx="28" cy="72" r="3" fill="#333" />
            <circle cx="72" cy="72" r="3" fill="#333" />
          </svg>
        );

      case 'chair-office':
        return (
          <svg viewBox="0 0 100 100" style={style}>
            {/* Office chair, top-down: swivel base + casters */}
            {[
              [50, 18],
              [80, 40],
              [69, 76],
              [31, 76],
              [20, 40],
            ].map(([x, y], i) => (
              <g key={i}>
                <line x1="50" y1="50" x2={x} y2={y} stroke="#333" strokeWidth="2" />
                <circle cx={x} cy={y} r="3" fill="#333" />
              </g>
            ))}
            {/* Seat cushion */}
            <circle cx="50" cy="50" r="14" fill={color} stroke="#333" strokeWidth="2" />
            <circle cx="50" cy="50" r="6" fill="#333" />
          </svg>
        );

      case 'sofa':
        return (
          <svg viewBox="0 0 100 100" style={style}>
            {/* Sofa, top-down: back, arms, cushions + throw pillows */}
            <rect x="16" y="16" width="68" height="14" rx="6" fill={color} stroke="#333" strokeWidth="2" />
            <rect x="16" y="30" width="68" height="34" rx="7" fill={color} stroke="#333" strokeWidth="2" />
            <rect x="8" y="30" width="11" height="30" rx="5" fill={color} stroke="#333" strokeWidth="2" />
            <rect x="81" y="30" width="11" height="30" rx="5" fill={color} stroke="#333" strokeWidth="2" />
            {/* Seat cushions */}
            <rect x="23" y="34" width="30" height="24" rx="5" fill="rgba(255,255,255,0.26)" stroke="#333" strokeWidth="1" strokeOpacity="0.45" />
            <rect x="55" y="34" width="22" height="24" rx="5" fill="rgba(255,255,255,0.22)" stroke="#333" strokeWidth="1" strokeOpacity="0.45" />
            <line x1="51" y1="34" x2="51" y2="58" stroke="#333" strokeWidth="1" opacity="0.3" />
            {/* Throw pillows */}
            <rect x="23" y="33" width="11" height="7" rx="3" fill="#ffffff" stroke="#333" strokeOpacity="0.5" strokeWidth="1" />
            <rect x="58" y="33" width="11" height="7" rx="3" fill="#ffffff" stroke="#333" strokeOpacity="0.5" strokeWidth="1" />
          </svg>
        );

      case 'bed':
        return (
          <svg viewBox="0 0 100 100" style={style}>
            {/* King bed, top-down */}
            <rect x="16" y="8" width="68" height="84" rx="6" fill={color} stroke="#333" strokeWidth="2" />
            {/* Headboard */}
            <rect x="16" y="8" width="68" height="6" fill={color} stroke="#333" strokeWidth="1.5" />
            {/* Mattress inset */}
            <rect x="23" y="16" width="54" height="68" rx="4" fill="#ffffff" fillOpacity="0.4" stroke="#333" strokeOpacity="0.4" strokeWidth="1" />
            {/* Pillows */}
            <rect x="26" y="19" width="22" height="12" rx="4" fill="#ffffff" stroke="#333" strokeWidth="1.5" />
            <rect x="52" y="19" width="22" height="12" rx="4" fill="#ffffff" stroke="#333" strokeWidth="1.5" />
            {/* Duvet fold */}
            <line x1="23" y1="46" x2="77" y2="46" stroke="#333" strokeWidth="1" opacity="0.3" />
            <line x1="50" y1="16" x2="50" y2="84" stroke="#333" strokeWidth="1" opacity="0.15" />
          </svg>
        );

      case 'nightstand':
        return (
          <svg viewBox="0 0 100 100" style={style}>
            {/* Nightstand, top-down: top + drawers/knots */}
            <rect x="25" y="25" width="50" height="50" rx="5" fill={color} stroke="#333" strokeWidth="2" />
            <rect x="31" y="31" width="38" height="38" rx="3" fill="none" stroke="#333" strokeWidth="1" opacity="0.45" />
            <line x1="25" y1="50" x2="75" y2="50" stroke="#333" strokeWidth="1.5" />
            <circle cx="50" cy="38" r="3" fill="#333" />
            <circle cx="50" cy="62" r="3" fill="#333" />
          </svg>
        );

      case 'desk':
        return (
          <svg viewBox="0 0 100 100" style={style}>
            {/* Desk, top-down: surface + monitor + keyboard + legs */}
            <rect x="10" y="28" width="80" height="44" rx="4" fill={color} stroke="#333" strokeWidth="2" />
            <rect x="16" y="34" width="68" height="32" rx="2" fill="none" stroke="#333" strokeWidth="1" opacity="0.4" />
            {/* Monitor */}
            <rect x="40" y="32" width="20" height="10" rx="2" fill="#ffffff" stroke="#333" strokeWidth="1.5" />
            {/* Keyboard */}
            <rect x="40" y="48" width="20" height="8" rx="2" fill="none" stroke="#333" strokeWidth="1" opacity="0.7" />
            {/* Legs */}
            <circle cx="18" cy="34" r="3" fill="#333" />
            <circle cx="82" cy="34" r="3" fill="#333" />
            <circle cx="18" cy="66" r="3" fill="#333" />
            <circle cx="82" cy="66" r="3" fill="#333" />
          </svg>
        );

      case 'stairs':
        return (
          <svg viewBox="0 0 100 100" style={style}>
            {/* Stair flight, plan: treads + up direction arrow */}
            <rect x="14" y="10" width="72" height="80" rx="3" fill={color} stroke="#333" strokeWidth="2" />
            {/* Treads */}
            <g stroke="#ffffff" strokeWidth="1" strokeOpacity="0.55">
              <line x1="14" y1="25" x2="86" y2="25" />
              <line x1="14" y1="40" x2="86" y2="40" />
              <line x1="14" y1="55" x2="86" y2="55" />
              <line x1="14" y1="70" x2="86" y2="70" />
            </g>
            {/* Up direction arrow */}
            <path d="M66 80 L66 30 M54 46 L66 30 L78 46" stroke="#ffffff" strokeWidth="2.5" strokeLinejoin="round" fill="none" />
            {/* Stringers */}
            <line x1="14" y1="10" x2="14" y2="90" stroke="#333" strokeWidth="1.5" />
            <line x1="86" y1="10" x2="86" y2="90" stroke="#333" strokeWidth="1.5" />
          </svg>
        );

      case 'column':
        return (
          <svg viewBox="0 0 100 100" style={style}>
            {/* Round column / structure in plan */}
            <circle cx="50" cy="50" r="22" fill={color} stroke="#333" strokeWidth="2" />
            <circle cx="50" cy="50" r="16" fill="none" stroke="#333" strokeWidth="1" opacity="0.5" />
            {/* Center axes */}
            <line x1="50" y1="20" x2="50" y2="80" stroke="#333" strokeWidth="1" opacity="0.4" strokeDasharray="4,3" />
            <line x1="20" y1="50" x2="80" y2="50" stroke="#333" strokeWidth="1" opacity="0.4" strokeDasharray="4,3" />
            <circle cx="50" cy="50" r="3" fill="#333" />
          </svg>
        );

      
      case 'cad-rectangle':
        return (
          <svg viewBox="0 0 100 100" style={style}>
            <rect x="20" y="30" width="60" height="40" fill={color} fillOpacity="0.3" stroke="#333" strokeWidth="2" strokeDasharray="5,5" />
          </svg>
        );

      case 'cad-line':
        return (
          <svg viewBox="0 0 100 100" style={style}>
            <line x1="20" y1="50" x2="80" y2="50" stroke={color} strokeWidth="3" />
            <circle cx="20" cy="50" r="4" fill={color} stroke="#333" strokeWidth="1" />
            <circle cx="80" cy="50" r="4" fill={color} stroke="#333" strokeWidth="1" />
          </svg>
        );

      case 'measurement':
        return (
          <svg viewBox="0 0 100 100" style={style}>
            <line x1="20" y1="50" x2="80" y2="50" stroke="#D21F2B" strokeWidth="2" />
            <line x1="20" y1="45" x2="20" y2="55" stroke="#D21F2B" strokeWidth="2" />
            <line x1="80" y1="45" x2="80" y2="55" stroke="#D21F2B" strokeWidth="2" />
            <polygon points="25,50 20,47 20,53" fill="#D21F2B" />
            <polygon points="75,50 80,47 80,53" fill="#D21F2B" />
          </svg>
        );

      case 'text':
        return (
          <svg viewBox="0 0 100 100" style={style}>
            <text
              x="50"
              y="55"
              textAnchor="middle"
              dominantBaseline="middle"
              fill={color}
              fontFamily={fontFamily || 'Inter'}
              fontSize={fontSize || 16}
              fontWeight={fontWeight || 'normal'}
              fontStyle={fontStyle || 'normal'}
            >
              {label || 'Text'}
            </text>
          </svg>
        );

      default:
        return (
          <svg viewBox="0 0 100 100" style={style}>
            <circle cx="50" cy="50" r="30" fill={color} stroke="#333" strokeWidth="2" />
          </svg>
        );
    }
  };

  return <div className="element-icon">{renderIcon()}</div>;
};

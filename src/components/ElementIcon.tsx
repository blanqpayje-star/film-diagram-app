import React from 'react';
import type { ElementType } from '../types';

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
  const iconRotation = rotation + (LIGHT_TYPES.has(type) ? -90 : 0);
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
            <rect x="30" y="30" width="40" height="40" fill={color} stroke="#333" strokeWidth="2" />
            <line x1="30" y1="30" x2="70" y2="70" stroke="#333" strokeWidth="1" />
            <line x1="70" y1="30" x2="30" y2="70" stroke="#333" strokeWidth="1" />
          </svg>
        );

      case 'wall':
        return (
          <svg viewBox="0 0 100 100" style={style}>
            <rect x="10" y="40" width="80" height="20" fill={color} stroke="#333" strokeWidth="2" />
            <line x1="30" y1="40" x2="30" y2="60" stroke="#333" strokeWidth="1" />
            <line x1="50" y1="40" x2="50" y2="60" stroke="#333" strokeWidth="1" />
            <line x1="70" y1="40" x2="70" y2="60" stroke="#333" strokeWidth="1" />
          </svg>
        );

      case 'door':
        return (
          <svg viewBox="0 0 100 100" style={style}>
            <rect x="40" y="20" width="20" height="60" fill={color} stroke="#333" strokeWidth="2" />
            <circle cx="54" cy="50" r="2" fill="#333" />
            <path d="M40 80 Q20 60 40 20" fill="none" stroke="#333" strokeWidth="1.5" strokeDasharray="3,3" />
          </svg>
        );

      case 'window':
        return (
          <svg viewBox="0 0 100 100" style={style}>
            <rect x="25" y="30" width="50" height="40" fill={color} stroke="#333" strokeWidth="2" />
            <line x1="50" y1="30" x2="50" y2="70" stroke="#333" strokeWidth="2" />
            <line x1="25" y1="50" x2="75" y2="50" stroke="#333" strokeWidth="2" />
          </svg>
        );

      case 'table-dining':
        return (
          <svg viewBox="0 0 100 100" style={style}>
            {/* Top-down dining table with chairs */}
            <rect x="22" y="22" width="56" height="56" rx="6" fill={color} stroke="#333" strokeWidth="2" />
            <line x1="30" y1="30" x2="70" y2="70" stroke="#333" strokeWidth="1" opacity="0.3" />
            <line x1="70" y1="30" x2="30" y2="70" stroke="#333" strokeWidth="1" opacity="0.3" />
          </svg>
        );

      case 'table-coffee':
        return (
          <svg viewBox="0 0 100 100" style={style}>
            {/* Low wide coffee table */}
            <rect x="15" y="32" width="70" height="36" rx="8" fill={color} stroke="#333" strokeWidth="2" />
            <rect x="22" y="39" width="56" height="22" rx="5" fill="none" stroke="#333" strokeWidth="1" opacity="0.4" />
          </svg>
        );

      case 'table-side':
        return (
          <svg viewBox="0 0 100 100" style={style}>
            {/* Small side table */}
            <circle cx="50" cy="50" r="26" fill={color} stroke="#333" strokeWidth="2" />
            <circle cx="50" cy="50" r="17" fill="none" stroke="#333" strokeWidth="1" opacity="0.4" />
          </svg>
        );

      case 'chair-armchair':
        return (
          <svg viewBox="0 0 100 100" style={style}>
            {/* Armchair, top-down */}
            <rect x="25" y="20" width="50" height="14" rx="5" fill={color} stroke="#333" strokeWidth="2" />
            <rect x="25" y="34" width="50" height="46" rx="8" fill={color} stroke="#333" strokeWidth="2" />
            <rect x="16" y="38" width="12" height="34" rx="5" fill={color} stroke="#333" strokeWidth="2" />
            <rect x="72" y="38" width="12" height="34" rx="5" fill={color} stroke="#333" strokeWidth="2" />
          </svg>
        );

      case 'chair-dining':
        return (
          <svg viewBox="0 0 100 100" style={style}>
            {/* Dining chair, top-down */}
            <rect x="28" y="18" width="44" height="10" rx="4" fill={color} stroke="#333" strokeWidth="2" />
            <rect x="30" y="28" width="40" height="48" rx="6" fill={color} stroke="#333" strokeWidth="2" />
          </svg>
        );

      case 'chair-office':
        return (
          <svg viewBox="0 0 100 100" style={style}>
            {/* Office chair, top-down */}
            <circle cx="50" cy="46" r="24" fill={color} stroke="#333" strokeWidth="2" />
            <rect x="40" y="14" width="20" height="12" rx="4" fill={color} stroke="#333" strokeWidth="2" />
            <path d="M50 70 L50 82 M50 82 L30 92 M50 82 L70 92 M50 82 L50 94" stroke="#333" strokeWidth="2.5" fill="none" />
          </svg>
        );

      case 'sofa':
        return (
          <svg viewBox="0 0 100 100" style={style}>
            {/* Sofa, top-down */}
            <rect x="14" y="18" width="72" height="16" rx="6" fill={color} stroke="#333" strokeWidth="2" />
            <rect x="14" y="34" width="72" height="42" rx="7" fill={color} stroke="#333" strokeWidth="2" />
            <line x1="50" y1="36" x2="50" y2="74" stroke="#333" strokeWidth="1.5" opacity="0.5" />
            <rect x="8" y="34" width="10" height="38" rx="5" fill={color} stroke="#333" strokeWidth="2" />
            <rect x="82" y="34" width="10" height="38" rx="5" fill={color} stroke="#333" strokeWidth="2" />
          </svg>
        );

      case 'bed':
        return (
          <svg viewBox="0 0 100 100" style={style}>
            {/* Bed, top-down */}
            <rect x="18" y="10" width="64" height="80" rx="5" fill={color} stroke="#333" strokeWidth="2" />
            <rect x="26" y="16" width="21" height="14" rx="4" fill="#fff" stroke="#333" strokeWidth="1.5" />
            <rect x="53" y="16" width="21" height="14" rx="4" fill="#fff" stroke="#333" strokeWidth="1.5" />
            <line x1="18" y1="38" x2="82" y2="38" stroke="#333" strokeWidth="1.5" />
            <line x1="50" y1="38" x2="50" y2="90" stroke="#333" strokeWidth="1" opacity="0.4" />
          </svg>
        );

      case 'nightstand':
        return (
          <svg viewBox="0 0 100 100" style={style}>
            {/* Nightstand, top-down */}
            <rect x="25" y="25" width="50" height="50" rx="4" fill={color} stroke="#333" strokeWidth="2" />
            <line x1="25" y1="50" x2="75" y2="50" stroke="#333" strokeWidth="1.5" />
            <circle cx="50" cy="38" r="3" fill="#333" />
            <circle cx="50" cy="62" r="3" fill="#333" />
          </svg>
        );

      case 'desk':
        return (
          <svg viewBox="0 0 100 100" style={style}>
            {/* Desk, top-down */}
            <rect x="12" y="30" width="76" height="40" rx="4" fill={color} stroke="#333" strokeWidth="2" />
            <rect x="60" y="34" width="24" height="14" rx="2" fill="none" stroke="#333" strokeWidth="1" opacity="0.5" />
            <rect x="16" y="52" width="20" height="14" rx="2" fill="none" stroke="#333" strokeWidth="1" opacity="0.5" />
          </svg>
        );

      case 'stairs':
        return (
          <svg viewBox="0 0 100 100" style={style}>
            <polygon points="15,80 85,80 85,20 15,20" fill={color} stroke="#333" strokeWidth="2" />
            <line x1="15" y1="70" x2="85" y2="70" stroke="#333" strokeWidth="1" />
            <line x1="15" y1="60" x2="85" y2="60" stroke="#333" strokeWidth="1" />
            <line x1="15" y1="50" x2="85" y2="50" stroke="#333" strokeWidth="1" />
            <line x1="15" y1="40" x2="85" y2="40" stroke="#333" strokeWidth="1" />
            <line x1="15" y1="30" x2="85" y2="30" stroke="#333" strokeWidth="1" />
          </svg>
        );

      case 'column':
        return (
          <svg viewBox="0 0 100 100" style={style}>
            <ellipse cx="50" cy="25" rx="20" ry="8" fill={color} stroke="#333" strokeWidth="2" />
            <rect x="30" y="25" width="40" height="50" fill={color} stroke="#333" strokeWidth="2" />
            <ellipse cx="50" cy="75" rx="20" ry="8" fill={color} stroke="#333" strokeWidth="2" />
            <ellipse cx="50" cy="33" rx="15" ry="6" fill="none" stroke="#333" strokeWidth="1" opacity="0.4" />
            <ellipse cx="50" cy="50" rx="15" ry="6" fill="none" stroke="#333" strokeWidth="1" opacity="0.4" />
            <ellipse cx="50" cy="67" rx="15" ry="6" fill="none" stroke="#333" strokeWidth="1" opacity="0.4" />
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

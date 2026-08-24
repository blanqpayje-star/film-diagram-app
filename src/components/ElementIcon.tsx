import React from 'react';
import type { ElementType } from '../types';

interface IconProps {
  type: ElementType;
  size?: number;
  color?: string;
  rotation?: number;
  customIcon?: string;
}

export const ElementIcon: React.FC<IconProps> = ({
  type,
  size = 40,
  color = '#000000',
  rotation = 0,
  customIcon,
}) => {
  const style = {
    width: size,
    height: size,
    transform: `rotate(${rotation}deg)`,
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
            <path
              d="M20 40 L60 40 L70 30 L80 30 L80 70 L20 70 Z"
              fill={color}
              stroke="#333"
              strokeWidth="2"
            />
            <circle cx="45" cy="55" r="12" fill="none" stroke="#333" strokeWidth="2" />
            <circle cx="45" cy="55" r="8" fill="none" stroke="#333" strokeWidth="1.5" />
            <rect x="65" y="45" width="8" height="6" fill="#ff0000" />
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
            <text x="50" y="95" fontSize="9" textAnchor="middle" fill="#333" fontWeight="bold">SOFT</text>
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
            <text x="50" y="95" fontSize="8" textAnchor="middle" fill="#333">FRESNEL</text>
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
            <text x="50" y="95" fontSize="10" textAnchor="middle" fill="#333">LED</text>
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
            <text x="50" y="95" fontSize="9" textAnchor="middle" fill="#333">KINO</text>
          </svg>
        );

      case 'light-practical':
        return (
          <svg viewBox="0 0 100 100" style={style}>
            <circle cx="50" cy="40" r="15" fill={color} stroke="#333" strokeWidth="2" />
            <line x1="50" y1="55" x2="50" y2="75" stroke="#333" strokeWidth="2" />
            <rect x="40" y="75" width="20" height="8" fill={color} stroke="#333" strokeWidth="2" />
            <text x="50" y="95" fontSize="9" textAnchor="middle" fill="#333">PRAC</text>
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

      case 'furniture':
        return (
          <svg viewBox="0 0 100 100" style={style}>
            <rect x="20" y="35" width="60" height="30" rx="5" fill={color} stroke="#333" strokeWidth="2" />
            <rect x="25" y="65" width="8" height="15" fill={color} stroke="#333" strokeWidth="1.5" />
            <rect x="67" y="65" width="8" height="15" fill={color} stroke="#333" strokeWidth="1.5" />
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
            <line x1="20" y1="50" x2="80" y2="50" stroke="#f59e0b" strokeWidth="2" />
            <line x1="20" y1="45" x2="20" y2="55" stroke="#f59e0b" strokeWidth="2" />
            <line x1="80" y1="45" x2="80" y2="55" stroke="#f59e0b" strokeWidth="2" />
            <polygon points="25,50 20,47 20,53" fill="#f59e0b" />
            <polygon points="75,50 80,47 80,53" fill="#f59e0b" />
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

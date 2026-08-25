# Film Diagram Studio

A free, web-based lighting and camera diagram tool for film production pre-visualization. Create professional diagrams to plan your shots before stepping on set.

![Film Diagram Studio](https://img.shields.io/badge/status-ready-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

## Features

### 🎬 Professional Film Equipment
- **Cameras** - Position and orient camera placements
- **Lighting** - Key, Fill, Back, and Practical lights with customizable colors
- **Actors** - Position talent in your scenes
- **Set Elements** - Walls, doors, windows, furniture, and props

### ✨ Fully Customizable
- **Colors** - Full color picker for every element
- **Labels** - Add custom labels to identify equipment and positions
- **Rotation** - Rotate elements 0-360° with precision controls
- **Scale** - Resize elements from 0.5x to 3x
- **Position** - Drag and drop or use arrow keys for pixel-perfect placement

### 🎯 Professional Tools
- **Grid System** - Optional grid with snap-to-grid functionality
- **Multiple Scenes** - Create and manage unlimited scenes/shots
- **Keyboard Shortcuts** - Efficient workflow with arrow keys and hotkeys
- **Export/Import** - Save scenes as JSON for backup and sharing
- **Persistent Storage** - Auto-saves to browser localStorage

### 🚀 Built for Speed
- Responsive interface optimized for desktop and tablets
- No registration or account required
- Works completely offline (after initial load)
- Zero cost - completely free to use

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

## Usage Guide

### Adding Elements
1. Click any element button in the left toolbar
2. The element appears in the center of the canvas
3. Drag it to position or use arrow keys for precision

### Editing Elements
1. Click an element to select it
2. Use the properties panel on the right to:
   - Change the label
   - Pick a custom color
   - Rotate the element
   - Scale the element
   - Fine-tune position coordinates

### Keyboard Shortcuts
- **Arrow Keys** - Move selected element by 1px
- **Shift + Arrow Keys** - Move by grid size
- **Delete/Backspace** - Remove selected element

### Managing Scenes
1. Use the scene dropdown in the header to switch between scenes
2. Click "New Scene" to create additional shots
3. Duplicate scenes to create variations
4. Export individual scenes as JSON files

### Grid & Snapping
- Toggle grid visibility with the grid icon
- Enable snap-to-grid with the magnet icon
- Adjust grid size in settings (default: 20px)

### Export & Import
- **Export** - Download current scene as JSON
- **Import** - Load a previously saved scene
- Scenes include all elements, positions, and properties

## Technology Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **Lucide React** - Icons
- **react-colorful** - Color picker

## Project Structure

```
src/
├── components/
│   ├── Canvas.tsx          # Main drawing canvas
│   ├── ElementIcon.tsx     # SVG icons for equipment
│   ├── Header.tsx          # Top navigation and scene management
│   ├── PropertiesPanel.tsx # Right sidebar for editing
│   └── Toolbar.tsx         # Left sidebar for adding elements
├── store.ts                # Zustand state management
├── types.ts                # TypeScript type definitions
├── App.tsx                 # Main application component
└── main.tsx                # Application entry point
```

## Customization

### Adding New Equipment Types

1. Add the type to `types.ts`:
```typescript
export type ElementType = 
  | 'camera'
  | 'your-new-type';
```

2. Create the icon in `ElementIcon.tsx`:
```typescript
case 'your-new-type':
  return (
    <svg viewBox="0 0 100 100" style={style}>
      {/* Your SVG path */}
    </svg>
  );
```

3. Add to toolbar in `Toolbar.tsx`:
```typescript
{ type: 'your-new-type', label: 'Your Label', icon: <YourIcon /> }
```

### Customizing Colors

Default colors are defined in `Toolbar.tsx` in the `getDefaultColor` function. Modify these to match your brand or preferences.

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

MIT License - feel free to use this for personal or commercial projects.

## Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests

## Roadmap

- [ ] PNG/PDF export
- [ ] Custom icons upload
- [ ] Layers management
- [ ] Undo/redo functionality
- [ ] Templates library
- [ ] Measurement tools
- [ ] Lighting cones/throw visualization
- [ ] Camera FOV overlay
- [ ] Collaboration features
- [ ] Mobile app version

## Support

This is a free, open-source tool built for the film community. If you find it useful, consider:
- Starring the repository
- Sharing it with fellow filmmakers
- Contributing improvements

## Inspiration

Inspired by tools like Cadrage and Shot Designer, built to be completely free and web-based for maximum accessibility.

---

**Built with ❤️ for filmmakers, by filmmakers** **- KYLE MAGANDA**

## Icon Attribution

Base element icons are sourced from [game-icons.net](https://game-icons.net) and are licensed under [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/). Icons in `src/assets/icons/*.svg` are by Lorc, Delapouite, and Caro Asercion, available at https://game-icons.net.

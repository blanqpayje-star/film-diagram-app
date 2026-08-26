# Film Diagram Studio

A free, web-based lighting and camera diagram tool for film production pre-visualization. Create professional diagrams to plan your shots before stepping on set.

![Film Diagram Studio](https://img.shields.io/badge/status-ready-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

## Features

### 🎥 Camera Department
- **Camera placement** - Position and orient cameras with drag-and-drop or precision controls
- **FOV visualization** - Realistic field-of-view cones rendered from real optics:
  - 6 sensor sizes: Super 35, Full Frame, APS-C, Micro Four Thirds, Medium Format, Super 16
  - Focal length control with common presets (14mm–200mm)
  - Horizontal FOV calculated from actual sensor/focal-length geometry, displayed live
  - Adjustable cone distance (50–500px) and opacity
- **Cone anchoring** - FOV cones stay locked to the camera's lens at any rotation or scale

### 💡 Lighting Department
- **6 fixture types** - Softbox, Umbrella, Fresnel, LED Panel, Kino Flo, and Practical
- **Light spread cones** - Visualize each fixture's throw with adjustable angle (15–120°), distance, and opacity
- **Photometric color** - Color lights by Kelvin temperature (2700K–6500K) with film-standard presets (Tungsten, Daylight, Overcast...) or by RGB hex
- **Grip & modifier tracking** - Attach modifiers to any fixture: diffusion, grids, barn doors, negatives, bounce (white/silver/gold), scrims, flags, dots and fingers — with intensity control

### 🎭 Set & Talent
- **Actors and props** for blocking
- **Architecture** - Walls, doors, windows, stairs, and columns
- **Furniture** - Dining/coffee/side tables, armchair/dining/office chairs, sofa, bed, nightstand, desk — all drawn as detailed top-down floor-plan art
- **Text annotations** with full typography controls (font family, size, weight, style, alignment, line height, letter spacing)

### 📐 CAD & Drafting Tools
- **Box / Rectangle tool** - Solid, hatch, or none fill styles (AutoCAD-style hatching)
- **Wall tool** - Thick architectural wall slabs with adjustable thickness and centerline
- **Measurement tool** - Measure distances with ft / m / in units and labeled dimension lines

### ✨ Fully Customizable Elements
- **Colors** - Full color picker for every element
- **Labels** - Add custom labels to identify equipment and positions
- **Rotation** - Rotate elements 0–360° with precision controls
- **Scale** - Uniform scale, or unlink X/Y for independent stretching (0.5x–3x)
- **Position** - Drag and drop or use arrow keys for pixel-perfect placement
- **Custom icons** - Upload your own images for any element (auto-compressed in-browser)

### 🖼️ Canvas & Workspace
- **Grid system** - Toggle grid with adjustable size (default 20px), color, and opacity
- **Snap-to-grid** - Toggleable magnetic snapping
- **Canvas control** - Adjustable canvas dimensions, background color, and background images (e.g. location photos or floor plans)
- **Dark mode** - Full light/dark theme support
- **Collapsible panels** - Collapse either sidebar to maximize canvas space

### 🎯 Professional Tools
- **Multiple scenes** - Create, rename, duplicate, and delete unlimited scenes/shots
- **Undo/redo** - 50-step history
- **Copy/paste/duplicate** - Fast element reuse
- **Keyboard shortcuts** - Hotkeys for every common action
- **Export** - PNG (2x resolution), PDF (A4 landscape), and JSON
- **Import** - Load previously saved scene JSON files
- **Persistent storage** - Auto-saves everything to browser localStorage

### 🚀 Built for Speed
- Responsive interface optimized for desktop and tablets
- No registration or account required
- Works completely offline (after initial load)
- Zero cost - completely free to use

## Getting Started

### Prerequisites

- Node.js >= 20

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

### Other Scripts

```bash
npm run lint        # Lint with oxlint
npm run typecheck   # TypeScript check without emitting
```

### Deployment

The repo includes a `vercel.json` for zero-config deployment on [Vercel](https://vercel.com). Any static host that serves the `dist/` folder works too.

## Usage Guide

### Adding Elements
1. Pick a category in the left toolbar (Camera Equipment, Lighting Equipment, Set & Props)
2. Click any element button — it appears in the center of the canvas
3. Drag it to position or use arrow keys for precision

### Editing Elements
1. Click an element to select it
2. Use the properties panel on the right to:
   - Change the label or color
   - Rotate and scale (linked or unlinked X/Y)
   - Fine-tune position coordinates
   - Upload a custom icon
3. Cameras expose **sensor size, focal length, and FOV cone controls**
4. Lights expose **spread cone controls, Kelvin/RGB color, and grip modifiers**

### CAD & Drawing Tools
1. Select a drawing mode in the toolbar: Box/Rectangle, Wall (thick line), Measure Line, or Text
2. Click and drag on the canvas to draw
3. Measurements respect the active unit (ft / m / in)

### Keyboard Shortcuts
- **Arrow Keys** - Move selected element by 1px
- **Shift + Arrow Keys** - Move by grid size
- **⌘/Ctrl + Z** - Undo
- **⌘/Ctrl + Shift + Z** or **⌘/Ctrl + Y** - Redo
- **⌘/Ctrl + C / V** - Copy / paste element
- **⌘/Ctrl + D** - Duplicate element
- **Delete** / **⌘/Ctrl + Backspace** - Remove selected element
- **Escape** - Deselect / cancel current tool

### Managing Scenes
1. Use the scene dropdown in the header to switch between scenes
2. Create, duplicate, rename, and delete scenes from the header
3. Export individual scenes as JSON files, or import them on another machine

### Grid & Snapping
- Toggle grid visibility and snap-to-grid from the canvas controls
- Adjust grid size, color, and opacity to match your style

### Export & Import
- **PNG** - High-resolution (2x) snapshot of the current scene
- **PDF** - A4 landscape document, great for call sheets and shot packets
- **JSON** - Full scene data (all elements, positions, and properties) for backup and sharing

## Technology Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Zustand 5** - State management (with localStorage persistence)
- **Tailwind CSS** - Styling
- **Vite 8** - Build tool
- **html2canvas + jsPDF** - PNG/PDF export
- **browser-image-compression** - Client-side custom icon compression
- **Lucide React** - UI icons
- **react-colorful** - Color picker
- **oxlint** - Linting

## Project Structure

```
src/
├── components/
│   ├── Canvas.tsx          # Main drawing canvas, FOV/light-spread cones, CAD rendering
│   ├── ElementIcon.tsx     # Equipment artwork (authored SVGs + fixed-color diagram icons)
│   ├── Header.tsx          # Top navigation, scene management, export/import
│   ├── PropertiesPanel.tsx # Right sidebar: element, camera, and light properties
│   └── Toolbar.tsx         # Left sidebar: element library and drawing tools
├── utils/
│   ├── camera.ts           # Sensor sizes, FOV math, measurement helpers
│   ├── color.ts            # Kelvin→RGB conversion and lighting presets
│   └── export.ts           # PNG/PDF export via html2canvas + jsPDF
├── assets/icons/           # Fixed-color diagram icons (camera, lights, actor)
├── store.ts                # Zustand state management + undo/redo history
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

2. Create the icon in `ElementIcon.tsx` (authored top-down floor-plan SVG), or drop a fixed-color PNG into `src/assets/icons/` and register it in `src/assets/icons/index.ts`:
   - Add its intrinsic size to `diagramIconSizes` so cones anchor to the artwork's true emitting edge
   - Use `LIGHT_TYPES` / `BASE_ICON_ROTATION` / `FLIP_X_TYPES` if the artwork needs aligning with the +X cone direction

3. Add to toolbar in `Toolbar.tsx`:
```typescript
{ type: 'your-new-type', label: 'Your Label', icon: <YourIcon />, category: 'set' }
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

- [ ] Layers management
- [ ] Templates library
- [ ] Scene notes editor
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

Camera and lighting equipment icons are sourced from [lightingdiagrams.com](https://www.lightingdiagrams.com/) (Online Lighting Diagram Creator) and remain the property of their respective authors. Set, prop, and furniture icons are original top-down floor-plan artwork authored in this repository.

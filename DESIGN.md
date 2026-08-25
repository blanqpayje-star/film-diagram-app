---
name: Film Diagram Studio
description: A two-shift production workspace: warm binder by day, dark lighting plot by night.
colors:
  day-workspace: "#b8a98f"
  day-binder: "#4a382c"
  day-inspector: "#e4d7c1"
  day-control: "#f1e6d1"
  day-control-hover: "#e8d8bc"
  day-field: "#fbf4e7"
  day-ink-strong: "#2e261f"
  day-ink: "#41362d"
  day-ink-muted: "#766553"
  day-line: "#b8a589"
  day-line-strong: "#927d65"
  day-accent: "#647832"
  day-accent-ink: "#fbf6ea"
  day-accent-soft: "#dce6b8"
  day-amber: "#b87220"
  day-danger: "#a74332"
  night-workspace: "#101518"
  night-binder: "#171d20"
  night-inspector: "#1c2326"
  night-control: "#222a2e"
  night-control-hover: "#2d383d"
  night-field: "#141a1d"
  night-ink-strong: "#f5f1e7"
  night-ink: "#e8e5db"
  night-ink-muted: "#9ca6a5"
  night-line: "#3a444a"
  night-line-strong: "#4d5659"
  night-accent: "#d7ff48"
  night-accent-ink: "#101518"
  night-accent-soft: "#334718"
  night-amber: "#ffc84a"
  night-danger: "#b14333"
  diagram-navy: "#1E40AF"
  diagram-blue: "#3B82F6"
  diagram-violet: "#8B5CF6"
typography:
  body:
    fontFamily: "Avenir Next, Avenir, Segoe UI, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "normal"
  title:
    fontFamily: "Avenir Next, Avenir, Segoe UI, sans-serif"
    fontSize: "18px"
    fontWeight: 700
    letterSpacing: "0.025em"
  label:
    fontFamily: "Avenir Next, Avenir, Segoe UI, sans-serif"
    fontSize: "10px"
    fontWeight: 700
    letterSpacing: "0.14em"
rounded:
  field: "5px"
  control: "6px"
  panel: "8px"
  key: "3px"
  pill: "999px"
spacing:
  micro: "4px"
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "20px"
components:
  button-primary-day:
    backgroundColor: "{colors.day-accent}"
    textColor: "{colors.day-accent-ink}"
    rounded: "{rounded.field}"
    padding: "6px 12px"
  button-primary-night:
    backgroundColor: "{colors.night-accent}"
    textColor: "{colors.night-accent-ink}"
    rounded: "{rounded.field}"
    padding: "6px 12px"
  field-day:
    backgroundColor: "{colors.day-field}"
    textColor: "{colors.day-ink-strong}"
    rounded: "{rounded.field}"
    padding: "8px 12px"
  field-night:
    backgroundColor: "{colors.night-field}"
    textColor: "{colors.night-ink-strong}"
    rounded: "{rounded.field}"
    padding: "8px 12px"
---

# Design System: Film Diagram Studio

## Overview

**Creative North Star: "The Two-Shift Production Binder"**

Film Diagram Studio is an operating surface made for real production planning. Its visual system has two deliberate shifts: Day theme is a warm, earthy notebook and binder environment; Night theme is a dark lighting-plot workstation. Both preserve the same compact controls, three-zone workbench layout, and paper-like diagram as the primary object.

Theme changes are role substitutions, not a new identity. `--workspace`, `--binder`, `--inspector`, `--control`, `--field`, ink, line, accent, amber, danger, canvas-outline, and scroll roles each have a defined day and night value. Semantic colors within the drawing remain stable so a camera, light, or furniture mark never changes its meaning with the workspace theme.

**Key Characteristics:**

- Day: tactile warm paper, walnut binder, olive confirmation, and handwritten-production-notebook warmth.
- Night: blue-charcoal plot table, acid-lime confirmation, and high-contrast technical focus.
- Compact, visibly bordered controls rather than card-heavy dashboard chrome.
- A large, elevated canvas that remains the visual center in either shift.

## Colors

Use theme roles through CSS variables. The frontmatter records their canonical Day and Night values; `:root` is Day and `.dark` replaces the same roles for Night.

### Primary

- **Day Olive Accent:** primary active, confirming, focus, selection, and slider role in the warm theme.
- **Night Cue Lime:** the same role in the dark theme; it is sharp and rare so the active state is unmistakable.

### Secondary

- **Diagram Navy:** technical drawing, camera, actor, wall, and label marks on the plot.
- **Diagram Blue:** lights, props, measurement previews, transform handles, and selection marks on the plot.
- **Diagram Violet:** furniture and set-dressing marks on the plot.

### Tertiary

- **Day / Night Amber:** special or warm inspector actions only.
- **Day / Night Danger:** destructive actions only.

### Neutral

- **Day Workspace / Binder / Inspector:** taupe work surface, walnut frame, and parchment inspector.
- **Day Control / Field:** cream controls and near-paper editable fields, separated by brown-taupe lines.
- **Night Workspace / Binder / Inspector:** near-black blue-charcoal work surface, binder frame, and lifted charcoal inspector.
- **Night Control / Field:** dark charcoal controls and darker fields, separated by cool gray lines.
- **Ink, muted ink, lines, canvas outline, and scroll roles:** always switch together with their theme; never mix a Day neutral role with a Night neutral role.

**The Role-Swap Rule.** Theme code uses semantic CSS roles, never one-off theme hexes in components. A theme shift changes the role values, not the UI’s hierarchy or meaning.

**The Diagram-Stays-True Rule.** Diagram Navy, Diagram Blue, and Diagram Violet stay theme-invariant; application state uses the active theme accent instead.

## Typography

**Display Font:** Avenir Next (with Avenir and Segoe UI fallbacks)

**Body Font:** Avenir Next (with Avenir and Segoe UI fallbacks)

**Character:** A humanist sans keeps technical controls approachable in both lighting conditions. Hierarchy comes from compact size, weight, and tracking—not oversized editorial type.

### Hierarchy

- **Title** (700, 18px, 0.025em tracking): app identity and scene-level headings.
- **Body** (400, 16px): working-copy baseline.
- **Control Label** (600–700, 12–14px): compact, scannable actions and property controls.
- **Panel Label** (700, 10px, 0.14em tracking, uppercase): dock and inspector structure.
- **Key Hint** (monospace, 12px): keyboard shortcut affordances on the canvas only.

## Layout

The full-height shell contains a 68px minimum header, a flexible three-column workspace, and a compact footer. The left tool dock is 256px expanded or 64px collapsed; the right inspector is 320px expanded or 64px collapsed. The canvas stage scrolls independently and has 20px of space around the framed diagram.

At 1080px, header metadata tightens and canvas padding drops to 16px. At 760px, the tool dock stays at 64px, the inspector is hidden, header controls may scroll horizontally, and canvas padding drops to 11.2px. These geometry rules are invariant across Day and Night.

**The Canvas-First Rule.** Preserve tools left, diagram center, and properties right. Panels may collapse, but the plot remains the visual and interaction priority.

## Elevation & Depth

Depth is structural, not card-heavy. Theme-specific header and canvas shadows preserve the same hierarchy: the header separates the application from work; the canvas is the only strongly elevated physical object; most panels and controls use tonal layering and 1px lines.

### Shadow Vocabulary

- **Day Header Separation** (`0 8px 24px rgba(52, 37, 26, .18)`): warm, low separation under the binder header.
- **Night Header Separation** (`0 8px 24px rgba(0,0,0,.2)`): dark-theme equivalent.
- **Day Canvas Lift** (`0 22px 56px rgba(52, 37, 26, .28), 0 2px 8px rgba(52, 37, 26, .2)`): physical notebook-page lift.
- **Night Canvas Lift** (`0 22px 56px rgba(0,0,0,.42), 0 2px 8px rgba(0,0,0,.32)`): stronger plot-table lift.

**The Plot Is the Object Rule.** Do not give dock modules or inspector cards comparable elevation.

## Shapes

Use practical, gently rounded rectangles: 5px fields and compact inspector actions, 6px standard controls, 8px grouped inspector modules, and 3px shortcut keys. Scroll thumbs alone are pill-shaped. Borders remain 1px at rest.

Avoid large soft radii, floating card grids, and decorative gradients. The geometry should read as durable binder hardware in Day and precise production equipment in Night.

## Components

### Buttons

- **Primary:** active theme accent with active theme accent ink; use for selected tools and key actions.
- **Tool / Ghost:** transparent at rest, then the active theme’s control-hover fill with its line border on hover.
- **Destructive:** active theme danger color with warm-white text; reserved for remove and delete.
- **Focus:** 2px active theme accent outline with 2px offset.

### Inputs / Fields

- **Style:** theme field fill, strong ink, theme strong-line border, and 5px rounding.
- **Focus:** the active theme accent owns focus treatment.
- **Range / Color:** sliders use the active theme accent; color wells retain their direct preview role.

### Navigation

- **Header:** active theme binder, 1px theme line, and matching structural shadow. Brand left; scene work center; view and export controls right.
- **Docks:** persistent vertical work zones, not card stacks. Headings use tracked uppercase labels and theme-line dividers.
- **Responsive:** docks collapse before the canvas compromises; inspector leaves at the narrow breakpoint.

### Cards / Containers

- **Inspector modules:** active theme control over the active theme inspector, with 8px corners and a theme-line border.
- **Canvas container:** one framed document with a 10px active-theme canvas outline and theme-specific Canvas Lift.
- **Shortcut hints:** compact binder-colored utility annotations with 3px keys.

### Lighting Plot Canvas

The plot is a user-configurable paper-like document framed by the current binder theme.

- **Surface:** user-selectable background color or image, with a warm paper default in diagram state.
- **Grid:** fine muted technical grid that stays subordinate to diagram marks.
- **Selection:** Diagram Blue handles and plot selections; active theme accent remains application-level only.
- **Annotations:** navy capsules with warm-white text; their semantic meaning does not change with theme.

## Do's and Don'ts

### Do:

- **Do** switch complete semantic role families between Day and Night through CSS custom properties.
- **Do** use olive active states on warm Day surfaces and lime active states on Night surfaces.
- **Do** preserve the stable blue, navy, and violet legend for diagram objects in both themes.
- **Do** keep controls compact, visibly bordered, and fast to scan.
- **Do** reserve the strongest elevation and largest uninterrupted area for the plot.

### Don't:

- **Don't** hardcode a Day or Night neutral in a component when a role variable exists.
- **Don't** mix warm Day surfaces with Night ink, lines, or accents (or the reverse) inside one active theme.
- **Don't** use diagram blue as the application active-state color.
- **Don't** spread amber or danger roles beyond their special-action and destructive meanings.
- **Don't** turn theme switching into a layout, typography, or semantic-diagram change.

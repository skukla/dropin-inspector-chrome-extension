# Dropin Inspector UI Redesign Research

## Goal

**Make the Dropin Inspector Chrome extension match the look and feel of the Demo Inspector in appearance.**

The Demo Inspector is a React-based floating panel with a clean, modern design. The Dropin Inspector should adopt its visual design patterns while maintaining its own functionality (detecting Adobe EDS dropins vs. tracking GraphQL queries).

---

## Summary

This research documents the visual design system of the Demo Inspector (`/demo-inspector`) and provides a mapping to implement the same appearance in the Dropin Inspector Chrome extension (`/dropin-inspector`). Key changes include: white/translucent panel background, rounded corners, Tailwind-style spacing, gradient-colored item buttons, and simplified typography.

---

## Demo Inspector Design Analysis

### Panel Container (`InspectorPanel.tsx:11`)

```css
bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200 p-4 w-80
```

| Property | Value | Notes |
|----------|-------|-------|
| Background | `white/95` (95% opacity) | Translucent white with blur |
| Backdrop | `backdrop-blur-sm` | Subtle blur effect |
| Border radius | `rounded-2xl` | 16px radius |
| Shadow | `shadow-2xl` | Heavy drop shadow |
| Border | `1px solid gray-200` | Light gray border |
| Padding | `p-4` (16px) | Consistent inner spacing |
| Width | `w-80` (320px) | Fixed width panel |

### Header (`InspectorHeader.tsx:14`)

```css
font-semibold text-gray-900 flex items-center
```

- Title: "Demo Inspector" with 🔍 icon
- Minimize button: `−` character
- Close button: `×` character
- Button styling: `text-gray-400 hover:text-gray-600`

### Data Source Buttons (`DataSourceButton.tsx:13-25`)

```css
w-full text-left p-3 rounded-xl transition-all transform hover:scale-[1.02]
```

**Inactive state:**
- Background: `bg-gray-50 hover:bg-gray-100`
- Text: `text-gray-900` (name), `text-gray-500` (description)

**Active state:**
- Background: `linear-gradient(135deg, ${color}, ${color}cc)`
- Text: `text-white`
- Shadow: `shadow-lg`
- Indicator: White pulsing dot (`animate-pulse`)

### Color Palette (`DemoInspectorContext.tsx:46-68`)

| Source | Color | Icon | Hex |
|--------|-------|------|-----|
| Commerce Core | Purple | 🏪 | `#9333ea` |
| Catalog Service | Blue | 📦 | `#2563eb` |
| Live Search | Green | 🔍 | `#16a34a` |

### Section Headers

```css
text-xs text-gray-500 uppercase font-medium mb-2
```

### Toggle Switch (`SourceToggle.tsx:14-21`)

```css
relative inline-flex h-6 w-11 items-center rounded-full
```

- Active: `bg-gray-600`
- Inactive: `bg-gray-300`
- Knob: `h-4 w-4 rounded-full bg-white`

### Query Items (`QueryItem.tsx:24`)

```css
text-xs p-2 bg-gray-50 rounded flex items-center justify-between
```

- Font: `font-mono` for query names
- Time: `text-gray-400`

### Collapsible Sections (`QueryTracker.tsx:17-27`)

- Header: `text-sm text-gray-600` with arrow indicator (`▼`/`▶`)
- Content: `max-h-40 overflow-y-auto`

### Help Text (`DemoInspector.tsx:114-119`)

```css
mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500
```

### Dividers

```css
border-t border-gray-100  /* lighter */
border-t border-gray-200  /* standard */
```

---

## Current Dropin Inspector Issues

### 1. Overly Broad Selectors (`content.js:21-22`)

```javascript
// CURRENT - matches too many elements (107+ false positives)
document.querySelectorAll('[data-dropin-container], [class*="container"]')
```

**Fix:** Use Adobe EDS-specific selectors:
```javascript
document.querySelectorAll(
  '[data-dropin], [data-dropin-container], .dropin__container, ' +
  '[class^="dropin-"], [class*=" dropin-"]'
)
```

### 2. UI Doesn't Match Demo Inspector

| Aspect | Current Dropin Inspector | Demo Inspector Target |
|--------|-------------------------|----------------------|
| Background | Solid cream/dark | White 95% + blur |
| Border radius | 8px | 16px (rounded-2xl) |
| Shadow | Light | Heavy (shadow-2xl) |
| Item style | Teal bars | Gradient buttons with icons |
| Typography | Custom design system | Simple gray scale |
| Panel height | Fixed 600px | Auto-height |

---

## Implementation Mapping

### Files to Modify

| Dropin Inspector File | Changes Needed |
|----------------------|----------------|
| `popup.html` | Update structure to match Demo Inspector layout |
| `styles.css` | Replace design system with Demo Inspector styles |
| `popup.js` | Update rendering logic for new UI components |
| `content.js` | Fix selectors for Adobe EDS detection |

### CSS Variable Mapping

| Demo Inspector (Tailwind) | Dropin Inspector Equivalent |
|--------------------------|----------------------------|
| `bg-white/95` | `rgba(255, 255, 255, 0.95)` |
| `backdrop-blur-sm` | `backdrop-filter: blur(4px)` |
| `rounded-2xl` | `border-radius: 16px` |
| `shadow-2xl` | `box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25)` |
| `text-gray-900` | `color: #111827` |
| `text-gray-500` | `color: #6b7280` |
| `text-gray-400` | `color: #9ca3af` |
| `bg-gray-50` | `background: #f9fafb` |
| `bg-gray-100` | `background: #f3f4f6` |
| `p-3` | `padding: 12px` |
| `p-4` | `padding: 16px` |
| `rounded-xl` | `border-radius: 12px` |
| `text-xs` | `font-size: 12px` |
| `text-sm` | `font-size: 14px` |

### Suggested Color Palette for Dropins

Adapt the Demo Inspector's data source pattern for dropin types:

| Dropin Type | Suggested Color | Icon |
|-------------|-----------------|------|
| Container | Blue | 📦 | `#2563eb` |
| Slot | Green | 🎯 | `#16a34a` |
| Block | Purple | 🧱 | `#9333ea` |

---

## Visual Comparison: Image 2 (Desired) vs Demo Inspector

Looking at Image 2 (the original console script output):

| Feature | Image 2 | Demo Inspector | Recommendation |
|---------|---------|----------------|----------------|
| Header | "DROPIN STRUCTURE" uppercase | "Demo Inspector" normal | Use "DROPIN STRUCTURE" style |
| Summary | "17 containers • 6 slots" | N/A | Keep this pattern |
| Container bars | Cyan/teal with 📦 | Gradient with icons | Use Demo Inspector gradient style |
| Slots | White bg + checkbox + ■ | Gray bg items | Adopt gray bg pattern |
| "No slots" | Gray text indicator | "No queries" pattern | Similar approach |
| Buttons | Close (teal), Clear (gray) | Minimal text buttons | Keep two-button footer |
| Collapse arrow | Right side ▼/▲ | Right side ▼/▶ | Use Demo Inspector arrows |

---

## Recommended Implementation Steps

### Phase 0: Repository Setup

1. **Rename folder**
   ```bash
   mv dropin-inspector dropin-inspector-chrome-extension
   ```

2. **Create private GitHub repository**
   ```bash
   cd dropin-inspector-chrome-extension
   gh repo create skukla/dropin-inspector-chrome-extension --private --source=. --push
   ```

3. **Initial commit** (if not using --push above)
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Dropin Inspector Chrome Extension"
   git push -u origin main
   ```

### Phase 1: Core Styling (Match Demo Inspector Appearance)

1. **Replace panel container styles**
   - White 95% background with backdrop blur
   - 16px border radius
   - Heavy shadow
   - 320px fixed width

2. **Update header**
   - "DROPIN STRUCTURE" title (can keep uppercase style from Image 2)
   - Add minimize/close buttons (−/×)
   - Gray color scheme

3. **Restyle container items**
   - Gradient backgrounds when selected
   - 12px border radius
   - Hover scale effect
   - Icon + name + description layout

4. **Restyle slot items**
   - Gray background (`bg-gray-50`)
   - Checkbox + bullet + name
   - Smaller text (`text-xs`)

5. **Update footer**
   - Text-based buttons
   - Lighter styling
   - Border top separator

### Phase 2: Fix Functionality

1. **Update selectors in `content.js`**
   - Target actual Adobe EDS dropin attributes
   - Remove generic `[class*="container"]` matcher

2. **Add keyboard shortcuts** (optional)
   - Match Demo Inspector pattern (Cmd+Shift+D)

### Phase 3: Polish

1. **Add transitions**
   - `transition-all` on interactive elements
   - `hover:scale-[1.02]` on buttons

2. **Smooth scrolling**
   - `overflow-y-auto` on content area
   - `max-height` constraints

---

## Key Takeaways

1. **Primary Goal**: Match Demo Inspector's visual appearance (white panel, gradients, gray typography, rounded corners, heavy shadows)

2. **Keep Dropin-specific features**: Container/slot hierarchy, checkbox selection, highlight functionality

3. **Fix the selector bug**: The 107 containers issue must be resolved by using proper Adobe EDS selectors

4. **Adapt the color scheme**: Use Demo Inspector's gradient button pattern but with dropin-appropriate colors (blue for containers, green for slots)

5. **Simplify the CSS**: Replace the extensive Perplexity design system with focused Demo Inspector-style utilities

---

## Reference Files

**Demo Inspector (source of visual design):**
- `demo-inspector/components/InspectorPanel.tsx` - Panel container
- `demo-inspector/components/InspectorHeader.tsx` - Header layout
- `demo-inspector/components/DataSourceButton.tsx` - Item button styling
- `demo-inspector/components/QueryTracker.tsx` - Collapsible section
- `demo-inspector/contexts/DemoInspectorContext.tsx` - Color definitions

**Dropin Inspector (files to modify):**
- `dropin-inspector/popup.html` - Structure
- `dropin-inspector/styles.css` - Styling (major rewrite)
- `dropin-inspector/popup.js` - Rendering logic
- `dropin-inspector/content.js` - Detection selectors

---

*Research completed: 2026-01-10*

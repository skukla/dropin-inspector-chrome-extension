# Step 3: Rewrite Panel Styling

## Purpose
Replace the complex Perplexity-style CSS design system (~900 lines with extensive variables, dark mode, and generic components) with focused Demo Inspector-style utilities (~200 lines). This creates a clean, modern panel appearance with gradient buttons, backdrop blur, and scale hover effects.

## Prerequisites
- [ ] Step 1 complete (repository setup)
- [ ] Step 2 complete (selectors fixed in content.js)

## Tests to Write First (RED Phase)
- [ ] Visual test: Panel background is semi-transparent white with blur effect
- [ ] Visual test: Container items show blue gradient when active/hovered
- [ ] Visual test: Slot items show green gradient when active/hovered
- [ ] Visual test: Buttons have scale(1.02) transform on hover
- [ ] Visual test: Panel has 16px border radius with subtle shadow

## Tasks
- [ ] Remove all Perplexity design system CSS variables (lines 1-264)
- [ ] Remove generic component styles (buttons, forms, cards, status indicators)
- [ ] Define new CSS variables for Demo Inspector color palette
- [ ] Style panel container with backdrop blur and shadow
- [ ] Style container items (inactive/active states with blue gradient)
- [ ] Style slot items (inactive/active states with green gradient)
- [ ] Style header (.panel-header, .panel-title, .header-controls, .control-btn)
- [ ] Style summary section (.summary)
- [ ] Style footer buttons (.panel-footer, .btn, .btn-primary, .btn-secondary)
- [ ] Add hover effects with scale transform
- [ ] Add collapsible arrow indicators (.arrow, .expanded)
- [ ] Style icon/indicator elements (.icon, .indicator)

## Files to Modify
- `styles.css` (after Step 1 rename: `/Users/kukla/Documents/Repositories/app-builder/adobe-demo-system/dropin-inspector-chrome-extension/styles.css`) - complete rewrite

## Implementation Details

### New CSS Variables
```css
:root {
  --panel-bg: rgba(255, 255, 255, 0.95);
  --panel-border: #e5e7eb;
  --panel-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  --panel-radius: 16px;
  --btn-radius: 12px;
  --container-gradient: linear-gradient(135deg, #3b82f6, #2563eb);
  --slot-gradient: linear-gradient(135deg, #22c55e, #16a34a);
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --bg-light: #f9fafb;
}
```

### Panel Container
```css
#panel-container {
  background: var(--panel-bg);
  backdrop-filter: blur(4px);
  border-radius: var(--panel-radius);
  box-shadow: var(--panel-shadow);
  border: 1px solid var(--panel-border);
  padding: 16px;
  width: 320px;
}
```

### Container Item (Blue Gradient)
```css
.container-item {
  background: var(--bg-light);
  border-radius: var(--btn-radius);
  padding: 10px 12px;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.container-item:hover,
.container-item.active {
  background: var(--container-gradient);
  color: white;
  transform: scale(1.02);
}
```

### Slot Item (Green Gradient)
```css
.slot-item {
  background: var(--bg-light);
  border-radius: 8px;
  padding: 8px 10px;
  transition: transform 0.15s ease;
}
.slot-item:hover,
.slot-item.active {
  background: var(--slot-gradient);
  color: white;
  transform: scale(1.02);
}
```

### Collapsible Arrows
```css
.arrow { transition: transform 0.2s ease; }
.container-item.expanded .arrow { transform: rotate(90deg); }
```

### Header Styling (for Step 4)
```css
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.panel-title {
  font-weight: 600;
  font-size: 14px;
  color: var(--text-primary);
}
.header-controls { display: flex; gap: 4px; }
.control-btn {
  background: var(--bg-light);
  border: none;
  border-radius: 6px;
  padding: 4px 8px;
  cursor: pointer;
}
.summary {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 12px;
}
```

### Button Styling (for Step 4 footer)
```css
.panel-footer { display: flex; gap: 8px; margin-top: 12px; }
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: var(--btn-radius);
  cursor: pointer;
  font-weight: 500;
}
.btn-primary { background: var(--container-gradient); color: white; }
.btn-secondary { background: var(--bg-light); color: var(--text-primary); }
```

### Icon/Indicator Styling (for Step 5)
```css
.icon { margin-right: 6px; }
.indicator { margin-right: 6px; font-size: 8px; }
```

## Expected Outcome
- Panel visually matches Demo Inspector appearance
- CSS reduced from ~900 lines to ~200 focused lines
- Clean gradient effects on container (blue) and slot (green) items
- Smooth hover animations with scale transform
- Semi-transparent panel with backdrop blur effect

## Acceptance Criteria
- [ ] Panel background is `rgba(255, 255, 255, 0.95)` with `backdrop-filter: blur(4px)`
- [ ] Panel border radius is 16px
- [ ] Panel has shadow `0 25px 50px -12px rgba(0, 0, 0, 0.25)`
- [ ] Container items use blue gradient `#2563eb` when active
- [ ] Slot items use green gradient `#16a34a` when active
- [ ] Hover effects include `transform: scale(1.02)`
- [ ] Button border radius is 12px
- [ ] Header classes defined (.panel-header, .panel-title, .header-controls, .control-btn)
- [ ] Footer classes defined (.panel-footer, .btn, .btn-primary, .btn-secondary)
- [ ] Icon/indicator classes defined (.icon, .indicator)
- [ ] CSS file is under 300 lines total

## Dependencies from Other Steps
- Step 4 (HTML structure) will use class names defined here
- Step 5 (JS rendering) will toggle `.active` and `.expanded` classes

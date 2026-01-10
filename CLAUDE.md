# CLAUDE.md - Dropin Inspector

## Project Goal

**Match the visual appearance of the Demo Inspector** (`../demo-inspector`) while maintaining dropin-specific functionality.

## Project Overview

Chrome extension for inspecting Adobe Edge Delivery Service (EDS) blocks, containers, dropins, and slots on web pages. Provides a visual debugging tool for Adobe Commerce developers to explore dropin component structures.

## Tech Stack

- **Platform**: Chrome Extension (Manifest V3)
- **Languages**: Vanilla JavaScript, HTML, CSS
- **No build process**: Direct file loading
- **Reference Design**: `../demo-inspector` (React/Tailwind)

## File Structure

```
dropin-inspector/
├── manifest.json      # Extension config - permissions, scripts, popup
├── content.js         # Page injection - detects and highlights elements
├── popup.html         # Inspector panel UI structure
├── popup.js           # Panel logic - state, messaging, rendering
├── styles.css         # Design system (NEEDS REWRITE to match demo-inspector)
├── background.js      # Service worker (minimal)
├── config.json        # Adobe Commerce config (unrelated to extension)
├── README.md          # User documentation
├── CLAUDE.md          # This file
└── .rptc/research/    # Research documentation
```

## Architecture

### Message Flow
```
popup.js (UI) <--chrome.runtime.sendMessage--> content.js (Page)
    |                                              |
    |-- getStructure --> returns containers/slots  |
    |-- highlight -----> applies visual highlight  |
    |-- clearHighlight -> removes highlight        |
    |-- clearAll -------> clears all highlights    |
```

### Key Components

**content.js** - Page-side detection and manipulation
- `initializeStructure()` - Scans DOM for containers/slots
- `highlightElement()` - Applies border/background styling + label
- `clearHighlight()` - Restores original element styles
- `createLabel()` - Adds floating label above highlighted element

**popup.js** - Extension popup logic
- `loadStructure()` - Requests structure from content script
- `renderExplorer()` - Builds collapsible container/slot tree
- `toggleContainer/toggleSlot()` - Handles checkbox interactions
- State: `expandedContainers`, `checkedContainers`, `checkedSlots`

## Current Issues

### 1. Overly Broad Selectors (content.js:21-22)
```javascript
// CURRENT - matches too many elements (107+ false positives)
document.querySelectorAll('[data-dropin-container], [class*="container"]')
```

**Required Fix:**
```javascript
// PROPER Adobe EDS dropin selectors
document.querySelectorAll(
  '[data-dropin], [data-dropin-container], .dropin__container, ' +
  '[class^="dropin-"], [class*=" dropin-"]'
)
```

### 2. UI Doesn't Match Demo Inspector

Current styling uses a custom Perplexity-inspired design system. Needs complete rewrite to match Demo Inspector appearance.

## Target Design (from Demo Inspector)

### Panel Container
```css
background: rgba(255, 255, 255, 0.95);
backdrop-filter: blur(4px);
border-radius: 16px;
box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
border: 1px solid #e5e7eb;
padding: 16px;
width: 320px;
```

### Color Palette
| Element | Color | Hex |
|---------|-------|-----|
| Container (active) | Blue gradient | `#2563eb` |
| Slot (active) | Green gradient | `#16a34a` |
| Text primary | Gray 900 | `#111827` |
| Text secondary | Gray 500 | `#6b7280` |
| Background | Gray 50 | `#f9fafb` |

### Key Visual Elements
- Gradient buttons with `hover:scale-[1.02]`
- Icons: 📦 (container), 🎯 (slot)
- Rounded corners: 12px for buttons, 16px for panel
- Collapsible sections with ▼/▶ arrows
- Toggle switches (rounded-full)

## Development Workflow

1. Make changes to any file
2. Go to `chrome://extensions/`
3. Click refresh on Dropin Inspector card
4. Reload test page
5. Click extension icon to test

## Testing

Test on Adobe Commerce pages with dropin components:
- Product detail pages (PDP)
- Cart pages
- Checkout flows
- Any page using Adobe EDS blocks

## Implementation Checklist

### Phase 0: Repository Setup
- [ ] Rename folder from `dropin-inspector` to `dropin-inspector-chrome-extension`
- [ ] Create new private GitHub repository with `gh repo create`
- [ ] Initialize git and push initial commit

### Phase 1: Fix Core Functionality
- [ ] Fix selectors in `content.js` for actual Adobe EDS detection

### Phase 2: Match Demo Inspector Appearance
- [ ] Rewrite `styles.css` to match Demo Inspector appearance
- [ ] Update `popup.html` structure for new layout
- [ ] Update `popup.js` rendering for gradient buttons
- [ ] Add minimize/close buttons (−/×)
- [ ] Add keyboard shortcuts (optional)

### Phase 3: Finalize
- [ ] Test on Adobe Commerce EDS pages
- [ ] Commit and push final changes

## Reference Files

**Demo Inspector (design source):**
- `../demo-inspector/components/InspectorPanel.tsx` - Panel styling
- `../demo-inspector/components/DataSourceButton.tsx` - Button styling
- `../demo-inspector/contexts/DemoInspectorContext.tsx` - Colors

**Research:**
- `.rptc/research/dropin-inspector-ui-redesign/research.md` - Full design analysis

## Related Resources

- [Adobe Commerce EDS Documentation](https://experienceleague.adobe.com/docs/experience-manager-cloud-service/content/edge-delivery/wysiwyg-authoring/edge-dev-getting-started.html)
- [Chrome Extension Manifest V3](https://developer.chrome.com/docs/extensions/mv3/)

# Dropin Structure Inspector - Chrome Extension v2.0

A professional Chrome extension for exploring and debugging Adobe Commerce dropin containers and slots, with a modern developer-tools aesthetic.

## ✨ What's New in v2.0

- **Modern Developer Tools UI** - Dark theme with professional styling inspired by GraphQL inspectors
- **Container Checkboxes** - Toggle containers on/off like slots
- **Smart Logic** - When a container is checked, all its slots are disabled
- **Slot Labels** - When a slot is highlighted, a label shows the container > slot name
- **Smooth Animations** - Gradient transitions, hover effects, and visual feedback
- **Better Visual Hierarchy** - Color-coded containers (blue) vs slots (green)
- **Professional Typography** - Clean system fonts with proper sizing and spacing

## Installation

### For Local Development

1. **Save the extension files** in a folder structure like this:

```
dropin-inspector/
├── manifest.json
├── popup.html
├── popup.js
├── content.js
├── background.js
└── styles.css
```

2. **Load the extension in Chrome**:
   - Open `chrome://extensions/`
   - Enable **Developer mode** (top right)
   - Click **Load unpacked**
   - Select the `dropin-inspector` folder
   - Done! The extension will appear in your Chrome toolbar

## Usage

1. **Navigate to any page with dropins** (like a Bulk.com product page)

2. **Click the extension icon** in the Chrome toolbar to open the inspector

3. **Interact with the panel**:
   - **Containers** show as blue boxes with checkboxes
   - **Check a container** to highlight it on the page
   - **When a container is checked**, its slots are disabled (cannot be toggled independently)
   - **Uncheck a container** to deselect it and allow slot toggling
   - **Check a slot** to highlight just that slot (only if container is unchecked)
   - **Slot labels** appear showing: `Container Name > Slot Name`
   - **Expand/collapse** container sections with the dropdown arrow
   - **Clear all highlights** with the Clear button

4. **Visual feedback**:
   - **Containers** highlight with solid blue border and light blue background
   - **Slots** highlight with dashed green border and light green background
   - **Labels** display at the top of highlighted elements (blue for containers, green for slots)
   - **Page scrolls** automatically to the highlighted element
   - **Smooth animations** on hover and state changes

5. **Summary** shows total count of containers and slots detected

## Features

✅ **Container & Slot Detection** - Automatically finds all dropins  
✅ **Toggle On/Off** - Check/uncheck to show/hide highlights  
✅ **Smart Logic** - Containers disable slots when checked  
✅ **Live Labels** - Shows type and name for each element  
✅ **Auto-scroll** - Navigates to elements automatically  
✅ **Modern UI** - Professional dark theme with smooth transitions  
✅ **Developer-friendly** - Fast, keyboard-accessible, no external dependencies  

## Design System

The extension uses a modern color palette:

- **Containers**: Blue (#0284c7) with gradient (#0369a1 → #0284c7)
- **Slots**: Green (#22c55e) with gradient for hover states
- **Background**: Deep dark (#1a1a1a) with subtle hierarchy
- **Accents**: Amber (#fbbf24) for checkboxes, Red (#ef4444) for destructive actions
- **Text**: Light gray (#e0e0e0) for readability

## Sharing with Colleagues

To share this extension with teammates:

1. **Create a GitHub repository** and commit all files
2. **Share the GitHub link** - they can download and load unpacked
3. **Or ZIP the folder** - send them the zip file with instructions to extract and load

## Customizing the Extension

### Colors

Edit `styles.css` to customize colors:

```css
/* Containers */
.container-item {
  background: linear-gradient(135deg, #0369a1 0%, #0284c7 100%);
}

/* Slots */
.slot-item {
  background: rgba(34, 197, 94, 0.08);
  border-left: 3px solid #22c55e;
}
```

### Detection Selectors

Edit `content.js` to customize what gets detected:

```javascript
// Currently looks for these selectors:
const containerElements = document.querySelectorAll(
  '[data-dropin-container], [class*="container"]'
);

const slotElements = containerEl.querySelectorAll(
  '[data-dropin-slot], [class*="slot"]'
);

// Add your custom selectors here
```

### Labels

Labels are shown in two places:
- In the popup as "Container Name > Slot Name"
- On the page as a fixed position tag above the element

The label shows:
- **Containers**: Just the container name (blue label)
- **Slots**: "Container Name > Slot Name" (green label)

## Requirements

- Chrome/Edge/Brave browser (Manifest V3 compatible)
- No external dependencies
- Works on any page with the detected dropin structure

## Troubleshooting

**"No dropins found"?**
- The page may not have dropins or may use different selectors
- Edit `content.js` lines 17-22 to add custom selectors for your page

**Labels not showing?**
- Make sure the element is in the viewport
- Labels position themselves at the top of the highlighted element
- They automatically adjust as you scroll

**Extension not loading?**
- Check that all files are in the correct folder
- Make sure `manifest.json` is valid JSON
- Refresh the extension after making changes (or toggle it off/on in chrome://extensions)

**Styles not applying?**
- Hard refresh the page (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
- Clear the extension's cached styles
- Check that styles.css is in the same folder as popup.html

## Browser Compatibility

- **Chrome**: 88+
- **Edge**: 88+
- **Brave**: Latest
- **Other Chromium browsers**: Should work with Manifest V3 support

## Performance

The extension is lightweight and performant:
- Minimal DOM manipulation
- Efficient event handling
- CSS-based styling (no heavy JavaScript)
- Lazy element detection on demand
- No persistent storage or background tasks

## Development

To modify the extension:

1. Make changes to any file
2. Go to `chrome://extensions/`
3. Click the refresh icon on the Dropin Inspector card
4. Reload your test page
5. Test your changes

## File Structure

- **manifest.json** - Extension configuration
- **popup.html** - Inspector UI markup
- **popup.js** - Inspector logic and state management
- **content.js** - Page detection and highlighting
- **background.js** - Service worker (minimal)
- **styles.css** - Modern styling with dark theme
- **README.md** - This file

## Version History

**v2.0.0**
- Complete UI redesign with dark theme
- Added container toggle functionality
- Smart logic: containers disable slots
- Improved labels with better positioning
- Better visual hierarchy and animations
- Professional color palette

**v1.0.0**
- Initial release
- Basic container and slot detection
- Highlighting functionality
- Simple UI

## License

Designed for Adobe Commerce developers. Use freely in your projects.

## Support

For issues or feature requests, refer back to your internal team or the GitHub repository.

---

**Ready to explore your dropins?** Click the extension icon and start inspecting! 🔍

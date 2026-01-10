# Step 5: Update Rendering Logic

## Purpose
Update `popup.js` to render tree items with icons and apply active styling when items are checked.

## Prerequisites
- [ ] Step 3 complete (CSS with design tokens)
- [ ] Step 4 complete (HTML structure)

## Tests to Write First (RED Phase)
- [ ] Visual: Containers display with box icon prefix
- [ ] Visual: Slots display with target/bullet indicator
- [ ] Visual: Checked containers have `.active` class applied
- [ ] Visual: Checked slots have `.active` class applied
- [ ] Functional: Close button closes popup (already wired)

## Tasks
- [ ] Add icon span to container rendering in `renderExplorer()`
- [ ] Add indicator span to slot rendering
- [ ] Toggle `.active` class on container-item when checked
- [ ] Toggle `.active` class on slot-item when checked

## Files to Modify
- `popup.js` (after Step 1 rename: `/Users/kukla/Documents/Repositories/app-builder/adobe-demo-system/dropin-inspector-chrome-extension/popup.js`)

## Implementation Details

### Container Icon Addition (lines 54-60)
```javascript
// After creating nameSpan, before label
const icon = document.createElement('span');
icon.className = 'icon';
icon.textContent = '\u{1F4E6}'; // 📦
nameSpan.appendChild(icon);
nameSpan.appendChild(label);
```

### Slot Indicator Addition (lines 113-118)
```javascript
// Before slotName text
const indicator = document.createElement('span');
indicator.className = 'indicator';
indicator.textContent = '\u25A0'; // ■ square bullet
slotItem.appendChild(slotCheckbox);
slotItem.appendChild(indicator);
slotItem.appendChild(slotName);
```

### Active Class Toggle for Containers (line 47-48)
```javascript
// After setting checkbox.checked
if (checkbox.checked) {
  containerItem.classList.add('active');
}
```

### Active Class Toggle for Slots (line 105-106)
```javascript
// After setting slotCheckbox.checked
if (slotCheckbox.checked && !isContainerChecked) {
  slotItem.classList.add('active');
}
```

## Expected Outcome
- Containers show box icon before name
- Slots show square indicator before name
- Checked items visually highlighted via CSS `.active` class
- Buttons remain functional

## Acceptance Criteria
- [ ] Container items render with icon prefix
- [ ] Slot items render with bullet indicator
- [ ] `.active` class applied when checkbox is checked
- [ ] No console errors during render
- [ ] Existing expand/collapse behavior unchanged

## Dependencies from Other Steps
- Step 3: CSS `.active` class styling (add if missing)
- Step 4: HTML element IDs for buttons

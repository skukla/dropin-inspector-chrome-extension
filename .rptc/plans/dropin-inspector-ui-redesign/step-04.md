# Step 4: Update HTML Structure

## Purpose
Modify popup.html to support Demo Inspector layout with header controls and class names matching step-03 CSS.

## Prerequisites
- [ ] Step 3 complete (CSS classes defined)

## Tests to Write First (RED Phase)
- [ ] Visual: Header shows minimize (−) and close (×) buttons
- [ ] Visual: Title displays "DROPIN STRUCTURE"
- [ ] Functional: Header buttons are clickable elements

## Tasks
- [ ] Add header-controls div with minimize and close buttons
- [ ] Update title text to "DROPIN STRUCTURE"
- [ ] Add section-header class for subtitle styling
- [ ] Ensure explorer div supports container-item and slot-item children

## Files to Modify
- `popup.html` (after Step 1 rename: `/Users/kukla/Documents/Repositories/app-builder/adobe-demo-system/dropin-inspector-chrome-extension/popup.html`)

## Implementation Details

### Updated Header Structure
```html
<div class="panel-header">
  <span class="panel-title">DROPIN STRUCTURE</span>
  <div class="header-controls">
    <button class="control-btn" id="minimize-btn">−</button>
    <button class="control-btn" id="close-btn">×</button>
  </div>
</div>
<div class="summary">
  <span id="container-count">0</span> containers,
  <span id="slot-count">0</span> slots
</div>
```

### Footer Buttons
```html
<div class="panel-footer">
  <button class="btn btn-primary" id="clear-btn">Clear</button>
  <button class="btn btn-secondary" id="refresh-btn">Refresh</button>
</div>
```

## Expected Outcome
- HTML structure supports Demo Inspector visual layout
- Class names align with step-03 CSS definitions
- Header controls ready for step-05 JS event handlers

## Acceptance Criteria
- [ ] Header contains minimize and close buttons
- [ ] Title shows "DROPIN STRUCTURE"
- [ ] Class names match CSS: panel-header, panel-title, header-controls, control-btn
- [ ] Explorer div preserved for dynamic content

## Dependencies from Other Steps
- Step 3: CSS must define .panel-title, .header-controls, .control-btn
- Step 5: JS will attach event listeners to new buttons

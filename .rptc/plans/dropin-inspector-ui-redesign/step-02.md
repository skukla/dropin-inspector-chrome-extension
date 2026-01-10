# Step 2: Fix Selectors

## Purpose
Fix overly broad CSS selectors in content.js that cause 107+ false positives by matching any element with "container" or "slot" in its class name. Replace with Adobe EDS-specific dropin selectors.

## Prerequisites
- [ ] Step 1 complete (repository setup)

## Tests to Write First (RED Phase)
- [ ] Manual test: Load extension on non-EDS page (e.g., google.com), verify 0 containers detected
- [ ] Manual test: Load extension on Adobe EDS demo page, verify only actual dropins detected (not 107+)

## Tasks
- [ ] Update container selector in `content.js` lines 21-22
- [ ] Update slot selector in `content.js` line 33
- [ ] Reload extension in chrome://extensions
- [ ] Test on non-EDS page (expect 0 results)
- [ ] Test on EDS page (expect correct dropin count)

## Files to Modify
- `content.js` (after Step 1 rename: `/Users/kukla/Documents/Repositories/app-builder/adobe-demo-system/dropin-inspector-chrome-extension/content.js`)

## Implementation Details

### Container Selector Fix (lines 21-22)

**Current (buggy):**
```javascript
const containerElements = document.querySelectorAll(
  '[data-dropin-container], [class*="container"]'
);
```

**Fixed:**
```javascript
const containerElements = document.querySelectorAll(
  '[data-dropin], [data-dropin-container], .dropin__container, [class^="dropin-"], [class*=" dropin-"]'
);
```

### Slot Selector Fix (line 33)

**Current (buggy):**
```javascript
const slotElements = containerEl.querySelectorAll('[data-dropin-slot], [class*="slot"]');
```

**Fixed:**
```javascript
const slotElements = containerEl.querySelectorAll('[data-dropin-slot], .dropin__slot, [class^="dropin-"][class*="slot"], [class*=" dropin-"][class*="slot"]');
```

## Expected Outcome
- Extension detects only actual Adobe EDS dropins
- No false positives from generic CSS classes like `.my-container` or `.card-slot`
- Clean, accurate dropin tree in panel

## Acceptance Criteria
- [ ] Container selector targets only Adobe EDS patterns
- [ ] Slot selector targets only Adobe EDS patterns
- [ ] Non-EDS pages show 0 containers
- [ ] EDS pages show correct dropin count

## Dependencies from Other Steps
- Step 1: Repository must exist for version control

# Dropin Inspector UI Redesign - Implementation Plan

## Status Tracking
- [x] Planned
- [ ] In Progress
- [ ] Code Review
- [ ] Testing
- [ ] Complete

**Created:** 2026-01-10
**Last Updated:** 2026-01-10

---

## Executive Summary

- **Feature**: Redesign Dropin Inspector Chrome extension to match Demo Inspector visual appearance
- **Purpose**: Create visual consistency with Demo Inspector while fixing selector accuracy issues causing 107+ false positives
- **Approach**: Replace current Perplexity-style CSS with Demo Inspector patterns (white 95% panel, gradient buttons, gray typography), fix Adobe EDS selectors
- **Complexity**: Medium
- **Key Risks**: Selector changes may miss legitimate dropins; visual parity requires careful CSS translation from Tailwind to vanilla

---

## Test Strategy

- **Framework**: Manual testing (Chrome extension - no automated test infrastructure)
- **Coverage Goals**: Visual parity with Demo Inspector, accurate Adobe EDS dropin detection
- **Test Scenarios Summary**:
  - Visual comparison against Demo Inspector appearance
  - Selector accuracy on Adobe Commerce EDS pages (PDP, cart, checkout)
  - Interactive functionality (highlight, collapse, checkbox selection)
  - Edge cases (pages with no dropins, pages with many dropins)

---

## Acceptance Criteria

- [ ] Panel matches Demo Inspector appearance (white 95% bg, 16px radius, heavy shadow)
- [ ] Container items use blue gradient (#2563eb) with icons
- [ ] Slot items use green gradient (#16a34a) with icons
- [ ] Selectors detect only actual Adobe EDS dropins (no false positives)
- [ ] Collapsible sections work with arrow indicators
- [ ] Hover effects include scale transform
- [ ] Extension loads and functions on Chrome

---

## Risk Assessment

| Risk | Category | Likelihood | Impact | Mitigation |
|------|----------|------------|--------|------------|
| Selector changes miss legitimate dropins | Technical | Medium | High | Test on multiple EDS pages before finalizing |
| CSS translation introduces visual bugs | Technical | Medium | Medium | Side-by-side comparison with Demo Inspector |
| Manifest changes break extension | Technical | Low | High | Test reload after each manifest change |

---

## Dependencies

- **New Packages**: None (vanilla JS/CSS)
- **Configuration Changes**: manifest.json may need permission updates
- **External Services**: GitHub (repository creation in Step 1)

---

## File Reference Map

**Existing Files to Modify:**
- `popup.html` - Update structure for new layout
- `popup.js` - Update rendering for gradient buttons, icons
- `styles.css` - Complete rewrite to match Demo Inspector
- `content.js` - Fix Adobe EDS dropin selectors

**New Files to Create:**
- None

---

## Coordination Notes

- **Step Dependencies**: Step 1 (repo setup) must complete before any other steps; Steps 2-5 must run sequentially (Step 2 -> Step 3 -> Step 4 -> Step 5) due to prerequisite chain
- **Integration Points**: popup.js rendering logic must align with styles.css class names and popup.html structure

---

## Next Actions

1. Begin with `/rptc:tdd "@dropin-inspector-ui-redesign/"` to start TDD implementation
2. First step: Repository setup (rename folder, create GitHub repo)

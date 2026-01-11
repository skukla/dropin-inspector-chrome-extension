// Dropin Inspector - Injected Panel
// Detects and highlights Adobe EDS blocks and dropin slots

(function() {
  'use strict';

  // State
  let panel = null;
  let isVisible = false;
  let observer = null;
  let currentUrl = location.href;
  let showEmptySlots = false; // Toggle for showing empty slots
  const activeItems = new Set();
  const expandedBlocks = new Set();
  const elementState = new Map();
  const labelElements = new Map();
  const labelPositions = new Map(); // Store computed positions for collision detection

  // Storage keys
  const STORAGE_KEY_VISIBLE = 'dropinInspector_visible';
  const STORAGE_KEY_POSITION = 'dropinInspector_position';
  const STORAGE_KEY_SHOW_EMPTY = 'dropinInspector_showEmpty';

  // Styles for highlighting
  const TYPE_STYLES = {
    block: {
      border: '2px solid #6366f1',
      outline: '2px solid rgba(99, 102, 241, 0.3)',
      backgroundColor: 'rgba(99, 102, 241, 0.08)',
      labelBg: '#6366f1'
    },
    slot: {
      border: '2px dashed #22c55e',
      outline: '2px dashed rgba(34, 197, 94, 0.4)',
      backgroundColor: 'rgba(34, 197, 94, 0.08)',
      labelBg: '#22c55e'
    }
  };

  // Panel CSS
  const PANEL_CSS = `
    #dropin-inspector-panel {
      position: fixed;
      top: 20px;
      right: 20px;
      width: 300px;
      max-height: 450px;
      background: rgba(255, 255, 255, 0.98);
      border-radius: 12px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 13px;
      z-index: 999999;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    #dropin-inspector-panel * {
      box-sizing: border-box;
    }

    #dropin-inspector-panel.hidden {
      display: none !important;
    }

    .di-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 12px;
      background: linear-gradient(135deg, #6366f1, #4f46e5);
      color: white;
      cursor: move;
      user-select: none;
    }

    .di-title {
      font-weight: 600;
      font-size: 12px;
      letter-spacing: 0.5px;
    }

    .di-controls {
      display: flex;
      gap: 4px;
    }

    .di-control-btn {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      border-radius: 4px;
      padding: 2px 8px;
      cursor: pointer;
      color: white;
      font-size: 14px;
      line-height: 1;
    }

    .di-control-btn:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    .di-summary {
      padding: 8px 12px;
      font-size: 11px;
      color: #6b7280;
      border-bottom: 1px solid #e5e7eb;
      background: #f9fafb;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .di-summary-text {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .di-toggle-wrapper {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 10px;
      color: #9ca3af;
    }

    .di-toggle {
      position: relative;
      width: 28px;
      height: 16px;
      background: #d1d5db;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.2s ease;
    }

    .di-toggle::after {
      content: '';
      position: absolute;
      top: 2px;
      left: 2px;
      width: 12px;
      height: 12px;
      background: white;
      border-radius: 50%;
      transition: transform 0.2s ease;
      box-shadow: 0 1px 2px rgba(0,0,0,0.2);
    }

    .di-toggle.active {
      background: #6366f1;
    }

    .di-toggle.active::after {
      transform: translateX(12px);
    }

    .di-watching {
      width: 6px;
      height: 6px;
      background: #22c55e;
      border-radius: 50%;
    }

    .di-explorer {
      flex: 1;
      overflow-y: auto;
      padding: 8px;
      max-height: 300px;
    }

    .di-block-group {
      margin-bottom: 4px;
    }

    .di-slot-group {
      margin-bottom: 2px;
    }

    .di-item {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 8px;
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.15s;
    }

    .di-item:hover {
      background: #f3f4f6;
    }

    .di-item.active {
      color: white;
    }

    .di-item-block.active {
      background: linear-gradient(135deg, #818cf8, #6366f1);
    }

    .di-item-slot.active {
      background: linear-gradient(135deg, #4ade80, #22c55e);
    }

    .di-item.nested {
      margin-left: 16px;
    }

    .di-arrow {
      width: 14px;
      font-size: 9px;
      color: #9ca3af;
      text-align: center;
      flex-shrink: 0;
    }

    .di-icon {
      width: 14px;
      height: 14px;
      flex-shrink: 0;
      opacity: 0.6;
    }

    .di-item.active .di-icon {
      opacity: 1;
    }

    .di-icon svg {
      width: 14px;
      height: 14px;
    }

    .di-item-block .di-icon {
      color: #6366f1;
    }

    .di-item-slot .di-icon {
      color: #22c55e;
    }

    .di-item.active .di-icon {
      color: white;
    }

    .di-name {
      flex: 1;
      font-size: 12px;
      font-weight: 500;
    }

    .di-badge {
      background: #e5e7eb;
      color: #6b7280;
      font-size: 10px;
      padding: 1px 6px;
      border-radius: 10px;
    }

    .di-item.active .di-badge {
      background: rgba(255, 255, 255, 0.25);
      color: white;
    }

    .di-children {
      display: none;
      margin-top: 2px;
      padding-left: 4px;
      border-left: 1px solid #e5e7eb;
      margin-left: 6px;
    }

    .di-children.visible {
      display: block;
    }

    .di-block-group .di-block-group {
      margin-bottom: 2px;
    }

    .di-footer {
      display: flex;
      gap: 6px;
      padding: 8px 12px;
      border-top: 1px solid #e5e7eb;
      background: #f9fafb;
    }

    .di-btn {
      flex: 1;
      padding: 6px 12px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 11px;
      font-weight: 500;
      font-family: inherit;
    }

    .di-btn-primary {
      background: linear-gradient(135deg, #6366f1, #4f46e5);
      color: white;
    }

    .di-btn-secondary {
      background: white;
      color: #374151;
      border: 1px solid #d1d5db;
    }

    .di-btn:hover {
      opacity: 0.9;
    }

    .di-empty {
      text-align: center;
      padding: 24px;
      color: #9ca3af;
    }

    .di-empty-icon {
      font-size: 24px;
      margin-bottom: 8px;
    }

    .di-explorer::-webkit-scrollbar {
      width: 6px;
    }

    .di-explorer::-webkit-scrollbar-track {
      background: #f3f4f6;
    }

    .di-explorer::-webkit-scrollbar-thumb {
      background: #d1d5db;
      border-radius: 3px;
    }
  `;

  // Icons
  const ICONS = {
    // Package/box icon with open top flaps
    block: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8l-9-5-9 5v8l9 5 9-5V8z"></path><path d="M3 8l9 5 9-5"></path><path d="M12 13v9"></path></svg>`,
    // Puzzle piece icon
    slot: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 0 1-.837.276c-.47-.07-.802-.48-.968-.925a2.501 2.501 0 1 0-3.214 3.214c.446.166.855.497.925.968a.979.979 0 0 1-.276.837l-1.61 1.61a2.404 2.404 0 0 1-1.705.707 2.402 2.402 0 0 1-1.704-.706l-1.568-1.568a1.026 1.026 0 0 0-.877-.29c-.493.074-.84.504-1.02.968a2.5 2.5 0 1 1-3.237-3.237c.464-.18.894-.527.967-1.02a1.026 1.026 0 0 0-.289-.877l-1.568-1.568A2.402 2.402 0 0 1 1.998 12c0-.617.236-1.234.706-1.704L4.315 8.69c.218-.22.346-.549.276-.837-.07-.471-.48-.802-.925-.968a2.501 2.501 0 1 1 3.214-3.214c.166.446.497.855.968.925.288.07.617-.058.837-.276l1.61-1.611a2.404 2.404 0 0 1 1.705-.706c.618 0 1.234.236 1.704.706l1.568 1.568c.23.23.556.338.877.29.493-.074.84-.504 1.02-.969a2.5 2.5 0 1 1 3.237 3.237c-.464.18-.894.527-.967 1.02Z"></path></svg>`
  };

  // Initialize panel
  function createPanel() {
    if (panel) return;

    // Inject styles
    const style = document.createElement('style');
    style.textContent = PANEL_CSS;
    document.head.appendChild(style);

    // Create panel
    panel = document.createElement('div');
    panel.id = 'dropin-inspector-panel';
    panel.className = 'hidden';
    panel.innerHTML = `
      <div class="di-header">
        <span class="di-title">DROPIN INSPECTOR</span>
        <div class="di-controls">
          <button class="di-control-btn" id="di-minimize" title="Minimize">−</button>
          <button class="di-control-btn" id="di-close" title="Close">×</button>
        </div>
      </div>
      <div class="di-summary">
        <span class="di-summary-text" id="di-summary">0 blocks • 0 slots</span>
        <div class="di-toggle-wrapper">
          <span>Empty</span>
          <div class="di-toggle" id="di-toggle-empty" title="Show empty slots/blocks"></div>
        </div>
      </div>
      <div class="di-explorer" id="di-explorer"></div>
      <div class="di-footer">
        <button class="di-btn di-btn-primary" id="di-refresh">Refresh</button>
        <button class="di-btn di-btn-secondary" id="di-toggle-all">Show All</button>
      </div>
    `;

    document.body.appendChild(panel);

    // Event listeners
    panel.querySelector('#di-close').addEventListener('click', hidePanel);
    panel.querySelector('#di-minimize').addEventListener('click', toggleMinimize);
    panel.querySelector('#di-refresh').addEventListener('click', loadStructure);
    panel.querySelector('#di-toggle-all').addEventListener('click', toggleAllHighlights);
    panel.querySelector('#di-toggle-empty').addEventListener('click', toggleEmptySlots);

    // Drag functionality
    initDrag();
  }

  // Drag functionality
  function initDrag() {
    const header = panel.querySelector('.di-header');
    let isDragging = false;
    let startX, startY, startLeft, startTop;

    header.addEventListener('mousedown', (e) => {
      if (e.target.closest('.di-control-btn')) return;
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      const rect = panel.getBoundingClientRect();
      startLeft = rect.left;
      startTop = rect.top;
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      panel.style.left = (startLeft + dx) + 'px';
      panel.style.top = (startTop + dy) + 'px';
      panel.style.right = 'auto';
    });

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        saveState(); // Save position after drag
      }
    });
  }

  // Toggle panel visibility
  function togglePanel() {
    if (!panel) createPanel();

    if (isVisible) {
      hidePanel();
    } else {
      showPanel();
    }
  }

  function showPanel() {
    if (!panel) createPanel();
    panel.classList.remove('hidden');
    isVisible = true;
    loadStructure();
    startObserver(); // Watch for async-loaded dropins
    saveState();
  }

  function hidePanel() {
    if (panel) {
      panel.classList.add('hidden');
    }
    isVisible = false;
    stopObserver();
    clearAllHighlights();
    saveState();
  }

  let isMinimized = false;
  function toggleMinimize() {
    const explorer = panel.querySelector('.di-explorer');
    const footer = panel.querySelector('.di-footer');
    const summary = panel.querySelector('.di-summary');

    isMinimized = !isMinimized;

    if (isMinimized) {
      explorer.style.display = 'none';
      footer.style.display = 'none';
      summary.style.display = 'none';
    } else {
      explorer.style.display = '';
      footer.style.display = '';
      summary.style.display = '';
    }
  }

  function toggleEmptySlots() {
    showEmptySlots = !showEmptySlots;
    updateEmptyToggle();

    // Clear highlights and reload structure
    clearAllHighlights();
    loadStructure();
    saveState();
  }

  function updateEmptyToggle() {
    if (!panel) return;
    const toggle = panel.querySelector('#di-toggle-empty');
    if (toggle) {
      toggle.classList.toggle('active', showEmptySlots);
      toggle.title = showEmptySlots ? 'Hide empty slots/blocks' : 'Show empty slots/blocks';
    }
  }

  // Get vertical position of element for sorting
  function getVerticalPosition(el) {
    const rect = el.getBoundingClientRect();
    return rect.top + window.scrollY;
  }

  // Check if element is visible (not hidden by CSS)
  // Filters out empty slots/placeholders that have no rendered content (unless showEmptySlots is on)
  function isElementVisible(el, blockName = null) {
    const style = window.getComputedStyle(el);

    // Check for explicitly hidden elements (always filter these)
    if (style.display === 'none') return false;
    if (style.visibility === 'hidden') return false;
    if (style.opacity === '0') return false;

    // Check dimensions
    const rect = el.getBoundingClientRect();

    // If showing empty slots, only filter truly hidden elements
    if (showEmptySlots) {
      return true;
    }

    // Always show header and footer - they're fundamental structural elements
    if (blockName) {
      const name = blockName.toLowerCase();
      if (name === 'header' || name === 'footer' ||
          name.includes('header') || name.includes('footer')) {
        return rect.height > 0 || rect.width > 0;
      }
    }

    // Filter out elements with no height (empty slots/placeholders)
    if (rect.height === 0) return false;

    // Also filter zero-width elements
    if (rect.width === 0) return false;

    // Filter out elements that have dimensions but no meaningful content
    // (e.g., placeholder divs with just padding/margin)
    if (!hasVisibleContent(el)) return false;

    return true;
  }

  // Check if element has meaningful visible content
  function hasVisibleContent(el) {
    // Check for text content (excluding whitespace)
    const textContent = el.textContent?.trim();
    if (textContent && textContent.length > 0) return true;

    // Check for images
    if (el.querySelector('img, svg, video, canvas, iframe')) return true;

    // Check for form elements
    if (el.querySelector('input, button, select, textarea')) return true;

    // Check for elements with background images
    const style = window.getComputedStyle(el);
    if (style.backgroundImage && style.backgroundImage !== 'none') return true;

    // Check children for visible content (non-empty children with dimensions)
    const children = el.children;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      const childRect = child.getBoundingClientRect();
      if (childRect.width > 0 && childRect.height > 0) {
        const childStyle = window.getComputedStyle(child);
        if (childStyle.display !== 'none' &&
            childStyle.visibility !== 'hidden' &&
            childStyle.opacity !== '0') {
          return true;
        }
      }
    }

    return false;
  }

  // Structure detection with nested block support
  function initializeStructure() {
    const SLOT_SELECTOR = '[data-slot], [data-slot-key]';
    const blockElements = Array.from(document.querySelectorAll('[data-block-name]'));
    const processedSlots = new Set();
    const processedBlocks = new Set();

    // Build a map of parent-child relationships
    function getDirectParentBlock(el) {
      let parent = el.parentElement;
      while (parent) {
        if (parent.hasAttribute && parent.hasAttribute('data-block-name')) {
          return parent;
        }
        parent = parent.parentElement;
      }
      return null;
    }

    // Get direct slots for a block (not in nested blocks)
    // Also detects blocks that are inside slots
    function getDirectSlots(blockEl) {
      const slots = [];
      const slotsInBlock = Array.from(blockEl.querySelectorAll(SLOT_SELECTOR));
      slotsInBlock.sort((a, b) => getVerticalPosition(a) - getVerticalPosition(b));

      slotsInBlock.forEach((slotEl) => {
        if (processedSlots.has(slotEl)) return;

        // Check if this slot belongs to a nested block
        const slotParentBlock = getDirectParentBlock(slotEl);
        if (slotParentBlock && slotParentBlock !== blockEl) return; // Belongs to a nested block

        // Skip slots with no visible dimensions
        if (!isElementVisible(slotEl)) return;

        processedSlots.add(slotEl);

        // Find blocks that are inside this slot (but not in deeper nested blocks)
        const blocksInSlot = [];
        blockElements.forEach(nestedBlockEl => {
          if (processedBlocks.has(nestedBlockEl)) return;
          // Check if this block is inside the slot
          if (!slotEl.contains(nestedBlockEl)) return;
          // Check if there's a closer parent block between the slot and this block
          const nestedParentBlock = getDirectParentBlock(nestedBlockEl);
          if (nestedParentBlock && nestedParentBlock !== blockEl) return; // Has a closer parent block
          // Check visibility (pass block name for header/footer exception)
          const nestedBlockName = nestedBlockEl.getAttribute('data-block-name');
          if (!isElementVisible(nestedBlockEl, nestedBlockName)) {
            processedBlocks.add(nestedBlockEl);
            return;
          }
          blocksInSlot.push(nestedBlockEl);
        });
        blocksInSlot.sort((a, b) => getVerticalPosition(a) - getVerticalPosition(b));

        // Build nested blocks inside this slot
        const nestedBlocks = blocksInSlot.map(el => buildBlockTree(el, 0)); // depth will be adjusted during rendering

        slots.push({
          name: slotEl.getAttribute('data-slot') || slotEl.getAttribute('data-slot-key') || 'Unnamed Slot',
          element: slotEl,
          children: nestedBlocks // Blocks nested inside this slot
        });
      });

      return slots;
    }

    // Get direct child blocks
    function getDirectChildBlocks(parentEl) {
      const children = [];
      blockElements.forEach(blockEl => {
        if (processedBlocks.has(blockEl)) return;
        const directParent = getDirectParentBlock(blockEl);
        if (directParent === parentEl) {
          // Skip blocks with no visible dimensions (pass block name for header/footer exception)
          const blockName = blockEl.getAttribute('data-block-name');
          if (!isElementVisible(blockEl, blockName)) {
            processedBlocks.add(blockEl); // Mark as processed so we don't revisit
            return;
          }
          children.push(blockEl);
        }
      });
      children.sort((a, b) => getVerticalPosition(a) - getVerticalPosition(b));
      return children;
    }

    // Recursively build block tree
    function buildBlockTree(blockEl, depth = 0) {
      processedBlocks.add(blockEl);

      const block = {
        name: blockEl.getAttribute('data-block-name'),
        element: blockEl,
        slots: getDirectSlots(blockEl),
        children: [],
        depth: depth
      };

      // Find direct child blocks
      const childBlockEls = getDirectChildBlocks(blockEl);
      childBlockEls.forEach(childEl => {
        block.children.push(buildBlockTree(childEl, depth + 1));
      });

      return block;
    }

    // Find top-level blocks (no parent block) with visible dimensions
    const topLevelBlocks = blockElements.filter(el => {
      if (getDirectParentBlock(el)) return false;
      const blockName = el.getAttribute('data-block-name');
      return isElementVisible(el, blockName);
    });
    topLevelBlocks.sort((a, b) => getVerticalPosition(a) - getVerticalPosition(b));

    // Build tree from top-level blocks
    const blocks = topLevelBlocks.map(el => buildBlockTree(el));

    // Find standalone slots (outside any block) with visible dimensions
    const allSlots = Array.from(document.querySelectorAll(SLOT_SELECTOR));
    const standaloneSlots = [];

    allSlots.forEach((slotEl) => {
      if (processedSlots.has(slotEl)) return;
      const isInsideBlock = blockElements.some(block => block.contains(slotEl));
      if (isInsideBlock) return;

      // Skip slots with no visible dimensions
      if (!isElementVisible(slotEl)) return;

      processedSlots.add(slotEl);
      standaloneSlots.push({
        name: slotEl.getAttribute('data-slot') || slotEl.getAttribute('data-slot-key') || 'Unnamed Slot',
        element: slotEl
      });
    });

    standaloneSlots.sort((a, b) => getVerticalPosition(a.element) - getVerticalPosition(b.element));

    if (standaloneSlots.length > 0) {
      blocks.push({
        name: 'Standalone Slots',
        element: document.body,
        slots: standaloneSlots,
        children: [],
        depth: 0
      });
    }

    // Assign IDs (flatten for counting)
    let blockIndex = 0;
    let slotIndex = 0;
    let totalBlocks = 0;
    let totalSlots = 0;

    function assignIds(blockList) {
      blockList.forEach(block => {
        block.id = `block-${blockIndex++}`;
        totalBlocks++;
        block.slots.forEach(slot => {
          slot.id = `slot-${slotIndex++}`;
          totalSlots++;
        });
        if (block.children.length > 0) {
          assignIds(block.children);
        }
      });
    }

    assignIds(blocks);

    return { blocks, totals: { blocks: totalBlocks, slots: totalSlots } };
  }

  // MutationObserver to detect async-loaded dropins
  function startObserver() {
    if (observer) return;

    let debounceTimer = null;

    observer = new MutationObserver((mutations) => {
      // Check if any mutations added elements with data-slot or data-block-name
      const hasRelevantChanges = mutations.some(mutation => {
        if (mutation.type === 'childList') {
          for (const node of mutation.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (node.matches && (node.matches('[data-slot]') || node.matches('[data-slot-key]') || node.matches('[data-block-name]'))) {
                return true;
              }
              if (node.querySelector && (node.querySelector('[data-slot], [data-slot-key], [data-block-name]'))) {
                return true;
              }
            }
          }
        }
        return false;
      });

      if (hasRelevantChanges && isVisible) {
        // Debounce to avoid too many re-renders
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          loadStructure();
        }, 300);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  function stopObserver() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  }

  // Load and render structure
  function loadStructure() {
    const structure = initializeStructure();
    renderExplorer(structure);
    updateSummary(structure.totals);
  }

  function renderExplorer(structure) {
    const explorer = panel.querySelector('#di-explorer');
    explorer.innerHTML = '';

    if (!structure.blocks.length) {
      explorer.innerHTML = `
        <div class="di-empty">
          <div class="di-empty-icon">📦</div>
          <div>No dropins found on this page</div>
        </div>
      `;
      return;
    }

    // Build a flat map of all blocks and slots for easy lookup
    const blockMap = new Map();
    const slotMap = new Map();

    function mapBlocksAndSlots(blockList) {
      blockList.forEach(block => {
        blockMap.set(block.id, block);
        block.slots.forEach(slot => {
          slotMap.set(slot.id, slot);
          // Also map blocks nested inside this slot
          if (slot.children && slot.children.length > 0) {
            mapBlocksAndSlots(slot.children);
          }
        });
        if (block.children.length > 0) {
          mapBlocksAndSlots(block.children);
        }
      });
    }
    mapBlocksAndSlots(structure.blocks);

    // Render top-level blocks
    structure.blocks.forEach(block => {
      const blockGroup = document.createElement('div');
      blockGroup.className = 'di-block-group';
      blockGroup.innerHTML = renderBlock(block);
      explorer.appendChild(blockGroup);
    });

    // Attach event listeners using data attributes
    explorer.querySelectorAll('.di-item-block').forEach(blockEl => {
      const blockId = blockEl.dataset.blockId;
      const block = blockMap.get(blockId);
      if (!block) return;

      const arrow = blockEl.querySelector('.di-arrow');
      const blockGroup = blockEl.closest('.di-block-group');

      arrow.addEventListener('click', (e) => {
        e.stopPropagation();
        // Find the children container for this specific block
        const childrenContainer = blockEl.nextElementSibling;
        if (childrenContainer && childrenContainer.classList.contains('di-children')) {
          toggleBlockExpandById(blockId, childrenContainer, arrow);
        }
      });

      blockEl.addEventListener('click', (e) => {
        if (!e.target.closest('.di-arrow')) {
          toggleHighlight(block.id, block.name, 'block', blockEl);
        }
      });
    });

    // Slot listeners
    explorer.querySelectorAll('.di-item-slot').forEach(slotEl => {
      const slotId = slotEl.dataset.slotId;
      const slot = slotMap.get(slotId);
      if (!slot) return;

      const arrow = slotEl.querySelector('.di-arrow');

      // Handle arrow click for slots with nested blocks
      if (arrow && slot.children && slot.children.length > 0) {
        arrow.addEventListener('click', (e) => {
          e.stopPropagation();
          const childrenContainer = slotEl.nextElementSibling;
          if (childrenContainer && childrenContainer.classList.contains('di-children')) {
            toggleBlockExpandById(slotId, childrenContainer, arrow);
          }
        });
      }

      slotEl.addEventListener('click', (e) => {
        if (!e.target.closest('.di-arrow')) {
          toggleHighlight(slot.id, slot.name, 'slot', slotEl);
        }
      });
    });
  }

  function renderBlock(block, depth = 0) {
    const hasChildren = block.slots.length > 0 || block.children.length > 0;
    const isExpanded = expandedBlocks.has(block.id);
    const isActive = activeItems.has(block.id);
    const childCount = block.slots.length + block.children.length;

    // Calculate indent based on depth
    const indent = depth > 0 ? ` style="margin-left: ${depth * 16}px"` : '';

    let html = `
      <div class="di-item di-item-block${isActive ? ' active' : ''}"${indent} data-block-id="${block.id}">
        <span class="di-arrow">${hasChildren ? (isExpanded ? '▼' : '▶') : ''}</span>
        <span class="di-icon">${ICONS.block}</span>
        <span class="di-name">${block.name}</span>
        ${hasChildren ? `<span class="di-badge">${childCount}</span>` : ''}
      </div>
    `;

    if (hasChildren) {
      html += `<div class="di-children${isExpanded ? ' visible' : ''}" data-parent="${block.id}">`;

      // Combine blocks and slots, then sort by vertical position
      const allChildren = [];

      block.children.forEach(childBlock => {
        allChildren.push({
          type: 'block',
          item: childBlock,
          position: getVerticalPosition(childBlock.element)
        });
      });

      block.slots.forEach(slot => {
        allChildren.push({
          type: 'slot',
          item: slot,
          position: getVerticalPosition(slot.element)
        });
      });

      // Sort by vertical position (top to bottom), DOM order preserved for same position
      allChildren.sort((a, b) => a.position - b.position);

      // Render in sorted order
      allChildren.forEach(child => {
        if (child.type === 'block') {
          html += `<div class="di-block-group">${renderBlock(child.item, depth + 1)}</div>`;
        } else {
          // Render slot (may have nested blocks inside)
          const slot = child.item;
          const slotActive = activeItems.has(slot.id);
          const slotIndent = (depth + 1) * 16;
          const slotHasChildren = slot.children && slot.children.length > 0;
          const slotExpanded = expandedBlocks.has(slot.id);

          html += `
            <div class="di-slot-group">
              <div class="di-item di-item-slot nested${slotActive ? ' active' : ''}" style="margin-left: ${slotIndent}px" data-slot-id="${slot.id}">
                <span class="di-arrow">${slotHasChildren ? (slotExpanded ? '▼' : '▶') : ''}</span>
                <span class="di-icon">${ICONS.slot}</span>
                <span class="di-name">${slot.name}</span>
                ${slotHasChildren ? `<span class="di-badge">${slot.children.length}</span>` : ''}
              </div>
              ${slotHasChildren ? `
                <div class="di-children${slotExpanded ? ' visible' : ''}" data-parent="${slot.id}">
                  ${slot.children.map(nestedBlock =>
                    `<div class="di-block-group">${renderBlock(nestedBlock, depth + 2)}</div>`
                  ).join('')}
                </div>
              ` : ''}
            </div>
          `;
        }
      });

      html += '</div>';
    }

    return html;
  }

  function toggleBlockExpandById(blockId, childrenContainer, arrow) {
    if (expandedBlocks.has(blockId)) {
      expandedBlocks.delete(blockId);
      childrenContainer.classList.remove('visible');
      arrow.textContent = '▶';
    } else {
      expandedBlocks.add(blockId);
      childrenContainer.classList.add('visible');
      arrow.textContent = '▼';
    }
  }

  function updateSummary(totals) {
    const summary = panel.querySelector('#di-summary');
    summary.innerHTML = `<span class="di-watching" title="Watching for changes"></span>${totals.blocks} blocks • ${totals.slots} slots`;
  }

  // Highlighting
  function toggleHighlight(itemId, itemName, type, itemEl) {
    const structure = initializeStructure();

    if (activeItems.has(itemId)) {
      activeItems.delete(itemId);
      clearHighlight(itemId);
      itemEl.classList.remove('active');
    } else {
      activeItems.add(itemId);
      highlightElement(itemId, itemName, type, structure);
      itemEl.classList.add('active');
    }

    updateToggleButton();
  }

  function highlightElement(elementId, label, type, structure, skipScroll = false) {
    const elementType = elementId.split('-')[0];
    let element = null;

    // Helper to find block or slot by ID in nested structure
    function findInBlocks(blocks) {
      for (const block of blocks) {
        if (elementType === 'block' && block.id === elementId) {
          return block.element;
        }
        if (elementType === 'slot') {
          for (const slot of block.slots) {
            if (slot.id === elementId) {
              return slot.element;
            }
          }
        }
        // Search in children
        if (block.children && block.children.length > 0) {
          const found = findInBlocks(block.children);
          if (found) return found;
        }
      }
      return null;
    }

    element = findInBlocks(structure.blocks);

    if (!element) return;

    // Store original styles AND the element reference
    elementState.set(elementId, {
      element: element,
      border: element.style.border,
      outline: element.style.outline,
      backgroundColor: element.style.backgroundColor,
      position: element.style.position,
      zIndex: element.style.zIndex
    });

    // Apply highlight
    const styles = TYPE_STYLES[elementType];
    element.style.border = styles.border;
    element.style.outline = styles.outline;
    element.style.backgroundColor = styles.backgroundColor;
    element.style.position = 'relative';
    element.style.zIndex = '10000';

    if (skipScroll) {
      // Add label immediately without scrolling
      createLabel(elementId, element, label, elementType);
    } else {
      // Smart scrolling based on element size and distance
      const rect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const isTallElement = rect.height > viewportHeight;

      // For tall elements, always use instant scroll to avoid timing/positioning issues
      // Smooth scroll for tall elements causes labels to appear in wrong places
      if (isTallElement) {
        element.scrollIntoView({ behavior: 'auto', block: 'start' });
        // Small delay for DOM to settle after instant scroll
        setTimeout(() => {
          createLabel(elementId, element, label, elementType);
        }, 50);
      } else {
        // Normal elements: check if it's a long scroll
        const scrollDistance = Math.abs(rect.top);
        const isLongScroll = scrollDistance > viewportHeight;

        if (isLongScroll) {
          element.scrollIntoView({ behavior: 'auto', block: 'center' });
          setTimeout(() => {
            createLabel(elementId, element, label, elementType);
          }, 50);
        } else {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(() => {
            createLabel(elementId, element, label, elementType);
          }, 400);
        }
      }
    }
  }

  function clearHighlight(elementId) {
    if (!elementState.has(elementId)) return;

    const state = elementState.get(elementId);
    const element = state.element;

    if (element) {
      element.style.border = state.border;
      element.style.outline = state.outline;
      element.style.backgroundColor = state.backgroundColor;
      element.style.position = state.position;
      element.style.zIndex = state.zIndex;
    }

    elementState.delete(elementId);

    const label = labelElements.get(elementId);
    if (label) {
      label.remove();
      labelElements.delete(elementId);
      labelPositions.delete(elementId);
    }
  }

  function clearAllHighlights() {
    activeItems.forEach(itemId => {
      clearHighlight(itemId);
    });
    activeItems.clear();

    labelElements.forEach(label => label.remove());
    labelElements.clear();
    labelPositions.clear();

    // Update UI
    if (panel) {
      panel.querySelectorAll('.di-item.active').forEach(el => {
        el.classList.remove('active');
      });
    }

    updateToggleButton();
  }

  function showAllHighlights() {
    const structure = initializeStructure();

    // Helper to highlight all blocks and slots recursively (skip scroll)
    function highlightAll(blocks) {
      blocks.forEach(block => {
        if (!activeItems.has(block.id)) {
          activeItems.add(block.id);
          highlightElement(block.id, block.name, 'block', structure, true);
        }
        block.slots.forEach(slot => {
          if (!activeItems.has(slot.id)) {
            activeItems.add(slot.id);
            highlightElement(slot.id, slot.name, 'slot', structure, true);
          }
        });
        if (block.children && block.children.length > 0) {
          highlightAll(block.children);
        }
      });
    }

    highlightAll(structure.blocks);

    // Update UI - mark all items as active
    if (panel) {
      panel.querySelectorAll('.di-item').forEach(el => {
        el.classList.add('active');
      });
    }

    updateToggleButton();
  }

  function toggleAllHighlights() {
    if (activeItems.size > 0) {
      clearAllHighlights();
    } else {
      showAllHighlights();
    }
  }

  function updateToggleButton() {
    if (!panel) return;
    const btn = panel.querySelector('#di-toggle-all');
    if (btn) {
      btn.textContent = activeItems.size > 0 ? 'Clear All' : 'Show All';
    }
  }

  // Check if two rectangles overlap
  function rectsOverlap(rect1, rect2) {
    return !(rect1.right < rect2.left ||
             rect1.left > rect2.right ||
             rect1.bottom < rect2.top ||
             rect1.top > rect2.bottom);
  }

  // Find best non-overlapping position for a label
  // Alternates preference between above/below to spread out labels
  function findBestLabelPosition(label, elementRect, currentElement, adjustedScrollTop = null) {
    const labelWidth = label.offsetWidth;
    const labelHeight = label.offsetHeight;
    // Use adjusted scroll position if provided (for pending scrolls)
    const scrollTop = adjustedScrollTop !== null ? adjustedScrollTop : (window.pageYOffset || document.documentElement.scrollTop);
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    const BUFFER = 4; // Gap between label and element
    const LABEL_BUFFER = 6; // Minimum gap between labels

    // Element position in document coordinates
    const elemTop = elementRect.top + scrollTop;
    const elemLeft = elementRect.left + scrollLeft;
    const elemRight = elementRect.right + scrollLeft;
    const elemBottom = elementRect.bottom + scrollTop;

    // Collect all existing label rects (with buffer)
    const existingLabelRects = [];
    labelPositions.forEach((pos) => {
      existingLabelRects.push({
        top: pos.top - LABEL_BUFFER,
        left: pos.left - LABEL_BUFFER,
        right: pos.left + pos.width + LABEL_BUFFER,
        bottom: pos.top + pos.height + LABEL_BUFFER
      });
    });

    // Only avoid other LABELS, not other highlighted elements
    // This allows labels to be adjacent to their own element
    const allObstacles = existingLabelRects;

    // Check if a position overlaps with any obstacle
    function hasCollision(rect) {
      return allObstacles.some(obstacle => rectsOverlap(rect, obstacle));
    }

    // Define all possible positions
    const above = {
      name: 'above',
      top: elemTop - labelHeight - BUFFER,
      left: elemLeft,
      right: elemLeft + labelWidth,
      bottom: elemTop - BUFFER
    };
    const below = {
      name: 'below',
      top: elemBottom + BUFFER,
      left: elemLeft,
      right: elemLeft + labelWidth,
      bottom: elemBottom + BUFFER + labelHeight
    };
    const right = {
      name: 'right',
      top: elemTop,
      left: elemRight + BUFFER,
      right: elemRight + BUFFER + labelWidth,
      bottom: elemTop + labelHeight
    };
    const left = {
      name: 'left',
      top: elemTop,
      left: elemLeft - labelWidth - BUFFER,
      right: elemLeft - BUFFER,
      bottom: elemTop + labelHeight
    };

    // Smart positioning approach:
    // 1. Always try "above" first - it's the most natural position
    // 2. If "above" collides, check available space to determine best fallback
    // 3. Prefer "right" if element doesn't extend to viewport edge

    // First, try above - if clear, use it
    if (!hasCollision(above)) {
      return { top: above.top, left: above.left };
    }

    // "Above" has collision - determine best fallback based on available space
    const viewportWidth = window.innerWidth;
    const spaceOnRight = viewportWidth - elementRect.right;
    const spaceOnLeft = elementRect.left;
    const minSpaceNeeded = labelWidth + 20; // Label width + buffer

    // Build fallback order based on available space
    let fallbackPositions;
    if (spaceOnRight >= minSpaceNeeded) {
      // Plenty of room on right - prefer it
      fallbackPositions = [right, below, left];
    } else if (spaceOnLeft >= minSpaceNeeded) {
      // Room on left but not right
      fallbackPositions = [below, left, right];
    } else {
      // Element spans most of viewport - use below
      fallbackPositions = [below, right, left];
    }

    for (const pos of fallbackPositions) {
      if (!hasCollision(pos)) {
        return { top: pos.top, left: pos.left };
      }
    }

    // All positions have collisions, default to below
    return { top: below.top, left: below.left };
  }

  function createLabel(elementId, element, text, type) {
    const existing = labelElements.get(elementId);
    if (existing) existing.remove();

    const styles = TYPE_STYLES[type];
    const label = document.createElement('div');

    Object.assign(label.style, {
      position: 'absolute',
      padding: '3px 8px',
      borderRadius: '3px',
      fontSize: '11px',
      fontWeight: '600',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      background: styles.labelBg,
      color: 'white',
      whiteSpace: 'nowrap',
      zIndex: '999998',
      pointerEvents: 'none',
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
    });

    label.textContent = text;

    // Append to body so label isn't clipped by parent overflow
    document.body.appendChild(label);

    // Get element rect for positioning
    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const viewportHeight = window.innerHeight;
    const labelHeight = label.offsetHeight;

    // For tall elements (taller than viewport), position label at the visible top
    // rather than the geometric top of the element
    let effectiveRect = rect;
    let adjustedScrollTop = scrollTop;

    if (rect.height > viewportHeight) {
      // For tall elements, if the element is off-screen, the scroll hasn't completed yet
      // Calculate where the element WILL be after scroll completes
      if (rect.top < -100 || rect.top > viewportHeight) {
        // Element is off-screen - scroll is still in progress
        // Calculate the target scroll position (where scrollIntoView will end up)
        const elementDocTop = scrollTop + rect.top; // Element's position in document
        adjustedScrollTop = elementDocTop; // After scroll, viewport will be at element top

        // Create effective rect as if element is at top of viewport
        effectiveRect = {
          top: 0,
          bottom: viewportHeight,
          left: rect.left,
          right: rect.right,
          width: rect.width,
          height: viewportHeight
        };
      } else {
        // Element is visible - create effective rect for visible portion
        const visibleTop = Math.max(rect.top, 0);
        const visibleBottom = Math.min(rect.bottom, viewportHeight);
        effectiveRect = {
          top: visibleTop,
          bottom: visibleBottom,
          left: rect.left,
          right: rect.right,
          width: rect.width,
          height: visibleBottom - visibleTop
        };
      }
    }

    // Find best position (tries above, below, right, left)
    // Pass adjustedScrollTop to account for pending scroll
    const finalPosition = findBestLabelPosition(label, effectiveRect, element, adjustedScrollTop);

    // Ensure label stays within viewport (use adjusted scroll position)
    finalPosition.top = Math.max(adjustedScrollTop + 4, finalPosition.top);
    finalPosition.left = Math.max(4, finalPosition.left);

    label.style.top = finalPosition.top + 'px';
    label.style.left = finalPosition.left + 'px';

    // Store position for collision detection (more reliable than getBoundingClientRect)
    labelPositions.set(elementId, {
      top: finalPosition.top,
      left: finalPosition.left,
      width: label.offsetWidth,
      height: label.offsetHeight
    });

    labelElements.set(elementId, label);
  }

  // Save panel state to storage
  function saveState() {
    chrome.storage.local.set({
      [STORAGE_KEY_VISIBLE]: isVisible,
      [STORAGE_KEY_POSITION]: panel ? {
        top: panel.style.top,
        left: panel.style.left,
        right: panel.style.right
      } : null,
      [STORAGE_KEY_SHOW_EMPTY]: showEmptySlots
    });
  }

  // Restore panel state from storage
  function restoreState() {
    chrome.storage.local.get([STORAGE_KEY_VISIBLE, STORAGE_KEY_POSITION, STORAGE_KEY_SHOW_EMPTY], (result) => {
      // Restore show empty preference
      if (result[STORAGE_KEY_SHOW_EMPTY] !== undefined) {
        showEmptySlots = result[STORAGE_KEY_SHOW_EMPTY];
      }

      if (result[STORAGE_KEY_VISIBLE]) {
        showPanel();

        // Restore position if saved
        if (result[STORAGE_KEY_POSITION] && panel) {
          const pos = result[STORAGE_KEY_POSITION];
          if (pos.left && pos.left !== 'auto') {
            panel.style.left = pos.left;
            panel.style.right = 'auto';
          }
          if (pos.top) {
            panel.style.top = pos.top;
          }
        }

        // Update toggle state
        updateEmptyToggle();
      }
    });
  }

  // Watch for SPA navigation (URL changes without page reload)
  function watchNavigation() {
    // Check URL periodically for SPA navigation
    setInterval(() => {
      if (location.href !== currentUrl) {
        currentUrl = location.href;
        if (isVisible) {
          // Clear highlights from old page elements
          labelElements.forEach(label => label.remove());
          labelElements.clear();
          labelPositions.clear();
          elementState.clear();
          activeItems.clear();

          // Refresh structure for new page
          setTimeout(() => loadStructure(), 500);
        }
      }
    }, 500);

    // Also listen for popstate (back/forward navigation)
    window.addEventListener('popstate', () => {
      if (isVisible) {
        setTimeout(() => {
          labelElements.forEach(label => label.remove());
          labelElements.clear();
          labelPositions.clear();
          elementState.clear();
          activeItems.clear();
          loadStructure();
        }, 500);
      }
    });
  }

  // Message listener
  chrome.runtime.onMessage.addListener((request) => {
    if (request.action === 'togglePanel') {
      togglePanel();
    }
  });

  // Initialize on page load
  restoreState();
  watchNavigation();

})();

let currentStructure = null;
const expandedBlocks = new Set(); // Track which blocks are expanded
const activeItems = new Set(); // Track active (highlighted) items by ID

// Helper to send messages to the active tab
function sendToActiveTab(message, callback) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, message, callback);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadStructure();
  setupEventListeners();
});

function setupEventListeners() {
  document.getElementById('clear-btn').addEventListener('click', clearHighlights);
  document.getElementById('close-btn').addEventListener('click', closePanel);
  document.getElementById('refresh-btn').addEventListener('click', loadStructure);
  document.getElementById('minimize-btn').addEventListener('click', () => {
    const explorer = document.getElementById('explorer');
    explorer.classList.toggle('hidden');
  });
}

function loadStructure() {
  sendToActiveTab({ action: 'getStructure' }, (response) => {
    if (response && response.structure) {
      currentStructure = response.structure;
      renderExplorer();
      updateSummary();
    } else {
      renderEmptyState();
    }
  });
}

function renderEmptyState() {
  const explorer = document.getElementById('explorer');
  explorer.innerHTML = '';

  const emptyState = document.createElement('div');
  emptyState.className = 'empty-state';

  const icon = document.createElement('div');
  icon.className = 'icon';
  icon.textContent = '\u{1F4E6}';

  const message = document.createElement('div');
  message.className = 'message';
  message.textContent = 'No dropins found on this page';

  emptyState.appendChild(icon);
  emptyState.appendChild(message);
  explorer.appendChild(emptyState);

  document.getElementById('block-count').textContent = '0';
  document.getElementById('slot-count').textContent = '0';
}

function renderExplorer() {
  const explorer = document.getElementById('explorer');
  explorer.innerHTML = '';

  if (!currentStructure || !currentStructure.blocks) {
    renderEmptyState();
    return;
  }

  const { blocks } = currentStructure;

  if (blocks.length === 0) {
    renderEmptyState();
    return;
  }

  // Render each block as an expandable item
  blocks.forEach((block) => {
    const hasSlots = block.slots.length > 0;
    const blockEl = renderBlock(block, hasSlots);
    explorer.appendChild(blockEl);
  });
}

function renderBlock(block, hasSlots) {
  const blockGroup = document.createElement('div');
  blockGroup.className = 'block-group';

  // Block header (clickable row)
  const blockHeader = document.createElement('div');
  blockHeader.className = 'item item-block';
  if (activeItems.has(block.id)) {
    blockHeader.classList.add('active');
  }

  // Expand arrow (only if has slots)
  const arrow = document.createElement('span');
  arrow.className = 'item-arrow';
  if (hasSlots) {
    arrow.textContent = expandedBlocks.has(block.id) ? '▼' : '▶';
    arrow.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleBlockExpand(block.id);
    });
  } else {
    arrow.textContent = '•';
    arrow.style.color = 'var(--text-muted)';
  }

  // Block icon (box/cube)
  const indicator = document.createElement('span');
  indicator.className = 'item-indicator';
  indicator.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>`;

  // Block name
  const name = document.createElement('span');
  name.className = 'item-name';
  name.textContent = block.name;

  // Slot count badge
  if (hasSlots) {
    const badge = document.createElement('span');
    badge.className = 'item-badge';
    badge.textContent = block.slots.length;
    name.appendChild(badge);
  }

  blockHeader.appendChild(arrow);
  blockHeader.appendChild(indicator);
  blockHeader.appendChild(name);

  // Click to toggle highlight (not on arrow)
  blockHeader.addEventListener('click', (e) => {
    if (e.target !== arrow) {
      toggleItem(block.id, block.name, 'block');
    }
  });

  blockGroup.appendChild(blockHeader);

  // Slots within this block
  if (hasSlots) {
    const slotsEl = document.createElement('div');
    slotsEl.className = 'block-children';
    if (expandedBlocks.has(block.id)) {
      slotsEl.classList.add('visible');
    }

    block.slots.forEach((slot) => {
      const slotEl = renderSlot(slot);
      slotsEl.appendChild(slotEl);
    });

    blockGroup.appendChild(slotsEl);
  }

  return blockGroup;
}

function renderSlot(slot) {
  const slotEl = document.createElement('div');
  slotEl.className = 'item item-slot nested';
  if (activeItems.has(slot.id)) {
    slotEl.classList.add('active');
  }

  // Slot icon (target/crosshair)
  const indicator = document.createElement('span');
  indicator.className = 'item-indicator';
  indicator.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle></svg>`;

  // Slot name
  const name = document.createElement('span');
  name.className = 'item-name';
  name.textContent = slot.name;

  slotEl.appendChild(indicator);
  slotEl.appendChild(name);

  // Click to toggle highlight
  slotEl.addEventListener('click', () => {
    toggleItem(slot.id, slot.name, 'slot');
  });

  return slotEl;
}

function toggleBlockExpand(blockId) {
  if (expandedBlocks.has(blockId)) {
    expandedBlocks.delete(blockId);
  } else {
    expandedBlocks.add(blockId);
  }
  renderExplorer();
}

function toggleItem(itemId, itemName, type) {
  if (activeItems.has(itemId)) {
    // Turn off highlight
    activeItems.delete(itemId);
    sendToActiveTab({
      action: 'clearHighlight',
      elementId: itemId
    });
  } else {
    // Turn on highlight
    activeItems.add(itemId);
    sendToActiveTab({
      action: 'highlight',
      elementId: itemId,
      label: itemName,
      type: type
    });
  }

  renderExplorer();
}

function clearHighlights() {
  activeItems.clear();
  sendToActiveTab({ action: 'clearAll' });
  renderExplorer();
}

function closePanel() {
  clearHighlights();
  window.close();
}

function updateSummary() {
  if (!currentStructure || !currentStructure.totals) {
    document.getElementById('block-count').textContent = '0';
    document.getElementById('slot-count').textContent = '0';
    return;
  }

  const { totals } = currentStructure;
  document.getElementById('block-count').textContent = totals.blocks;
  document.getElementById('slot-count').textContent = totals.slots;
}

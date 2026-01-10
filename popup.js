let currentStructure = null;
let expandedContainers = new Set();
const checkedContainers = new Map();
const checkedSlots = new Map();

// Helper to send messages to the active tab (reduces duplication)
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
    // Toggle minimized state (could collapse explorer)
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
  icon.textContent = '\u{1F4E6}'; // Package emoji

  const message = document.createElement('div');
  message.className = 'message';
  message.textContent = 'No dropins found on this page';

  emptyState.appendChild(icon);
  emptyState.appendChild(message);
  explorer.appendChild(emptyState);

  document.getElementById('container-count').textContent = '0';
  document.getElementById('slot-count').textContent = '0';
}

function renderExplorer() {
  const explorer = document.getElementById('explorer');
  explorer.innerHTML = '';

  if (!currentStructure || currentStructure.length === 0) {
    renderEmptyState();
    return;
  }

  currentStructure.forEach((container) => {
    const containerGroup = document.createElement('div');
    containerGroup.className = 'container-group';

    const containerItem = document.createElement('div');
    containerItem.className = 'container-item';

    const isContainerChecked = checkedContainers.get(container.id) === true;

    if (expandedContainers.has(container.id)) {
      containerItem.classList.add('expanded');
    }
    if (isContainerChecked) {
      containerItem.classList.add('active');
    }

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = isContainerChecked;
    checkbox.addEventListener('change', (e) => {
      e.stopPropagation();
      toggleContainer(container.id, checkbox.checked);
    });

    // Add icon
    const icon = document.createElement('span');
    icon.className = 'icon';
    icon.textContent = '📦';

    const nameSpan = document.createElement('span');
    nameSpan.className = 'name';

    const label = document.createElement('span');
    label.textContent = container.name;

    nameSpan.appendChild(icon);
    nameSpan.appendChild(label);

    const arrow = document.createElement('span');
    arrow.className = 'arrow';
    arrow.textContent = '▶';

    containerItem.appendChild(checkbox);
    containerItem.appendChild(nameSpan);

    if (container.slots.length > 0) {
      containerItem.appendChild(arrow);
      containerItem.addEventListener('click', (e) => {
        // Don't toggle if clicking checkbox
        if (e.target.type === 'checkbox') return;

        if (expandedContainers.has(container.id)) {
          expandedContainers.delete(container.id);
          containerItem.classList.remove('expanded');
        } else {
          expandedContainers.add(container.id);
          containerItem.classList.add('expanded');
        }
        const slotsContainer = containerGroup.querySelector('.slots-container');
        if (slotsContainer) {
          slotsContainer.classList.toggle('visible');
        }
      });
    }

    containerGroup.appendChild(containerItem);

    if (container.slots.length > 0) {
      const slotsContainer = document.createElement('div');
      slotsContainer.className = 'slots-container';
      if (expandedContainers.has(container.id)) {
        slotsContainer.classList.add('visible');
      }

      container.slots.forEach((slot) => {
        const slotItem = document.createElement('div');
        slotItem.className = 'slot-item';

        const isSlotChecked = checkedSlots.get(slot.id) === true;

        if (isContainerChecked) {
          slotItem.classList.add('disabled');
        }
        if (isSlotChecked && !isContainerChecked) {
          slotItem.classList.add('active');
        }

        const slotCheckbox = document.createElement('input');
        slotCheckbox.type = 'checkbox';
        slotCheckbox.checked = isSlotChecked && !isContainerChecked;
        slotCheckbox.disabled = isContainerChecked;

        slotCheckbox.addEventListener('change', (e) => {
          e.stopPropagation();
          toggleSlot(slot.id, slotCheckbox.checked, container.id);
        });

        // Add indicator
        const indicator = document.createElement('span');
        indicator.className = 'indicator';
        indicator.textContent = '■';

        const slotName = document.createElement('span');
        slotName.className = 'name';
        slotName.textContent = slot.name;

        slotItem.appendChild(slotCheckbox);
        slotItem.appendChild(indicator);
        slotItem.appendChild(slotName);

        slotsContainer.appendChild(slotItem);
      });

      containerGroup.appendChild(slotsContainer);
    } else {
      // Show "no slots" message
      const noSlots = document.createElement('div');
      noSlots.className = 'no-slots';
      noSlots.textContent = 'No slots';
      containerGroup.appendChild(noSlots);
    }

    explorer.appendChild(containerGroup);
  });
}

function toggleContainer(containerId, isChecked) {
  const container = currentStructure.find((c) => c.id === containerId);

  if (isChecked) {
    checkedContainers.set(containerId, true);

    container.slots.forEach((slot) => {
      checkedSlots.delete(slot.id);
    });

    sendToActiveTab({
      action: 'highlight',
      elementId: containerId,
      label: container.name,
    });
  } else {
    checkedContainers.delete(containerId);

    sendToActiveTab({
      action: 'clearHighlight',
      elementId: containerId,
    });
  }

  renderExplorer();
  updateSummary();
}

function toggleSlot(slotId, isChecked, containerId) {
  const container = currentStructure.find((c) => c.id === containerId);
  const slot = container.slots.find((s) => s.id === slotId);

  if (isChecked) {
    checkedSlots.set(slotId, true);

    sendToActiveTab({
      action: 'highlight',
      elementId: slotId,
      label: `${container.name} > ${slot.name}`,
    });
  } else {
    checkedSlots.delete(slotId);

    sendToActiveTab({
      action: 'clearHighlight',
      elementId: slotId,
    });
  }

  renderExplorer();
  updateSummary();
}

function clearHighlights() {
  checkedContainers.clear();
  checkedSlots.clear();
  expandedContainers.clear();

  sendToActiveTab({ action: 'clearAll' });

  renderExplorer();
  updateSummary();
}

function closePanel() {
  clearHighlights();
  window.close();
}

function updateSummary() {
  const containerCount = currentStructure ? currentStructure.length : 0;
  const slotCount = currentStructure
    ? currentStructure.reduce((sum, c) => sum + c.slots.length, 0)
    : 0;

  document.getElementById('container-count').textContent = containerCount;
  document.getElementById('slot-count').textContent = slotCount;
}

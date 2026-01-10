let currentStructure = null;
let expandedContainers = new Set();
const checkedContainers = new Map();
const checkedSlots = new Map();

document.addEventListener('DOMContentLoaded', () => {
  loadStructure();
  setupEventListeners();
});

function setupEventListeners() {
  document.getElementById('clear-btn').addEventListener('click', clearHighlights);
  document.getElementById('close-btn').addEventListener('click', closePanel);
}

function loadStructure() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { action: 'getStructure' },
      (response) => {
        if (response && response.structure) {
          currentStructure = response.structure;
          renderExplorer();
          updateSummary();
        }
      }
    );
  });
}

function renderExplorer() {
  const explorer = document.getElementById('explorer');
  explorer.innerHTML = '';

  currentStructure.forEach((container) => {
    const containerGroup = document.createElement('div');
    containerGroup.className = 'container-group';

    const containerItem = document.createElement('div');
    containerItem.className = 'container-item';
    if (expandedContainers.has(container.id)) {
      containerItem.classList.add('expanded');
    }

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = checkedContainers.get(container.id) === true;
    checkbox.addEventListener('change', (e) => {
      e.stopPropagation();
      toggleContainer(container.id, checkbox.checked);
    });

    const nameSpan = document.createElement('span');
    nameSpan.className = 'name';

    const label = document.createElement('span');
    label.textContent = container.name;

    nameSpan.appendChild(label);

    const arrow = document.createElement('span');
    arrow.className = 'arrow';
    arrow.textContent = '▼';

    containerItem.appendChild(checkbox);
    containerItem.appendChild(nameSpan);

    if (container.slots.length > 0) {
      containerItem.appendChild(arrow);
      containerItem.addEventListener('click', () => {
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

        const slotCheckbox = document.createElement('input');
        slotCheckbox.type = 'checkbox';

        const isContainerChecked = checkedContainers.get(container.id) === true;
        const isSlotChecked = checkedSlots.get(slot.id) === true;

        slotCheckbox.checked = isSlotChecked && !isContainerChecked;
        slotCheckbox.disabled = isContainerChecked;

        slotCheckbox.addEventListener('change', (e) => {
          e.stopPropagation();
          toggleSlot(slot.id, slotCheckbox.checked, container.id);
        });

        const slotName = document.createElement('span');
        slotName.className = 'name';
        slotName.textContent = `${container.name} > ${slot.name}`;

        slotItem.appendChild(slotCheckbox);
        slotItem.appendChild(slotName);

        slotsContainer.appendChild(slotItem);
      });

      containerGroup.appendChild(slotsContainer);
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

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'highlight',
        elementId: containerId,
        label: container.name,
      });
    });
  } else {
    checkedContainers.delete(containerId);

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'clearHighlight',
        elementId: containerId,
      });
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

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'highlight',
        elementId: slotId,
        label: `${container.name} > ${slot.name}`,
      });
    });
  } else {
    checkedSlots.delete(slotId);

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'clearHighlight',
        elementId: slotId,
      });
    });
  }

  renderExplorer();
  updateSummary();
}

function clearHighlights() {
  checkedContainers.clear();
  checkedSlots.clear();
  expandedContainers.clear();

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'clearAll' });
  });

  renderExplorer();
  updateSummary();
}

function closePanel() {
  clearHighlights();
  window.close();
}

function updateSummary() {
  const containerCount =
    currentStructure.reduce((sum, c) => sum + 1, 0) || 0;
  const slotCount =
    currentStructure.reduce((sum, c) => sum + c.slots.length, 0) || 0;

  document.getElementById('container-count').textContent = containerCount;
  document.getElementById('slot-count').textContent = slotCount;
}

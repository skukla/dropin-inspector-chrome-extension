const elementState = new Map();
const labelElements = new Map();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getStructure') {
    const structure = initializeStructure();
    sendResponse({ structure });
  } else if (request.action === 'highlight') {
    highlightElement(request.elementId, request.label);
  } else if (request.action === 'clearHighlight') {
    clearHighlight(request.elementId);
  } else if (request.action === 'clearAll') {
    clearAllHighlights();
  }
});

function initializeStructure() {
  const containers = [];

  // Updated selectors - adjust based on your dropin structure
  const containerElements = document.querySelectorAll(
    '[data-dropin-container], [class*="container"]'
  );

  containerElements.forEach((containerEl, index) => {
    const containerId = `container-${index}`;
    const containerName =
      containerEl.getAttribute('data-container-name') ||
      containerEl.className.split(' ')[0] ||
      `Container ${index + 1}`;

    const slots = [];
    const slotElements = containerEl.querySelectorAll('[data-dropin-slot], [class*="slot"]');

    slotElements.forEach((slotEl, slotIndex) => {
      const slotId = `slot-${index}-${slotIndex}`;
      const slotName =
        slotEl.getAttribute('data-slot-name') ||
        slotEl.className.split(' ')[0] ||
        `Slot ${slotIndex + 1}`;

      slots.push({
        id: slotId,
        name: slotName,
        element: slotEl,
      });
    });

    containers.push({
      id: containerId,
      name: containerName,
      element: containerEl,
      slots: slots,
    });
  });

  return containers;
}

function highlightElement(elementId, label) {
  const structure = initializeStructure();

  let element = null;
  let isSlot = false;

  // Find the element
  const containerIndex = parseInt(elementId.split('-')[1]);
  if (elementId.startsWith('container-')) {
    element = structure[containerIndex]?.element;
  } else if (elementId.startsWith('slot-')) {
    const parts = elementId.split('-');
    const slotIndex = parseInt(parts[2]);
    element = structure[containerIndex]?.slots[slotIndex]?.element;
    isSlot = true;
  }

  if (!element) return;

  // Store original styles
  const originalStyles = {
    border: element.style.border,
    outline: element.style.outline,
    backgroundColor: element.style.backgroundColor,
    zIndex: element.style.zIndex,
  };

  elementState.set(elementId, originalStyles);

  // Apply highlight styles
  element.style.border = isSlot
    ? '2px dashed #4ade80'
    : '2px solid #0284c7';
  element.style.outline = isSlot
    ? '2px dashed rgba(74, 222, 128, 0.4)'
    : '2px solid rgba(2, 132, 199, 0.3)';
  element.style.backgroundColor = isSlot
    ? 'rgba(34, 197, 94, 0.08)'
    : 'rgba(2, 132, 199, 0.08)';
  element.style.zIndex = '10000';

  // Add label
  createLabel(elementId, element, label, isSlot);

  // Scroll element into view
  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function clearHighlight(elementId) {
  const structure = initializeStructure();

  let element = null;

  // Find the element
  const containerIndex = parseInt(elementId.split('-')[1]);
  if (elementId.startsWith('container-')) {
    element = structure[containerIndex]?.element;
  } else if (elementId.startsWith('slot-')) {
    const parts = elementId.split('-');
    const slotIndex = parseInt(parts[2]);
    element = structure[containerIndex]?.slots[slotIndex]?.element;
  }

  if (!element || !elementState.has(elementId)) return;

  // Restore original styles
  const originalStyles = elementState.get(elementId);
  element.style.border = originalStyles.border;
  element.style.outline = originalStyles.outline;
  element.style.backgroundColor = originalStyles.backgroundColor;
  element.style.zIndex = originalStyles.zIndex;

  elementState.delete(elementId);

  // Remove label
  const label = labelElements.get(elementId);
  if (label) {
    label.remove();
    labelElements.delete(elementId);
  }
}

function clearAllHighlights() {
  elementState.forEach((_, elementId) => {
    clearHighlight(elementId);
  });

  elementState.clear();
  labelElements.forEach((label) => {
    label.remove();
  });
  labelElements.clear();
}

function createLabel(elementId, element, text, isSlot) {
  // Remove existing label if present
  const existingLabel = labelElements.get(elementId);
  if (existingLabel) {
    existingLabel.remove();
  }

  const label = document.createElement('div');
  label.style.position = 'fixed';
  label.style.padding = '6px 12px';
  label.style.borderRadius = '4px';
  label.style.fontSize = '11px';
  label.style.fontWeight = '600';
  label.style.zIndex = '10001';
  label.style.whiteSpace = 'nowrap';
  label.style.fontFamily =
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  label.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
  label.style.letterSpacing = '0.5px';

  if (isSlot) {
    label.style.background = '#22c55e';
    label.style.color = 'white';
    label.style.border = '1px solid #4ade80';
  } else {
    label.style.background = '#0284c7';
    label.style.color = 'white';
    label.style.border = '1px solid #0ea5e9';
  }

  label.textContent = text;

  document.body.appendChild(label);

  // Position label at top-left of highlighted element
  const rect = element.getBoundingClientRect();
  label.style.left = Math.max(10, rect.left) + 'px';
  label.style.top = Math.max(10, rect.top - 40) + 'px';

  labelElements.set(elementId, label);

  // Keep label in view as page scrolls
  const updateLabelPosition = () => {
    const newRect = element.getBoundingClientRect();
    label.style.left = Math.max(10, newRect.left) + 'px';
    label.style.top = Math.max(10, newRect.top - 40) + 'px';
  };

  window.addEventListener('scroll', updateLabelPosition, true);
  window.addEventListener('resize', updateLabelPosition);

  // Store cleanup function
  const cleanup = () => {
    window.removeEventListener('scroll', updateLabelPosition, true);
    window.removeEventListener('resize', updateLabelPosition);
  };

  elementState.set(elementId + '-cleanup', cleanup);
}

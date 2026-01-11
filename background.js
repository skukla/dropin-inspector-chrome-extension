// Background service worker - handles extension icon click
chrome.action.onClicked.addListener(async (tab) => {
  try {
    await chrome.tabs.sendMessage(tab.id, { action: 'togglePanel' });
  } catch (error) {
    // Content script not loaded - inject it first, then send message
    if (error.message.includes('Receiving end does not exist')) {
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        });
        await chrome.tabs.sendMessage(tab.id, { action: 'togglePanel' });
      } catch (injectError) {
        // Page doesn't allow script injection (chrome://, etc.)
        console.log('Cannot inject on this page:', injectError.message);
      }
    }
  }
});

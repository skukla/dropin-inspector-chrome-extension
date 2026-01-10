// Background service worker - minimal for manifest v3
chrome.runtime.onInstalled.addListener(() => {
  console.log('Dropin Inspector installed');
});

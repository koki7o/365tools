// background.js
let tabsData = new Map();

// Listen for data from content scripts
chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.type === 'storageData' && sender.tab) {
    tabsData.set(sender.tab.id, {
      url: message.data.url,
      data: message.data,
      title: sender.tab.title,
      favicon: sender.tab.favIconUrl
    });
  }
});

// Handle requests from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'getStorageData') {
    // Get current tabs with storage data
    sendResponse(Array.from(tabsData.entries()));
  } else if (message.type === 'refreshTab') {
    // Request refresh from specific tab
    chrome.tabs.sendMessage(message.tabId, { type: 'refreshStorage' });
  }
  return true;  // Keep message channel open for async response
});

// Inject content script into new tabs
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content-script.js']
    });
  }
});
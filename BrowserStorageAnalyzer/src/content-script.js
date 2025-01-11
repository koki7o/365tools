// content-script.js
function analyzeStorage() {
  // Get localStorage data
  const localData = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    localData[key] = {
      value: localStorage.getItem(key),
      size: new Blob([localStorage.getItem(key)]).size
    };
  }

  // Get sessionStorage data
  const sessionData = {};
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    sessionData[key] = {
      value: sessionStorage.getItem(key),
      size: new Blob([sessionStorage.getItem(key)]).size
    };
  }

  // Send data back to extension
  chrome.runtime.sendMessage({
    type: 'storageData',
    data: {
      url: window.location.href,
      localStorage: localData,
      sessionStorage: sessionData
    }
  });
}

// Run analysis immediately
analyzeStorage();

// Listen for requests to refresh data
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'refreshStorage') {
    analyzeStorage();
  }
});
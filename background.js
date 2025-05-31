let timeSpent = {};
let currentTabId = null;
let currentDomain = null;
let startTime = null;
let intervalId = null;

// Helper to save data
function saveTimeSpent() {
  chrome.storage.local.set({ timeSpent }, () => {
    if (chrome.runtime.lastError) {
      console.error("Error saving timeSpent:", chrome.runtime.lastError);
    }
  });
}

// Helper to load data
function loadTimeSpent(callback) {
  chrome.storage.local.get('timeSpent', (data) => {
    if (chrome.runtime.lastError) {
      console.error("Error loading timeSpent:", chrome.runtime.lastError);
      timeSpent = {};
    } else {
      timeSpent = data.timeSpent || {};
    }
    callback();
  });
}

// Extract domain from a URL
function getDomain(url) {
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch (e) {
    console.error("Invalid URL:", url);
    return null;
  }
}

// Update time for the current domain
function updateTime() {
  if (currentDomain && startTime) {
    const now = Date.now();
    const timeElapsed = (now - startTime) / 1000; // Time in seconds
    timeSpent[currentDomain] = (timeSpent[currentDomain] || 0) + timeElapsed;
    startTime = now; // Reset startTime to prevent double-counting
    saveTimeSpent();
  }
}

// Called when switching tabs or when a new tab is loaded
function trackTimeSwitch(newTabId, newUrl) {
  updateTime(); // Save time for the previous domain

  // Update to the new tab's details
  currentTabId = newTabId;
  currentDomain = getDomain(newUrl);
  startTime = currentDomain ? Date.now() : null;
}

// Check active tab periodically
function checkActiveTab() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0 && tabs[0].url) {
      const newTabId = tabs[0].id;
      const newUrl = tabs[0].url;
      if (newTabId !== currentTabId || getDomain(newUrl) !== currentDomain) {
        trackTimeSwitch(newTabId, newUrl);
      }
    } else {
      // No active tab or invalid URL, stop tracking
      trackTimeSwitch(null, null);
    }
  });
}

// Start tracking time
function startTracking() {
  loadTimeSpent(() => {
    // Initialize tracking for the current tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0 && tabs[0].url) {
        trackTimeSwitch(tabs[0].id, tabs[0].url);
      }
    });
    // Check active tab and update time every 5 seconds
    if (!intervalId) {
      intervalId = setInterval(() => {
        updateTime(); // Update time for current domain
        checkActiveTab(); // Check if tab/domain changed
      }, 5000);
    }
  });
}

// Stop tracking and save final time
// function stopTracking() {
//   updateTime(); // Save time for the current domain
//   if (intervalId) {
//     clearInterval(intervalId);
//     intervalId = null;
//   }
// }

// Tab switched
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab.url) {
      trackTimeSwitch(activeInfo.tabId, tab.url);
    }
  });
});

// Tab updated (like loading new website)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.active && tab.url) {
    trackTimeSwitch(tabId, tab.url);
  }
});

// When a tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabId === currentTabId) {
    trackTimeSwitch(null, null);
  }
});

// When browser window is closed
chrome.windows.onRemoved.addListener(() => {
  stopTracking();
});

// On extension startup
chrome.runtime.onStartup.addListener(() => {
  startTracking();
});

// On extension installed or updated
chrome.runtime.onInstalled.addListener(() => {
  startTracking();
});

// Handle browser focus changes
chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    // Browser lost focus (minimized or no windows), save current time
    updateTime();
  } else {
    // Browser regained focus, ensure tracking is active
    checkActiveTab();
  }
});
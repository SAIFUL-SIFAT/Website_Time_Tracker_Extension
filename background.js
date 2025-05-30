let timeSpent={};
let curentTabId = null;
let currentDomain = null;
let startTime = null;
// Helper to save data
function saveTimeSpent(){
     chome.storage.local.set({timeSpent});
}
// Extract domain from a URL
function getDomain(url) {
    try{
        return new URL(url).hostname;
    }
    catch(e){
        console.error("Invalid URL:", url);
        return null;
    }
}
// Called when switching tabs or when a new tab is loaded
function trackTimeSwitch(newTabId, newUrl){
    const now= Date.now();
    const timeElapsed = (now - startTime) / 1000; 

    if (currentDomain){
        if (!timeSpent[currentDomain]) {
            timeSpent[currentDomain] = 0;
        }
        timeSpent[currentDomain] += timeElapsed;
        saveTimeSpent();
    }
    //Update to the new tab's details
    curentTabId = newTabId;
    currentDomain = getDomain(newUrl);  
    startTime = now;
}
//Tab switched
chrome.tabs.onActivated.addListener(activeInfo => {
  chrome.tabs.get(activeInfo.tabId, tab => {
    if (tab.url) {
      trackTimeSwitch(tab.id, tab.url);
    }
  });
});
// Tab updated (like loading new website)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.active) {
    trackTimeSwitch(tab.id, tab.url);
  }
});
// When browser window/tab is closed or refreshed
chrome.windows.onRemoved.addListener(() => {
  trackTimeSwitch(null, null);
});

chrome.runtime.onStartup.addListener(() => {
  startTime = Date.now();
});


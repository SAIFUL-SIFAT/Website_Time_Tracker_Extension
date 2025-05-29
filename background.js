let timeSpent={};
let curentTabId = null;
let currentDomain = null;
let startTime = null;

function saveTimeSpent(){
     chome.storage.local.set({timeSpent});
}

function getDomain(url) {
    try{
        return new URL(url).hostname;
    }
    catch(e){
        console.error("Invalid URL:", url);
        return null;
    }
}


// chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
//     if(changeInfo.status === 'complete') {
//         )
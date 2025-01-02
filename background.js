// background.js
// System1 - prevents URL from loading in the first place

chrome.runtime.onInstalled.addListener(initializeDynamicRules);
chrome.runtime.onStartup.addListener(initializeDynamicRules);

// Listen for messages from popup.js to update rules
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'updateRules') {
    initializeDynamicRules(message.urls);
    sendResponse({ status: 'Rules updated' });
  }
});

initializeDynamicRules(); // run on startup

async function initializeDynamicRules(urlsParam) {
  try {
    let urlList = urlsParam;

    if (!urlList) {
      const res = await fetch(chrome.runtime.getURL('urls.json'));
      urlList = await res.json();

      // Additionally load stored URLs from chrome.storage
      const storedUrls = await getStoredUrls();
      if (storedUrls && storedUrls.length > 0) {
        urlList = urlList.concat(storedUrls);
      }
    }

    const rules = urlList.map((url, index) => ({
      id: index + 1, // increment ID by adding one
      priority: 1,
      action: { type: 'block' },
      condition: {
        urlFilter: url,
        resourceTypes: ['image']
      }
    }));

    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: rules.map(rule => rule.id), // clear dynamic rules
      addRules: rules // add new rules
    });

    console.log(`Dynamic rules loaded: ${rules.length} image URLs blocked.`);
  } catch (error) {
    console.error('Error initializing dynamic rules:', error);
  }
}

// Helper function to get stored URLs from chrome.storage
function getStoredUrls() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['blockedUrls'], (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result.blockedUrls || []);
      }
    });
  });
}

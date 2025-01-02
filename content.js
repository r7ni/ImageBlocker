// content.js
// System2 - failsafe that removes from DOM instead of network.

// Blocked URLs will be loaded from chrome.storage
let blockedUrls = [];

chrome.storage.local.get(['blockedUrls'], (result) => {
  blockedUrls = result.blockedUrls || [];
  console.log('Blocked URLs loaded:', blockedUrls);
  initRemovalLogic();
});

// Listen for updates to blocked URLs
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.blockedUrls) {
    blockedUrls = changes.blockedUrls.newValue || [];
    console.log('Blocked URLs updated:', blockedUrls);
  }
});

/**
 * This function sets up everything after we've attempted to load blockedUrls.
 */
function initRemovalLogic() {
  // Checks for any mutations/changes
  const observer = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'src') { // checking for changes to src attribute
        processImage(mutation.target); // check if blocked
      }
      mutation.addedNodes.forEach(node => processNode(node)); // go through every new node
    }
  });

  observer.observe(document.documentElement, { // observe the DOM for new:
    childList: true, // new nodes
    subtree: true, // new nodes/children
    attributes: true,
    attributeFilter: ['src', 'data-src', 'data-lazy', 'style'] // changes to attributes
  });

  // When DOM loaded, run listener
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialProcess);
  } else {
    initialProcess();
  }
}

function isBlockedImage(src) {
  if (!src) return false; // null or empty
  return blockedUrls.some(blockedUrl => src.includes(blockedUrl)); // return true if any blockedUrl substring is included in src
}

function processImage(img) {
  if (isBlockedImage(img.src)) { // if true, remove image
    img.remove();
  }
}

/**
 * Processes an element (and its children) to remove blocked images, including background-image checks.
 */
function processNode(node) { // checking element and its children and bg imgs
  if (node.nodeType === Node.ELEMENT_NODE) { // make sure it is an HTML element
    if (node.tagName === 'IMG') { // if node is an image, process it
      processImage(node);
    } else {
      // Check for background images
      const bgImage = window.getComputedStyle(node).backgroundImage;
      if (bgImage && bgImage !== 'none') {
        const urlMatch = bgImage.match(/url\(['"]?(.*?)['"]?\)/);
        if (urlMatch && isBlockedImage(urlMatch[1])) {
          node.style.backgroundImage = 'none';
        }
      }
      // Process child images
      node.querySelectorAll('img').forEach(processImage);
    }
  }
}

/**
 * Removes blocked images from the existing DOM when first loaded.
 */
function initialProcess() {
  document.querySelectorAll('img').forEach(processImage);
  processNode(document.body);
}

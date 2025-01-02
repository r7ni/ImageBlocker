//have a happy happy day

document.addEventListener('DOMContentLoaded', () => {
  const addBtn = document.getElementById('addBtn');
  const urlInput = document.getElementById('urlInput');
  const urlList = document.getElementById('urlList');
  const clearAllBtn = document.getElementById('clearAllBtn');
  const exportBtn = document.getElementById('exportBtn');
  const importBtn = document.getElementById('importBtn');
  const importFile = document.getElementById('importFile');

  //Load and display existing blocked URLs
  loadBlockedUrls();

  addBtn.addEventListener('click', () => {
    const url = urlInput.value.trim();
    if (url) {
      if (isValidUrl(url)) {
        addBlockedUrl(url);
        urlInput.value = '';
      } else {
        alert('Please enter a valid URL or pattern.');
      }
    }
  });

  // Allow adding URL on Enter key press
  urlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addBtn.click();
    }
  });

  // Function to load and display blocked URLs
  function loadBlockedUrls() {
    chrome.storage.local.get(['blockedUrls'], (result) => {
      const urls = result.blockedUrls || [];
      urlList.innerHTML = '';
      urls.forEach((url, index) => {
        const li = document.createElement('li');

        const urlSpan = document.createElement('span');
        urlSpan.textContent = url;
        urlSpan.title = url; // Tooltip on hover
        urlSpan.style.wordBreak = 'break-all'; // Allow long URLs to wrap

        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remove';
        removeBtn.className = 'remove-btn';
        removeBtn.addEventListener('click', () => {
          if (confirm('Are you sure you want to remove this URL from the block list?')) {
            removeBlockedUrl(index);
          }
        });

        li.appendChild(urlSpan);
        li.appendChild(removeBtn);
        urlList.appendChild(li);
      });
    });
  }

  // Function to add a new blocked URL to the list
  function addBlockedUrl(url) {
    chrome.storage.local.get(['blockedUrls'], (result) => {
      const urls = result.blockedUrls || [];
      if (!urls.includes(url)) {
        urls.push(url);
        chrome.storage.local.set({ blockedUrls: urls }, () => {
          loadBlockedUrls();
          updateBackgroundRules(urls);
        });
      } else {
        alert('This URL is already blocked.');
      }
    });
  }

  // Function to remove a blocked URL form the list
  function removeBlockedUrl(index) {
    chrome.storage.local.get(['blockedUrls'], (result) => {
      let urls = result.blockedUrls || [];
      if (index >= 0 && index < urls.length) {
        urls.splice(index, 1);
        chrome.storage.local.set({ blockedUrls: urls }, () => {
          loadBlockedUrls();
          updateBackgroundRules(urls);
        });
      }
    });
  }

  // Function to clear all blocked URLs from the list
  clearAllBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to remove all blocked URLs?')) {
      chrome.storage.local.set({ blockedUrls: [] }, () => {
        loadBlockedUrls();
        updateBackgroundRules([]);
      });
    }
  });

  // Function to export the list
  exportBtn.addEventListener('click', () => {
    chrome.storage.local.get(['blockedUrls'], (result) => {
      const urls = result.blockedUrls || [];
      const blob = new Blob([JSON.stringify(urls, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'blockedUrls.json';
      a.click();
      
      URL.revokeObjectURL(url);
    });
  });

  importBtn.addEventListener('click', () => {
    importFile.click();
  });

  importFile.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedUrls = JSON.parse(e.target.result);
        if (Array.isArray(importedUrls)) {
          chrome.storage.local.set({ blockedUrls: importedUrls }, () => {
            loadBlockedUrls();
            updateBackgroundRules(importedUrls);
            alert('Blocked URLs imported successfully.');
          });
        } else {
          throw new Error('Invalid file format.');
        }
      } catch (error) {
        alert('Failed to import URLs. Please ensure the file is a valid JSON array.');
        console.error('Import Error:', error);
      }
    };
    reader.readAsText(file);
  });

  function updateBackgroundRules(urls) {
    chrome.runtime.sendMessage({ type: 'updateRules', urls: urls }, (response) => {
      if (response && response.status) {
        console.log(response.status);
      }
    });
  }

  function isValidUrl(string) {
    //Validating URLs
    const pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
      '(([a-zA-Z0-9_-]+\\.)+[a-zA-Z]{2,6})' + // domain naem
      '(\\/[^\\s]*)?$');
    return pattern.test(string);
  }
});

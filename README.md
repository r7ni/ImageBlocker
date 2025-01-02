# Portraits of the Blessed Beauty Hider

## Overview
This Chrome extension blocks images of specified URLs. It operates on two levels:
1. **Network Level Blocking**: Prevents images from loading using Chrome's `declarativeNetRequest` API.
2. **DOM Level Blocking**: Removes images from the DOM level as a failsafe if they bypass network blocking.

---

## Features
- **Network-Level Blocking**: Blocks specified image URLs before they load.
- **DOM-Level Blocking**: Removes images from the DOM that match blocked URLs.
- **Manage Blocked URLs**: Add, remove, or clear URLs via the popup interface.
- **Import/Export**: Export the blocked URL list as a JSON file or import a list from a file.
- **Real-Time Updates**: Updates rules dynamically when the list of blocked URLs changes.
- **Background Image Blocking**: Blocks images set as CSS background images.

---

## Installation
1. Clone or download this repository.
2. Open Chrome and navigate to `chrome://extensions`.
3. Enable **Developer mode** in the top-right corner.
4. Click **Load unpacked** and select the extension folder.
5. The extension is now installed and active.

---

## Usage
### Blocking Images
1. Pin the extension and then click the icon to open up the popup.
2. Enter the URL or data of the image you want to block and **Add**.
3. The URL will be added to the block list. Refresh for effect.
4. To remove an image from the block list click either Remove or Clear All.

### Import/Export Block Lists
- **Export**:
  1. Click **Export** in the popup.
  2. A JSON file containing the current block list will be downloaded.
- **Import**:
  1. Click **Import** in the popup.
  2. Select a valid JSON file containing an array of URLs.

---

## File Descriptions
### Files
- **`background.js`**:
  - Handles network-level blocking using Chrome's `declarativeNetRequest` API.
  - Loads default and user-defined block lists from storage.
  - Dynamically updates blocking rules.

- **`content.js`**:
  - Monitors the DOM for new or modified image elements.
  - Removes blocked images and background images from the DOM.

- **`popup.html`**:
  - User interface for managing the block list.
  - Allows adding, removing, importing, and exporting URLs.

- **`popup.js`**:
  - Handles interactions in `popup.html`.
  - Communicates with files to update blocking basis.

- **`icons/`**: 
    - Contains the icons used for the extension.

- **`manifest.json`**:
    - Extension's Manifest.

- **`urls.json`**:
    - Default list of URLs to block. Add URLs here to automatically block.

---


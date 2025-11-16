# FitGirl Game Downloader

An automated downloader for FitGirl repack game parts from `fuckingfast.co`, designed to **trigger downloads via Free Download Manager (FDM)** for faster, resumable transfers.

## What This Project Does

This tool automates downloading FitGirl `.rar` parts by:

1. Parsing URLs from a paste file (e.g., `paste-bc03dda029e41067.txt`)
2. Launching your preferred browser (**Edge, Chrome, or Brave**) — optionally using your **real profile** (to keep cookies/settings) or a **temporary profile**
3. Extracting the **real download URL** from the page's `window.download()` function
4. **Launching FDM directly via CLI** with that URL (bypassing browser download)
5. Falling back to **simulated button click** if FDM fails
6. **Cleaning up temporary browser profiles** after use

> ⚠️ Note: The downloader does not depend on the FDM browser extension. It attempts to launch Free Download Manager (fdm.exe) directly with the extracted download URL for faster, resumable transfers. 
> 
> - Ensure FDM is installed and fdm.exe is reachable (add to PATH or set a custom executable path in your .env).
> - If fdm.exe is missing or fails to start, the script falls back to simulating the page’s download button — this uses the browser’s download flow and may show save dialogs and be slower.
> - You can run the script without FDM; downloads will still proceed via the fallback, but for best reliability and resume support, configure FDM.

---

## Features

- ✅ **Multi-browser support**: Works with Edge, Chrome, and Brave (Windows)
- ✅ **FDM CLI Integration**: Sends direct download links to Free Download Manager
- ✅ **Smart URL Extraction**: Parses the real `/dl/...` token from the page's JavaScript
- ✅ **Fallback Mechanism**: Clicks the download button if FDM launch fails
- ✅ **Profile Management**: Uses your main browser profile if available; falls back to a clean temp profile
- ✅ **Auto Cleanup**: Deletes temporary browser profile after closing
- ✅ **Configurable**: All settings via `.env` file
- ✅ **Robust Parsing**: Handles Markdown-style or bullet-point URLs

---

## Prerequisites

- **Windows** (paths are Windows-specific)
- **Node.js** (v16 or higher)
- **Free Download Manager (FDM)** installed (and `fdm.exe` accessible) you can download it from [here](https://www.freedownloadmanager.org/download.htm)
- A supported **browser installed**: Edge, Chrome, or Brave
- A **paste file** containing `fuckingfast.co` links (see format below)

> ❗ The **FDM browser extension is NOT required** — the script uses the **desktop app via CLI**.


## Installation

1. Clone or download this repository
2. Navigate to the project directory
3. Install dependencies:

```bash
npm install
```

## Configuration

### Environment Variables

Create or modify the `.env` file to configure the downloader:

```env
# Browser Configuration
BROWSER_TYPE=edge                    # Browser to use (edge, brave, chrome)
BROWSER_PATH=                       # Custom browser executable path (optional)
USER_DATA_DIR=                      # Custom user data directory (optional)

# Extension Configuration
EXTENSION_ID=ahmpjcflkgiildlgicmcieglgoilbfdp  # FDM extension ID
EXTENSION_NAME=FDM                  # Extension name

# Download Settings
WAITING_TIME_BETWEEN_DOWNLOADS=3000  # Time between downloads in ms
DOWNLOAD_WAIT_TIMEOUT=600000        # Timeout for download completion in ms
PASTE_FILE_PATH=paste-bc03dda029e41067.txt  # Path to paste file

# Profile Settings
TEMP_PROFILE_DIR=temp_profile       # Directory for temporary profiles

# Timeout Settings
PAGE_LOAD_TIMEOUT=3000             # Page load timeout in ms
INITIAL_WAIT_TIME=2000              # Initial wait time in ms

# Logging
ENABLE_LOGGING=true
```

### Paste File

Create a text file containing the URLs to download. The file should contain URLs in one of these formats:
- Direct URLs: `https://fuckingfast.co/...`
- Markdown links: `[text](https://fuckingfast.co/...)`
- Bullet points: `- https://fuckingfast.co/...`

## How to Run

### Method 1: Using npm (Recommended)
```bash
npm start
```

### Method 2: Direct Node execution
```bash
node main.js
```

### Method 3: Development mode
```bash
npm run dev
```

## File Structure

```
fitgirl-game-downloader/
├── main.js              # Main execution file
├── config.js           # Configuration management
├── BrowserManager.js   # Browser operations and profile management
├── DownloadManager.js  # Download operations and triggering methods
├── url-parser.js       # URL parsing and extraction
├── .env               # Environment configuration
├── package.json       # Project dependencies and scripts
└── [paste file]       # Text file containing download URLs
```

## Usage

1. Prepare your paste file with fuckingfast.co URLs
2. Update the `.env` file with your preferred settings
3. Run the downloader using `npm start`
4. The browser will launch automatically and begin processing URLs
5. Downloads will be handled by Free Download Manager

## Troubleshooting

- **Browser not launching**: Ensure the browser is installed and paths are correct in `.env`
- **FDM not triggering**: Verify FDM is installed and accessible on your system (and that `fdm.exe` is reachable)
- **Downloads not starting**: Check that the paste file contains valid fuckingfast.co URLs
- **Profile conflicts**: The tool automatically uses temporary profiles when main profiles are in use

## Customization

You can easily customize:
- Browser type and paths
- Download timing and timeouts
- Extension settings
- File locations
- Download methods

## License

MIT License - Feel free to modify and distribute.

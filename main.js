const config = require('./config');
const BrowserManager = require('./BrowserManager');
const DownloadManager = require('./DownloadManager');
const { parsePasteFile } = require('./url-parser');

// Error handling
process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
});

process.on('SIGINT', async () => {
  console.log('\nDownload interrupted by user');
  process.exit(0);
});

// Main function
async function main() {
  const pasteFilePath = process.env.PASTE_FILE_PATH || "paste.txt";
  const fileDir = process.env.FILE_DIR || __dirname;
  const urls = parsePasteFile(fileDir, pasteFilePath);
  console.log(`Found ${urls.length} download links`);
  
  if (urls.length === 0) {
    console.log('No download links found!');
    return;
  }

  // Configure which browser to use
  const browserType = process.env.BROWSER_TYPE || 'edge'; // Can be 'brave', 'edge', or 'chrome'
  
  try {
    const browserManager = new BrowserManager(browserType);
    const downloadManager = new DownloadManager(browserManager);
    
    const results = await downloadManager.downloadFiles(urls);
    
    console.log(`\n🎉 Download session completed!`);
    console.log(`✅ Successful: ${results.successful}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`📁 Check your Downloads folder for files`);
  } catch (error) {
    console.error('Download failed:', error);
    process.exit(1);
  }
}

// Start the downloader
if (require.main === module) {
  main().catch(error => {
    console.error('Download failed:', error);
    process.exit(1);
  });
}

module.exports = { main };

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const config = require('./config');

class DownloadManager {
    /**
     * @param {Object} browserManager - Manages browser launch
     */
    constructor(browserManager) {
        this.browserManager = browserManager;
    }

    /**
     * Extracts the real download URL from the page's `window.download` function.
     * @param {import('puppeteer').Page} page
     * @returns {Promise<{ directUrls: string[], extractedUrls: string[] }>}
     */
    async extractDownloadUrls(page) {
        return await page.evaluate(() => {
            if (typeof window.download !== 'function') {
                return { directUrls: [], extractedUrls: [] };
            }

            const fnSource = window.download.toString();
            const match = fnSource.match(/window\.open\(["']([^"']+)["']/);
            const url = match?.[1] || '';

            return {
                directUrls: [],
                extractedUrls: url ? [url] : []
            };
        });
    }

    /**
     * Launches FDM with the given URL.
     * @param {string} url
     * @returns {Promise<boolean>}
     */
    async launchFDMWithUrl(url) {
        const fdmPath = config.fdm.path;

        if (!fs.existsSync(fdmPath)) {
            console.warn('⚠️ FDM executable not found at:', fdmPath);
            return false;
        }

        return new Promise((resolve) => {
            const cmd = `"${fdmPath}" "${url}"`;
            console.log(`🚀 Launching FDM: ${url}`);

            exec(cmd, (error) => {
                if (error) {
                    console.error('❌ Failed to launch FDM:', error.message);
                    resolve(false);
                } else {
                    console.log('✅ FDM accepted URL');
                    resolve(true);
                }
            });
        });
    }

    /**
     * Attempts to trigger download via FDM (preferred) or fallback to button click.
     * @param {import('puppeteer').Page} page
     * @returns {Promise<boolean>} true if any method succeeded
     */
    async triggerDownloadMethods(page) {
        const { extractedUrls } = await this.extractDownloadUrls(page);
        const downloadUrl = extractedUrls[0];

        if (downloadUrl) {
            const fdmSuccess = await this.launchFDMWithUrl(downloadUrl);
            if (fdmSuccess) return true;
            console.log('🔁 Falling back to in-browser click...');
        }

        return await this.findAndClickDownloadButton(page);
    }

    /**
     * Simulates a click on the download button.
     * @param {import('puppeteer').Page} page
     * @returns {Promise<boolean>}
     */
    async findAndClickDownloadButton(page) {
        const clicked = await page.evaluate(() => {
            const btn = [...document.querySelectorAll('button')].find(el =>
                el.classList.contains('gay-button') ||
                /download/i.test(el.textContent)
            );

            if (btn) {
                btn.dispatchEvent(new MouseEvent('click', {
                    view: window,
                    bubbles: true,
                    cancelable: true,
                    button: 0
                }));
                return true;
            }
            return false;
        });

        if (clicked) {
            console.log('🖱️ Download button clicked');
        } else {
            console.warn('⚠️ No download button found');
        }

        return clicked;
    }

    /**
     * Main download loop.
     * @param {string[]} urls
     * @returns {Promise<{ successful: number, failed: number }>}
     */
    async downloadFiles(urls) {
        const { waitingTimeBetweenDownloads, pageLoadTimeout, initialWaitTime } = config.downloadSettings;
        let browser = null;

        try {
            // Try main profile first, fallback to temp
            try {
                browser = await this.browserManager.launchBrowser(false);
            } catch (err) {
                console.warn(`Main profile failed (${err.message}), using temp profile...`);
                browser = await this.browserManager.launchBrowser(true);
            }

            const page = await browser.newPage();
            const downloadsDir = path.join(require('os').homedir(), 'Downloads');
            console.log(`📁 Monitoring: ${downloadsDir}`);

            let successful = 0;
            let failed = 0;

            for (let i = 0; i < urls.length; i++) {
                const url = urls[i];
                const filename = this.extractFilename(url);

                try {
                    console.log(`\n[${i + 1}/${urls.length}] Processing: ${filename}`);
                    await page.goto(url, { waitUntil: 'networkidle2', timeout: pageLoadTimeout });
                    await new Promise(r => setTimeout(r, initialWaitTime));

                    const triggered = await this.triggerDownloadMethods(page);
                    if (triggered) {
                        successful++;
                        console.log(`✅ Triggered: ${filename}`);
                    } else {
                        failed++;
                        console.log(`⚠️ No action taken for: ${filename}`);
                    }
                } catch (error) {
                    failed++;
                    console.error(`❌ Error on ${filename}:`, error.message);
                }

                // Wait between downloads (skip after last)
                if (i < urls.length - 1) {
                    console.log(`⏳ Waiting ${waitingTimeBetweenDownloads / 1000} sec before next...`);
                    await new Promise(r => setTimeout(r, waitingTimeBetweenDownloads));
                }
            }

            console.log('\n📥 All download triggers completed. Keeping browser open for active transfers...');
            await browser.close();
            this.browserManager.cleanupTempProfile();
            return { successful, failed };

        } catch (err) {
            console.error('💥 Critical error in downloadFiles:', err.message);
            return { successful: 0, failed: urls.length };
        }
    }

    /**
     * Extracts filename from URL hash (e.g., #file.rar).
     * @param {string} url
     * @returns {string}
     */
    extractFilename(url) {
        const hashIndex = url.indexOf('#');
        return hashIndex !== -1
            ? url.substring(hashIndex + 1)
            : `download_${Date.now()}.rar`;
    }
}

module.exports = DownloadManager;
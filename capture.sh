#!/usr/bin/env bash
set -euo pipefail
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
: "${CAPTURE_URL:?Set CAPTURE_URL to the exact preview URL}"
: "${CAPTURE_DIR:?Set CAPTURE_DIR to an output directory outside the project}"
case "$CAPTURE_DIR" in
  "$PROJECT_DIR"|"$PROJECT_DIR"/*) echo 'CAPTURE_DIR must be outside the project.' >&2; exit 1 ;;
esac
RUNTIME_PLAYWRIGHT="$HOME/.local/share/omgithub-playwright"
CONFIG="$RUNTIME_PLAYWRIGHT/linux.json"
if [[ ! -r "$CONFIG" || ! -d "$RUNTIME_PLAYWRIGHT/node_modules/playwright" ]]; then
  echo 'Playwright browser runtime is unavailable; retry after setup.' >&2
  exit 75
fi
/usr/bin/time -p mkdir -p "$CAPTURE_DIR"
export DISPLAY="${DISPLAY:-:$(cat "$RUNTIME_PLAYWRIGHT/display" 2>/dev/null || true)}"
export PLAYWRIGHT_CONFIG="$CONFIG"
/usr/bin/time -p node --input-type=module - "$CAPTURE_URL" "$CAPTURE_DIR" "$RUNTIME_PLAYWRIGHT" <<'NODE'
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const [url, output, runtime] = process.argv.slice(2);
let browser;
let exitCode = 1;
const transient = error => Object.assign(error instanceof Error ? error : new Error(String(error)), { exitCode: 75 });
try {
  let config;
  try { config = JSON.parse(await readFile(process.env.PLAYWRIGHT_CONFIG, 'utf8')); }
  catch (error) { throw transient(error); }
  const require = createRequire(join(runtime, 'package.json'));
  const { chromium } = require('playwright');
  try {
    browser = await chromium.launch({ ...config.browser.launchOptions, timeout: 30000 });
  } catch (error) { throw transient(error); }

  for (const [name, width, height, mobile] of [['desktop', 1440, 900, false], ['mobile', 390, 844, true]]) {
    let page;
    try {
      page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile });
      const pageErrors = [];
      page.on('pageerror', error => pageErrors.push(error.message));
      const response = await page.goto(url, { waitUntil: 'load', timeout: 45000 }).catch(error => { throw transient(error); });
      if (!response?.ok()) {
        const status = response?.status();
        throw Object.assign(new Error(`Preview returned HTTP ${status ?? 'no response'}: ${url}`), {
          exitCode: !status || [408, 429, 500, 502, 503, 504].includes(status) ? 75 : 1
        });
      }
      try {
        await page.locator('#scene').waitFor({ state: 'visible', timeout: 15000 });
        await page.waitForFunction(() => {
          const canvas = document.querySelector('#scene');
          if (!canvas || canvas.width < 2 || canvas.height < 2) return false;
          const pixel = canvas.getContext('2d')?.getImageData(4, 4, 1, 1).data;
          return !!pixel && (pixel[0] + pixel[1] + pixel[2] > 0);
        }, { timeout: 15000 });
        const title = await page.title();
        if (!title.includes('Tokyo Sunset')) throw new Error(`Unexpected rendered page title: ${title}`);
      } catch (error) {
        if (error.name === 'TimeoutError') throw new Error(`App did not render its canvas (${name}): ${error.message}`);
        throw error;
      }
      if (pageErrors.length) throw new Error(`JavaScript error (${name}): ${pageErrors.join('; ')}`);
      await page.screenshot({ path: join(output, `final-${name}.png`), timeout: 30000 }).catch(error => {
        if (error.name === 'TimeoutError' || !browser.isConnected()) throw transient(error);
        throw error;
      });
      console.log(`Captured rendered ${name} view at ${width}x${height}: ${join(output, `final-${name}.png`)}`);
    } catch (error) {
      if (error.exitCode) throw error;
      if (!browser?.isConnected() || /net::ERR_|Navigation timeout|Target closed|Browser has been closed/i.test(error.message)) throw transient(error);
      throw error;
    } finally {
      await page?.close().catch(() => {});
    }
  }
  exitCode = 0;
} catch (error) {
  console.error(error);
  exitCode = error.exitCode || 1;
} finally {
  try { await browser?.close(); }
  catch (error) { console.error(`Browser cleanup failed: ${error.message}`); if (!exitCode) exitCode = 75; }
}
process.exitCode = exitCode;
NODE

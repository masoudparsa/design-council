#!/usr/bin/env node
// Design Council batch renderer: one browser launch for every screenshot.
// Setup (once per machine):  node render.cjs --setup
//   installs playwright into ~/.claude/design-council-runtime and downloads Chromium.
// Check:  node render.cjs --check   (exit 0 ready · 2 playwright missing · 3 Chromium missing)
// Usage:  node render.cjs jobs.json
// jobs.json: { "shots": [ { "url": "file:///ABS/x.html?state=default", "out": "shots/x.mobile.default.png",
//              "device": "iPhone 13" | "viewport": [1440, 900], "fullPage": false, "dark": false } ] }
// Relative "out" paths resolve against the jobs file's folder.
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');
const RUNTIME = path.join(os.homedir(), '.claude', 'design-council-runtime');

function loadPlaywright(quiet) {
  try { return require(path.join(RUNTIME, 'node_modules', 'playwright')); } catch {}
  try { return require('playwright'); } catch {}
  for (const dir of (process.env.PATH || '').split(path.delimiter)) {
    if (!/node_modules[\\/]\.bin$/.test(dir)) continue;
    try { return require(path.join(dir, '..', 'playwright')); } catch {}
  }
  if (quiet) return null;
  console.error('playwright not found. Run once: node render.cjs --setup');
  process.exit(2);
}

function setup() {
  fs.mkdirSync(RUNTIME, { recursive: true });
  const run = cmd => execSync(cmd, { stdio: 'inherit', cwd: RUNTIME });
  const cli = path.join(RUNTIME, 'node_modules', 'playwright', 'cli.js');
  if (!fs.existsSync(cli)) run('npm install --no-audit --no-fund --prefix . playwright@1');
  run(`node "${cli}" install chromium`);
  console.log('ready: ' + RUNTIME);
}

(async () => {
  const arg = process.argv[2];
  if (arg === '--setup') { setup(); return; }
  if (arg === '--check') {
    const pw = loadPlaywright(true);
    if (!pw) { console.log('missing: playwright (run --setup)'); process.exit(2); }
    try { const b = await pw.chromium.launch(process.env.DC_CHROMIUM ? { executablePath: process.env.DC_CHROMIUM } : {}); await b.close(); console.log('ready'); process.exit(0); }
    catch { console.log('missing: chromium (run --setup)'); process.exit(3); }
  }
  const jobsPath = path.resolve(process.argv[2] || 'jobs.json');
  const base = path.dirname(jobsPath);
  const { shots = [] } = JSON.parse(fs.readFileSync(jobsPath, 'utf8'));
  const { chromium, devices } = loadPlaywright();
  let browser;
  try { browser = await chromium.launch(process.env.DC_CHROMIUM ? { executablePath: process.env.DC_CHROMIUM } : {}); }
  catch (e) {
    console.error('Chromium missing. Run once: node render.cjs --setup\n' + e.message);
    process.exit(3);
  }
  let failed = 0;
  for (const s of shots) {
    const out = path.resolve(base, s.out);
    try {
      const opts = s.device ? { ...devices[s.device] } : { viewport: { width: s.viewport[0], height: s.viewport[1] } };
      if (s.device && !devices[s.device]) throw new Error('unknown device ' + s.device);
      opts.colorScheme = s.dark ? 'dark' : 'light';
      const ctx = await browser.newContext(opts);
      const page = await ctx.newPage();
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      await page.goto(s.url, { waitUntil: 'networkidle', timeout: 30000 });
      await page.evaluate(() => document.fonts && document.fonts.ready);
      await page.waitForTimeout(s.wait ?? 250);
      fs.mkdirSync(path.dirname(out), { recursive: true });
      await page.screenshot({ path: out, fullPage: !!s.fullPage });
      const blank = await page.evaluate(() => (document.body?.innerText || '').trim().length === 0 && !document.querySelector('svg,img,canvas'));
      console.log(`ok   ${s.out}${blank ? '  WARN: page looks blank' : ''}${errors.length ? '  JS errors: ' + errors.join(' | ') : ''}`);
      await ctx.close();
    } catch (e) {
      failed++;
      console.log(`FAIL ${s.out}  ${e.message.split('\n')[0]}`);
    }
  }
  await browser.close();
  console.log(`${shots.length - failed}/${shots.length} rendered`);
  process.exit(failed ? 1 : 0);
})();

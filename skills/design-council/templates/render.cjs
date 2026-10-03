#!/usr/bin/env node
// Design Council batch renderer: one browser launch for every screenshot.
// Usage:  npx -y -p playwright@1 node render.cjs jobs.json
// jobs.json: { "shots": [ { "url": "file:///ABS/x.html?state=default", "out": "shots/x.mobile.default.png",
//              "device": "iPhone 13" | "viewport": [1440, 900], "fullPage": false, "dark": false } ] }
// Relative "out" paths resolve against the jobs file's folder. Exit code 1 if any shot failed.
const fs = require('fs');
const path = require('path');

function loadPlaywright() {
  try { return require('playwright'); } catch {}
  for (const dir of (process.env.PATH || '').split(path.delimiter)) {
    if (!/node_modules[\\/]\.bin$/.test(dir)) continue;
    try { return require(path.join(dir, '..', 'playwright')); } catch {}
  }
  console.error('playwright not found. Run: npx -y -p playwright@1 node render.cjs jobs.json');
  process.exit(2);
}

(async () => {
  const jobsPath = path.resolve(process.argv[2] || 'jobs.json');
  const base = path.dirname(jobsPath);
  const { shots = [] } = JSON.parse(fs.readFileSync(jobsPath, 'utf8'));
  const { chromium, devices } = loadPlaywright();
  let browser;
  try { browser = await chromium.launch(); }
  catch (e) {
    console.error('Chromium missing. Run once: npx -y playwright@1 install chromium\n' + e.message);
    process.exit(3);
  }
  let failed = 0;
  for (const s of shots) {
    const out = path.resolve(base, s.out);
    try {
      if (s.device && !devices[s.device]) throw new Error('unknown device ' + s.device);
      const opts = s.device ? { ...devices[s.device] } : { viewport: { width: s.viewport[0], height: s.viewport[1] } };
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

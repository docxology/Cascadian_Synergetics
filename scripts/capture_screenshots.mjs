#!/usr/bin/env node
// Capture the paper's two screenshots from the games themselves.
//
//   node scripts/capture_screenshots.mjs [--set paper|social] [--out DIR] [--only FILE] [--chrome PATH]
//
// The paper set (the default) writes docs/images/ and its record; the social set writes three wide frames for sharing
// to output/social/. --only takes one scene of a set into a scratch folder given by --out.
//
// Serves the repository on 127.0.0.1, opens each standalone game in headless Chrome at a fixed size, and before any
// page script runs seeds Math.random and stops the page's own animation loop, so that time moves only when the page's
// test hook steps it. The scene is then set up through that hook (window.__fs, window.__oss) in fixed steps, and the
// view is saved as a JPEG. A record beside the images, screenshots.json, gives each image's SHA-256, the page it was
// taken from and that page's SHA-256, the viewport and the scene's own report; tests/check.mjs holds the images to it.
//
// Needs Google Chrome (or Chromium) and a network connection: the field station loads three.js from cdnjs, and both
// pages load their fonts from Google Fonts. WebGL is drawn by SwiftShader, Chrome's software renderer, so the field
// station renders the same way on any machine.

import { createServer } from 'node:http';
import { readFile, writeFile, mkdir, mkdtemp, rm } from 'node:fs/promises';
import { existsSync, realpathSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { dirname, join, extname, resolve, relative, sep } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const RECORD = 'docs/images/screenshots.json';

/* What each screenshot shows, and how the page's test hook sets it up. Every scene starts the patrol, then moves time
   only through the hook's step(), so the same script draws the same frame. */
export const SCENES = [
  {
    file: 'field-station-lookout.jpg',
    page: 'field-station/index.html',
    shows: 'From the top of Lookout Rise, the mountain over the fog under a lenticular cloud',
    viewport: { width: 1440, height: 900, scale: 1.5 },
    ready: '!!(window.__fs && window.THREE)',
    setup: `
      const fs = window.__fs; document.getElementById('btnBegin').click(); window.dispatchEvent(new Event('resize'));
      fs.teleport(0, -96, 0); fs.step(0.1);
      const v0 = fs.vista(); fs.face(v0.at[0] + 60, v0.at[2]); fs.S.pl.pitch = 0.16; fs.step(3);
      fs.teleport(0.3, -96, fs.S.pl.yaw); fs.step(1.5);
      ({ vista: fs.vista(), selfTest: fs.selfTest().passed + ' of ' + fs.selfTest().total })`,
  },
  {
    file: 'storybook-lattice.jpg',
    page: 'storybook/index.html',
    shows: 'At the Cathedral Ring, four marked nodes of the stillness lattice span a unit tetrahedron',
    viewport: { width: 1440, height: 900, scale: 1.5 },
    ready: '!!window.__oss',
    setup: `
      const sb = window.__oss; document.getElementById('btnBegin').click(); window.dispatchEvent(new Event('resize'));
      // stand still by the Ring: the lattice fades in once a ranger has been still for a few seconds
      sb.teleport(sb.RING.x - 1.5, 18); sb.step(14);
      if (sb.lattice().opacity < 0.9) throw new Error('the lattice did not appear: opacity ' + sb.lattice().opacity);
      // four mutually neighbouring nodes near the middle of the view: a unit tetrahedron of the lattice
      const W = innerWidth, H = innerHeight, near = [];
      for (let i = 0; i < sb.lattice().nodes; i++){ const p = sb.nodeScreen(i); if (p && p.q && p.x > W * 0.36 && p.x < W * 0.64 && p.y > H * 0.3 && p.y < H * 0.7) near.push({ i, ...p }); }
      const nb = (a, b) => { const d = a.q.map((v, k) => v - b.q[k]), m = Math.min(...d); return d.map(v => v - m).sort().join() === '0,1,1,2'; };
      near.sort((a, b) => Math.hypot(a.x - W / 2, a.y - H / 2) - Math.hypot(b.x - W / 2, b.y - H / 2));
      let four = null;
      for (const a of near) { for (const b of near) { if (!nb(a, b)) continue; for (const c of near) { if (!nb(a, c) || !nb(b, c)) continue;
        for (const d of near) { if (nb(a, d) && nb(b, d) && nb(c, d)) { four = [a, b, c, d]; break; } } if (four) break; } if (four) break; } if (four) break; }
      if (!four) throw new Error('no unit tetrahedron of nodes near the middle of the view');
      for (const n of four) { sb.tap(n.x, n.y); sb.step(0.1); }
      sb.step(1.2);   // the counter clicks out the count
      if (sb.lattice().marks.length !== 4 || sb.lattice().vol === null) throw new Error('the four marks did not count: ' + JSON.stringify(sb.lattice()));
      ({ lattice: sb.lattice(), marked: four.map(n => n.q) })`,
  },
];

/* Wide frames for sharing the games (node scripts/capture_screenshots.mjs --set social): 16:9, 2400 by 1350. They are
   not the paper's figures, so they go to output/social/ with their own record, social.json; scripts/make_social.py
   adds a fourth image, the jitterbug's gauge drawn for sharing. */
const WIDE = { width: 1200, height: 675, scale: 2 };
export const SOCIAL = [
  {
    file: 'social-1-field-station-lattice.jpg',
    page: 'field-station/index.html',
    shows: 'At the Cathedral Ring in the field station, the stillness lattice glows and four marked nodes are counted',
    viewport: WIDE,
    ready: '!!(window.__fs && window.THREE)',
    setup: `
      const fs = window.__fs; document.getElementById('btnBegin').click(); window.dispatchEvent(new Event('resize'));
      // stand still a little way from the Ring, facing it, until the lattice glows around the ranger
      fs.teleport(7, 8, 0); fs.S.still = 0; fs.face(0, 0); fs.S.pl.pitch = 0.04; fs.step(9);
      const yaw = fs.S.pl.yaw, fwd = [-Math.sin(yaw), -Math.cos(yaw)], e = [fs.S.pl.x, fs.S.pl.y + 1.68, fs.S.pl.z];
      const dist = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
      const nodes = Array.from({ length: fs.lattice().nodes }, (_, i) => fs.nodeWorld(i)), strut = Math.min(...nodes.slice(1).map(p => dist(p, nodes[0])).filter(d => d > 0.1));
      // four mutually adjacent nodes in front, within reach and off the ground: a unit tetrahedron of the lattice
      const near = nodes.filter(p => { const d = dist(p, e), f = ((p[0] - e[0]) * fwd[0] + (p[2] - e[2]) * fwd[1]) / d; return d > 3 && d < 6 && f > 0.35 && p[1] > 0.3; });
      const adj = (p, q) => Math.abs(dist(p, q) - strut) < 0.01;
      let four = null;
      for (const a of near) { for (const b of near) { if (!adj(a, b)) continue; for (const c of near) { if (!adj(a, c) || !adj(b, c)) continue;
        for (const d of near) { if (adj(a, d) && adj(b, d) && adj(c, d)) { four = [a, b, c, d]; break; } } if (four) break; } if (four) break; } if (four) break; }
      if (!four) throw new Error('no unit tetrahedron of nodes in reach');
      for (const p of four) {   // mark each by looking at it, as a player does
        fs.lookAt(...p); fs.step(0.05);
        if (document.getElementById('prompt').hidden || !document.getElementById('promptText').textContent.startsWith('Mark')) throw new Error('a node in reach could not be marked');
        fs.act();
      }
      // face the Ring again, its vector equilibrium framed by the glowing lattice, and let the counter click
      fs.face(0, 0); fs.S.pl.pitch = 0.2; fs.step(1.6);
      if (fs.lattice().marks.length !== 4) throw new Error('the four marks did not count: ' + JSON.stringify(fs.lattice()));
      ({ lattice: fs.lattice(), strut, selfTest: fs.selfTest().passed + ' of ' + fs.selfTest().total })`,
  },
  { ...SCENES[0], file: 'social-2-lookout-rise.jpg', viewport: WIDE },
  { ...SCENES[1], file: 'social-3-storybook-ring.jpg', viewport: WIDE },
];

function chromePath(given) {
  const candidates = [given, process.env.CHROME, '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium', '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'];
  const found = candidates.find(p => p && existsSync(p));
  if (!found) throw new Error('Chrome not found; pass --chrome PATH or set CHROME');
  return found;
}

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' };

/* A static server for the repository, bound to loopback; it refuses any path outside the repository. */
function serve() {
  const server = createServer(async (req, res) => {
    try {
      const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      let file = resolve(ROOT, '.' + path);
      if (path.endsWith('/')) file = join(file, 'index.html');
      if (file !== ROOT && !file.startsWith(ROOT + sep)) { res.writeHead(403).end(); return; }
      const body = await readFile(file);
      res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream' }).end(body);
    } catch { res.writeHead(404).end(); }
  });
  return new Promise(ok => server.listen(0, '127.0.0.1', () => ok(server)));
}

/* A minimal Chrome DevTools Protocol client over Node's built-in WebSocket. */
async function connect(url) {
  const ws = new WebSocket(url);
  await new Promise((ok, fail) => { ws.onopen = ok; ws.onerror = () => fail(new Error(`cannot connect to ${url}`)); });
  let next = 0; const waiting = new Map();
  ws.onmessage = e => {
    const m = JSON.parse(e.data);
    if (m.id && waiting.has(m.id)) { const { ok, fail } = waiting.get(m.id); waiting.delete(m.id); m.error ? fail(new Error(m.error.message)) : ok(m.result); }
  };
  const send = (method, params = {}) => new Promise((ok, fail) => { const id = ++next; waiting.set(id, { ok, fail }); ws.send(JSON.stringify({ id, method, params })); });
  return { send, close: () => ws.close() };
}

async function evaluate(page, expression, what) {
  const r = await page.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error(`${what}: ${r.exceptionDetails.exception?.description || r.exceptionDetails.text}`);
  return r.result.value;
}

const pause = ms => new Promise(ok => setTimeout(ok, ms));
const sha256 = data => createHash('sha256').update(data).digest('hex');

/* Seeded before any page script: a fixed Math.random, and an animation loop that never runs on its own. */
const FREEZE = `(() => {
  let a = 0x0551975; Math.random = () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  window.requestAnimationFrame = () => 0; window.cancelAnimationFrame = () => {};
})();`;

async function capture(chrome, base, scene) {
  const profile = await mkdtemp(join(tmpdir(), 'cascadian-capture-'));
  const proc = spawn(chrome, ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`, '--no-first-run',
    '--no-default-browser-check', '--hide-scrollbars', '--mute-audio', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
    '--ignore-gpu-blocklist', 'about:blank'], { stdio: 'ignore' });
  try {
    let port = null;
    for (let i = 0; i < 100 && !port; i++) { await pause(100); try { port = (await readFile(join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]; } catch { /* not yet */ } }
    if (!port) throw new Error('Chrome did not open its debugging port');
    const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
    const page = await connect(targets.find(t => t.type === 'page').webSocketDebuggerUrl);
    const { width, height, scale } = scene.viewport;
    await page.send('Page.enable');
    await page.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: scale, mobile: false });
    await page.send('Page.addScriptToEvaluateOnNewDocument', { source: FREEZE });
    await page.send('Page.navigate', { url: `${base}/${scene.page}` });
    let ready = false;
    for (let i = 0; i < 300 && !ready; i++) { await pause(100); ready = await evaluate(page, `document.readyState === 'complete' && ${scene.ready}`, 'waiting for the page').catch(() => false); }
    if (!ready) throw new Error(`${scene.page} did not finish loading`);
    await evaluate(page, 'document.fonts.ready.then(() => true)', 'waiting for fonts');
    const report = await evaluate(page, scene.setup, `setting up ${scene.file}`);
    await pause(300);   // let the compositor take the last frame the hook drew
    const shot = await page.send('Page.captureScreenshot', { format: 'jpeg', quality: 88, captureBeyondViewport: false });
    page.close();
    return { jpeg: Buffer.from(shot.data, 'base64'), report };
  } finally {
    proc.kill();
    await pause(300);
    await rm(profile, { recursive: true, force: true });
  }
}

async function main(argv) {
  const arg = name => { const i = argv.indexOf(name); return i >= 0 ? argv[i + 1] : undefined; };
  const set = arg('--set') || 'paper';
  if (!['paper', 'social'].includes(set)) throw new Error(`--set ${set}: the sets are paper and social`);
  const only = arg('--only'), scenes = (set === 'paper' ? SCENES : SOCIAL).filter(s => !only || s.file === only);
  if (!scenes.length) throw new Error(`--only ${only}: no such scene in the ${set} set`);
  if (only && !arg('--out')) throw new Error('--only takes one scene into a scratch folder: give --out too, so the set and its record stay whole');
  const out = resolve(arg('--out') || join(ROOT, set === 'paper' ? 'docs/images' : 'output/social'));
  const chrome = chromePath(arg('--chrome'));
  await mkdir(out, { recursive: true });
  const server = await serve();
  const base = `http://127.0.0.1:${server.address().port}`;
  const record = { about: set === 'paper' ? 'Written by scripts/capture_screenshots.mjs; tests/check.mjs holds each image to its SHA-256 here.'
    : 'Written by scripts/capture_screenshots.mjs --set social: wide frames of the games for sharing, not figures of the paper.', shots: [] };
  try {
    for (const scene of scenes) {
      const { jpeg, report } = await capture(chrome, base, scene);
      await writeFile(join(out, scene.file), jpeg);
      record.shots.push({ file: scene.file, sha256: sha256(jpeg), shows: scene.shows, page: scene.page,
        page_sha256: sha256(await readFile(join(ROOT, scene.page))), viewport: scene.viewport, scene: report });
      console.log(`${relative(process.cwd(), join(out, scene.file))}  ${jpeg.length} bytes  ${JSON.stringify(report).slice(0, 160)}`);
    }
  } finally { server.close(); }
  await writeFile(join(out, set === 'paper' ? 'screenshots.json' : 'social.json'), JSON.stringify(record, null, 1) + '\n');
}

if (realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
  main(process.argv.slice(2)).catch(e => { console.error(e.message); process.exit(1); });
}

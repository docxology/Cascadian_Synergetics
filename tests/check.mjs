// Checks that need no browser: every inline script parses, the artifact rules
// hold, the standalone pages are fresh, and the geometry the games show is true.
//
//   node tests/check.mjs

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = p => readFileSync(join(ROOT, p), 'utf8');
let failures = 0;
const ok = (cond, msg) => { console.log(`${cond ? 'ok  ' : 'FAIL'}  ${msg}`); if (!cond) failures++; };
const near = (a, b, eps = 1e-9) => Math.abs(a - b) <= eps;
const dist = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);

/* 1. Artifact sources: one inline script each, it parses, and the page follows the artifact contract */
const ALLOWED_SCRIPT_HOSTS = ['https://cdnjs.cloudflare.com/'];
for (const file of ['src/storybook.html', 'src/field-station.html']) {
  const html = read(file);
  const inline = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
  ok(inline.length === 1, `${file}: one inline script`);
  for (const code of inline) {
    try { new vm.Script(code, { filename: file }); ok(true, `${file}: inline script parses`); }
    catch (e) { ok(false, `${file}: ${e.message}`); }
  }
  for (const m of html.matchAll(/<script src="([^"]+)"/g)) ok(ALLOWED_SCRIPT_HOSTS.some(h => m[1].startsWith(h)) && /\/r\d+\//.test(m[1]), `${file}: external script is pinned on cdnjs (${m[1]})`);
  ok(/<title>[^<]+<\/title>/.test(html.slice(0, 8192)), `${file}: <title> within the first 8 KB`);
  ok(!/<!doctype|<html|<head>|<body/i.test(html), `${file}: no document skeleton (the artifact host adds it)`);
  ok(!/\balert\(|\bconfirm\(|\bprompt\(/.test(inline.join('\n')), `${file}: no alert/confirm/prompt dialogs`);
}

/* 2. Standalone pages are a fresh build of the sources */
try { execFileSync(process.execPath, [join(ROOT, 'tools/build.mjs'), '--check'], { stdio: 'pipe' }); ok(true, 'storybook/ and field-station/ match a fresh build'); }
catch (e) { ok(false, `standalone pages are stale:\n${(e.stdout || '') + (e.stderr || '')}`); }

/* 3. The geometry, using the exact functions the first-person game runs */
const src = read('src/field-station.html');
const grab = (re, what) => { const m = src.match(re); if (!m) throw new Error(`could not find ${what} in src/field-station.html`); return m[0]; };
const code = [
  grab(/const QR = \[[^\n]*\n/, 'QR'),
  grab(/function toQuadray\([^\n]*\n/, 'toQuadray'),
  grab(/function fromQuadray\([^\n]*\n/, 'fromQuadray'),
  grab(/function jitterbug\([\s\S]*?\n}\n/, 'jitterbug'),
  grab(/const TET_V = [^\n]*\n/, 'TET_V'),
].join('\n') + '\nthis.QR = QR; this.toQuadray = toQuadray; this.fromQuadray = fromQuadray; this.jitterbug = jitterbug; this.TET_V = TET_V;';
const g = {}; vm.createContext(g); vm.runInContext(code, g);

// Quadrays: four unit rays to a regular tetrahedron's corners, summing to zero, 109.47 degrees apart.
const sum = [0, 1, 2].map(k => g.QR.reduce((s, q) => s + q[k], 0));
ok(g.QR.every(q => near(Math.hypot(...q), 1)), 'quadray basis: four unit rays');
ok(sum.every(v => near(v, 0)), 'quadray basis: the four rays sum to zero');
let tetAngles = true;
for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) tetAngles &&= near(g.QR[i].reduce((s, v, k) => s + v * g.QR[j][k], 0), -1 / 3);
ok(tetAngles, 'quadray basis: every pair meets at the tetrahedral angle (cos = -1/3)');
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
let allGood = true;
for (let i = 0; i < 2000; i++) {
  const p = [rnd() * 200 - 100, rnd() * 40 - 5, rnd() * 200 - 100], q = g.toQuadray(...p), back = g.fromQuadray(q);
  allGood &&= q.every(v => v >= -1e-12) && q.some(v => Math.abs(v) < 1e-12) && dist(p, back) < 1e-9;
}
ok(allGood, 'quadray coordinates: 2000 points are non-negative, have one zero, and convert back exactly');

// Jitterbug: eight rigid equilateral triangles; vector equilibrium, icosahedron, octahedron.
const PHI = (1 + Math.sqrt(5)) / 2, E = 1;
const vertsOf = J => { const out = []; for (const t of J.tris) for (const v of t) if (!out.some(u => dist(u, v) < 1e-9)) out.push(v); return out; };
for (const r of [1, 1 / PHI, 0.5, 0]) {
  const J = g.jitterbug(r, E);
  ok(J.tris.length === 8 && J.tris.every(t => near(dist(t[0], t[1]), E) && near(dist(t[1], t[2]), E) && near(dist(t[2], t[0]), E)), `jitterbug r=${r.toFixed(3)}: eight equilateral triangles of edge 1`);
}
const ve = vertsOf(g.jitterbug(1, E));
ok(ve.length === 12 && ve.every(v => near(Math.hypot(...v), E)), 'vector equilibrium: 12 vertices, radius equals edge');
const ico = vertsOf(g.jitterbug(1 / PHI, E));
ok(ico.length === 12 && ico.every(v => ico.filter(u => near(dist(u, v), E)).length === 5), 'at a/b = 1/phi the 12 vertices form an icosahedron (5 neighbours each)');
const oct = vertsOf(g.jitterbug(0, E));
ok(oct.length === 6 && oct.every(v => oct.filter(u => near(dist(u, v), E)).length === 4), 'at a = 0 the vertices pair up into an octahedron (6 vertices, 4 neighbours each)');

// The cube and its inscribed tetrahedron: cube 3, tetrahedron 1, four corner pieces of 1/2.
const det3 = (a, b, c) => a[0] * (b[1] * c[2] - b[2] * c[1]) - a[1] * (b[0] * c[2] - b[2] * c[0]) + a[2] * (b[0] * c[1] - b[1] * c[0]);
const vol = (p0, p1, p2, p3) => Math.abs(det3([p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]], [p2[0] - p0[0], p2[1] - p0[1], p2[2] - p0[2]], [p3[0] - p0[0], p3[1] - p0[1], p3[2] - p0[2]])) / 6;
const tet = vol(...g.TET_V), cube = 8, corner = vol([-1, -1, -1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]);
ok(near(cube / tet, 3), 'cube on the tetrahedron’s edges = 3 tetravolumes');
ok(near(corner / tet, 0.5) && near(tet + 4 * corner, cube), 'cube = tetrahedron + four corner pieces of 1/2');

console.log(failures ? `\n${failures} check(s) failed` : '\nall checks passed');
process.exit(failures ? 1 : 0);

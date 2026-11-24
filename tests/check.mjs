// Checks that need no browser: every inline script parses, the artifact rules
// hold, the standalone pages are fresh, the geometry the games show is true, and
// the code imported from QuadCraft and QuadMath is what upstream published and
// gives the answers upstream gives.
//
//   node tests/check.mjs

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { checkLocal, readLock } from '../tools/vendor.mjs';
import { SPLICES, splicedPaths } from '../tools/build.mjs';
import { TALLY_SAMPLES } from '../tools/facts.mjs';

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

/* The 3D view is sized by CSS, not by its pixel buffer: the game lowers its pixel ratio when frames run slow
   (and raises it on dense screens), and a canvas without a CSS size would shrink or overflow with it. */
{ const fsHtml = read('src/field-station.html'), rule = (fsHtml.match(/#view\{[^}]*\}/) || [''])[0];
  ok(/renderer\.setSize\([^)]*false\)/.test(fsHtml) && /width:100%/.test(rule) && /height:100%/.test(rule), 'src/field-station.html: the 3D canvas fills the frame at any pixel ratio (CSS width and height 100%)'); }

/* Every number the docs state about the geometry and the imports is computed and injected, none typed */
try {
  const out = execFileSync(process.execPath, [join(ROOT, 'tools/facts.mjs'), '--check'], { stdio: 'pipe', encoding: 'utf8' });
  ok(/^fresh: computed numbers in the docs \(\d+ facts\)$/m.test(out), `docs: every computed number is injected and current (${(out.match(/\((\d+) facts\)/) || [])[1]} facts)`);
}
catch (e) { ok(false, `docs: computed numbers are stale or typed:\n${(e.stdout || '') + (e.stderr || '')}`); }

/* 2. Standalone pages are a fresh build of the sources */
try {
  const out = execFileSync(process.execPath, [join(ROOT, 'tools/build.mjs'), '--check'], { stdio: 'pipe', encoding: 'utf8' });
  // Require the script's own report, so a build that silently did nothing cannot pass.
  ok(/^fresh: storybook\/index\.html$/m.test(out) && /^fresh: field-station\/index\.html$/m.test(out) && /^fresh: spliced blocks in src\/field-station\.html$/m.test(out), 'storybook/, field-station/ and the spliced blocks match a fresh build');
}
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

/* 4. Imports: vendor/ is upstream's bytes, the spliced blocks are vendor/'s bytes, the fixture is QuadMath's answers */
const require = createRequire(import.meta.url);
for (const r of checkLocal()) ok(r.ok, `vendored: ${r.msg}`);
const lock = readLock(), qmLock = lock.sources.find(s => s.name === 'quadmath');
const FIX = JSON.parse(read('tests/fixtures/quadmath.json'));
ok(FIX.source.commit === qmLock.commit && Object.entries(FIX.source.blobs).every(([to, blob]) => qmLock.files.find(f => f.to === to)?.blob === blob),
  `tests/fixtures/quadmath.json was computed by the vendored QuadMath (${qmLock.commit.slice(0, 7)})`);
for (const [file, paths] of Object.entries(SPLICES)) {
  const html = read(file);
  ok(splicedPaths(html).join() === paths.join(), `${file}: carries ${paths.join(', ')}`);
  for (const path of paths) {
    const m = html.match(new RegExp(`/\\* ==== splice ${path.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')} ==== \\*/\\n([\\s\\S]*?)/\\* ==== end splice`));
    ok(m && m[1] === read(path), `${file}: its ${path} block is byte-identical to the file`);
  }
}

/* 5. The QuadMath port reproduces QuadMath, exactly */
const TV = require('../lib/tetravolume.js');
const frac = v => v.map(String).join('/');
const cases = [...FIX.named, ...FIX.random_integer, ...FIX.random_ivm];
ok(cases.every(c => frac(TV.aceTetravolumeExact(...c.points)) === frac(c.ace)), `aceTetravolumeExact = QuadMath ace_tetravolume_5x5 on all ${cases.length} fixture tetrahedra`);
ok(cases.every(c => frac(c.ace) === frac(c.integer)), 'QuadMath’s own two volume methods agree on every fixture (5x5 and projected 3x3)');
ok(FIX.bareiss.every(b => TV.bareissDeterminant(b.matrix) === BigInt(b.det)), `bareissDeterminant = QuadMath bareiss_determinant_int on all ${FIX.bareiss.length} fixture matrices`);
ok(cases.every(c => near(TV.aceTetravolume(...c.points), c.ace[0] / c.ace[1], 1e-9)), 'the floating-point companion agrees with the exact volume to 1e-9');
ok(JSON.stringify(TV.IVM_NEIGHBOR_MOVES) === JSON.stringify(FIX.ivm_neighbor_moves), 'IVM_NEIGHBOR_MOVES = QuadMath’s twelve permutations of (2, 1, 1, 0)');
const named = Object.fromEntries(FIX.named.map(c => [c.name.split(':')[0], frac(c.ace)]));
ok(named['unit IVM tetrahedron'] === '1/1' && named['primitive tetrahedron'] === '1/4' && named['frequency-two tetrahedron'] === '8/1', 'QuadMath: unit IVM tetrahedron 1, primitive 1/4, frequency two 8');
ok(FIX.random_ivm.every(c => c.ace[1] === 1) && FIX.random_integer.some(c => c.ace[1] !== 1), 'QuadMath: every IVM-node tetrahedron is whole, while arbitrary integer quadrays are not');

/* 6. QuadCraft's own checks pass, and its convention meets QuadMath's and the compass's */
const QC = require('../vendor/quadcraft/quadray.js'), SYN = require('../vendor/quadcraft/synergetics.js');
const suite = SYN.verifyGeometricIdentities();
ok(suite.allPassed && suite.checks.length === 8, `QuadCraft verifyGeometricIdentities: ${suite.checks.filter(c => c.passed).length} of ${suite.checks.length} pass`);
const E4 = [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]], qcCart = q => { const c = new QC.Quadray(...q).toCartesian(); return [c.x, c.y, c.z]; };
const qmXYZ = q => FIX.default_embedding.map(row => row.reduce((s, v, i) => s + v * q[i], 0));
const swapBC = [0, 2, 1, 3];
ok(E4.every((e, i) => dist(qmXYZ(e), qcCart(E4[swapBC[i]]).map(v => v * Math.SQRT2)) < 1e-12),
  'conventions: QuadMath’s DEFAULT_EMBEDDING is √2 × QuadCraft’s toCartesian with b and c exchanged');
ok(TV.IVM_NEIGHBOR_MOVES.every(m => near(Math.hypot(...qcCart(m)), 2)), 'conventions: in QuadCraft’s frame every IVM neighbour move is 2 long, one sphere diameter');
{ // the compass basis QR is QuadCraft's basis turned so one ray points straight up, and scaled by √(3/2)
  const u = E4.map(e => { const v = qcCart(e), l = Math.hypot(...v); return v.map(x => x / l); });
  const inv3 = m => { const [a, b, c] = m, d = det3(a, b, c), cr = (p, q) => [p[1] * q[2] - p[2] * q[1], p[2] * q[0] - p[0] * q[2], p[0] * q[1] - p[1] * q[0]]; const adj = [cr(b, c), cr(c, a), cr(a, b)]; return [0, 1, 2].map(i => adj.map(r => r[i] / d)); }; // columns b×c, c×a, a×b over det
  const mul = (A, B) => A.map(r => [0, 1, 2].map(j => r.reduce((s, v, k) => s + v * B[k][j], 0)));
  const col = vs => [0, 1, 2].map(i => vs.map(v => v[i])), apply = (M, v) => M.map(r => r[0] * v[0] + r[1] * v[1] + r[2] * v[2]);
  let found = null;
  const perms = [[0, 1, 2, 3], [0, 1, 3, 2], [0, 2, 1, 3], [0, 2, 3, 1], [0, 3, 1, 2], [0, 3, 2, 1], [1, 0, 2, 3], [1, 0, 3, 2], [1, 2, 0, 3], [1, 2, 3, 0], [1, 3, 0, 2], [1, 3, 2, 0], [2, 0, 1, 3], [2, 0, 3, 1], [2, 1, 0, 3], [2, 1, 3, 0], [2, 3, 0, 1], [2, 3, 1, 0], [3, 0, 1, 2], [3, 0, 2, 1], [3, 1, 0, 2], [3, 1, 2, 0], [3, 2, 0, 1], [3, 2, 1, 0]];
  for (const s of perms) {
    const Rm = mul(col(g.QR.slice(0, 3)), inv3(col([u[s[0]], u[s[1]], u[s[2]]])));
    const orth = [0, 1, 2].every(i => [0, 1, 2].every(j => near(Rm.reduce((a, r) => a + r[i] * r[j], 0), i === j ? 1 : 0, 1e-12)));
    if (orth && near(det3(...Rm), 1, 1e-12) && dist(apply(Rm, u[s[3]]), g.QR[3]) < 1e-12) { found = { s, Rm }; break; }
  }
  let agree = !!found;
  if (found) for (let i = 0; i < 500 && agree; i++) {
    const P = [rnd() * 200 - 100, rnd() * 40 - 5, rnd() * 200 - 100], RtP = [0, 1, 2].map(j => found.Rm.reduce((a, r, k) => a + r[j] * P[k], 0));
    const qc = QC.Quadray.fromCartesian(...RtP), qcv = [qc.a, qc.b, qc.c, qc.d], fs = g.toQuadray(...P);
    agree = fs.every((v, k) => near(v, Math.sqrt(1.5) * qcv[found.s[k]], 1e-9));
  }
  ok(agree, `conventions: the compass quadray of any point = √(3/2) × QuadCraft’s, under a proper rotation and relabelling ${found ? found.s.join('') : '(none found)'}`);
}

/* 7. The game's lattice, tally and Ring gauge, run with the imported code exactly as spliced */
const block = path => src.match(new RegExp(`/\\* ==== splice ${path.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')} ==== \\*/\\n[\\s\\S]*?/\\* ==== end splice [^\\n]*`))[0];
const fn = name => grab(new RegExp(`function ${name}\\([\\s\\S]*?\\n}\\n`), name);
const game = {}; vm.createContext(game);
vm.runInContext([...SPLICES['src/field-station.html'].map(block),
  'this.out = { ivmLattice, latticeAddress, jitterVolume, jitterbug, veSolid, aceTetravolumeExact, IVM_NEIGHBOR_MOVES };'].join('\n'), game);
const G = game.out, EDGE = 2.4, LAT = G.ivmLattice(11, EDGE);
const addr = LAT.nodes.map(p => G.latticeAddress(...p, EDGE));
ok(addr.every(Boolean), `lattice: all ${LAT.nodes.length} nodes of the stillness lattice have whole QuadCraft addresses`);
const P = 2 * LAT.s, shifted = LAT.nodes.slice(0, 50).map(p => G.latticeAddress(p[0] + 37 * P, p[1] - 4 * P, p[2] - 21 * P, EDGE));
ok(shifted.every(Boolean), 'lattice: shifted by whole periods, as it is when it appears around a ranger, the addresses stay whole');
const moveSet = new Set(G.IVM_NEIGHBOR_MOVES.map(m => m.join())), norm = a => { const m = Math.min(...a); return a.map(v => v - m); };
ok(LAT.edges.every(([p, q]) => { const a = G.latticeAddress(...p, EDGE), b = G.latticeAddress(...q, EDGE); return near(dist(p, q), EDGE) && moveSet.has(norm(b.map((v, i) => v - a[i])).join()); }),
  `lattice: all ${LAT.edges.length} struts are ${EDGE} m and step between addresses by one of QuadMath’s twelve moves`);
const degree = new Map(); for (const [p, q] of LAT.edges) for (const v of [p, q]) degree.set(v.join(), (degree.get(v.join()) || 0) + 1);
ok(LAT.nodes.filter(p => Math.hypot(...p) < 11 - EDGE).every(p => degree.get(p.join()) === 12), 'lattice: every interior node has twelve neighbours');
let wholeAll = true, matchAll = true, counted = 0; const unit = EDGE ** 3 / (6 * Math.SQRT2);
for (let i = 0; i < TALLY_SAMPLES; i++) {
  const pick4 = [0, 1, 2, 3].map(() => LAT.nodes[Math.floor(rnd() * LAT.nodes.length)]), q4 = pick4.map(p => G.latticeAddress(...p, EDGE));
  const [num, den] = G.aceTetravolumeExact(...q4); wholeAll &&= den === 1n; matchAll &&= near(Number(num) / Number(den), vol(...pick4) / unit, 1e-7); counted++;
}
ok(wholeAll, `tally: ${counted} random four-node marks all count to whole tetravolumes`);
ok(matchAll, 'tally: each count equals the tetrahedron’s XYZ volume over a regular tetrahedron of the lattice edge');
const verts2 = J => { const out = []; for (const t of J.tris) for (const v of t) if (!out.some(u => dist(u, v) < 1e-9)) out.push(v); return out; };
const hullVol = pts => { // brute-force convex hull: every triple whose plane leaves all other points on one side
  let V = 0; const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], cr = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) for (let k = j + 1; k < pts.length; k++) {
    const nrm = cr(sub(pts[j], pts[i]), sub(pts[k], pts[i])), L = Math.hypot(...nrm); if (L < 1e-12) continue;
    let pos = 0, neg = 0; for (let m = 0; m < pts.length; m++) { if (m === i || m === j || m === k) continue; const d = (nrm[0] * (pts[m][0] - pts[i][0]) + nrm[1] * (pts[m][1] - pts[i][1]) + nrm[2] * (pts[m][2] - pts[i][2])) / L; if (d > 1e-9) pos++; else if (d < -1e-9) neg++; }
    if (pos && neg) continue; if (pos + neg < pts.length - 3) return NaN; V += Math.abs(det3(pts[i], pts[j], pts[k])) / 6;
  }
  return V;
};
const RE = 2.3, tetE = RE ** 3 / (6 * Math.SQRT2), jv = r => G.jitterVolume(G.jitterbug(r, RE), RE);
ok(near(jv(1), 20, 1e-9) && near(jv(1 / PHI), 5 * Math.SQRT2 * PHI * PHI, 1e-9) && near(jv(0), 4, 1e-9), 'Ring gauge: the jitterbug measures 20 (vector equilibrium), 5√2φ² ≈ 18.512 (icosahedron), 4 (octahedron)');
const rs = Array.from({ length: 38 }, (_, i) => 0.02 + i * 0.025), hullOK = rs.every(r => near(jv(r), hullVol(verts2(G.jitterbug(r, RE))) / tetE, 1e-8));
ok(hullOK, 'Ring gauge: between the stations the reading is the struts’ convex hull, checked against an independent hull');
const sweep = Array.from({ length: 1001 }, (_, i) => ({ r: i / 1000, v: jv(i / 1000) })), top = sweep.reduce((a, b) => (b.v > a.v ? b : a));
ok(top.v > 20 && top.r > 1 / PHI && top.r < 1, `Ring gauge: the hull swells to ${top.v.toFixed(3)} at a/b = ${top.r.toFixed(3)}, between the icosahedron and the vector equilibrium, before it falls`);
{ // the ash over the station: each flake is a vector equilibrium of 20 tetravolumes
  const AE = 0.065, flat = G.veSolid(AE), tris = []; for (let i = 0; i < flat.length; i += 9) tris.push([flat.slice(i, i + 3), flat.slice(i + 3, i + 6), flat.slice(i + 6, i + 9)]);
  const edgesOK = tris.every(t => [[0, 1], [1, 2], [2, 0]].every(([a, b]) => { const l = dist(t[a], t[b]); return near(l, AE, 1e-12) || near(l, AE * Math.SQRT2, 1e-12); }));
  const V = tris.reduce((s, [a, b, c]) => s + Math.abs(det3(a, b, c)) / 6, 0) / (AE ** 3 / (6 * Math.SQRT2));
  ok(tris.length === 20 && edgesOK && near(V, 20, 1e-9), 'ash: each flake is a vector equilibrium, 8 triangles and 6 squares closing 20 tetravolumes');
}
{ // the storybook's lattice closes around its looping beat, so addresses never break where the loop joins
  const sb = read('src/storybook.html'), env = {}; vm.createContext(env);
  vm.runInContext([sb.match(/const LOOP = [^\n]*/)[0], sb.match(/const LAT_EDGE = [^\n]*/)[0], 'this.n = LOOP / (LAT_EDGE * Math.SQRT2); this.edge = LAT_EDGE;'].join('\n'), env);
  const SL = G.ivmLattice(6.5, env.edge);
  ok(near(env.n, Math.round(env.n), 1e-9) && SL.nodes.every(p => G.latticeAddress(...p, env.edge)), `storybook lattice: ${Math.round(env.n)} whole periods around the ${Math.round(env.n * env.edge * Math.SQRT2)} m loop, every node addressed`);
}
{ // cube 3 again, now with quadrays and the 5x5 determinant: QuadCraft's basis tips are the game's TET_V
  const k = 1 / Math.SQRT2, q = p => { const r = QC.Quadray.fromCartesian(p[0] * k, p[1] * k, p[2] * k); return [r.a, r.b, r.c, r.d]; };
  const t1 = TV.aceTetravolume(...g.TET_V.map(q)), corner4 = [[-1, -1, -1], [1, 1, -1], [1, -1, 1], [-1, 1, 1]].map(c => TV.aceTetravolume(q(c), ...g.TET_V.filter(v => dist(v, c) < 2.9).map(q)));
  ok(near(t1, 1, 1e-12) && corner4.every(v => near(v, 0.5, 1e-12)) && near(t1 + corner4.reduce((a, b) => a + b, 0), 3, 1e-12), 'cube = 3 by the 5x5 determinant too: the tetrahedron 1 and four corners of 1/2');
}

console.log(failures ? `\n${failures} check(s) failed` : '\nall checks passed');
process.exit(failures ? 1 : 0);

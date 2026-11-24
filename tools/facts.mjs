// The numbers the docs and the manuscript state about the geometry and the imports, computed from
// their sources and injected, never typed by hand.
//
// In the Markdown docs a computed number sits between invisible markers: <!-- n:hullPeak -->20.44<!-- /n -->.
// The value inside is rewritten from computeFacts(); the markers never show when the page renders.
// The manuscript (docs/manuscript/) writes the same facts as {{HULL_PEAK}} tokens, which the template's
// hydration step replaces from the map that --tokens prints (scripts/z_generate_manuscript_variables.py).
//
//   node tools/facts.mjs              recompute every fact and rewrite the marked numbers in the docs
//   node tools/facts.mjs --check      exit 1 if a marked number is stale or unknown, if a docs file states a
//                                     decimal with two or more places outside a marker, if the manuscript
//                                     states a number that is not a token, or if the tracked PDF no longer
//                                     matches the sources it was rendered from
//   node tools/facts.mjs --tokens     print the manuscript's token map as JSON
//   node tools/facts.mjs --series     print the data the manuscript's figures plot, as JSON
//   node tools/facts.mjs --stamp      after a render: record the PDF's digest and its sources' digest

import { readFileSync, writeFileSync, readdirSync, statSync, realpathSync, existsSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import vm from 'node:vm';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = p => readFileSync(join(ROOT, p), 'utf8');
const PHI = (1 + Math.sqrt(5)) / 2;

/* How many random four-node marks the checks count on the stillness lattice. */
export const TALLY_SAMPLES = 400;

/* How many evenly spaced values of a/b the jitterbug sweep measures, from 0 to 1 inclusive. */
export const SWEEP_POINTS = 1001;

/* The Markdown whose numbers are checked. */
export const DOCS = ['README.md', 'AGENTS.md', 'docs/imports.md', 'docs/synergetics.md', 'docs/design.md', 'docs/cascadia.md', 'CHANGELOG.md'];

/* The manuscript, its rendered PDF, and the record binding the one to the other. */
export const MANUSCRIPT = 'docs/manuscript';
export const PDF = 'output/pdf/Cascadian_Synergetics_combined.pdf';
export const STAMP = 'output/pdf/Cascadian_Synergetics_combined.json';
/* Guidance files in the manuscript folder that the template never renders (its EXCLUDED_DOC_FILENAMES), plus the LaTeX preamble. */
const MS_NOT_PROSE = new Set(['README.md', 'AGENTS.md', 'MANUSCRIPT_STATUS.md', 'SYNTAX.md', 'preamble.md']);

/* Facts the repository cannot compute: each comes from a cited source, and the manuscript must cite it in
   the same paragraph wherever it uses the token. */
export const SOURCED = {
  cascadiaQuakeDate: { value: 'January 1700', cite: 'satake1996' },   // the month the cited records give; the day is not stated here
};

/* The grove's shared geometry with the code it imports, run the way both games run it (tools/build.mjs splices the same four files). */
function geometry() {
  const env = {}; vm.createContext(env);
  vm.runInContext(['vendor/quadcraft/quadray.js', 'vendor/quadcraft/synergetics.js', 'lib/tetravolume.js', 'lib/grove-geometry.js'].map(read).join('\n') +
    '\nthis.out = { Quadray, verifyGeometricIdentities, bareissDeterminant, aceMatrix, aceTetravolumeExact, aceTetravolume, IVM_NEIGHBOR_MOVES, jitterbug, jitterVolume, ivmLattice, latticeAddress, aModules };', env);
  return env.out;
}

/* Constants the field station declares, read from its source rather than repeated here. */
function fieldStation() {
  const src = read('src/field-station.html'), env = {}; vm.createContext(env);
  vm.runInContext(src.match(/const TET_V = [^\n]*/)[0] + '\nthis.TET_V = TET_V;', env);
  const ivm = src.match(/const IVM = buildIVM\(([\d.]+), ([\d.]+),/), three = src.match(/three\.js\/(r\d+)\//);
  if (!ivm || !three) throw new Error('src/field-station.html: could not find the stillness lattice or the three.js revision');
  return { TET_V: env.TET_V, latticeRadius: Number(ivm[1]), latticeEdge: Number(ivm[2]), threeRevision: three[1] };
}

function storybook() {
  const sb = read('src/storybook.html'), env = {}; vm.createContext(env);
  vm.runInContext([sb.match(/const LOOP = [^\n]*/)[0], sb.match(/const LAT_EDGE = [^\n]*/)[0], 'this.loop = LOOP; this.edge = LAT_EDGE;'].join('\n'), env);
  return { loop: env.loop, edge: env.edge };
}

/* A float that must be a whole number, as a string; anything else is an error, never a rounded claim. */
function whole(v, what) {
  const n = Math.round(v);
  if (Math.abs(v - n) > 1e-9) throw new Error(`${what} = ${v} is not whole`);
  return String(n);
}

/* A float that must be a small fraction, as [numerator, denominator]. */
function fraction(v, what, maxDen = 1000) {
  for (let d = 1; d <= maxDen; d++) { const n = Math.round(v * d); if (Math.abs(v * d - n) < 1e-9) return [n, d]; }
  throw new Error(`${what} = ${v} is not a fraction with denominator up to ${maxDen}`);
}
const tex = ([n, d]) => (String(d) === '1' ? String(n) : `\\tfrac{${n}}{${d}}`);

const sub = (a, b) => a.map((v, i) => v - b[i]);
const det3 = (a, b, c) => a[0] * (b[1] * c[2] - b[2] * c[1]) - a[1] * (b[0] * c[2] - b[2] * c[0]) + a[2] * (b[0] * c[1] - b[1] * c[0]);
const dist = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);

/* The jitterbug's volume, swept from the octahedron (a/b = 0) to the vector equilibrium (a/b = 1). */
function sweep(G) {
  const jv = r => G.jitterVolume(G.jitterbug(r, 1), 1);
  const points = Array.from({ length: SWEEP_POINTS }, (_, i) => { const r = i / (SWEEP_POINTS - 1); return { r, v: jv(r) }; });
  const peak = points.reduce((a, b) => (b.v > a.v ? b : a));
  const stations = [
    { name: 'octahedron', r: 0, v: jv(0) },
    { name: 'icosahedron', r: 1 / PHI, v: jv(1 / PHI) },
    { name: 'vector equilibrium', r: 1, v: jv(1) },
  ];
  return { points, peak, stations };
}

/* The cube on the tetrahedron's edges, measured with Tom Ace's 5x5 determinant on QuadCraft quadrays. */
function cube(G, TET_V) {
  const k = 1 / Math.SQRT2, q = p => { const r = G.Quadray.fromCartesian(p[0] * k, p[1] * k, p[2] * k); return [r.a, r.b, r.c, r.d]; };
  const tet = G.aceTetravolume(...TET_V.map(q));
  const corners = [[-1, -1, -1], [1, 1, -1], [1, -1, 1], [-1, 1, 1]].map(c => G.aceTetravolume(q(c), ...TET_V.filter(v => dist(v, c) < 2.9).map(q)));
  return { tet, corners, total: tet + corners.reduce((a, b) => a + b, 0) };
}

/* Fuller's A-modules: their count, the share each holds (exact), and how many turn each way. */
function aModules(G, TET_V) {
  const Q = [[12, 0, 0, 0], [0, 12, 0, 0], [0, 0, 12, 0], [0, 0, 0, 12]], wholeT = G.aceTetravolumeExact(...Q), mods = G.aModules(Q);
  const shares = new Set(mods.map(m => { const [n, d] = G.aceTetravolumeExact(...m); const num = n * wholeT[1], den = d * wholeT[0]; let x = num, y = den; while (y) [x, y] = [y, x % y]; return `${num / x}/${den / x}`; }));
  if (shares.size !== 1) throw new Error(`A-modules do not all hold the same share: ${[...shares].join(', ')}`);
  const xyz = G.aModules(TET_V).map(m => ({ pts: m, hand: Math.sign(det3(sub(m[1], m[0]), sub(m[2], m[0]), sub(m[3], m[0]))) }));
  const left = xyz.filter(m => m.hand > 0).length, right = xyz.filter(m => m.hand < 0).length;
  if (left !== right) throw new Error(`A-modules: ${left} turn one way and ${right} the other`);
  return { count: mods.length, share: [...shares][0].split('/'), hand: left, xyz };
}

export function computeFacts() {
  const fix = JSON.parse(read('tests/fixtures/quadmath.json')), lock = JSON.parse(read('vendor/vendor.lock.json'));
  const G = geometry(), FS = fieldStation(), SB = storybook(), S = sweep(G), C = cube(G, FS.TET_V), A = aModules(G, FS.TET_V);
  const src = name => lock.sources.find(s => s.name === name);
  const named = Object.fromEntries(fix.named.map(c => [c.name.split(':')[0], c.ace]));
  const lattice = G.ivmLattice(FS.latticeRadius, FS.latticeEdge);
  const suite = G.verifyGeometricIdentities();
  const ico = S.stations[1].v;
  const cases = fix.named.length + fix.random_integer.length + fix.random_ivm.length;
  return {
    // the QuadMath fixture
    fixtureCases: String(cases),
    fixtureNamed: String(fix.named.length),
    fixtureInteger: String(fix.random_integer.length),
    fixtureIvm: String(fix.random_ivm.length),
    fixtureDets: String(fix.bareiss.length),
    fixtureMaxOrder: String(Math.max(...fix.bareiss.map(b => b.matrix.length))),
    intFractional: String(fix.random_integer.filter(c => c.ace[1] !== 1).length),
    ivmFractional: String(fix.random_ivm.filter(c => c.ace[1] !== 1).length),
    unitIvmVolume: tex(named['unit IVM tetrahedron']),
    primitiveTex: tex(named['primitive tetrahedron']),
    freqTwoVolume: tex(named['frequency-two tetrahedron']),
    tallySamples: String(TALLY_SAMPLES),
    // the jitterbug and the Ring's gauge
    invPhi: (1 / PHI).toFixed(3),
    icosa3: ico.toFixed(3),
    icosa2: ico.toFixed(2),
    veVolume: whole(S.stations[2].v, 'the vector equilibrium'),
    octaVolume: whole(S.stations[0].v, 'the octahedron'),
    hullPeak: S.peak.v.toFixed(2),
    hullPeakAt: S.peak.r.toFixed(2),
    sweepPoints: String(SWEEP_POINTS),
    // the cube and the A-modules
    cubeVolume: whole(C.total, 'the cube'),
    tetVolume: whole(C.tet, 'the inscribed tetrahedron'),
    cubeCornerTex: tex(fraction(C.corners[0], 'a corner piece')),
    cubeCorners: String(C.corners.length),
    aModuleCount: String(A.count),
    aModuleShareTex: tex(A.share),
    aModuleHand: String(A.hand),
    // Tom Ace's determinant and the lattice
    aceOrder: String(G.aceMatrix([0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]).length),
    ivmMoves: String(G.IVM_NEIGHBOR_MOVES.length),
    ivmMoveLength: (() => { const L = new Set(G.IVM_NEIGHBOR_MOVES.map(m => { const c = new G.Quadray(...m).toCartesian(); return whole(Math.hypot(c.x, c.y, c.z), 'a neighbour move'); })); if (L.size !== 1) throw new Error('neighbour moves differ in length'); return [...L][0]; })(),
    latticeDet: String(G.bareissDeterminant([[1, -1, 0], [1, 0, -1], [2, 1, 1]])),
    latticeRadius: String(FS.latticeRadius),
    latticeEdge: String(FS.latticeEdge),
    latticeNodes: String(lattice.nodes.length),
    latticeStruts: String(lattice.edges.length),
    quadcraftChecks: String(suite.checks.length),
    // the storybook's loop
    sbLoop: String(SB.loop),
    sbPeriods: String(Math.round(SB.loop / (SB.edge * Math.SQRT2))),
    sbEdge: SB.edge.toFixed(2),
    // what the repository pins
    version: JSON.parse(read('package.json')).version,
    quadcraftCommit: src('quadcraft').commit.slice(0, 7),
    quadmathCommit: src('quadmath').commit.slice(0, 7),
    quadmathDoi: src('quadmath').doi,
    threeRevision: FS.threeRevision,
  };
}

/* camelCase fact names become the manuscript's UPPER_SNAKE tokens: hullPeakAt -> HULL_PEAK_AT. */
export const tokenName = key => key.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toUpperCase();

export function tokens(facts = computeFacts()) {
  const out = {};
  for (const [k, v] of Object.entries(facts)) out[tokenName(k)] = v;
  for (const [k, s] of Object.entries(SOURCED)) out[tokenName(k)] = s.value;
  return Object.fromEntries(Object.entries(out).sort(([a], [b]) => (a < b ? -1 : 1)));
}

/* What the manuscript's figures plot. scripts/make_figures.py draws these and computes nothing of its own. */
export function series() {
  const G = geometry(), FS = fieldStation(), S = sweep(G), A = aModules(G, FS.TET_V);
  const fix = JSON.parse(read('tests/fixtures/quadmath.json'));
  const lattice = G.ivmLattice(FS.latticeRadius, FS.latticeEdge);
  const ico = G.jitterbug(1 / PHI, FS.latticeEdge);
  return {
    jitterbug: { points: S.points, peak: S.peak, stations: S.stations },
    aModules: { tetrahedron: FS.TET_V, modules: A.xyz },
    fixture: {
      integer: fix.random_integer.map(c => c.ace[1]),
      ivm: fix.random_ivm.map(c => c.ace[1]),
    },
    cover: { nodes: lattice.nodes, edges: lattice.edges, edge: FS.latticeEdge, icosahedron: ico },
  };
}

/* Everything the rendered PDF depends on that lives in this repository, as one digest. */
function walk(dir) {
  const out = [];
  for (const name of readdirSync(join(ROOT, dir)).sort()) {
    if (name === '.DS_Store') continue;
    const p = `${dir}/${name}`;
    if (statSync(join(ROOT, p)).isDirectory()) out.push(...walk(p)); else out.push(p);
  }
  return out;
}
const sha256 = data => createHash('sha256').update(data).digest('hex');
export function manuscriptDigest() {
  const files = [...walk(MANUSCRIPT), ...walk('docs/images'), 'scripts/make_figures.py', 'scripts/z_generate_manuscript_variables.py'];
  const lines = files.map(p => `${p}\0${sha256(readFileSync(join(ROOT, p)))}\n`);
  lines.push(`tokens\0${sha256(JSON.stringify(tokens()))}\n`, `series\0${sha256(JSON.stringify(series()))}\n`);
  return { digest: sha256(lines.join('')), files: files.length };
}

const MARK = /<!-- n:(\w+) -->([^<]*)<!-- \/n -->/g;

export function inject(text, facts) {
  return text.replace(MARK, (all, key) => (key in facts ? `<!-- n:${key} -->${facts[key]}<!-- /n -->` : all));
}

/* Problems in one Markdown text: unknown or stale markers, and decimals stated outside any marker. */
export function problems(path, text, facts) {
  const out = [];
  for (const m of text.matchAll(MARK)) {
    if (!(m[1] in facts)) out.push(`${path}: unknown fact "${m[1]}"`);
    else if (m[2] !== facts[m[1]]) out.push(`${path}: ${m[1]} reads ${m[2]}, computes ${facts[m[1]]}`);
  }
  const bare = text.replace(MARK, '')
    .replace(/`[^`]*`/g, '')                 // code spans name parameters, not results
    .replace(/\]\([^)]*\)/g, '')             // link targets
    .replace(/\b10\.\d{4,}\/\S+/g, '')        // DOIs
    .replace(/\bv?\d+\.\d+\.\d+\b/g, '');     // versions
  for (const m of bare.matchAll(/\b\d+\.\d{2,}\b/g)) out.push(`${path}: the decimal ${m[0]} is typed, not computed`);
  return out;
}

const TOKEN = /\{\{([A-Z][A-Z0-9_]*)\}\}/g;

/* The manuscript's numeral rule. A number the repository computes or pins is a token. Inside math, single
   digits are notation (the 2 of a square root, the 5 in the definition of phi) and stay; a number of two or
   more digits, or a decimal, is a result and must be a token. Outside math no digit may be typed at all.
   A sourced token needs its citation in the same paragraph, and every citation needs a bibliography entry. */
export function manuscriptProblems(T = tokens()) {
  const out = [], dir = join(ROOT, MANUSCRIPT);
  if (!existsSync(dir)) return [`${MANUSCRIPT}: missing`];
  const bib = new Set([...read(`${MANUSCRIPT}/references.bib`).matchAll(/@\w+\{([^,\s]+),/g)].map(m => m[1]));
  const sections = readdirSync(dir).filter(f => f.endsWith('.md') && !MS_NOT_PROSE.has(f)).sort();
  if (!sections.length) out.push(`${MANUSCRIPT}: no sections`);
  for (const f of sections) {
    const path = `${MANUSCRIPT}/${f}`, text = read(path);
    for (const m of text.matchAll(TOKEN)) if (!(m[1] in T)) out.push(`${path}: unknown token {{${m[1]}}}`);
    for (const para of text.split(/\n\s*\n/)) {
      for (const [k, s] of Object.entries(SOURCED)) {
        if (para.includes(`{{${tokenName(k)}}}`) && !para.includes(`@${s.cite}`)) out.push(`${path}: {{${tokenName(k)}}} is used without citing @${s.cite} in the same paragraph`);
      }
    }
    for (const m of text.matchAll(/\[([^[\]]*@[^[\]]*)\]/g)) {
      for (const k of m[1].matchAll(/@([\w:-]+)/g)) {
        if (/^(fig|sec|tbl|eq):/.test(k[1])) continue;
        if (!bib.has(k[1])) out.push(`${path}: [@${k[1]}] has no entry in references.bib`);
      }
    }
    // Blank out what is not prose, keeping every newline so that line numbers still point at the source.
    const blank = s => s.replace(/[^\n]/g, ' ');
    let body = text
      .replace(/^```[\s\S]*?^```/gm, blank)          // fenced code
      .replace(/<!--[\s\S]*?-->/g, blank)           // comments
      .replace(/`[^`\n]*`/g, blank)                 // code spans
      .replace(TOKEN, blank)                        // tokens
      .replace(/\]\([^)\s]*\)(\{[^}]*\})?/g, m => ']' + blank(m.slice(1)))   // link and image targets, with their attributes
      .replace(/\{#[^}]*\}/g, blank)                // heading, equation and table labels
      .replace(/\[[^[\]]*@[^[\]]*\]/g, blank);      // citations and cross-references (never a caption around one)
    const lineOf = index => body.slice(0, index).split('\n').length;
    // display math may span lines; inline math may wrap onto the next line but never across a blank one
    body = body.replace(/\$\$[\s\S]*?\$\$|\$(?:[^$\n]|\n(?![ \t]*\n))+?\$/g, (mathSpan, index) => {
      const inner = mathSpan.replace(/\\[a-zA-Z]+/g, m => ' '.repeat(m.length));
      for (const n of inner.matchAll(/\d*\.\d+|\d{2,}/g)) out.push(`${path}:${lineOf(index + n.index)}: ${n[0]} in math is a result; make it a token`);
      return blank(mathSpan);
    });
    body.split('\n').forEach((line, i) => {
      for (const n of line.matchAll(/\d+(?:[.,]\d+)*/g)) out.push(`${path}:${i + 1}: ${n[0]} is typed; make it a token`);
    });
  }
  const cited = new Set(sections.flatMap(f => [...read(`${MANUSCRIPT}/${f}`).matchAll(/@([\w-]+)/g)].map(m => m[1])));
  for (const key of bib) if (!cited.has(key)) out.push(`${MANUSCRIPT}/references.bib: ${key} is never cited`);
  const pkg = JSON.parse(read('package.json')).version, cfg = read(`${MANUSCRIPT}/config.yaml`), cff = read('CITATION.cff');
  if (TOKEN.test(cfg)) out.push(`${MANUSCRIPT}/config.yaml: the renderer reads this file literally; it cannot carry tokens`);
  TOKEN.lastIndex = 0;
  /* every version the config states for this paper (its own and the publication's intended one) is the package's */
  for (const field of ['version', 'intended_version']) {
    const found = [...cfg.matchAll(new RegExp(`^\\s*${field}:\\s*"?([^"\\s#]*)"?`, 'gm'))].map(m => m[1]);
    if (!found.length) out.push(`${MANUSCRIPT}/config.yaml: ${field} is missing`);
    for (const v of found) if (v !== pkg) out.push(`${MANUSCRIPT}/config.yaml: ${field} ${v || '(empty)'} differs from package.json ${pkg}`);
  }
  const status = (cfg.match(/^\s*release_status:\s*"?([^"\s#]*)"?/m) || [])[1];
  if (!['unreleased', 'published'].includes(status)) out.push(`${MANUSCRIPT}/config.yaml: release_status ${status} is not unreleased or published`);
  const cffVersion = (cff.match(/^version:\s*(\S+)/m) || [])[1];
  if (cffVersion !== pkg) out.push(`CITATION.cff: version ${cffVersion} differs from package.json ${pkg}`);
  /* the publication record follows the template's release rules; the template checks only its own projects */
  const field = name => (cfg.match(new RegExp(`^\\s*${name}:\\s*"?([^"\\s#]*)"?`, 'm')) || [])[1] || '';
  const published = field('last_published_version'), versionDoi = field('version_doi'), cffDoi = (cff.match(/^doi:\s*(\S+)/m) || [])[1] || '';
  const isDoi = v => /^10\.\d{4,9}\/\S+$/.test(v);
  if (Boolean(published) !== Boolean(versionDoi)) out.push(`${MANUSCRIPT}/config.yaml: last_published_version and version_doi must be given together`);
  if (status === 'published' && published && published !== pkg) out.push(`${MANUSCRIPT}/config.yaml: release_status is published but the last published version is ${published}, not ${pkg}`);
  if (status === 'unreleased' && published && published === pkg) out.push(`${MANUSCRIPT}/config.yaml: release_status is unreleased but ${pkg} is the last published version`);
  for (const [where, v] of [['config.yaml doi', field('doi')], ['config.yaml version_doi', versionDoi], ['CITATION.cff doi', cffDoi],
    ...[...cff.matchAll(/^\s*-\s*type:\s*doi\s*\n\s*value:\s*(\S+)/gm)].map(m => ['CITATION.cff identifier', m[1]])])
    if (v && !isDoi(v)) out.push(`${where}: ${v} is not a DOI`);
  if (cffDoi && (cffDoi !== versionDoi || cffVersion !== published)) out.push(`CITATION.cff: doi ${cffDoi} must be the version DOI of ${cffVersion} recorded in ${MANUSCRIPT}/config.yaml`);
  return out;
}

/* The tracked PDF must have been rendered from the sources as they are now. */
export function stampProblems() {
  if (!existsSync(join(ROOT, STAMP))) return [`${STAMP}: missing; render with python scripts/build.py`];
  if (!existsSync(join(ROOT, PDF))) return [`${PDF}: missing; render with python scripts/build.py`];
  const stamp = JSON.parse(read(STAMP)), out = [];
  if (stamp.sources !== manuscriptDigest().digest) out.push(`${PDF}: rendered from older sources; render again with python scripts/build.py`);
  if (stamp.pdf !== sha256(readFileSync(join(ROOT, PDF)))) out.push(`${PDF}: differs from the file the render recorded`);
  return out;
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes('--tokens')) { process.stdout.write(JSON.stringify(tokens(), null, 2) + '\n'); return; }
  if (args.includes('--series')) { process.stdout.write(JSON.stringify(series()) + '\n'); return; }
  if (args.includes('--stamp')) {
    const template = (args[args.indexOf('--stamp') + 1] || '').startsWith('--') ? '' : (args[args.indexOf('--stamp') + 1] || '');
    const record = { pdf: sha256(readFileSync(join(ROOT, PDF))), sources: manuscriptDigest().digest, template_commit: template || null };
    writeFileSync(join(ROOT, STAMP), JSON.stringify(record, null, 2) + '\n');
    console.log(`stamped ${STAMP}: pdf ${record.pdf.slice(0, 12)}, sources ${record.sources.slice(0, 12)}`);
    return;
  }
  const facts = computeFacts(), check = args.includes('--check');
  let bad = 0;
  for (const p of DOCS) {
    let text; try { text = read(p); } catch { continue; }
    if (check) {
      const found = problems(p, text, facts);
      for (const f of found) console.error(f);
      bad += found.length;
    } else {
      const next = inject(text, facts);
      if (next !== text) { writeFileSync(join(ROOT, p), next); console.log(`injected numbers into ${p}`); }
    }
  }
  if (!check) return;
  if (bad) { console.error('Run `node tools/facts.mjs` to recompute, and mark any computed number: <!-- n:key -->value<!-- /n -->.'); process.exit(1); }
  console.log(`fresh: computed numbers in the docs (${Object.keys(facts).length} facts)`);
  const T = tokens(), ms = manuscriptProblems(T);
  for (const p of ms) console.error(p);
  if (ms.length) { console.error('Write every computed or pinned number in the manuscript as a {{TOKEN}}; `node tools/facts.mjs --tokens` lists them.'); process.exit(1); }
  console.log(`fresh: the manuscript states numbers only as tokens (${Object.keys(T).length} tokens)`);
  const st = stampProblems();
  for (const p of st) console.error(p);
  if (st.length) process.exit(1);
  console.log(`fresh: ${PDF} was rendered from the current sources`);
}

const invokedDirectly = () => { try { return realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url)); } catch { return false; } };
if (process.argv[1] && invokedDirectly()) main();

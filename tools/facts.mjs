// The numbers the docs state about the geometry and the imports, computed from their sources and
// injected into the Markdown, never typed by hand.
//
// In the docs a computed number sits between invisible markers: <!-- n:hullPeak -->20.44<!-- /n -->.
// The value inside is rewritten from computeFacts(); the markers never show when the page renders.
//
//   node tools/facts.mjs           recompute every fact and rewrite the marked numbers
//   node tools/facts.mjs --check   exit 1 if a marked number is stale or unknown, or if a docs file
//                                  states a decimal with two or more places outside a marker

import { readFileSync, writeFileSync, realpathSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = p => readFileSync(join(ROOT, p), 'utf8');

/* How many random four-node marks the checks count on the stillness lattice. */
export const TALLY_SAMPLES = 400;

/* The Markdown whose numbers are checked. */
export const DOCS = ['README.md', 'AGENTS.md', 'docs/imports.md', 'docs/synergetics.md', 'docs/design.md', 'docs/cascadia.md', 'CHANGELOG.md'];

/* The grove's shared geometry with the code it imports, run the way both games run it. */
function geometry() {
  const env = {}; vm.createContext(env);
  vm.runInContext(['vendor/quadcraft/quadray.js', 'lib/tetravolume.js', 'lib/grove-geometry.js'].map(read).join('\n') + '\nthis.out = { jitterbug, jitterVolume };', env);
  return env.out;
}

export function computeFacts() {
  const fix = JSON.parse(read('tests/fixtures/quadmath.json'));
  const { jitterbug, jitterVolume } = geometry();
  const PHI = (1 + Math.sqrt(5)) / 2, ico = jitterVolume(jitterbug(1 / PHI, 1), 1);
  let peak = { r: 0, v: -Infinity };
  for (let i = 0; i <= 1000; i++) { const r = i / 1000, v = jitterVolume(jitterbug(r, 1), 1); if (v > peak.v) peak = { r, v }; }
  const sb = read('src/storybook.html'), env = {}; vm.createContext(env);
  vm.runInContext([sb.match(/const LOOP = [^\n]*/)[0], sb.match(/const LAT_EDGE = [^\n]*/)[0], 'this.loop = LOOP; this.edge = LAT_EDGE;'].join('\n'), env);
  const cases = fix.named.length + fix.random_integer.length + fix.random_ivm.length;
  return {
    fixtureCases: String(cases),
    fixtureNamed: String(fix.named.length),
    fixtureInteger: String(fix.random_integer.length),
    fixtureIvm: String(fix.random_ivm.length),
    fixtureDets: String(fix.bareiss.length),
    intFractional: String(fix.random_integer.filter(c => c.ace[1] !== 1).length),
    ivmFractional: String(fix.random_ivm.filter(c => c.ace[1] !== 1).length),
    tallySamples: String(TALLY_SAMPLES),
    invPhi: (1 / PHI).toFixed(3),
    icosa3: ico.toFixed(3),
    icosa2: ico.toFixed(2),
    hullPeak: peak.v.toFixed(2),
    hullPeakAt: peak.r.toFixed(2),
    sbLoop: String(env.loop),
    sbPeriods: String(Math.round(env.loop / (env.edge * Math.SQRT2))),
    sbEdge: env.edge.toFixed(2),
  };
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

function main() {
  const facts = computeFacts(), check = process.argv.includes('--check');
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
  if (check) {
    if (bad) { console.error('Run `node tools/facts.mjs` to recompute, and mark any computed number: <!-- n:key -->value<!-- /n -->.'); process.exit(1); }
    console.log(`fresh: computed numbers in the docs (${Object.keys(facts).length} facts)`);
  }
}

const invokedDirectly = () => { try { return realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url)); } catch { return false; } };
if (process.argv[1] && invokedDirectly()) main();

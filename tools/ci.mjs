// Local CI: the repository's whole gate, run on a clean copy of one commit.
//
// Nothing runs on GitHub and nothing is billed. This script exports the
// committed tree of a revision (HEAD by default) into a temporary folder,
// runs tests/check.mjs there, and prints a verdict bound to that commit and
// tree. When local clones of the vendored repositories sit beside this checkout
// (../QuadCraft, ../QuadMath), it also confirms from them that each locked
// commit really holds each vendored file; without them that step is reported
// as skipped, never as passed. With --receipt-dir it also writes the verdict to
// <dir>/<commit>.json, so a pass can be shown later without trusting anyone's
// working copy.
//
//   node tools/ci.mjs                          check HEAD
//   node tools/ci.mjs --rev <sha>              check another commit
//   node tools/ci.mjs --receipt-dir <folder>   also write a receipt (keep it outside the checkout)

import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir, platform, arch } from 'node:os';
import { join, resolve, relative, isAbsolute, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const opt = name => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
const git = (...a) => execFileSync('git', a, { encoding: 'utf8' }).trim();

// The repository this script belongs to, wherever it is run from.
const root = git('-C', dirname(fileURLToPath(import.meta.url)), 'rev-parse', '--show-toplevel');
const commit = git('-C', root, 'rev-parse', '--verify', `${opt('--rev') || 'HEAD'}^{commit}`);
const tree = git('-C', root, 'rev-parse', `${commit}^{tree}`);
const dirty = git('-C', root, 'status', '--porcelain').length > 0;
const started = new Date().toISOString();

const work = mkdtempSync(join(tmpdir(), 'cascadian-ci-'));
let run, upstream = { status: 'skipped', detail: 'this commit vendors nothing' };
try {
  const archive = execFileSync('git', ['-C', root, 'archive', '--format=tar', commit], { maxBuffer: 256 * 1024 * 1024 });
  execFileSync('tar', ['-x', '-C', work], { input: archive });
  run = spawnSync(process.execPath, [join(work, 'tests', 'check.mjs')], { cwd: work, encoding: 'utf8' });
  const lockFile = join(work, 'vendor', 'vendor.lock.json');
  if (existsSync(lockFile)) {
    const sources = JSON.parse(readFileSync(lockFile, 'utf8')).sources;
    const clones = sources.map(s => ({ name: s.name, path: resolve(dirname(root), s.repository.split('/').pop()) }));
    const missing = clones.filter(c => !existsSync(join(c.path, '.git')));
    if (missing.length) upstream = { status: 'skipped', detail: `no local clone at ${missing.map(c => c.path).join(', ')}` };
    else {
      const v = spawnSync(process.execPath, [join(work, 'tools', 'vendor.mjs'), '--upstream', ...clones.flatMap(c => [`--clone-${c.name}`, c.path])], { cwd: work, encoding: 'utf8' });
      const lines = (v.stdout || '').split('\n').filter(l => /^(ok|FAIL)\s+upstream/.test(l)), want = sources.reduce((n, s) => n + s.files.length, 0);
      // A pass needs one 'ok' line per locked file, not just a zero exit status.
      const verified = v.status === 0 && lines.length === want && lines.every(l => l.startsWith('ok'));
      upstream = { status: verified ? 'verified' : 'failed', detail: lines.join('\n') + (lines.length === want ? '' : `\nexpected ${want} upstream lines, got ${lines.length}`) + (v.stderr || '') };
    }
  }
} finally {
  rmSync(work, { recursive: true, force: true });
}

const checks = (run.stdout || '').split('\n').filter(l => /^(ok|FAIL)\s/.test(l)).map(l => ({ ok: l.startsWith('ok'), name: l.replace(/^(ok|FAIL)\s+/, '') }));
const verdict = run.status === 0 && checks.length > 0 && checks.every(c => c.ok) && upstream.status !== 'failed' ? 'pass' : 'fail';
const receipt = {
  repository: 'docxology/Cascadian_Synergetics',
  gate: 'node tests/check.mjs on a clean export of the commit',
  commit, tree, verdict,
  exit_status: run.status,
  checks_passed: checks.filter(c => c.ok).length,
  checks_total: checks.length,
  failures: checks.filter(c => !c.ok).map(c => c.name),
  vendored_upstream: upstream,
  node: process.version,
  platform: `${platform()}-${arch()}`,
  started,
  finished: new Date().toISOString(),
  working_tree_dirty_at_run: dirty,
};

process.stdout.write(run.stdout || '');
if (run.stderr) process.stderr.write(run.stderr);
console.log(`\nupstream vendor check: ${upstream.status}${upstream.status === 'skipped' ? ` (${upstream.detail})` : ''}`);
if (upstream.status === 'failed') console.log(upstream.detail);
console.log(`\nlocal CI: ${verdict.toUpperCase()} for ${commit.slice(0, 12)} (tree ${tree.slice(0, 12)}), ${receipt.checks_passed}/${receipt.checks_total} checks${dirty ? '; uncommitted changes were not part of this run' : ''}`);

const dir = opt('--receipt-dir');
if (dir) {
  const abs = resolve(dir), rel = relative(root, abs);
  if (!rel.startsWith('..') && !isAbsolute(rel)) {
    console.error('Keep receipts outside the checkout, so they never become part of what they certify.');
    process.exit(2);
  }
  mkdirSync(abs, { recursive: true });
  const file = join(abs, `${commit}.json`);
  writeFileSync(file, JSON.stringify(receipt, null, 2) + '\n');
  console.log(`receipt: ${file}`);
}
process.exit(verdict === 'pass' ? 0 : 1);

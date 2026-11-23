// Local CI: the repository's whole gate, run on a clean copy of one commit.
//
// Nothing runs on GitHub and nothing is billed. This script exports the
// committed tree of a revision (HEAD by default) into a temporary folder,
// runs tests/check.mjs there, and prints a verdict bound to that commit and
// tree. With --receipt-dir it also writes the verdict to <dir>/<commit>.json,
// so a pass can be shown later without trusting anyone's working copy.
//
//   node tools/ci.mjs                          check HEAD
//   node tools/ci.mjs --rev <sha>              check another commit
//   node tools/ci.mjs --receipt-dir <folder>   also write a receipt (keep it outside the checkout)

import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir, platform, arch } from 'node:os';
import { join, resolve, relative, isAbsolute } from 'node:path';

const args = process.argv.slice(2);
const opt = name => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
const git = (...a) => execFileSync('git', a, { encoding: 'utf8' }).trim();

const root = git('rev-parse', '--show-toplevel');
const commit = git('-C', root, 'rev-parse', '--verify', `${opt('--rev') || 'HEAD'}^{commit}`);
const tree = git('-C', root, 'rev-parse', `${commit}^{tree}`);
const dirty = git('-C', root, 'status', '--porcelain').length > 0;
const started = new Date().toISOString();

const work = mkdtempSync(join(tmpdir(), 'cascadian-ci-'));
let run;
try {
  const archive = execFileSync('git', ['-C', root, 'archive', '--format=tar', commit], { maxBuffer: 256 * 1024 * 1024 });
  execFileSync('tar', ['-x', '-C', work], { input: archive });
  run = spawnSync(process.execPath, [join(work, 'tests', 'check.mjs')], { cwd: work, encoding: 'utf8' });
} finally {
  rmSync(work, { recursive: true, force: true });
}

const checks = (run.stdout || '').split('\n').filter(l => /^(ok|FAIL)\s/.test(l)).map(l => ({ ok: l.startsWith('ok'), name: l.replace(/^(ok|FAIL)\s+/, '') }));
const verdict = run.status === 0 && checks.length > 0 && checks.every(c => c.ok) ? 'pass' : 'fail';
const receipt = {
  repository: 'docxology/Cascadian_Synergetics',
  gate: 'node tests/check.mjs on a clean export of the commit',
  commit, tree, verdict,
  exit_status: run.status,
  checks_passed: checks.filter(c => c.ok).length,
  checks_total: checks.length,
  failures: checks.filter(c => !c.ok).map(c => c.name),
  node: process.version,
  platform: `${platform()}-${arch()}`,
  started,
  finished: new Date().toISOString(),
  working_tree_dirty_at_run: dirty,
};

process.stdout.write(run.stdout || '');
if (run.stderr) process.stderr.write(run.stderr);
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

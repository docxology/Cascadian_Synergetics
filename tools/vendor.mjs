// Keeps vendor/ honest: every vendored file is the exact upstream Git object named in
// vendor/vendor.lock.json.
//
//   node tools/vendor.mjs              hash each vendored file and compare with the lock (offline)
//   node tools/vendor.mjs --upstream   also confirm, in local clones of QuadCraft and QuadMath,
//                                      that each locked commit holds each locked blob at its path
//   node tools/vendor.mjs --update     copy the files again from the clones' HEAD (or --commit-<name> SHA)
//                                      and rewrite the lock; then regenerate fixtures and rebuild
//
// Local clones default to siblings of this checkout (../QuadCraft, ../QuadMath), the GitVault
// layout. Point elsewhere with --clone-<name> PATH, e.g. --clone-quadmath ~/src/QuadMath.

import { readFileSync, writeFileSync, existsSync, realpathSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const LOCK = join(ROOT, 'vendor/vendor.lock.json');

/* The id Git gives a file's bytes: sha1 over "blob <length>\0" followed by the bytes. */
export function blobId(bytes) {
  return createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
}

export function readLock() { return JSON.parse(readFileSync(LOCK, 'utf8')); }

/* Offline check: returns one { ok, msg } per vendored file. */
export function checkLocal(lock = readLock()) {
  const out = [];
  for (const s of lock.sources) for (const f of s.files) {
    const p = join(ROOT, f.to);
    if (!existsSync(p)) { out.push({ ok: false, msg: `${f.to}: missing (locked from ${s.name}@${s.commit.slice(0, 7)})` }); continue; }
    const id = blobId(readFileSync(p));
    out.push({ ok: id === f.blob, msg: `${f.to} is ${s.name}@${s.commit.slice(0, 7)}:${f.path}${id === f.blob ? '' : ` (blob ${id}, lock says ${f.blob})`}` });
  }
  return out;
}

const args = process.argv.slice(2);
const opt = name => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
const repoName = s => s.repository.split('/').pop();
const cloneOf = s => resolve(opt(`--clone-${s.name}`) || join(ROOT, '..', repoName(s)));
const git = (cwd, ...a) => execFileSync('git', ['-C', cwd, ...a], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();

function checkUpstream(lock) {
  const out = [];
  for (const s of lock.sources) {
    const clone = cloneOf(s);
    if (!existsSync(join(clone, '.git'))) { out.push({ ok: false, msg: `${s.name}: no local clone at ${clone} (pass --clone-${s.name} PATH)` }); continue; }
    try { git(clone, 'cat-file', '-e', `${s.commit}^{commit}`); }
    catch { out.push({ ok: false, msg: `${s.name}: commit ${s.commit} is not in ${clone}; fetch it first` }); continue; }
    for (const f of s.files) {
      let id = '';
      try { id = git(clone, 'rev-parse', `${s.commit}:${f.path}`); } catch { /* path absent at that commit: reported below */ }
      out.push({ ok: id === f.blob, msg: `upstream ${s.name}@${s.commit.slice(0, 7)}:${f.path}${id === f.blob ? ' matches the lock' : id ? ` is blob ${id}, lock says ${f.blob}` : ' does not exist at that commit'}` });
    }
  }
  return out;
}

function update(lock) {
  for (const s of lock.sources) {
    const clone = cloneOf(s);
    if (!existsSync(join(clone, '.git'))) throw new Error(`${s.name}: no local clone at ${clone}`);
    const commit = git(clone, 'rev-parse', '--verify', `${opt(`--commit-${s.name}`) || 'HEAD'}^{commit}`);
    for (const f of s.files) {
      const bytes = execFileSync('git', ['-C', clone, 'show', `${commit}:${f.path}`], { maxBuffer: 64 * 1024 * 1024 });
      writeFileSync(join(ROOT, f.to), bytes);
      f.blob = blobId(bytes);
    }
    if (commit !== s.commit) console.log(`${s.name}: ${s.commit.slice(0, 7)} -> ${commit.slice(0, 7)}`);
    s.commit = commit;
  }
  writeFileSync(LOCK, JSON.stringify(lock, null, 2) + '\n');
  console.log('vendor/ refreshed. Next: python3 tools/quadmath_fixtures.py, node tools/build.mjs, node tests/check.mjs');
}

function main() {
  const lock = readLock();
  if (args.includes('--update')) { update(lock); return; }
  const results = [...checkLocal(lock), ...(args.includes('--upstream') ? checkUpstream(lock) : [])];
  for (const r of results) console.log(`${r.ok ? 'ok  ' : 'FAIL'}  ${r.msg}`);
  const bad = results.filter(r => !r.ok).length;
  console.log(bad ? `\n${bad} vendored file check(s) failed` : '\nvendor/ matches the lock');
  process.exit(bad ? 1 : 0);
}

// Run only when invoked directly. Compare real paths: a temporary folder reached through a
// symlink (macOS /tmp, /var) would otherwise make this false and the script a silent no-op.
const invokedDirectly = () => { try { return realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url)); } catch { return false; } };
if (process.argv[1] && invokedDirectly()) main();

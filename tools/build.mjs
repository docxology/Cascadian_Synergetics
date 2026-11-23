// Builds the games from their sources.
//
// Each file in src/ is exactly what gets published as a Claude artifact: page
// content without <!doctype>, <html>, <head> or <body>, because the artifact host
// wraps it. A source may carry spliced blocks, verbatim copies of files from vendor/
// and lib/ between marker comments, so the published artifact stays one file while
// the imported code keeps a single home. This script
//
//   1. rewrites each spliced block from its file (the blocks are never edited by hand), and
//   2. writes the standalone pages: the same source wrapped in a document skeleton, with
//      the cross-links between the two games pointed at their local copies.
//
//   node tools/build.mjs           refresh the spliced blocks and write the standalone pages
//   node tools/build.mjs --check   exit 1 if any spliced block or standalone page is stale

import { readFileSync, writeFileSync, mkdirSync, existsSync, realpathSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

export const PAGES = [
  { src: 'src/storybook.html', out: 'storybook/index.html' },
  { src: 'src/field-station.html', out: 'field-station/index.html' },
];

// Spliced blocks: which files each source carries, in order.
export const SPLICES = {
  'src/field-station.html': ['vendor/quadcraft/quadray.js', 'vendor/quadcraft/synergetics.js', 'lib/tetravolume.js'],
};
const SPLICE_RE = /\/\* ==== splice (\S+) ==== \*\/\n([\s\S]*?)\/\* ==== end splice \1 ==== \*\//g;

const readFile = p => readFileSync(join(ROOT, p), 'utf8');

/* Rewrite every spliced block in a source from its file. The files must end with a newline. */
export function splice(source, read = readFile) {
  return source.replace(SPLICE_RE, (_, path) => {
    const body = read(path);
    if (!body.endsWith('\n')) throw new Error(`${path} must end with a newline to be spliced`);
    return `/* ==== splice ${path} ==== */\n${body}/* ==== end splice ${path} ==== */`;
  });
}

/* The spliced paths a source actually carries, in order. */
export function splicedPaths(source) { return [...source.matchAll(SPLICE_RE)].map(m => m[1]); }

// Hosted artifact links inside the games, mapped to their copies in this repository.
export const LINKS = {
  'https://claude.ai/artifact/9tZNx7B6G3egbtkoinNyo6': '../storybook/',
  'https://claude.ai/artifact/H96uDqtq776RDTxr9AWfiG': '../field-station/',
};

// The same minimal skeleton the artifact host supplies.
const HEAD = [
  '<!doctype html>',
  '<html lang="en">',
  '<head>',
  '<meta charset="utf-8">',
  '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">',
  '<style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style>',
].join('\n');

export function standalone(source) {
  let page = source;
  for (const [hosted, local] of Object.entries(LINKS)) page = page.split(hosted).join(local);
  // The artifact source opens with its <title>, metas, font links and <style>; those belong in <head>.
  const cut = page.indexOf('</style>');
  if (cut < 0) throw new Error('Expected the page to open with its <style> block.');
  const head = page.slice(0, cut + '</style>'.length).trim();
  const body = page.slice(cut + '</style>'.length).trim();
  return `${HEAD}\n${head}\n</head>\n<body>\n${body}\n</body>\n</html>\n`;
}

function main() {
  const check = process.argv.includes('--check');
  let stale = 0;
  for (const [src, wanted] of Object.entries(SPLICES)) {
    const current = readFile(src), have = splicedPaths(current);
    if (have.join('\n') !== wanted.join('\n')) {
      console.error(`${src}: carries spliced blocks [${have.join(', ')}], expected [${wanted.join(', ')}]`);
      stale++;
      continue;
    }
    const fresh = splice(current);
    if (fresh === current) console.log(`fresh: spliced blocks in ${src}`);
    else if (check) { console.error(`stale: a spliced block in ${src} differs from its file`); stale++; }
    else { writeFileSync(join(ROOT, src), fresh); console.log(`spliced ${wanted.join(', ')} into ${src}`); }
  }
  for (const { src, out } of PAGES) {
    const built = standalone(readFile(src));
    const target = join(ROOT, out);
    if (check) {
      const current = existsSync(target) ? readFileSync(target, 'utf8') : '';
      if (current !== built) { console.error(`stale: ${out} differs from a fresh build of ${src}`); stale++; }
      else console.log(`fresh: ${out}`);
    } else {
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, built);
      console.log(`wrote ${out}`);
    }
  }
  if (stale) { console.error('Run `node tools/build.mjs` and commit the result.'); process.exit(1); }
}

// Run only when invoked directly. Compare real paths: a temporary folder reached through a
// symlink (macOS /tmp, /var) would otherwise make this false and the script a silent no-op.
const invokedDirectly = () => { try { return realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url)); } catch { return false; } };
if (process.argv[1] && invokedDirectly()) main();

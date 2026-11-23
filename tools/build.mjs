// Builds standalone pages from the Claude artifact sources.
//
// Each file in src/ is exactly what gets published as a Claude artifact: page
// content without <!doctype>, <html>, <head> or <body>, because the artifact host
// wraps it. This script adds that wrapper so the same game runs as an ordinary
// web page, and points the cross-links between the two games at their local
// copies instead of the hosted artifacts.
//
//   node tools/build.mjs           write storybook/index.html and field-station/index.html
//   node tools/build.mjs --check   exit 1 if the committed pages differ from a fresh build

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

export const PAGES = [
  { src: 'src/storybook.html', out: 'storybook/index.html' },
  { src: 'src/field-station.html', out: 'field-station/index.html' },
];

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
  for (const { src, out } of PAGES) {
    const built = standalone(readFileSync(join(ROOT, src), 'utf8'));
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

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();

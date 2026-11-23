# vendor/

Byte-for-byte copies of files from two sibling projects, pinned in [`vendor.lock.json`](vendor.lock.json):

- `quadcraft/`: [QuadCraft](https://github.com/docxology/QuadCraft) `quadray.js` and `synergetics.js`, spliced verbatim into the field station, with QuadCraft's `LICENSE` (Apache-2.0) and `CITATION.cff`.
- `quadmath/`: [QuadMath](https://github.com/docxology/QuadMath) `quadray.py` and `linalg_utils.py`, which compute the test fixture and are the original of `lib/tetravolume.js`, with QuadMath's `LICENSE` (Apache-2.0) and `CITATION.cff`.

Never edit these files by hand. `node tools/vendor.mjs` checks them; `node tools/vendor.mjs --update` refreshes them. The `package.json` in `quadcraft/` only tells Node to load the copies as CommonJS, as upstream wrote them. See [docs/imports.md](../docs/imports.md).

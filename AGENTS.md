# Working on Cascadian Synergetics

## The two sources are the product

`src/storybook.html` and `src/field-station.html` are published to Claude artifacts as they are. Keep each one a single file:

- No `<!doctype>`, `<html>`, `<head>` or `<body>`: the artifact host adds them. Start with `<title>`, then metas, font links and one `<style>`.
- External scripts come only from `https://cdnjs.cloudflare.com/`, pinned to an exact version (Three.js r128). Stylesheets only from Google Fonts. Everything else is inline.
- No `alert`, `confirm` or `prompt`; the host never shows them.
- Wrap every `localStorage` read and write in `try`/`catch`.

After any edit, run `node tools/build.mjs` and `node tests/check.mjs`, and commit `src/` together with the rebuilt `storybook/` and `field-station/`.

## Imported code

- `vendor/` holds byte-for-byte copies of QuadCraft and QuadMath files, pinned by commit and Git blob id in `vendor/vendor.lock.json`. Never edit them. Refresh them only with `node tools/vendor.mjs --update`, then regenerate the fixture (`python3 -I tools/quadmath_fixtures.py`) and rebuild.
- `src/field-station.html` carries `vendor/quadcraft/quadray.js`, `vendor/quadcraft/synergetics.js` and `lib/tetravolume.js` between `/* ==== splice … ==== */` markers, inside the game's script. `tools/build.mjs` writes those blocks; change the files, never the blocks.
- `lib/tetravolume.js` is a port of QuadMath. Its exact path takes integers only (BigInt), and it must reproduce `tests/fixtures/quadmath.json` exactly. Call anything computed from floating-point positions approximate, never exact.
- The spliced code shares the game's scope. A new game-level name must not collide with `Quadray`, `ROOT2`, `S3`, `SYNERGETICS`, `angleBetweenQuadrays`, `verifyRoundTrip`, `verifyGeometricIdentities`, `quadrayComponents`, `bareissDeterminant`, `aceMatrix`, `aceTetravolume`, `aceTetravolumeExact` or `IVM_NEIGHBOR_MOVES`. A collision is a parse error, which `tests/check.mjs` catches.
- Keep the conventions straight: the lattice and its addresses use QuadCraft's frame (one lattice edge is two units), the compass uses its own unit rays with one pointing up, and QuadMath's embedding is QuadCraft's times √2 with b and c exchanged. `docs/imports.md` has the bridges; the checks hold them.

CI is local only: `node tools/ci.mjs` checks a clean export of a commit, and `.githooks/pre-push` runs it before every push (`git config core.hooksPath .githooks`). Do not add a GitHub Actions workflow; nothing here should depend on hosted runners or billing.

## Rules the grove keeps

- **No right angles.** Trunks lean and taper, the UI uses circles, soft blobs and 120-degree hex chips, and the viewport edge dissolves into mist. The only squares belong to the incursions, which are the thing being resolved.
- **Show, don't tell.** No screen explains the theme. Rangers talk about boots, coffee, elk and slugs; the radio carries deadpan bulletins. Nothing in the text names right angles, tension, timelessness or tetrahedron arithmetic; the world shows them. The action button names the action ("Raise lanterns", "Kneel"), not the idea.
- **True geometry.** Any synergetic quantity the games show must hold. `tests/check.mjs` checks the quadray conversion, the jitterbug, the cube decomposition, the lattice addresses, the tally and the Ring's dial against the functions the field station runs, with the imported code as spliced; extend it when you add geometry.
- **No fail state.** The patrol cannot be lost. Tasks wait; the beat loops.
- **Comfort.** Respect `prefers-reduced-motion`: no head bob, glitch flicker or forced camera moves.

## Testing in a browser

Serve the folder (`python3 -m http.server 8000`) and use the test hooks from the console:

- Storybook: `window.__oss.step(seconds)`, `teleport(x, z)`, `finishTasks()`.
- Field station: `window.__fs.step(seconds)`, `teleport(x, z, yaw)`, `face(x, z)`, `lookAt(x, y, z)`, `act()`, `finishTasks()`, `info()` for draw calls and triangles, `ivmCheck()`, `quadCheck(x, y, z)`, `countFrames(ms)`, `visitor()`, `lattice()` (opacity, gazed node, marks, count, past counts), `nodeWorld(i)`, `ringVolume()`, `gaugeMarks()`, `selfTest()`, `vista()`.

To try the tally: `step(9)` to let the lattice appear, then for four nodes `lookAt(...nodeWorld(i))`, `step(0.05)`, `act()`, and read `lattice()` after a few more seconds of `step`.

A hidden tab stops `requestAnimationFrame`, so drive time with `step()` and read state rather than trusting a screenshot of a hidden page.

## Where the layout lives

- Storybook: the beat is a 480 m loop (`LOOP`); places are listed in `ZONES`; objectives in `CUBES`, `MASTS`, `SLUGS`, `INSIG`.
- Field station: the Ring sits at the origin and the beat circles it at `BEAT_R` (48 m); places are constants near the top (`HQ`, `LOOKOUT`, `POOL`, `LAMP`, `CREEK`, `TETPOOL`, `ALBINO`). The wonders are `IVM` (the stillness lattice), `TALLY_OBJ` and `updTally` (marks and counting), `VE`, `GAUGE_MARKS` and `GAUGE_FULL` (the Ring and its dial), the instrument rail in the HQ block, and `VISTA` (the mountain from Lookout Rise).

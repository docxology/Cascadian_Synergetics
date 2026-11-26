# Develop and verify

Edit the single-page artifact sources in `src/` or the shared geometry in
`lib/`. Build the standalone pages from the repository root:

```sh
node tools/build.mjs
node tests/check.mjs
```

Commit changes to the artifact sources with the corresponding built pages.
The [paper build](manuscript-build.md) has its own render and digest checks.

## Local CI

There is no GitHub Actions workflow: nothing runs on GitHub and nothing is billed. The gate runs on your machine with Node 20 or newer and no packages to install.

```bash
node tools/ci.mjs
```

It exports the committed `HEAD` into a temporary folder, runs every check there, and prints a verdict bound to that commit and tree, so uncommitted edits can neither help nor hurt it. If clones of QuadCraft and QuadMath sit beside this checkout, it also confirms from them that the locked upstream commits hold exactly the vendored bytes, and reports that step as verified, failed or skipped. `--rev <sha>` checks another commit. `--receipt-dir <folder>` also writes the verdict to `<folder>/<commit>.json`; the folder must be outside the checkout.

To run it automatically before every push:

```bash
git config core.hooksPath .githooks
```

While editing, check the working tree directly and rebuild the standalone pages:

```bash
node tests/check.mjs
```

```bash
node tools/build.mjs
```

The checks confirm that both inline scripts parse, that each source keeps the artifact rules (title near the top, no document skeleton, scripts only from cdnjs, no blocking dialogs), and that the standalone pages and spliced blocks match a fresh build. For the imports they confirm that:

- every vendored file has the Git blob id its lock names, and each spliced block is byte-identical to its file
- the fixture was computed by the vendored QuadMath, and the JavaScript port reproduces all of it exactly: <!-- n:fixtureCases -->245<!-- /n --> tetravolumes, <!-- n:fixtureDets -->60<!-- /n --> determinants, the twelve neighbour moves
- QuadCraft's own eight self-checks pass, and the three quadray conventions in play (QuadCraft's, QuadMath's and the compass's) relate exactly as [imports](imports.md) says

They also check the geometry, using the exact functions the field station runs, with the imported code as spliced:

- the four quadray rays are unit length, sum to zero, and meet at the tetrahedral angle
- quadray coordinates come out non-negative with one zero, and convert back exactly
- the jitterbug's eight triangles stay equilateral, passing through the vector equilibrium, the icosahedron and the octahedron
- the cube built on a tetrahedron's edges holds 3 tetravolumes: the tetrahedron plus four corner pieces of one half each, measured both in XYZ and with the 5×5 determinant
- every node of the stillness lattice has a whole address, every strut is one of QuadMath's twelve moves, and <!-- n:tallySamples -->400<!-- /n --> random four-node marks all count whole, each matching the tetrahedron's XYZ volume
- the Ring's dial reads 20, 5√2 φ² and 4 at the three stations and the convex hull between them
- each flake of ash is a vector equilibrium closing 20 tetravolumes

In a browser, both games expose a small test hook (`window.__oss` for the storybook, `window.__fs` for the field station) with `step`, `teleport` and checks such as `__fs.ivmCheck()`, which confirms every interior lattice node has twelve equal edges, `__fs.lattice()` for the gazed node, the marks and the count, `__fs.ringVolume()`, `__fs.selfTest()`, `__fs.vista()`, `__fs.sundown()`, `__fs.quake()`, `__fs.elk()`, `__fs.murrelets(true)`, `__fs.mail()`, `__fs.car(true)`, `__fs.roadside()` and `await __fs.audioCheck(name, args, seconds, times)`, which renders one of the game's sounds offline and reports its loudness and strongest frequency at each given time.

## Images for sharing

Four 2400 by 1350 images, made the way the paper's figures are: three frames of the games taken through their test hooks, and the jitterbug's gauge drawn from the same computation the paper states.

```bash
node scripts/capture_screenshots.mjs --set social
```

```bash
python3 scripts/make_social.py
```

Both write to `output/social/`; the first needs Chrome and a network connection, the second matplotlib (the docxology/template interpreter has it).

## Editing and republishing

Edit `src/` (or `lib/`), run `node tools/build.mjs`, commit, then `node tools/ci.mjs`. To update the hosted artifacts, publish `src/storybook.html` and `src/field-station.html` to their existing artifact links; the field station's source already carries the spliced code. To move the imports to newer upstream commits, follow [imports](imports.md#updating-the-imports). See [project guidance](../AGENTS.md) for the rules the games keep.

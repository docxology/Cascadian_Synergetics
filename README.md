# Cascadian Synergetics

Two patrols through a fog-bound Cascadian redwood grove, where the Office of Synergetics Services keeps space from growing square.

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.24508082.svg)](https://doi.org/10.5281/zenodo.24508082)

![From the top of Lookout Rise in the field station, a mountain stands up out of the fog under a lenticular cloud; a ranger's lantern glows in the foreground.](docs/images/field-station-lookout.jpg)

| Game | Kind | Source | Standalone page |
|------|------|--------|-----------------|
| Cascadian Field Station | First person, 3D (Three.js r128) | [`src/field-station.html`](src/field-station.html) | [`field-station/`](field-station/) |
| Office of Synergetics Services | Storybook, 2.5D (Canvas 2D) | [`src/storybook.html`](src/storybook.html) | [`storybook/`](storybook/) |

Each game is a single HTML file that needs nothing beyond fonts and, for the field station, Three.js from cdnjs. In both games the coordinates, self-checks and counting come from two sibling projects, [QuadCraft](https://github.com/docxology/QuadCraft) and [QuadMath](https://github.com/docxology/QuadMath). Their code is spliced into the page byte for byte from `vendor/` and `lib/`, and tested against upstream; see [docs/imports.md](docs/imports.md).

## Play

**In a browser.** GitHub Pages serves both games straight from this repository: the [landing page](https://docxology.github.io/Cascadian_Synergetics/), the [Cascadian Field Station](https://docxology.github.io/Cascadian_Synergetics/field-station/) and the [storybook patrol](https://docxology.github.io/Cascadian_Synergetics/storybook/). The field station needs WebGL and a network connection for Three.js.

**Hosted as Claude artifacts.** The same files are published as [Cascadian Field Station](https://claude.ai/artifact/H96uDqtq776RDTxr9AWfiG) and the [storybook patrol](https://claude.ai/artifact/9tZNx7B6G3egbtkoinNyo6). They open for anyone the owner has shared them with.

**Locally.** Serve the folder and open the landing page:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000/`. The storybook also opens straight from the file. The field station needs a network connection for Three.js.

## The patrol

Patrol Trine is you, Ranger Sitka and Ranger Madrone. The grove has no briefing screen and no explanations; things show you what they are.

- **Incursions.** Five humming cubes lay a square grid over the moss and turn nearby ferns to pixels. Raise lanterns, and the three rangers stand on a triangle while light comes down from the canopy. The cube folds into the tetrahedron on its face diagonals; its four corner pieces flutter away and a triangular lattice blooms where the grid was.
- **Masts.** Three tensegrity masts have gone slack. Pluck their cables in time and they pull taut and sing.
- **Banana slugs.** Kneel and survey three of them. Don't hurry them.
- **Insignia.** Eight pins, coins and patches from the gallery lie on the forest floor. Found ones ride on the rangers' coats.
- **The Cathedral Ring.** A Vector Equilibrium floats at the centre, stiff at first, with square gaps glitching. Each task lets it breathe further through its jitterbug. When the grove is whole it breathes all the way, and the view lifts into the canopy.

Both games carry things that are never named:

- Stand still for a few seconds and the isotropic vector matrix appears around you, fixed to the world. Each node has a whole quadray address, counted out from the foot of the Ring; the action button shows the one you would mark.
- Mark four nodes and the tetrahedron between them lights while a brass counter clicks out its volume. It always comes out whole, and the notebook keeps the counts. In the field station you face a node; in the storybook you tap one, or press E for the node by your lantern.
- At the Ring, a brass dial follows the jitterbug's volume as it breathes.
- A brass rail by the station door carries eight beads, one for each of the station's self-checks, lit when the check passes.
- Every few minutes the ground hums. Re-tensioned masts ring their chords and slack ones rattle, and the radio reports in.
- The station's mailbox raises its flag now and then. Open it and the tetrahedron that lives inside eats the envelope and leaves a postcard.
- Roosevelt elk graze in the fog, and the bull bugles. Marbled murrelets cross overhead on their way in from the coast. Ash drifts down over the station, each flake a tiny vector equilibrium.
- From Lookout Rise, a lenticular cloud stands over the peaks and the sun is red.
- Sometimes a tall figure waits at the fog's edge, off to one side, after two wood knocks. Turn to it and it is gone.
- Somewhere in the grove there is a white redwood.
- At Public Works the ants build a tetrahedron out of Fuller's A-modules, one sliver at a time, then let it go and start again.
- Stand still by a fallen log and the foxfire in the rotting wood begins to glow.
- A rough-skinned newt crosses the trail in no hurry. Come close and it arches to show its orange underside.

The field station adds what a first-person view can give: the mountain standing up out of the fog from the summit of Lookout Rise; with the sun at your back up there, the patrol's three shadows on the fog below, a glory of coloured rings round one head only, yours; and Highway 101 along the grove's west edge, where cars pass in the fog lights first and Dot keeps the diner. The storybook keeps its own diner on 101, its salmon run, its ant crew and its flooded roots.

## Controls

| | Field station | Storybook |
|---|---|---|
| Walk | WASD or arrows; R keeps walking on its own; left thumb on a phone | WASD or arrows, or tap the ground; R keeps walking on its own |
| Look | Click the grove for mouse look (Esc releases), or drag; right thumb on a phone | |
| Act | E, Space, click, or the button at the bottom; also marks a lattice node | E, Space, or the button at the bottom; tap a lattice node to mark it |
| Notebook | L | L |
| Sound | M | M |

## Repository layout

```
src/                       the two games exactly as published to Claude (no <html>/<head>/<body>)
storybook/                 standalone storybook page, built from src/
field-station/             standalone field-station page, built from src/
index.html                 landing page with both doors
vendor/                    QuadCraft and QuadMath files, byte for byte, pinned in vendor.lock.json
lib/tetravolume.js         QuadMath's exact 5x5 tetravolume and Bareiss determinant, ported to JavaScript
lib/grove-geometry.js      the jitterbug, its volume, the lattice and its addresses, the ash: shared by both games
tools/build.mjs            splices vendor/ and lib/ into src/, then builds the standalone pages
tools/vendor.mjs           checks vendor/ against the lock (and upstream clones); refreshes it
tools/quadmath_fixtures.py runs the vendored QuadMath to write tests/fixtures/quadmath.json
tests/check.mjs            parse, artifact, freshness, import, port and geometry checks
tools/ci.mjs               local CI: the checks on a clean export of one commit, with an optional receipt
.githooks/pre-push         runs local CI on every commit being pushed
tools/facts.mjs            computes every number the docs and the manuscript state; --check fails on a stale or typed one
docs/                      design, synergetics, imports and Cascadia notes, and the images
docs/manuscript/           the paper about the games, rendered through docxology/template
scripts/                   the manuscript build: figures, tokens, render, render contract
output/pdf/                the rendered paper and the digests binding it to its sources
```

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
- QuadCraft's own eight self-checks pass, and the three quadray conventions in play (QuadCraft's, QuadMath's and the compass's) relate exactly as [docs/imports.md](docs/imports.md) says

They also check the geometry, using the exact functions the field station runs, with the imported code as spliced:

- the four quadray rays are unit length, sum to zero, and meet at the tetrahedral angle
- quadray coordinates come out non-negative with one zero, and convert back exactly
- the jitterbug's eight triangles stay equilateral, passing through the vector equilibrium, the icosahedron and the octahedron
- the cube built on a tetrahedron's edges holds 3 tetravolumes: the tetrahedron plus four corner pieces of one half each, measured both in XYZ and with the 5×5 determinant
- every node of the stillness lattice has a whole address, every strut is one of QuadMath's twelve moves, and <!-- n:tallySamples -->400<!-- /n --> random four-node marks all count whole, each matching the tetrahedron's XYZ volume
- the Ring's dial reads 20, 5√2 φ² and 4 at the three stations and the convex hull between them
- each flake of ash is a vector equilibrium closing 20 tetravolumes

In a browser, both games expose a small test hook (`window.__oss` for the storybook, `window.__fs` for the field station) with `step`, `teleport` and checks such as `__fs.ivmCheck()`, which confirms every interior lattice node has twelve equal edges, `__fs.lattice()` for the gazed node, the marks and the count, `__fs.ringVolume()`, `__fs.selfTest()`, `__fs.vista()`, `__fs.sundown()`, `__fs.quake()`, `__fs.elk()`, `__fs.murrelets(true)`, `__fs.mail()`, `__fs.car(true)`, `__fs.roadside()` and `await __fs.audioCheck(name, args, seconds, times)`, which renders one of the game's sounds offline and reports its loudness and strongest frequency at each given time.

## The paper

[`output/pdf/Cascadian_Synergetics_combined.pdf`](output/pdf/Cascadian_Synergetics_combined.pdf) is a paper about the games: what they show, the geometry behind it, how the imported code is held to its sources, the real Cascadia behind the grove, and how every claim is checked. Its source is [`docs/manuscript/`](docs/manuscript/), rendered by the [docxology/template](https://github.com/docxology/template) pipeline:

```bash
python3 scripts/build.py
```

That needs a template checkout beside this one with its project lane linked here, plus Node, TeX, Pandoc with pandoc-crossref and poppler; [`docs/manuscript/README.md`](docs/manuscript/README.md) has the setup. Every number in the paper is computed by `tools/facts.mjs` and injected as the paper renders, and the figures are drawn from the same code. Local CI does not render; it checks that the committed PDF was rendered from the current sources.

Release 0.5.1, the paper and the source at its tag, is archived on Zenodo as [doi:10.5281/zenodo.24511763](https://doi.org/10.5281/zenodo.24511763), release 0.5.0 as [doi:10.5281/zenodo.24511112](https://doi.org/10.5281/zenodo.24511112), and release 0.4.0 as [doi:10.5281/zenodo.24508085](https://doi.org/10.5281/zenodo.24508085); [doi:10.5281/zenodo.24508082](https://doi.org/10.5281/zenodo.24508082) always resolves to the latest archived release.

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

Edit `src/` (or `lib/`), run `node tools/build.mjs`, commit, then `node tools/ci.mjs`. To update the hosted artifacts, publish `src/storybook.html` and `src/field-station.html` to their existing artifact links; the field station's source already carries the spliced code. To move the imports to newer upstream commits, follow [docs/imports.md](docs/imports.md#updating-the-imports). See [AGENTS.md](AGENTS.md) for the rules the games keep.

## Sources and credits

- The [Office of Synergetics Services](https://docs.superhuman.com/d/Math4Wisdom_d0SvdI3KSto/Office-of-Synergetics-Services_suFScEwl) gallery in Math4Wisdom: the station, the ants' public works, the pins and coins, the salmon and the tetrahedron, the fire lookout.
- R. Buckminster Fuller's *Synergetics*: the jitterbug, tetravolumes, the isotropic vector matrix, tensegrity.
- Quadray coordinates as developed in the synergetics community, and Tom Ace's 5×5 determinant for tetravolumes.
- [QuadCraft](https://github.com/docxology/QuadCraft) (Apache-2.0): `quadray.js` and `synergetics.js`, vendored at `6b5e65f`.
- [QuadMath](https://github.com/docxology/QuadMath) (Apache-2.0, manuscript [doi:10.5281/zenodo.16887791](https://doi.org/10.5281/zenodo.16887791)): the exact tetravolume and Bareiss determinant, ported from `6e1f004`.
- [Three.js](https://threejs.org/) r128 (MIT). Fonts: Fraunces, Alegreya Sans and Special Elite from Google Fonts.

Notes on the geometry and on the real Cascadia behind the grove are in [docs/](docs/). Releases are listed in [CHANGELOG.md](CHANGELOG.md).

![In the storybook, the stillness lattice glows around Patrol Trine at the Cathedral Ring; four marked nodes span a tetrahedron and the brass counter reads 1.](docs/images/storybook-lattice.jpg)

## License

MIT for this repository's own code. See [LICENSE](LICENSE) and [CITATION.cff](CITATION.cff). The files in `vendor/` keep their upstream Apache-2.0 licence, whose text is beside them, and `lib/tetravolume.js` is a port of Apache-2.0 code that says so in its header.

# Cascadian Synergetics

Two patrols through a fog-bound Cascadian redwood grove, where the Office of Synergetics Services keeps space from growing square.

| Game | Kind | Source | Standalone page |
|------|------|--------|-----------------|
| Cascadian Field Station | First person, 3D (Three.js r128) | [`src/field-station.html`](src/field-station.html) | [`field-station/`](field-station/) |
| Office of Synergetics Services | Storybook, 2.5D (Canvas 2D) | [`src/storybook.html`](src/storybook.html) | [`storybook/`](storybook/) |

Each game is a single HTML file with no build step and no dependencies beyond fonts and, for the field station, Three.js from cdnjs.

## Play

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

The field station adds three things that are never named:

- Stand still for a few seconds and the isotropic vector matrix appears around you, fixed to the world.
- Sometimes a tall figure waits at the fog's edge, off to one side, after two wood knocks. Look straight at it and it is gone.
- At the far edge of the grove there is a white redwood.

## Controls

| | Field station | Storybook |
|---|---|---|
| Walk | WASD or arrows; left thumb on a phone | WASD or arrows, or tap the ground |
| Look | Click the grove for mouse look (Esc releases), or drag; right thumb on a phone | |
| Act | E, Space, click, or the button at the bottom | E, Space, or the button at the bottom |
| Notebook | L | L |
| Sound | M | M |

## Repository layout

```
src/                 the two games exactly as published to Claude (no <html>/<head>/<body>)
storybook/           standalone storybook page, built from src/
field-station/       standalone field-station page, built from src/
index.html           landing page with both doors
tools/build.mjs      wraps each source in a full document and points cross-links at local copies
tests/check.mjs      parse, artifact-contract, freshness and geometry checks
docs/                design, synergetics and Cascadia notes
```

## Build and test

Node 20 or newer, no packages to install.

```bash
node tests/check.mjs
```

```bash
node tools/build.mjs
```

The tests check that both inline scripts parse, that each source keeps the artifact rules (title near the top, no document skeleton, scripts only from cdnjs, no blocking dialogs), and that the standalone pages match a fresh build. They also check the geometry, using the exact functions the field station runs:

- the four quadray rays are unit length, sum to zero, and meet at the tetrahedral angle
- quadray coordinates come out non-negative with one zero, and convert back exactly
- the jitterbug's eight triangles stay equilateral, passing through the vector equilibrium, the icosahedron and the octahedron
- the cube built on a tetrahedron's edges holds 3 tetravolumes: the tetrahedron plus four corner pieces of one half each

In a browser, both games expose a small test hook (`window.__oss` for the storybook, `window.__fs` for the field station) with `step`, `teleport` and checks such as `__fs.ivmCheck()`, which confirms every interior lattice node has twelve equal edges.

## Editing and republishing

Edit `src/`, run `node tools/build.mjs`, then `node tests/check.mjs`. To update the hosted artifacts, publish `src/storybook.html` and `src/field-station.html` to their existing artifact links. See [AGENTS.md](AGENTS.md) for the rules the games keep.

## Sources and credits

- The [Office of Synergetics Services](https://docs.superhuman.com/d/Math4Wisdom_d0SvdI3KSto/Office-of-Synergetics-Services_suFScEwl) gallery in Math4Wisdom: the station, the ants' public works, the pins and coins, the salmon and the tetrahedron, the fire lookout.
- R. Buckminster Fuller's *Synergetics*: the jitterbug, tetravolumes, the isotropic vector matrix, tensegrity.
- Quadray coordinates as developed in the synergetics community.
- [Three.js](https://threejs.org/) r128 (MIT). Fonts: Fraunces, Alegreya Sans and Special Elite from Google Fonts.

Notes on the geometry and on the real Cascadia behind the grove are in [docs/](docs/).

## License

MIT. See [LICENSE](LICENSE) and [CITATION.cff](CITATION.cff).

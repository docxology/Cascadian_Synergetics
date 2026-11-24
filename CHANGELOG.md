# Changelog

## Unreleased

- **A manuscript.** `docs/manuscript/` holds a paper about the games, their geometry and how it is checked, rendered to `output/pdf/Cascadian_Synergetics_combined.pdf` by the docxology/template pipeline with `python3 scripts/build.py`. Every number in it is a token computed by `tools/facts.mjs`; the figures are drawn from the same code (`scripts/make_figures.py`); the build reads the render contract back out of the PDF (`scripts/check_render.py`) and records the PDF's digest beside its sources' digest, which the local checks compare.
- `tools/facts.mjs` gains `--tokens`, `--series` and `--stamp`, and `--check` now also rejects a typed number in the manuscript, an unknown token, an uncited or missing bibliography entry, a sourced fact used without its citation, a version that differs between `package.json`, `CITATION.cff` and the manuscript, and a PDF older than its sources.
- From the field station's summit, with the sun at your back, the patrol's shadows on the fog below and a glory round your own.
- The ants at Public Works build a tetrahedron from Fuller's 24 A-modules (both games); `aModules` joins the shared geometry and the checks confirm each module is exactly one twenty-fourth.
- Foxfire on the fallen logs, and a rough-skinned newt that shows its orange underside (both games).

## 0.3.0 (2026-11-23)

- **Both games carry the same instruments.** QuadCraft's quadray code and self-checks, QuadMath's exact tetravolume and the grove's shared geometry (`lib/grove-geometry.js`) are spliced into the field station and the storybook alike.
- **The storybook comes level.** It gains the stillness lattice with whole addresses (its edge closes a whole number of periods around the loop), the four-mark tally, the Ring's volume dial, the instrument rail, tremors with singing masts, postcards from the mailbox, a lenticular cloud at Lookout Rise, the visitor in the fog, a white redwood, and R to keep walking.
- **The field station gains** tremors, Roosevelt elk, marbled murrelets, a red sun from the summit, ash over the station, the mailbox and its file-eating tetrahedron, Highway 101 with passing cars, and the diner. R keeps you walking.
- **Fixes.** The 3D view is sized by CSS, so it fills its frame at any pixel ratio. Work in reach takes the action button before a lattice node does. Tally markers draw whole.
- **Checks.** Every number the docs state about the geometry and the imports is computed and injected (`tools/facts.mjs`). Both games expose `audioCheck`, which renders a sound offline and measures it.

## 0.2.0 (2026-11-23)

- QuadCraft (`quadray.js`, `synergetics.js`) and QuadMath (`quadray.py`, `linalg_utils.py`) vendored byte for byte and pinned by Git blob id; the exact tetravolume ported to JavaScript and held to fixtures computed by QuadMath's own Python.
- The field station's lattice addresses, four-node tally, Ring dial, instrument rail, and the mountain from Lookout Rise.
- Local CI confirms the vendored files against upstream clones and records the result in its receipt.

## 0.1.0 (2026-11-23)

- The field station (first person, Three.js) and the storybook (2.5D, Canvas), published as Claude artifacts and as standalone pages.
- Local CI on a clean export of each commit, run before every push. No hosted runners.

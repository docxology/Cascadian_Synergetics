# Changelog

## Unreleased

- **The paper, much extended.** A background section (synergetics and its units, quadrays, lattices and closest packing, the jitterbug and the A modules, play and learning, reproducible documents) with twenty-three new references, each resolved through its DOI or fetched from its page; a section on the one body of code behind the games and the paper, with a schema of the build; and an availability table of plain links for playing, reading and citing. The geometry is restated as eight numbered definitions and nine numbered propositions, each with its reason where the reason is short and its check in a new table, and every display equation is numbered. New figures draw the quadrays and the twelve neighbour moves, the cube and its corners, and the jitterbug's shapes above the gauge; the A-modules and denominator figures are redrawn; every caption says what is drawn and from which code.
- **The abstract** is rewritten and ends with plain links to play both games, to the source and the imports, and to the Zenodo archive.
- **Both games play on GitHub Pages** at https://docxology.github.io/Cascadian_Synergetics/, served from `main` with `.nojekyll`.
- **Checks.** `tools/facts.mjs --check` also refuses a display equation without a label, a reference to an undeclared label, a label prefix the template's validator would take for a citation key, and a typed number in a formal statement's title; the paper's links are tokens read from `CITATION.cff` (which gains the Pages `url`) and the vendor lock. `tests/check.mjs` confirms that the neighbour moves, projected, generate exactly the lattice whose determinant is the 5x5 formula's divisor, and that between the jitterbug's stations every gap is skew, so folding it on the other diagonal would read differently. `scripts/check_render.py` reads each kind of formal statement's numbering back out of the PDF and finds figures whose captions hold cross-references.
- Release 0.4.0 is archived on Zenodo as [doi:10.5281/zenodo.24508085](https://doi.org/10.5281/zenodo.24508085) (every release: [doi:10.5281/zenodo.24508082](https://doi.org/10.5281/zenodo.24508082)). `CITATION.cff`, the README and the paper's cover cite it, and `tools/facts.mjs --check` holds the paper's publication record to the template's rules: a published version has its DOI, and the citation file's DOI is that version's.

## 0.4.0 (2026-11-24)

- **A paper.** `docs/manuscript/` holds a paper about the games, their geometry and how it is checked, rendered to `output/pdf/Cascadian_Synergetics_combined.pdf` by the docxology/template pipeline with `python3 scripts/build.py`. Every number in it is a token computed by `tools/facts.mjs`; the figures are drawn from the same code (`scripts/make_figures.py`); the build reads the render contract back out of the PDF (`scripts/check_render.py`) and records the PDF's digest beside its sources' digest, which the local checks compare.
- **Checks.** `tools/facts.mjs` gains `--tokens`, `--series` and `--stamp`, and `--check` now also rejects a typed number in the manuscript, an unknown token, an uncited or missing bibliography entry, a sourced fact used without its citation, a version that differs between `package.json`, `CITATION.cff` and the manuscript's configuration, and a PDF older than its sources.
- **The field station gains** a Brocken spectre: from the summit, with the sun at your back, the patrol's shadows on the fog below and a glory round your own.
- **Both games gain** the ants' tetrahedron at Public Works, built from Fuller's A-modules (`aModules` joins the shared geometry, and the checks confirm each module is exactly one twenty-fourth of the tetrahedron), foxfire on the fallen logs, and a rough-skinned newt that shows its orange underside.

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

# Manuscript status

- **State:** released with the repository's 0.5.0, which carries the extended
  paper (0.4.0 carried the first); renders through docxology/template with the render contract
  passing (`scripts/check_render.py`).
- **Numbers:** every number is a token computed by `tools/facts.mjs`; the one
  sourced fact (the month of the Cascadia earthquake, January 1700; the day is
  deliberately not stated) is bound to its citation.
- **Structure:** ten numbered sections, from the background (synergetics,
  quadrays, lattices, the jitterbug, play and learning, reproducible documents)
  to an availability table of plain links for playing, reading and citing.
- **Formalisms:** eight definitions and nine propositions, numbered by the
  template's formalism filter, and thirteen labelled display equations,
  numbered by pandoc-crossref; the gate refuses an unlabelled equation, an
  undeclared reference, or a label prefix the template's validator would take
  for a citation key.
- **Figures:** seven drawn from the games' code (cover, the build schema, the
  quadrays and neighbour moves, the fixture's denominators, the cube, the
  jitterbug's gauge with its shapes, the A modules) and two frames of the games,
  2160 by 1350 pixels, captured by `scripts/capture_screenshots.mjs` through the
  games' test hooks and held by the local checks to `docs/images/screenshots.json`.
- **Bibliography:** every DOI resolved through doi.org when the entry was
  written; the gallery entry has no DOI and records its access date.
- **Release:** `config.yaml` (`version`, `intended_version`, `release_status`
  published) and the Discussion name release 0.5.0. Between releases, if the
  paper describes work the changelog lists as unreleased, say so in the
  Discussion's last sentence. At the next release, reserve the new Zenodo
  version's DOI first, put it in `CITATION.cff` and `config.yaml` with the
  version bump, render, tag, then publish the Zenodo version with the tagged
  PDF and source.
- **Archive:** release 0.5.0 is on Zenodo as doi:10.5281/zenodo.24511112, and 0.4.0 as
  doi:10.5281/zenodo.24508085; the concept doi:10.5281/zenodo.24508082, printed on
  the cover, resolves to the latest. Each archived PDF is the one attached to
  that version's GitHub release.
- **Not covered:** behaviour visible only in a browser (drawing, sound,
  controls) is checked by hand through the games' test hooks, not by the local
  checks.

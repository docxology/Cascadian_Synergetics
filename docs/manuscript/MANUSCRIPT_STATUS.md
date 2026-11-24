# Manuscript status

- **State:** released with the repository's 0.4.0, the first release to carry
  the paper; renders through docxology/template with the render contract
  passing (`scripts/check_render.py`).
- **Numbers:** every number is a token computed by `tools/facts.mjs`; the one
  sourced fact (the month of the Cascadia earthquake, January 1700; the day is
  deliberately not stated) is bound to its citation.
- **Figures:** four drawn from the games' code (cover, the jitterbug's gauge,
  the A modules, the fixture's denominators) and two screenshots of the games,
  captured by hand.
- **Bibliography:** every DOI resolved through doi.org when the entry was
  written; the gallery entry has no DOI and records its access date.
- **Release:** `config.yaml` (`version`, `intended_version`, `release_status`
  published) and the Discussion name release 0.4.0. At the next release, bump
  both versions with `package.json` and `CITATION.cff` and render again.
- **Archive:** release 0.4.0 is on Zenodo as doi:10.5281/zenodo.24508085 (concept
  doi:10.5281/zenodo.24508082, printed on the cover). The archived PDF is the one
  attached to the v0.4.0 GitHub release; later renders differ from it only
  where their sources do.
- **Not covered:** behaviour visible only in a browser (drawing, sound,
  controls) is checked by hand through the games' test hooks, not by the local
  checks.

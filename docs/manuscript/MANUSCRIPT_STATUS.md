# Manuscript status

- **State:** complete draft; renders through docxology/template with the render
  contract passing (`scripts/check_render.py`).
- **Numbers:** every number is a token computed by `tools/facts.mjs`; the one
  sourced fact (the month of the Cascadia earthquake, January 1700; the day is
  deliberately not stated) is bound to its citation.
- **Figures:** four drawn from the games' code (cover, the jitterbug's gauge,
  the A modules, the fixture's denominators) and two screenshots of the games,
  captured by hand.
- **Bibliography:** every DOI resolved through doi.org when the entry was
  written; the gallery entry has no DOI and records its access date.
- **Release:** unreleased. `config.yaml` and the Discussion carry the
  repository's current version (the Discussion says the paper also covers
  unreleased work); bump it with `package.json` and `CITATION.cff` when cutting
  a release.
- **Not covered:** behaviour visible only in a browser (drawing, sound,
  controls) is checked by hand through the games' test hooks, not by the local
  checks.

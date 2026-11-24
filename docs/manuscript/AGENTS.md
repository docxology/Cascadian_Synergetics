# Rules for the manuscript

These hold for every file in `docs/manuscript/` that the template renders.

- **No typed numbers.** A number the repository computes or pins is a token,
  `{{NAME}}`, from `node tools/facts.mjs --tokens`. Outside mathematics no digit
  may be typed at all. Inside mathematics a single digit is notation (the 2 of
  `\sqrt{2}`, the 4 in the determinant's `\frac{1}{4}`); a number of two or more
  digits, or a decimal, is a result and must be a token. Section titles and
  figure captions follow the same rule. `node tools/facts.mjs --check` enforces
  it and names the file and line of each typed number.
- **New numbers start in code.** Add the computation to `computeFacts()` in
  `tools/facts.mjs`, under a camelCase name; its token is the UPPER_SNAKE form
  (`hullPeakAt` → `HULL_PEAK_AT`). Never add a constant there that the code
  could compute instead.
- **Facts from outside are cited where they are used.** A fact the repository
  cannot compute goes in `SOURCED` in `tools/facts.mjs` with its citation key,
  and every paragraph that uses its token must cite that key.
- **Every citation resolves, every entry is cited.** Each `[@key]` needs an entry
  in `references.bib`, and each entry must be cited. Take an entry's fields from
  the record its DOI resolves to, not from memory.
- **Figures are drawn from the code.** `scripts/make_figures.py` plots only what
  `node tools/facts.mjs --series` returns. Place a figure with a path from this
  folder, `../../output/figures/<name>`, and a `{#fig:...}` label.
- **`config.yaml` is literal.** The template reads it without hydration, so it
  carries no tokens. Its `version` and `intended_version` equal `package.json`
  and `CITATION.cff`, and `release_status` is `unreleased` or `published`.
- **The paper describes a release.** The Discussion names release
  `{{VERSION}}`. Describe only what that release contains; to write about work
  the changelog still lists as unreleased, say so in that sentence.
- **Claims stay inside the checks.** A statement about the geometry must be one
  that `tests/check.mjs` checks, and a statement about the games must be true
  of `src/`. Write what the code does, not what synergetics might imply.
- **Render after every change.** Run `python3 scripts/build.py` and commit the
  PDF and `output/pdf/Cascadian_Synergetics_combined.json` with the change; the
  local checks fail on a PDF rendered from older sources.

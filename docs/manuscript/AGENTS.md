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
- **Screenshots are captured, never made by hand.** Take them with
  `node scripts/capture_screenshots.mjs`, which writes `docs/images/` and its
  record; change a scene by editing `SCENES` in that script, never an image.
- **`config.yaml` is literal.** The template reads it without hydration, so it
  carries no tokens. Its `version` and `intended_version` equal `package.json`
  and `CITATION.cff`, and `release_status` is `unreleased` or `published`.
- **A release is published once it has a DOI.** After minting a Zenodo record,
  set `last_published_version`, `doi` (the concept DOI, printed on the cover),
  `version_doi` and `version_record`, and put the version DOI in `CITATION.cff`.
  When the version is bumped for the next release, set `release_status` to
  `unreleased` and drop `doi` from `CITATION.cff` until that release has its
  own record.
- **Formal statements are numbered blocks.** Write a definition or proposition
  as a fenced block, `::: {.definition #def:name title="…"}` … `:::`, which the
  template's formalism filter numbers; refer to it as `[@def:name]`. Label it
  with a prefix the template's pre-render validator accepts (`def`, `prop`,
  `thm` and the like, listed in `tools/facts.mjs`), whatever its kind, or the
  validator takes the reference for a missing citation.
- **Every display equation is numbered.** Follow each `$$ … $$` with an
  `{#eq:name}` label, and refer to it as `[@eq:name]`. Never open a sentence
  with a reference to a section, figure, table or equation, which pandoc-crossref
  writes in lower case.
- **The paper describes a release.** The Discussion names release
  `{{VERSION}}`. Describe only what that release contains; to write about work
  the changelog still lists as unreleased, say so in that sentence.
- **Claims stay inside the checks.** A statement about the geometry must be one
  that `tests/check.mjs` checks, and a statement about the games must be true
  of `src/`. Write what the code does, not what synergetics might imply.
- **Render after every change.** Run `python3 scripts/build.py` and commit the
  PDF and `output/pdf/Cascadian_Synergetics_combined.json` with the change; the
  local checks fail on a PDF rendered from older sources.

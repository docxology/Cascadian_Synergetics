# The manuscript

*Cascadian Synergetics: Synergetic Geometry, Shown and Checked, in Two Browser
Games*, the paper about this repository, written here and
rendered to [`output/pdf/Cascadian_Synergetics_combined.pdf`](../../output/pdf/Cascadian_Synergetics_combined.pdf)
by the [docxology/template](https://github.com/docxology/template) pipeline.

| File | What it holds |
|------|---------------|
| `00_abstract.md` … `10_availability.md` | the sections, rendered in file-name order |
| `99_references.md` | the References heading; BibTeX fills it from `references.bib` |
| `references.bib` | every cited source; each DOI was resolved through doi.org |
| `config.yaml` | title page, author, cover, keywords and render toggles, read literally by the template |
| `preamble.md` | the LaTeX packages |
| `AGENTS.md` | the rules for editing the manuscript |
| `MANUSCRIPT_STATUS.md` | where the manuscript stands |

The template does not render `README.md`, `AGENTS.md` or `MANUSCRIPT_STATUS.md`.

## Rendering

With a checkout of docxology/template beside this repository (it needs its own
`.venv` with the template's dependencies) and its project lane pointing here:

```bash
ln -s ../../../Cascadian_Synergetics ../template/projects/working/Cascadian_Synergetics
```

```bash
python3 scripts/build.py
```

Run both from the repository root. The first command is needed once; the
template ignores everything under `projects/`. Pass `--template-root PATH` or
set `TEMPLATE_ROOT` for a checkout elsewhere. The build also needs Node (for the
numbers and the figure data), a TeX distribution with `xelatex` and `bibtex`,
Pandoc with pandoc-crossref, and poppler's `pdftotext`, `pdfimages` and
`pdfinfo`.

`scripts/build.py` draws the figures (`scripts/make_figures.py`), writes the
tokens and hydrates the manuscript into `output/manuscript/`
(`scripts/z_generate_manuscript_variables.py`), runs the template's render
stage, checks the result (`scripts/check_render.py`) and records the PDF's digest
beside the digest of its sources in `output/pdf/Cascadian_Synergetics_combined.json`.
The two frames of the games are taken separately, by `node scripts/capture_screenshots.mjs`, which needs Chrome and a network connection and writes `docs/images/` with its record; take them again when a game changes what they show, then build.

Commit the PDF and that record together with the sources they came from;
`node tests/check.mjs` fails when they disagree.

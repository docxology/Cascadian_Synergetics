# Build the paper with pinned Template

The [manuscript source](manuscript/README.md) contains the ordered sections,
literal render configuration, preamble, and bibliography. The configured
publication format is PDF. The browser pages are built separately.

Use Git, Node 20 or later, Python, uv, Pandoc with a matching pandoc-crossref
release, LuaLaTeX with a PDF-tagging stack and BibTeX, and Poppler's `pdfinfo`, `pdftotext`, and
`pdfimages`. For the pinned runner below, the verified Pandoc pair is
Pandoc 3.14 and pandoc-crossref 0.3.26b. The tagged PDF
uses TeX Live 2026 with LuaLaTeX, `lualatex-math`, and `luaotfload`. Put
that TeX distribution on `PATH`. Template documents its
[TeX dependencies](https://github.com/docxology/template/blob/87704feae0a4490ef7dad9c931d268e8c30273c2/docs/usage/output-formats.md).

From the root of a clean Cascadian Synergetics checkout:

```sh
set -e
source_repo="$(pwd -P)"
proof_root="$(mktemp -d)"
project_copy="$proof_root/Cascadian_Synergetics"
renderer="$proof_root/template"
git clone --no-hardlinks "$source_repo" "$project_copy"
git -C "$project_copy" checkout --detach "$(git -C "$source_repo" rev-parse HEAD)"
git clone https://github.com/docxology/template.git "$renderer"
git -C "$renderer" checkout --detach 87704feae0a4490ef7dad9c931d268e8c30273c2

cd "$renderer"
uv sync --locked --no-dev
mkdir -p projects/working
ln -s "$project_copy" projects/working/Cascadian_Synergetics

cd "$project_copy"
node tools/ci.mjs
MPLBACKEND=Agg python3 scripts/build.py --template-root "$renderer"
python3 scripts/stage_validation_evidence.py

cd "$renderer"
uv run --no-sync python scripts/pipeline/stage_04_validate.py --project working/Cascadian_Synergetics
```

The native build computes values with `tools/facts.mjs`, regenerates the
geometry plots, and copies the existing script-captured frames from
`docs/images/`. It hydrates the authored sections and runs Template Stage 03,
then checks the PDF and stamps it with the source digest and renderer commit.
The evidence script registers figure paths and source-anchored formal
references for Stage 04. Stage 04 validates the publication artifact. The PDF and stamp
are under `output/pdf/` in the disposable checkout.

`scripts/check_render.py` checks the embedded figures and cover, section and
formal-statement numbering, bibliography, and unresolved tokens or
references. The [development guide](development.md) describes how to
recapture the browser frames when the scenes change.

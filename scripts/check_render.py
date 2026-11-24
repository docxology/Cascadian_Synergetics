#!/usr/bin/env python3
"""Read the render contract back out of the rendered PDF.

The template's render stage reports success when a PDF exists; this checks that
the PDF says what the sources say:

1. the title on the PDF is the title in ``docs/manuscript/config.yaml``;
2. no token, citation key, cross-reference label or ``??`` survived into the text;
3. every image the manuscript places is embedded, plus the cover, and each file
   it names exists in ``output/figures/``;
4. the sections are numbered 1, 2, 3, ... in the table of contents, in the order
   of the section files, and each kind of formal statement (Definition,
   Proposition, Remark) is numbered 1 to n, one number for each block declared;
5. LaTeX reported no missing glyph and no undefined citation or reference, and
   BibTeX reported no warning;
6. every bibliography entry is printed: each entry's first author appears in the
   References section.

Needs poppler's ``pdfinfo``, ``pdftotext`` and ``pdfimages`` on PATH.

Exit codes: 0 the contract holds; 1 it does not (every failure is printed).
"""

from __future__ import annotations

import re
import shutil
import subprocess
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
NAME = "Cascadian_Synergetics"
PDF = PROJECT_ROOT / "output" / "pdf" / f"{NAME}_combined.pdf"
LOG = PROJECT_ROOT / "output" / "pdf" / "_combined_manuscript.log"
BLG = PROJECT_ROOT / "output" / "pdf" / "_combined_manuscript.blg"
MANUSCRIPT = PROJECT_ROOT / "docs" / "manuscript"
FIGURES = PROJECT_ROOT / "output" / "figures"
NOT_SECTIONS = {"README.md", "AGENTS.md", "MANUSCRIPT_STATUS.md", "SYNTAX.md", "preamble.md"}


def run(*command: str) -> str:
    if shutil.which(command[0]) is None:
        raise SystemExit(f"{command[0]} is not on PATH (install poppler)")
    completed = subprocess.run(list(command), capture_output=True, text=True, check=False)
    if completed.returncode != 0:
        raise SystemExit(f"{' '.join(command)} failed:\n{completed.stderr}")
    return completed.stdout


def sections() -> list[Path]:
    return sorted(p for p in MANUSCRIPT.glob("*.md") if p.name not in NOT_SECTIONS)


def main() -> int:
    failures: list[str] = []
    if not PDF.is_file():
        print(f"missing {PDF}", file=sys.stderr)
        return 1

    # 1. title
    info = run("pdfinfo", str(PDF))
    config = (MANUSCRIPT / "config.yaml").read_text(encoding="utf-8")
    title = re.search(r'^\s*title:\s*"([^"]+)"', config, re.M).group(1)
    pdf_title = (re.search(r"^Title:\s*(.*)$", info, re.M) or [None, ""])[1].strip()
    if pdf_title != title:
        failures.append(f"PDF title {pdf_title!r} is not the configured {title!r}")
    pages = int(re.search(r"^Pages:\s*(\d+)", info, re.M).group(1))

    # 2. nothing unresolved in the text
    text = run("pdftotext", "-layout", str(PDF), "-")
    flat = re.sub(r"\s+", " ", text)
    for pattern, what in (
        (r"\{\{", "an unresolved {{TOKEN}}"),
        (r"\?\?", "an unresolved reference (??)"),
        (r"\[@", "an unprocessed citation [@...]"),
        (r"\{#", "a leaked label {#...}"),
        (r"@(fig|sec|tbl|eq|def|prop|rem|thm|lem|cor|ex|claim|ax):", "a raw cross-reference key"),
    ):
        for m in re.finditer(pattern, flat):
            failures.append(f"{what} in the PDF text: ...{flat[max(0, m.start() - 40):m.end() + 40]}...")

    # 3. images
    placed: list[str] = []
    for section in sections():
        # A caption may hold cross-references in brackets, so find each figure by the target that ends its line.
        for line in section.read_text(encoding="utf-8").splitlines():
            if line.startswith("!["):
                placed += re.findall(r"\]\(([^)\s]+)\)\{#fig:[^}]*\}\s*$", line)
    for target in placed:
        if not (FIGURES / Path(target).name).is_file():
            failures.append(f"figure {target} is placed but {FIGURES / Path(target).name} does not exist")
    listing = run("pdfimages", "-list", str(PDF)).splitlines()[2:]
    embedded = [line for line in listing if line.split()[2] == "image"]
    expected = len(placed) + 1  # the cover
    if len(embedded) != expected:
        failures.append(f"{len(embedded)} images are embedded; the manuscript places {len(placed)} plus the cover")

    # 4. section numbering
    numbered = [int(m.group(1)) for m in re.finditer(r"^\s*(\d+)\s+[A-Z][^\n]*?\s+\d+\s*$", text.split("References")[0], re.M)]
    titles = []
    for section in sections():
        heading = re.search(r"^#\s+(.+?)\s*(\{[^}]*\})?\s*$", section.read_text(encoding="utf-8"), re.M)
        if heading and ".unnumbered" not in (heading.group(2) or "") and section.name != "99_references.md":
            titles.append(heading.group(1))
    if numbered[: len(titles)] != list(range(1, len(titles) + 1)):
        failures.append(f"table of contents numbers {numbered[:len(titles)]}, expected 1..{len(titles)} for {titles}")

    # 4b. formal statements: each kind is numbered 1..n, as the template's formalism filter numbers them
    kinds = {"definition": "Definition", "proposition": "Proposition", "remark": "Remark", "theorem": "Theorem",
             "lemma": "Lemma", "corollary": "Corollary", "example": "Example", "claim": "Claim", "axiom": "Axiom"}
    declared: dict[str, int] = {}
    for section in sections():
        for attrs in re.findall(r"^:::\s*\{([^}]*)\}", section.read_text(encoding="utf-8"), re.M):
            for cls in re.findall(r"\.([\w-]+)", attrs):
                if cls in kinds and ".unnumbered" not in attrs:
                    declared[kinds[cls]] = declared.get(kinds[cls], 0) + 1
    for kind, n in sorted(declared.items()):
        seen = sorted({int(m) for m in re.findall(rf"\b{kind} (\d+)\b", flat)})
        if seen != list(range(1, n + 1)):
            failures.append(f"{kind}s in the PDF carry the numbers {seen}; the sources declare {n}")

    # 5. the LaTeX and BibTeX logs
    log = LOG.read_text(encoding="utf-8", errors="replace") if LOG.is_file() else ""
    if not log:
        failures.append(f"missing {LOG}")
    for pattern in (r"Missing character", r"Citation `[^']*' .*undefined", r"Reference `[^']*' .*undefined", r"There were undefined references"):
        for m in re.finditer(pattern, log):
            failures.append(f"LaTeX log: {log[m.start():m.start() + 120].splitlines()[0]}")
    blg = BLG.read_text(encoding="utf-8", errors="replace") if BLG.is_file() else ""
    for line in blg.splitlines():
        if line.startswith("Warning--"):
            failures.append(f"BibTeX: {line}")

    # 6. the bibliography
    bib = (MANUSCRIPT / "references.bib").read_text(encoding="utf-8")
    references = flat.split("References")[-1]
    for key, authors in re.findall(r"@\w+\{([^,\s]+),[^@]*?author\s*=\s*\{(.+?)\},?\s*\n", bib, re.S):
        first = authors.split(" and ")[0].strip("{} ")
        family = first.split(",")[0].strip("{} ") if "," in first else first.split()[-1]
        if family not in references:
            failures.append(f"bibliography entry {key} ({family}) is not printed in the References")

    for failure in failures:
        print(f"FAIL  {failure}", file=sys.stderr)
    if failures:
        return 1
    formal = ", ".join(f"{n} {kind.lower()}s" for kind, n in sorted(declared.items()))
    print(f"ok    {PDF.name}: {pages} pages, {len(embedded)} images, {len(titles)} numbered sections, {formal}, title {title!r}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

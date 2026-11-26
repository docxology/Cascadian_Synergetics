#!/usr/bin/env python3
"""Register the rendered figure and formal references for Template Stage 04."""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "docs" / "manuscript"
OUTPUT = ROOT / "output"
FIGURE = re.compile(r"^!\[(.+)\]\(([^)\s]+)\)\{#(fig:[\w:-]+)", re.MULTILINE)
FORMAL = re.compile(r"^:{3,}\s*\{[^}\n]*#((?:def|prop|rem|thm|lem|cor|ex|claim|ax):[\w:-]+)", re.MULTILINE)


def write_json(path: Path, content: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(content, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    figures, claims = [], []
    for section in sorted(SOURCE.glob("[0-9]*.md")):
        rendered = (OUTPUT / "manuscript" / section.name).read_text(encoding="utf-8")
        for caption, target, label in FIGURE.findall(rendered):
            filename = Path(target).name
            if not (OUTPUT / "figures" / filename).is_file():
                raise FileNotFoundError(f"{label} cites a missing figure: {filename}")
            figures.append({"label": label, "filename": filename, "caption": caption})
        for label in FORMAL.findall(section.read_text(encoding="utf-8")):
            source = section.relative_to(ROOT).as_posix()
            claims.append({
                "claim_id": label,
                "kind": "citation",
                "value": label,
                "artifact_path": source,
                "source": f"{source} #{label}",
            })

    if not figures or not claims:
        raise ValueError("the manuscript must declare figures and formal statements")
    write_json(OUTPUT / "figures" / "figure_registry.json", {"figures": figures})
    write_json(OUTPUT / "data" / "manuscript_claim_ledger.json", {"claims": claims})
    print(f"Registered {len(figures)} figures and {len(claims)} formal references")


if __name__ == "__main__":
    main()

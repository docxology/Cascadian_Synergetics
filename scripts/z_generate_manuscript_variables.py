#!/usr/bin/env python3
"""Resolve the manuscript's tokens and write the hydrated tree to ``output/manuscript/``.

The docxology/template rendering stage looks for exactly this path when it
hydrates a project's manuscript. The numbers come from ``node tools/facts.mjs
--tokens``, the single source shared with the docs and the checks; the
substitution is the template's own ``write_resolved_manuscript_tree``.

The template only warns about a token that survives hydration, so this script
fails on one: a mistyped token would otherwise ship verbatim into the PDF.

Run it with the template checkout's interpreter and ``TEMPLATE_REPO_ROOT`` set
(``scripts/build.py`` does both).

Exit codes:
    0   tokens written, tree hydrated, no token left
    1   node failed, the template could not be imported, or a token survived
"""

from __future__ import annotations

import json
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
TOKEN_RE = re.compile(r"\{\{([A-Z][A-Z0-9_]*)\}\}")
CODE_SPAN_RE = re.compile(r"`[^`\n]*`")

_TEMPLATE_ROOT = os.environ.get("TEMPLATE_REPO_ROOT")
if _TEMPLATE_ROOT:
    sys.path.insert(0, _TEMPLATE_ROOT)


def node_tokens() -> dict[str, str]:
    """The token map, computed by the same code the checks run."""
    node = shutil.which("node")
    if node is None:
        raise RuntimeError("node is not on PATH; the manuscript's numbers come from tools/facts.mjs")
    completed = subprocess.run(
        [node, str(PROJECT_ROOT / "tools" / "facts.mjs"), "--tokens"],
        capture_output=True,
        text=True,
        check=False,
    )
    if completed.returncode != 0:
        raise RuntimeError(f"tools/facts.mjs --tokens failed:\n{completed.stderr}")
    tokens = json.loads(completed.stdout)
    if not tokens or not all(isinstance(k, str) and isinstance(v, str) for k, v in tokens.items()):
        raise RuntimeError("tools/facts.mjs --tokens did not return a map of strings")
    return tokens


def main() -> int:
    try:
        from infrastructure.rendering.manuscript_injection import write_resolved_manuscript_tree
    except ImportError as exc:
        print(
            "cannot import the template's rendering infrastructure; run this with the "
            f"docxology/template interpreter and TEMPLATE_REPO_ROOT set ({exc})",
            file=sys.stderr,
        )
        return 1
    try:
        tokens = node_tokens()
    except RuntimeError as exc:
        print(exc, file=sys.stderr)
        return 1

    out_path = PROJECT_ROOT / "output" / "data" / "manuscript_variables.json"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(tokens, indent=2, sort_keys=True, ensure_ascii=False) + "\n", encoding="utf-8")

    resolved_root = Path(write_resolved_manuscript_tree(PROJECT_ROOT, tokens))
    print(out_path)
    print(resolved_root)

    leftovers: dict[str, list[str]] = {}
    for section in sorted(resolved_root.glob("*.md")):
        text = CODE_SPAN_RE.sub("", section.read_text(encoding="utf-8"))
        found = sorted(set(TOKEN_RE.findall(text)))
        if found:
            leftovers[section.name] = found
    for name, keys in leftovers.items():
        print(f"unresolved token in {name}: {', '.join(keys)}", file=sys.stderr)
    return 1 if leftovers else 0


if __name__ == "__main__":
    raise SystemExit(main())

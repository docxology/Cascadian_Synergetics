#!/usr/bin/env python3
"""Render the manuscript in docs/manuscript/ to a PDF through docxology/template.

    python3 scripts/build.py [--template-root PATH]

The steps, in order:

0. print the environment: this interpreter, the template's, matplotlib, node, and
   the template commit, so the log records what produced the PDF;
1. ``scripts/make_figures.py``: the figures, drawn from ``node tools/facts.mjs --series``;
2. ``scripts/z_generate_manuscript_variables.py``: the tokens from
   ``node tools/facts.mjs --tokens``, hydrated into ``output/manuscript/`` by the
   template's own ``write_resolved_manuscript_tree``;
3. the template's ``scripts/pipeline/stage_03_render.py --skip-manuscript-hydration``;
4. ``scripts/check_render.py``: the render contract, read back out of the PDF;
5. ``node tools/facts.mjs --stamp``: record the PDF's digest beside the digest of
   every source it was rendered from, so the local checks notice a stale PDF.

Steps 1 to 4 run on the template checkout's interpreter (it has matplotlib and
the rendering infrastructure). The template checkout is ``--template-root``, else
``$TEMPLATE_ROOT``, else the sibling ``template/`` beside this repository. Its
``projects/working/Cascadian_Synergetics`` lane must be a symlink to this
repository (the template ignores everything under ``projects/``). The template's
working tree must read the same before and after the render.

Exit codes: 0 every step passed; 2 a step failed or the setup is wrong.
"""

from __future__ import annotations

import argparse
import os
import platform
import shutil
import subprocess
import sys
from pathlib import Path

PROJECT = Path(__file__).resolve().parents[1]
NAME = "Cascadian_Synergetics"


def template_root(explicit: str | None) -> Path:
    configured = explicit if explicit is not None else os.environ.get("TEMPLATE_ROOT")
    candidate = Path(configured).expanduser() if configured else PROJECT.parent / "template"
    python = candidate / ".venv" / "bin" / "python"
    stage = candidate / "scripts" / "pipeline" / "stage_03_render.py"
    if not python.is_file() or not stage.is_file():
        raise FileNotFoundError(
            f"no usable docxology/template checkout at {candidate}: it needs .venv/bin/python and "
            "scripts/pipeline/stage_03_render.py. Pass --template-root or set TEMPLATE_ROOT."
        )
    return candidate.resolve()


def run(step: str, command: list[str], *, cwd: Path, env: dict[str, str] | None = None, capture: bool = False) -> str:
    print(f"== {step} ==", flush=True)
    completed = subprocess.run(command, cwd=cwd, env=env, text=True, capture_output=capture, check=False)
    if completed.returncode != 0:
        if capture:
            print(completed.stdout, completed.stderr, sep="\n", file=sys.stderr)
        print(f"step failed ({completed.returncode}): {step}", file=sys.stderr)
        raise SystemExit(2)
    return completed.stdout if capture else ""


def git(template: Path, *args: str) -> str:
    completed = subprocess.run(["git", "-C", str(template), *args], capture_output=True, text=True, check=False)
    if completed.returncode != 0:
        print(f"git {' '.join(args)} failed in {template}:\n{completed.stderr}", file=sys.stderr)
        raise SystemExit(2)
    return completed.stdout


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--template-root", help="the docxology/template checkout")
    args = parser.parse_args(argv)

    try:
        template = template_root(args.template_root)
    except FileNotFoundError as error:
        parser.error(str(error))
    lane = template / "projects" / "working" / NAME
    if not lane.is_symlink() or lane.resolve() != PROJECT:
        parser.error(
            f"{lane} must be a symlink to {PROJECT}. Create it with:\n"
            f"  ln -s {os.path.relpath(PROJECT, lane.parent)} {lane}"
        )
    node = shutil.which("node")
    if node is None:
        parser.error("node is not on PATH; the manuscript's numbers and figure data come from tools/facts.mjs")
    tpython = str(template / ".venv" / "bin" / "python")
    env = dict(os.environ, MPLCONFIGDIR=str(PROJECT / "output" / ".cache" / "matplotlib"), TEMPLATE_REPO_ROOT=str(template))
    Path(env["MPLCONFIGDIR"]).mkdir(parents=True, exist_ok=True)

    print("== 0. environment ==")
    commit = git(template, "rev-parse", "HEAD").strip()
    before = git(template, "status", "--porcelain")
    print(f"python   {platform.python_version()}  {sys.executable}")
    versions = subprocess.run(
        [tpython, "-c", "import sys, matplotlib; print(sys.version.split()[0], matplotlib.__version__)"],
        capture_output=True, text=True, check=False,
    )
    if versions.returncode != 0:
        print(f"the template interpreter cannot import matplotlib:\n{versions.stderr}", file=sys.stderr)
        return 2
    tver, mver = versions.stdout.split()
    print(f"template {template} at {commit[:12]}, python {tver}, matplotlib {mver}")
    print(f"node     {subprocess.run([node, '--version'], capture_output=True, text=True, check=False).stdout.strip()}")

    run("1. figures", [tpython, str(PROJECT / "scripts" / "make_figures.py")], cwd=PROJECT, env=env)
    run("2. tokens and hydration", [tpython, str(PROJECT / "scripts" / "z_generate_manuscript_variables.py")], cwd=template, env=env)
    run(
        "3. the PDF",
        [tpython, "scripts/pipeline/stage_03_render.py", "--project", f"working/{NAME}", "--skip-manuscript-hydration"],
        cwd=template,
        env=env,
    )
    run("4. the render contract", [tpython, str(PROJECT / "scripts" / "check_render.py")], cwd=PROJECT, env=env)

    after = git(template, "status", "--porcelain")
    if after != before:
        print(f"the render changed the template's working tree:\nbefore:\n{before}\nafter:\n{after}", file=sys.stderr)
        return 2
    run("5. stamp", [node, str(PROJECT / "tools" / "facts.mjs"), "--stamp", commit], cwd=PROJECT)
    print(f"rendered: {PROJECT / 'output' / 'pdf' / (NAME + '_combined.pdf')}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

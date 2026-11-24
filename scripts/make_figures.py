#!/usr/bin/env python3
"""Draw the manuscript's figures from the data the games' own code computes.

Every plotted value comes from ``node tools/facts.mjs --series``, which runs the
same spliced geometry the two games run; this script computes nothing of its own
beyond display transforms (the cover's perspective, the A-modules' spacing). Output is deterministic (no timestamps or software stamps in the
PNG metadata), so ``--out`` into a scratch directory and a byte comparison is a
regeneration check.

    python scripts/make_figures.py [--out DIR] [--series FILE]

Needs matplotlib; ``scripts/build.py`` runs it with the docxology/template
interpreter, which has it.
"""

from __future__ import annotations

import argparse
import json
import math
import shutil
import subprocess
import sys
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402
from matplotlib.collections import LineCollection  # noqa: E402
from mpl_toolkits.mplot3d.art3d import Line3DCollection, Poly3DCollection  # noqa: E402

PROJECT_ROOT = Path(__file__).resolve().parent.parent

# The grove's palette, taken from the games: the stillness lattice's brass (0xf6c068), the jitterbug's
# cyan square gaps, redwood bark, sorrel green and the fog.
BRASS = "#f6c068"
CYAN = "#7fe3ff"
BARK = "#8a4b2f"
SORREL = "#5f8f4e"
FOG = "#dfe6e8"
NIGHT = "#16232c"
INK = "#24343c"

SCREENSHOTS = {
    "fig_field_station.jpg": "docs/images/field-station-lookout.jpg",
    "fig_storybook.jpg": "docs/images/storybook-lattice.jpg",
}
FIGURES = ("fig_cover.png", "fig_jitterbug.png", "fig_amodules.png", "fig_counts.png", *SCREENSHOTS)

plt.rcParams.update(
    {
        "font.family": "DejaVu Sans",
        "font.size": 9,
        "axes.edgecolor": INK,
        "axes.labelcolor": INK,
        "xtick.color": INK,
        "ytick.color": INK,
        "axes.spines.top": False,
        "axes.spines.right": False,
        "svg.hashsalt": "cascadian-synergetics",
    }
)


def load_series(path: str | None) -> dict:
    """The figure data: from a saved file, or computed now by tools/facts.mjs."""
    if path:
        return json.loads(Path(path).read_text(encoding="utf-8"))
    node = shutil.which("node")
    if node is None:
        raise SystemExit("node is not on PATH; the figures plot what tools/facts.mjs --series computes")
    completed = subprocess.run(
        [node, str(PROJECT_ROOT / "tools" / "facts.mjs"), "--series"], capture_output=True, text=True, check=False
    )
    if completed.returncode != 0:
        raise SystemExit(f"tools/facts.mjs --series failed:\n{completed.stderr}")
    return json.loads(completed.stdout)


def save(fig, path: Path, dpi: int = 300) -> None:
    fig.savefig(path, dpi=dpi, metadata={"Software": None}, facecolor=fig.get_facecolor())
    plt.close(fig)
    print(path)


def project(points, eye, target, up=(0.0, 0.0, 1.0), focal=1.6):
    """Perspective projection of 3D points for the cover: returns (x, y, depth) per point."""

    def sub(a, b):
        return [a[i] - b[i] for i in range(3)]

    def norm(v):
        n = math.sqrt(sum(c * c for c in v))
        return [c / n for c in v]

    def cross(a, b):
        return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]

    def dot(a, b):
        return sum(a[i] * b[i] for i in range(3))

    forward = norm(sub(target, eye))
    right = norm(cross(forward, up))
    upv = cross(right, forward)
    out = []
    for p in points:
        d = sub(p, eye)
        z = dot(d, forward)
        out.append((focal * dot(d, right) / z, focal * dot(d, upv) / z, z))
    return out


def cover(data: dict, out: Path) -> None:
    """The field station's stillness lattice with the jitterbug's icosahedron at its heart."""
    # a camera direction chosen off every lattice row, so no row of struts lines up into a streak
    eye, target = (9.7, -13.1, 5.3), (0.0, 0.0, 0.0)
    fig = plt.figure(figsize=(6.5, 4.6))
    fig.patch.set_facecolor(NIGHT)
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_facecolor(NIGHT)
    ax.set_axis_off()

    # the fog: a soft vertical gradient behind everything
    gradient = [[i / 255] for i in range(256)]
    ax.imshow(gradient, extent=(-1.1, 1.1, -0.78, 0.78), cmap=matplotlib.colors.LinearSegmentedColormap.from_list(
        "fog", [NIGHT, "#2c4352", "#4d6a74"]), origin="lower", aspect="auto", zorder=0)

    segments, colours = [], []
    far = max(math.dist(eye, n) for n in data["nodes"])
    near = min(math.dist(eye, n) for n in data["nodes"])
    brass = matplotlib.colors.to_rgb(BRASS)
    for p, q in data["edges"]:
        (x1, y1, z1), (x2, y2, z2) = project([p, q], eye, target)
        depth = (0.5 * (z1 + z2) - near) / (far - near)
        fade = max(0.03, 0.72 * (1 - depth) ** 2.2)
        segments.append([(x1, y1), (x2, y2)])
        colours.append((*brass, fade))
    order = sorted(range(len(segments)), key=lambda i: colours[i][3])
    ax.add_collection(LineCollection([segments[i] for i in order], colors=[colours[i] for i in order],
                                     linewidths=0.55, zorder=1))

    nodes = project(data["nodes"], eye, target)
    ax.scatter([n[0] for n in nodes], [n[1] for n in nodes], s=[max(0.2, 5 * (1 - (n[2] - near) / (far - near)) ** 2) for n in nodes],
               color=BRASS, alpha=0.55, linewidths=0, zorder=2)

    # the icosahedron: the jitterbug's eight triangles, and each folded square's shorter diagonal
    ico = data["icosahedron"]
    lines = []
    for tri in ico["tris"]:
        lines += [(tri[i], tri[(i + 1) % 3]) for i in range(3)]
    for sq in ico["squares"]:
        lines += [(sq[i], sq[(i + 1) % 4]) for i in range(4)]
        d02, d13 = math.dist(sq[0], sq[2]), math.dist(sq[1], sq[3])
        lines.append((sq[0], sq[2]) if d02 <= d13 else (sq[1], sq[3]))
    glow = [project([a, b], eye, target) for a, b in lines]
    for width, alpha in ((6.0, 0.08), (3.2, 0.18), (1.3, 0.95)):
        ax.add_collection(LineCollection([[(g[0][0], g[0][1]), (g[1][0], g[1][1])] for g in glow],
                                         colors=[(*matplotlib.colors.to_rgb(CYAN), alpha)], linewidths=width, zorder=3))
    ax.set_xlim(-1.1, 1.1)
    ax.set_ylim(-0.78, 0.78)
    save(fig, out / "fig_cover.png")


def jitterbug(data: dict, out: Path) -> None:
    """The Ring's gauge: the jitterbug's volume from the octahedron to the vector equilibrium."""
    pts, stations, peak = data["points"], data["stations"], data["peak"]
    fig, ax = plt.subplots(figsize=(6.2, 3.4))
    ax.plot([p["r"] for p in pts], [p["v"] for p in pts], color=BARK, linewidth=1.6, zorder=2)
    offsets = {"octahedron": (10, -4, "left"), "icosahedron": (-8, -16, "right"), "vector equilibrium": (-8, -16, "right")}
    for s in stations:
        ax.scatter([s["r"]], [s["v"]], s=34, color=CYAN, edgecolor=INK, linewidth=0.7, zorder=3)
        dx, dy, ha = offsets[s["name"]]
        ax.annotate(f"{s['name']}  {s['v']:.3f}".rstrip("0").rstrip("."), (s["r"], s["v"]), xytext=(dx, dy),
                    textcoords="offset points", ha=ha, fontsize=8.5, color=INK)
    ax.scatter([peak["r"]], [peak["v"]], s=40, marker="D", color=BRASS, edgecolor=INK, linewidth=0.7, zorder=3)
    ax.annotate(f"hull peak {peak['v']:.2f} at a/b = {peak['r']:.2f}", (peak["r"], peak["v"]), xytext=(-10, 10),
                textcoords="offset points", ha="right", fontsize=8.5, color=INK)
    ax.set_xlabel("a / b  (vertices at the cyclic permutations of (0, ±a, ±b), edge held fixed)")
    ax.set_ylabel("volume in tetravolumes")
    ax.set_xlim(-0.02, 1.02)
    ax.set_ylim(0, max(p["v"] for p in pts) * 1.12)
    ax.grid(axis="y", color=FOG, linewidth=0.8, zorder=0)
    fig.tight_layout()
    save(fig, out / "fig_jitterbug.png")


def amodules(data: dict, out: Path) -> None:
    """Fuller's A quanta modules: the tetrahedron assembled, then drawn apart by hand."""
    tet, modules = data["tetrahedron"], data["modules"]
    centre = [sum(v[k] for v in tet) / 4 for k in range(3)]
    colours = {1: BRASS, -1: SORREL}
    fig = plt.figure(figsize=(6.4, 3.2))
    for panel, spread in ((1, 0.0), (2, 1.0)):
        ax = fig.add_subplot(1, 2, panel, projection="3d")
        polys, faces = [], []
        for m in modules:
            # each module is [centre, corner, edge midpoint, face centre]: draw it away along its face's
            # outward direction, then a little towards its own corner, so the six on a face fan apart
            pts = m["pts"]
            towards_face = [pts[3][k] - centre[k] for k in range(3)]
            towards_corner = [0.5 * (pts[1][k] + pts[2][k]) - pts[3][k] for k in range(3)]
            shift = [spread * (1.5 * towards_face[k] + 0.55 * towards_corner[k]) for k in range(3)]
            moved = [[p[k] + shift[k] for k in range(3)] for p in pts]
            for a, b, c in ((0, 1, 2), (0, 1, 3), (0, 2, 3), (1, 2, 3)):
                polys.append([moved[a], moved[b], moved[c]])
                faces.append(colours[m["hand"]])
        ax.add_collection3d(Poly3DCollection(polys, facecolors=faces, edgecolors=INK, linewidths=0.25, alpha=0.88))
        ax.add_collection3d(Line3DCollection([[tet[i], tet[j]] for i in range(4) for j in range(i + 1, 4)],
                                             colors=INK, linewidths=0.8))
        lim = 1.55 if spread else 1.1
        ax.set_xlim(-lim, lim)
        ax.set_ylim(-lim, lim)
        ax.set_zlim(-lim, lim)
        ax.set_box_aspect((1, 1, 1))
        ax.view_init(elev=24, azim=-38)
        ax.set_axis_off()
    fig.subplots_adjust(left=0, right=1, top=1, bottom=0, wspace=0)
    save(fig, out / "fig_amodules.png")


def counts(data: dict, out: Path) -> None:
    """Tetravolume denominators: arbitrary integer quadrays against tetrahedra on IVM nodes."""
    groups = (("arbitrary integer quadrays", data["integer"], BARK), ("IVM nodes", data["ivm"], SORREL))
    dens = sorted({d for _, ds, _ in groups for d in ds} | {1, 2, 4})
    fig, ax = plt.subplots(figsize=(5.6, 2.9))
    width = 0.38
    for g, (label, ds, colour) in enumerate(groups):
        xs = [i + (g - 0.5) * width for i in range(len(dens))]
        ys = [sum(1 for d in ds if d == den) for den in dens]
        ax.bar(xs, ys, width=width, color=colour, label=label, zorder=2)
        for x, y in zip(xs, ys):
            ax.annotate(str(y), (x, y), xytext=(0, 2), textcoords="offset points", ha="center", fontsize=8, color=INK)
    ax.set_xticks(range(len(dens)))
    ax.set_xticklabels([{1: "whole", 2: "in halves", 4: "in quarters"}.get(d, f"in 1/{d}") for d in dens])
    ax.set_ylabel("tetrahedra in the fixture")
    ax.legend(frameon=False, fontsize=8)
    ax.grid(axis="y", color=FOG, linewidth=0.8, zorder=0)
    fig.tight_layout()
    save(fig, out / "fig_counts.png")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out", default=str(PROJECT_ROOT / "output" / "figures"), help="directory to write into")
    parser.add_argument("--series", help="read the figure data from this file instead of running node")
    args = parser.parse_args(argv)
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    data = load_series(args.series)
    cover(data["cover"], out)
    jitterbug(data["jitterbug"], out)
    amodules(data["aModules"], out)
    counts(data["fixture"], out)
    for name, source in SCREENSHOTS.items():
        shutil.copyfile(PROJECT_ROOT / source, out / name)
        print(out / name)
    missing = [name for name in FIGURES if not (out / name).is_file()]
    if missing:
        print(f"missing figures: {', '.join(missing)}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

#!/usr/bin/env python3
"""Draw the manuscript's figures from the data the games' own code computes.

Every plotted value comes from ``node tools/facts.mjs --series``, which runs the
same spliced geometry the two games run; this script computes nothing of its own
beyond display transforms (the cover's perspective, the A-modules' and the cube's spacing, label
placement and the fractions a label is written in). Output is deterministic (no timestamps or software stamps in the
PNG metadata), so ``--out`` into a scratch directory and a byte comparison is a
regeneration check.

    python scripts/make_figures.py [--out DIR] [--series FILE]

Needs matplotlib; ``scripts/build.py`` runs it with the docxology/template
interpreter, which has it.
"""

from __future__ import annotations

import argparse
from fractions import Fraction
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
from matplotlib.patches import FancyArrowPatch, FancyBboxPatch  # noqa: E402
import matplotlib.lines  # noqa: E402
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
INK_SOFT = "#4f6068"
CYAN_DARK = "#1f8fae"
BRASS_DARK = "#c18f2e"
BRASS_LIGHT = "#fbe7c0"
BARK_DARK = "#4a2716"
FOG_DARK = "#9aa8ad"
FOG_LIGHT = "#eef2f2"
SORREL_LIGHT = "#e6efe1"
PAPER = "#fbf8f1"

SCREENSHOTS = {
    "fig_field_station.jpg": "docs/images/field-station-lookout.jpg",
    "fig_storybook.jpg": "docs/images/storybook-lattice.jpg",
}
FIGURES = ("fig_cover.png", "fig_schema.png", "fig_quadrays.png", "fig_counts.png", "fig_cube.png", "fig_jitterbug.png",
           "fig_amodules.png", *SCREENSHOTS)

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


def _style3d(ax, lim: float, elev: float = 22, azim: float = -52) -> None:
    ax.set_xlim(-lim, lim)
    ax.set_ylim(-lim, lim)
    ax.set_zlim(-lim, lim)
    ax.set_box_aspect((1, 1, 1))
    ax.view_init(elev=elev, azim=azim)
    ax.set_axis_off()


def _frac(value: float) -> str:
    """A computed share written as a fraction for a label (display only)."""
    f = Fraction(value).limit_denominator(64)
    return str(f.numerator) if f.denominator == 1 else f"{f.numerator}/{f.denominator}"


def _shape(ax, shape: dict, lim: float) -> None:
    """One jitterbug: its eight triangles filled, its six gaps outlined in cyan with the fold the gauge uses."""
    ax.add_collection3d(Poly3DCollection(shape["tris"], facecolors=BRASS, edgecolors=INK, linewidths=0.5, alpha=0.92))
    lines, folds = [], []
    for sq in shape["squares"]:
        lines += [[sq[i], sq[(i + 1) % 4]] for i in range(4)]
        d02, d13 = math.dist(sq[0], sq[2]), math.dist(sq[1], sq[3])
        folds.append([sq[0], sq[2]] if d02 <= d13 else [sq[1], sq[3]])
    ax.add_collection3d(Line3DCollection(lines, colors=CYAN_DARK, linewidths=0.9))
    ax.add_collection3d(Line3DCollection(folds, colors=CYAN_DARK, linewidths=0.5, linestyles="dotted"))
    _style3d(ax, lim, elev=18, azim=-40)


def jitterbug(data: dict, out: Path) -> None:
    """The Ring's gauge across the jitterbug, with the shape it reads drawn above each marked point."""
    pts, stations, peak, shapes = data["points"], data["stations"], data["peak"], data["shapes"]
    fig = plt.figure(figsize=(6.6, 4.5))
    ax = fig.add_axes([0.1, 0.11, 0.86, 0.5])
    ax.plot([p["r"] for p in pts], [p["v"] for p in pts], color=BARK, linewidth=1.6, zorder=2)
    for s in stations:
        ax.scatter([s["r"]], [s["v"]], s=34, color=CYAN, edgecolor=INK, linewidth=0.7, zorder=3)
    ax.scatter([peak["r"]], [peak["v"]], s=40, marker="D", color=BRASS, edgecolor=INK, linewidth=0.7, zorder=3)
    ax.set_xlabel("a / b, the jitterbug's ratio (vertices at the cyclic permutations of (0, ±a, ±b), edge fixed)")
    ax.set_ylabel("gauge reading, tetravolumes")
    ax.set_xlim(-0.03, 1.03)
    top = max(p["v"] for p in pts)
    ax.set_ylim(0, top * 1.12)
    ax.grid(axis="y", color=FOG, linewidth=0.8, zorder=0)
    # each shape sits above its own value of a/b, joined to its point by a thread
    fig.canvas.draw()
    to_fig = fig.transFigure.inverted()
    for i, s in enumerate(shapes):
        value = min(pts, key=lambda p: abs(p["r"] - s["r"]))["v"]
        x_mid = 0.2 + i * 0.22
        inset = fig.add_axes([x_mid - 0.1, 0.64, 0.2, 0.27], projection="3d")
        _shape(inset, s, 1.05)
        reading = f"{value:.2f}" if s["name"] == "hull peak" else f"{value:.3f}".rstrip("0").rstrip(".")
        ratio = f"{s['r']:.3f}".rstrip("0").rstrip(".")
        fig.text(x_mid, 0.955, s["name"], ha="center", fontsize=8.5, color=INK)
        fig.text(x_mid, 0.925, f"a/b = {ratio}  ·  {reading}", ha="center", fontsize=7.5, color=INK_SOFT)
        x_pt, y_pt = to_fig.transform(ax.transData.transform((s["r"], value)))
        fig.add_artist(matplotlib.lines.Line2D([x_mid, x_pt], [0.645, y_pt + 0.02], color=INK_SOFT, linewidth=0.6,
                                               linestyle=(0, (1, 2)), transform=fig.transFigure))
    save(fig, out / "fig_jitterbug.png")


def amodules(data: dict, out: Path) -> None:
    """Fuller's A quanta modules: one module named by its corners, the tetrahedron assembled, and all of them apart."""
    tet, modules = data["tetrahedron"], data["modules"]
    centre = [sum(v[k] for v in tet) / 4 for k in range(3)]
    colours = {1: BRASS, -1: SORREL}
    edges = [[tet[i], tet[j]] for i in range(4) for j in range(i + 1, 4)]
    fig = plt.figure(figsize=(7.0, 2.95))

    def faces(pts):
        return [[pts[a], pts[b], pts[c]] for a, b, c in ((0, 1, 2), (0, 1, 3), (0, 2, 3), (1, 2, 3))]

    # (a) one module and the four points that define it
    ax = fig.add_axes([0.0, 0.1, 0.33, 0.82], projection="3d")
    one = modules[0]["pts"]
    ax.add_collection3d(Line3DCollection(edges, colors=INK_SOFT, linewidths=0.6))
    ax.add_collection3d(Poly3DCollection(faces(one), facecolors=colours[modules[0]["hand"]], edgecolors=INK, linewidths=0.6, alpha=0.95))
    for (label, ha), p in zip((("O  centre", "left"), ("corner", "left"), ("edge midpoint", "left"), ("face centre", "right")), one):
        ax.scatter([p[0]], [p[1]], [p[2]], s=9, color=INK)
        ax.text(p[0], p[1], p[2], "  " + label + "  ", fontsize=7, color=INK, ha=ha, va="bottom")
    _style3d(ax, 1.1, elev=24, azim=-38)
    fig.text(0.02, 0.93, "(a) one module", fontsize=8.5, color=INK)

    for panel, spread in ((1, 0.0), (2, 1.0)):
        ax = fig.add_axes([0.33 * panel, 0.1, 0.33, 0.82], projection="3d")
        polys, cols = [], []
        for m in modules:
            # draw each module away along its face's outward direction, then a little towards its own corner,
            # so the six on a face fan apart
            pts = m["pts"]
            towards_face = [pts[3][k] - centre[k] for k in range(3)]
            towards_corner = [0.5 * (pts[1][k] + pts[2][k]) - pts[3][k] for k in range(3)]
            shift = [spread * (1.5 * towards_face[k] + 0.55 * towards_corner[k]) for k in range(3)]
            moved = [[p[k] + shift[k] for k in range(3)] for p in pts]
            polys += faces(moved)
            cols += [colours[m["hand"]]] * 4
        ax.add_collection3d(Poly3DCollection(polys, facecolors=cols, edgecolors=INK, linewidths=0.25, alpha=0.9))
        ax.add_collection3d(Line3DCollection(edges, colors=INK, linewidths=0.8))
        _style3d(ax, 1.55 if spread else 1.1, elev=24, azim=-38)
        fig.text(0.33 * panel + 0.02, 0.93, "(b) assembled" if panel == 1 else "(c) drawn apart, face by face", fontsize=8.5, color=INK)
    hands = {h: sum(1 for m in modules if m["hand"] == h) for h in (1, -1)}
    fig.text(0.47, 0.035, f"{hands[1]} of one hand", color=BARK_DARK, fontsize=8, ha="right",
             bbox=dict(boxstyle="round,pad=0.3", fc=BRASS, ec="none"))
    fig.text(0.53, 0.035, f"{hands[-1]} of the other", color="white", fontsize=8, ha="left",
             bbox=dict(boxstyle="round,pad=0.3", fc=SORREL, ec="none"))
    save(fig, out / "fig_amodules.png")


def counts(data: dict, out: Path) -> None:
    """Tetravolume denominators: arbitrary integer quadrays against tetrahedra on IVM nodes."""
    groups = (("arbitrary integer quadrays", data["integer"], BARK), ("lattice nodes (sums of neighbour moves)", data["ivm"], SORREL))
    dens = sorted({d for _, ds, _ in groups for d in ds} | {1, 2, 4})
    names = {1: "whole", 2: "in halves", 4: "in quarters"}
    fig, axes = plt.subplots(1, 2, figsize=(6.6, 2.7), sharey=True)
    for ax, (label, ds, colour) in zip(axes, groups):
        ys = [sum(1 for d in ds if d == den) for den in dens]
        bars = ax.bar(range(len(dens)), ys, width=0.62, color=colour, zorder=2)
        for bar, y in zip(bars, ys):
            ax.annotate(str(y), (bar.get_x() + bar.get_width() / 2, y), xytext=(0, 2), textcoords="offset points",
                        ha="center", fontsize=8, color=INK)
        ax.set_xticks(range(len(dens)))
        ax.set_xticklabels([names.get(d, f"in 1/{d}") for d in dens])
        fractional = sum(1 for d in ds if d != 1)
        ax.set_title(f"{label}\n{fractional} of {len(ds)} fractional", fontsize=8.5, color=INK, pad=6)
        ax.grid(axis="y", color=FOG, linewidth=0.8, zorder=0)
    axes[0].set_ylabel("tetrahedra in QuadMath's fixture")
    fig.tight_layout()
    save(fig, out / "fig_counts.png")


def quadrays(data: dict, out: Path) -> None:
    """QuadCraft's four basis quadrays, and the twelve neighbour moves that make the vector equilibrium."""
    basis, moves, ve_edges = data["basis"], data["moves"], data["veEdges"]
    fig = plt.figure(figsize=(7.0, 3.4))

    # (a) the basis rays to alternate corners of a cube, and the regular tetrahedron on their tips
    ax = fig.add_axes([0.0, 0.0, 0.46, 0.92], projection="3d")
    h = abs(basis[0]["xyz"][0])
    corners = [(x, y, z) for x in (-h, h) for y in (-h, h) for z in (-h, h)]
    cube_edges = [[p, q] for i, p in enumerate(corners) for q in corners[i + 1:] if abs(math.dist(p, q) - 2 * h) < 1e-9]
    ax.add_collection3d(Line3DCollection(cube_edges, colors=FOG_DARK, linewidths=0.6, linestyles="dashed"))
    tips = [b["xyz"] for b in basis]
    ax.add_collection3d(Line3DCollection([[tips[i], tips[j]] for i in range(4) for j in range(i + 1, 4)], colors=BRASS_DARK, linewidths=1.2))
    for name, b in zip("abcd", basis):
        x, y, z = b["xyz"]
        ax.quiver(0, 0, 0, x, y, z, color=BARK, linewidth=1.3, arrow_length_ratio=0.14)
        ax.text(x * 1.32, y * 1.32, z * 1.32, f"{name}  ({', '.join(str(v) for v in b['quadray'])})", fontsize=7.5, color=INK, ha="center")
    ax.scatter([0], [0], [0], s=10, color=INK)
    _style3d(ax, 0.95, elev=12, azim=-18)  # off the cube's face normal, so the four tips spread apart
    fig.text(0.02, 0.93, "(a) the four basis rays and their tetrahedron", fontsize=8.5, color=INK)

    # (b) the twelve neighbour moves from a node: the vector equilibrium, each neighbour with its address
    ax = fig.add_axes([0.48, 0.0, 0.52, 0.92], projection="3d")
    pts = [m["xyz"] for m in moves]
    ax.add_collection3d(Line3DCollection([[pts[i], pts[j]] for i, j in ve_edges], colors=CYAN_DARK, linewidths=0.9))
    ax.add_collection3d(Line3DCollection([[(0, 0, 0), p] for p in pts], colors=BARK, linewidths=0.5, alpha=0.6))
    for m in moves:
        x, y, z = m["xyz"]
        ax.scatter([x], [y], [z], s=12, color=BRASS, edgecolor=INK, linewidth=0.4)
        ax.text(x * 1.24, y * 1.24, z * 1.24, "".join(str(v) for v in m["quadray"]), fontsize=6.8, color=INK, ha="center", va="center")
    ax.scatter([0], [0], [0], s=14, color=INK)
    ax.text(0.18, -0.1, -0.3, "0000", fontsize=6.8, color=INK)
    _style3d(ax, 1.75, elev=35, azim=-45)  # down a three-fold axis, where no two neighbours overlap
    fig.text(0.5, 0.93, "(b) the twelve neighbour moves, labelled abcd", fontsize=8.5, color=INK)
    save(fig, out / "fig_quadrays.png")


def cube(data: dict, out: Path) -> None:
    """The cube on the tetrahedron's edges: the tetrahedron and four corner pieces, drawn together and apart."""
    tet, pieces = data["tetrahedron"], data["pieces"]
    fig = plt.figure(figsize=(6.6, 3.1))
    corners = [(x, y, z) for x in (-1, 1) for y in (-1, 1) for z in (-1, 1)]
    cube_edges = [[p, q] for i, p in enumerate(corners) for q in corners[i + 1:] if abs(math.dist(p, q) - 2) < 1e-9]

    def faces(pts):
        return [[pts[a], pts[b], pts[c]] for a, b, c in ((0, 1, 2), (0, 1, 3), (0, 2, 3), (1, 2, 3))]

    for panel, spread in ((0, 0.0), (1, 1.05)):
        ax = fig.add_axes([0.5 * panel, 0.12, 0.5, 0.82], projection="3d")
        if not spread:
            ax.add_collection3d(Line3DCollection(cube_edges, colors=INK, linewidths=0.9))
            ax.add_collection3d(Poly3DCollection(faces(tet), facecolors=BRASS, edgecolors=INK, linewidths=0.7, alpha=0.95))
        else:
            # one collection, so the pieces and the tetrahedron are depth-sorted together
            polys, cols = list(faces(tet)), [BRASS] * 4
            for piece in pieces:
                c = piece[0]
                polys += faces([[p[k] + spread * c[k] for k in range(3)] for p in piece])
                cols += [SORREL] * 4
            ax.add_collection3d(Poly3DCollection(polys, facecolors=cols, edgecolors=INK, linewidths=0.5, alpha=0.95))
        _style3d(ax, 1.55 if not spread else 2.25, elev=22 if not spread else 12, azim=-56 if not spread else -14)
    fig.text(0.02, 0.92, "(a) the tetrahedron on the cube's face diagonals", fontsize=8.5, color=INK)
    fig.text(0.52, 0.92, "(b) the corners drawn away", fontsize=8.5, color=INK)
    sums = f"{_frac(data['total'])}  =  {_frac(data['tet'])}  +  {len(data['corners'])} × {_frac(data['corners'][0])}   tetravolumes"
    fig.text(0.5, 0.04, sums, ha="center", fontsize=9, color=INK)
    save(fig, out / "fig_cube.png")


def schema(data: dict, out: Path) -> None:
    """How the repository is built: imports, shared code, the two games, and the paper, with the checks beneath."""
    fig = plt.figure(figsize=(7.2, 4.7))
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_xlim(-0.05, 10.45)
    ax.set_ylim(0, 6.6)
    ax.set_axis_off()

    def box(x, y, title, body, fc="white", ec=INK, w=2.1, h=0.86):
        ax.add_patch(FancyBboxPatch((x - w / 2, y - h / 2), w, h, boxstyle="round,pad=0.02,rounding_size=0.12",
                                    fc=fc, ec=ec, lw=0.9, zorder=2))
        ax.text(x, y + h / 2 - 0.2, title, ha="center", va="center", fontsize=7.8, weight="bold", color=INK, zorder=3)
        ax.text(x, y - 0.12, body, ha="center", va="center", fontsize=6.9, color=INK_SOFT, zorder=3, linespacing=1.25)
        return (x, y, w, h)

    def arrow(a, b, side_a="right", side_b="left", style="-|>", ls="solid", colour=INK, rad=0.0, label=None):
        def anchor(bx, side):
            x, y, w, h = bx
            return {"right": (x + w / 2, y), "left": (x - w / 2, y), "top": (x, y + h / 2), "bottom": (x, y - h / 2)}[side]
        p, q = anchor(a, side_a), anchor(b, side_b)
        ax.add_patch(FancyArrowPatch(p, q, arrowstyle=style, mutation_scale=8, lw=0.9, color=colour, linestyle=ls,
                                     connectionstyle=f"arc3,rad={rad}", zorder=1, shrinkA=2, shrinkB=2))
        if label:
            ax.text((p[0] + q[0]) / 2, (p[1] + q[1]) / 2 + 0.12, label, ha="center", fontsize=6.4, color=INK_SOFT, style="italic")

    for x, name in ((1.25, "upstream"), (3.85, "this repository"), (6.35, "the games"), (8.8, "the paper")):
        ax.text(x, 6.35, name, ha="center", fontsize=8.5, color=BARK, weight="bold")
    ax.add_patch(FancyBboxPatch((2.65, 1.7), 2.4, 4.35, boxstyle="round,pad=0.02,rounding_size=0.15", fc=FOG_LIGHT, ec="none", zorder=0))

    qc = box(1.25, 5.3, f"QuadCraft @{data['quadcraft']}", "quadray.js\nsynergetics.js", fc=PAPER)
    qm = box(1.25, 3.6, f"QuadMath @{data['quadmath']}", "quadray.py\nlinalg_utils.py", fc=PAPER)
    vendor = box(3.85, 5.45, "vendor/", "byte-for-byte copies,\npinned by Git blob id")
    port = box(3.85, 4.4, "lib/tetravolume.js", "the exact 5×5 tetravolume,\nported from QuadMath")
    grove = box(3.85, 3.35, "lib/grove-geometry.js", "jitterbug, lattice,\nA modules, ash")
    fixture = box(3.85, 2.3, "tests/fixtures/", "QuadMath's own answers,\ncomputed by its Python")
    build = box(6.35, 5.45, "tools/build.mjs", "splices the shared files\ninto each page")
    games = box(6.35, 4.2, "two single-page games", "field station (three.js)\nstorybook (canvas)", fc=BRASS_LIGHT)
    served = box(6.35, 2.95, "where they are played", "GitHub Pages,\nClaude artifacts")
    facts = box(8.8, 5.45, "tools/facts.mjs", "runs the same spliced code:\nnumbers, tokens, series")
    figs = box(8.8, 4.4, "make_figures.py", "figures from the series")
    template = box(8.8, 3.35, "docxology/template", "hydrates docs/manuscript/,\nrenders the PDF")
    stamp = box(8.8, 2.3, "PDF and its stamp", "digests of the PDF\nand of its sources", fc=BRASS_LIGHT)

    arrow(qc, vendor, label="copy")
    arrow(qm, vendor, rad=-0.15)
    arrow(qm, port, label="port")
    arrow(qm, fixture, rad=0.15, label="run")
    for src in (vendor, port, grove):
        arrow(src, build, rad=0.0)
    arrow(build, games, "bottom", "top")
    arrow(games, served, "bottom", "top")
    arrow(build, facts)
    arrow(facts, figs, "bottom", "top")
    arrow(figs, template, "bottom", "top")
    arrow(template, stamp, "bottom", "top")
    arrow(facts, template, "right", "right", rad=-0.42)
    ax.text(10.18, 4.4, "tokens", rotation=-90, ha="center", va="center", fontsize=6.4, color=INK_SOFT, style="italic")

    checks = box(5.1, 0.72, "local checks: tests/check.mjs, run on a clean export of each commit by tools/ci.mjs",
                 "copies against upstream  ·  the port against the fixture  ·  spliced blocks against their files\n"
                 "the geometry and the propositions  ·  every number against the code  ·  the PDF against its sources",
                 fc=SORREL_LIGHT, ec=SORREL, w=9.6, h=0.95)
    for target in (qm, fixture, served, stamp):
        x, y, w, h = target
        ax.add_patch(FancyArrowPatch((x, checks[1] + checks[3] / 2), (x, y - h / 2), arrowstyle="-|>", mutation_scale=7,
                                     lw=0.7, color=SORREL, linestyle=(0, (3, 2)), zorder=1, shrinkA=1, shrinkB=2))
    save(fig, out / "fig_schema.png")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out", default=str(PROJECT_ROOT / "output" / "figures"), help="directory to write into")
    parser.add_argument("--series", help="read the figure data from this file instead of running node")
    args = parser.parse_args(argv)
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    data = load_series(args.series)
    cover(data["cover"], out)
    schema(data["schema"], out)
    quadrays(data["quadrays"], out)
    counts(data["fixture"], out)
    cube(data["cube"], out)
    jitterbug(data["jitterbug"], out)
    amodules(data["aModules"], out)
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

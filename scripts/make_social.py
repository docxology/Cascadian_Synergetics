#!/usr/bin/env python3
"""Draw the jitterbug's gauge as an image for sharing, 2400 by 1350 (16:9).

Every number, address and DOI on it comes from ``node tools/facts.mjs`` (the gauge's sweep, its stations and the
largest hull from ``--series``; the play address and the archive's DOI from ``--tokens``), the same computation the
paper states and plots. It writes ``output/social/social-4-jitterbug.png``; the three frames of the games beside it come
from ``node scripts/capture_screenshots.mjs --set social``.

    python scripts/make_social.py [--out DIR]

Needs matplotlib; run it with the docxology/template interpreter, as the paper's figures are.
"""

from __future__ import annotations

import argparse
import json
import math
import shutil
import subprocess
import textwrap
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.lines  # noqa: E402
import matplotlib.pyplot as plt  # noqa: E402
from matplotlib.colors import LinearSegmentedColormap  # noqa: E402
from mpl_toolkits.mplot3d.art3d import Line3DCollection, Poly3DCollection  # noqa: E402

PROJECT_ROOT = Path(__file__).resolve().parent.parent

# The grove at night: the stillness lattice's brass, the jitterbug's cyan gaps, fog-blue shadows and ledger cream.
NIGHT, DUSK = "#14212a", "#27424c"
BRASS, BRASS_DEEP = "#f6c068", "#c18f2e"
CYAN = "#7fe3ff"
CREAM, MIST = "#f4eedc", "#b9c8c4"

plt.rcParams.update({"font.family": "DejaVu Sans", "svg.hashsalt": "cascadian-synergetics"})


def facts(flag: str) -> dict:
    node = shutil.which("node")
    if node is None:
        raise SystemExit("node is not on PATH; the image plots what tools/facts.mjs computes")
    done = subprocess.run([node, str(PROJECT_ROOT / "tools" / "facts.mjs"), flag], capture_output=True, text=True, check=False)
    if done.returncode != 0:
        raise SystemExit(f"tools/facts.mjs {flag} failed:\n{done.stderr}")
    return json.loads(done.stdout)


def reading(value: float, name: str) -> str:
    """A station's reading as the paper states it: whole volumes whole, the icosahedron and the peak to two places."""
    return str(round(value)) if abs(value - round(value)) < 1e-9 else f"{value:.2f}"


def shape(ax, s: dict) -> None:
    """One jitterbug: brass triangles that keep their edge, cyan gaps, and the fold the gauge reads."""
    ax.set_facecolor((0, 0, 0, 0))
    ax.add_collection3d(Poly3DCollection(s["tris"], facecolors=BRASS, edgecolors=BRASS_DEEP, linewidths=0.7, alpha=0.93))
    rims, folds = [], []
    for q in s["squares"]:
        rims += [[q[i], q[(i + 1) % 4]] for i in range(4)]
        folds.append([q[0], q[2]] if math.dist(q[0], q[2]) <= math.dist(q[1], q[3]) else [q[1], q[3]])
    for width, alpha in ((4.0, 0.15), (1.6, 1.0)):
        ax.add_collection3d(Line3DCollection(rims, colors=[(*matplotlib.colors.to_rgb(CYAN), alpha)], linewidths=width))
    ax.add_collection3d(Line3DCollection(folds, colors=CYAN, linewidths=0.7, linestyles="dotted"))
    for setter in (ax.set_xlim, ax.set_ylim, ax.set_zlim):
        setter(-1.05, 1.05)
    ax.set_box_aspect((1, 1, 1))
    ax.view_init(elev=18, azim=-40)
    ax.set_axis_off()


def draw(series: dict, tokens: dict, out: Path) -> Path:
    pts, stations, peak, shapes = series["points"], series["stations"], series["peak"], series["shapes"]
    by_name = {s["name"]: s for s in stations}
    ve, ico, octa = (by_name[n]["v"] for n in ("vector equilibrium", "icosahedron", "octahedron"))

    fig = plt.figure(figsize=(8, 4.5), dpi=300)
    ground = fig.add_axes([0, 0, 1, 1])
    ground.imshow([[i / 255] for i in range(256)], extent=(0, 1, 0, 1), origin="upper", aspect="auto",
                  cmap=LinearSegmentedColormap.from_list("night", [NIGHT, DUSK]))
    ground.set_axis_off()

    fig.text(0.05, 0.905, "The jitterbug breathes", fontsize=25, color=CREAM, family="DejaVu Serif", weight="bold", va="center")
    subtitle = (f"Fuller's vector equilibrium folds through the icosahedron to the octahedron. The games' own gauge reads "
                f"{reading(ve, 've')}, {reading(ico, 'ico')} and {reading(octa, 'octa')} tetravolumes at the three stations, "
                f"yet leaving the vector equilibrium its hull first swells to {reading(peak['v'], 'peak')}.")
    fig.text(0.05, 0.815, "\n".join(textwrap.wrap(subtitle, 118)), fontsize=8.6, color=MIST, va="center", linespacing=1.45)

    curve = fig.add_axes([0.08, 0.16, 0.88, 0.27])
    curve.set_facecolor((0, 0, 0, 0))
    xs, ys = [p["r"] for p in pts], [p["v"] for p in pts]
    for width, alpha in ((7, 0.08), (4, 0.18), (2, 1.0)):
        curve.plot(xs, ys, color=BRASS, linewidth=width, alpha=alpha, solid_capstyle="round", zorder=2)
    for s in stations:
        curve.scatter([s["r"]], [s["v"]], s=46, color=CYAN, edgecolor=NIGHT, linewidth=1, zorder=4)
    curve.scatter([peak["r"]], [peak["v"]], s=58, marker="D", color=BRASS, edgecolor=NIGHT, linewidth=1, zorder=4)
    curve.set_xlim(-0.03, 1.03)
    curve.set_ylim(0, max(ys) * 1.15)
    curve.set_xlabel("a / b, the jitterbug's ratio", color=MIST, fontsize=8)
    curve.set_ylabel("tetravolumes", color=MIST, fontsize=8)
    curve.tick_params(colors=MIST, labelsize=7)
    for side, spine in curve.spines.items():
        spine.set_visible(side in ("left", "bottom"))
        spine.set_color(MIST)
        spine.set_alpha(0.5)
    curve.grid(axis="y", color=MIST, alpha=0.12, linewidth=0.6)

    fig.canvas.draw()
    to_fig = fig.transFigure.inverted()
    for i, s in enumerate(shapes):
        value = min(pts, key=lambda p: abs(p["r"] - s["r"]))["v"]
        x_mid = 0.17 + i * 0.22
        shape(fig.add_axes([x_mid - 0.11, 0.5, 0.22, 0.33], projection="3d"), s)
        fig.text(x_mid, 0.545, s["name"], ha="center", fontsize=8.2, color=CREAM, va="top")
        fig.text(x_mid, 0.51, reading(value, s["name"]), ha="center", fontsize=9, color=BRASS, weight="bold", va="top")
        x_pt, y_pt = to_fig.transform(curve.transData.transform((s["r"], value)))
        fig.add_artist(matplotlib.lines.Line2D([x_mid, x_pt], [0.47, y_pt + 0.018], color=CREAM, alpha=0.35, linewidth=0.6,
                                               linestyle=(0, (1, 2.5)), transform=fig.transFigure))

    play = tokens["PLAY_URL"].removeprefix("https://").rstrip("/")
    name = fig.text(0.05, 0.035, "Cascadian Synergetics", fontsize=8.4, color=CREAM, weight="bold", va="center")
    fig.canvas.draw()   # place the address just after the name, however wide the name sets
    right = to_fig.transform((name.get_window_extent().x1, 0))[0]
    fig.text(right + 0.012, 0.035, f"·   play in a browser: {play}", fontsize=8, color=MIST, va="center")
    fig.text(0.96, 0.035, f"doi:{tokens['CONCEPT_DOI']}", fontsize=8, color=MIST, va="center", ha="right")

    out.mkdir(parents=True, exist_ok=True)
    path = out / "social-4-jitterbug.png"
    fig.savefig(path, dpi=300, metadata={"Software": None}, facecolor=NIGHT)
    plt.close(fig)
    return path


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out", default=str(PROJECT_ROOT / "output" / "social"), help="directory to write into")
    args = parser.parse_args()
    print(draw(facts("--series")["jitterbug"], facts("--tokens"), Path(args.out)))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

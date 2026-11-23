"""Write tests/fixtures/quadmath.json by running QuadMath's own code.

The answers in the fixture come from the vendored QuadMath sources in vendor/quadmath/
(bareiss_determinant_int, ace_tetravolume_5x5, integer_tetra_volume, IVM_NEIGHBOR_MOVES),
not from this repository. tests/check.mjs then holds the JavaScript port in
lib/tetravolume.js to every answer here, exactly.

    python3 -I tools/quadmath_fixtures.py

Standard library only. The vendored modules are loaded under their upstream package names
without importing the rest of the QuadMath package, which they do not need.
"""

from __future__ import annotations

import hashlib
import importlib.util
import json
import platform
import random
import sys
import types
from pathlib import Path

sys.dont_write_bytecode = True  # never leave __pycache__ inside vendor/

ROOT = Path(__file__).resolve().parent.parent
VENDOR = ROOT / "vendor" / "quadmath"
OUT = ROOT / "tests" / "fixtures" / "quadmath.json"
SEED = 20261123


def blob_id(data: bytes) -> str:
    return hashlib.sha1(b"blob %d\0" % len(data) + data).hexdigest()


def load_quadmath():
    for name in ("quadmath", "quadmath.core"):
        package = types.ModuleType(name)
        package.__path__ = [str(VENDOR)]
        sys.modules[name] = package
    loaded = {}
    for module, filename in (("quadmath.core.linalg_utils", "linalg_utils.py"), ("quadmath.core.quadray", "quadray.py")):
        spec = importlib.util.spec_from_file_location(module, VENDOR / filename)
        mod = importlib.util.module_from_spec(spec)
        sys.modules[module] = mod
        spec.loader.exec_module(mod)
        loaded[filename] = mod
    return loaded["linalg_utils.py"], loaded["quadray.py"]


def main() -> None:
    la, qr = load_quadmath()
    Q = qr.Quadray
    rng = random.Random(SEED)
    lock = json.loads((ROOT / "vendor" / "vendor.lock.json").read_text())
    source = next(s for s in lock["sources"] if s["name"] == "quadmath")

    def case(name, points):
        p = [Q(*pt) for pt in points]
        ace = qr.ace_tetravolume_5x5(*p)
        whole = qr.integer_tetra_volume(*p)
        return {"name": name, "points": [list(pt) for pt in points], "ace": [ace.numerator, ace.denominator], "integer": [whole.numerator, whole.denominator]}

    moves = [list(m) for m in qr.IVM_NEIGHBOR_MOVES]
    o = (0, 0, 0, 0)
    named = [
        case("unit IVM tetrahedron: the origin and three neighbours", [o, (2, 1, 1, 0), (2, 1, 0, 1), (2, 0, 1, 1)]),
        case("the four basis tips", [(1, 0, 0, 0), (0, 1, 0, 0), (0, 0, 1, 0), (0, 0, 0, 1)]),
        case("primitive tetrahedron: the origin and three basis tips", [o, (1, 0, 0, 0), (0, 1, 0, 0), (0, 0, 1, 0)]),
        case("frequency-two tetrahedron", [o, (4, 2, 2, 0), (4, 2, 0, 2), (4, 0, 2, 2)]),
        case("three points on one line and a fourth: flat", [o, (2, 1, 1, 0), (4, 2, 2, 0), (2, 1, 0, 1)]),
    ]

    def ivm_point(steps):
        a = [0, 0, 0, 0]
        for _ in range(steps):
            m = rng.choice(moves)
            a = [x + y for x, y in zip(a, m)]
        low = min(a)
        return tuple(x - low for x in a)

    random_integer = [case(f"integer quadrays {i}", [tuple(rng.randint(0, 6) for _ in range(4)) for _ in range(4)]) for i in range(120)]
    random_ivm = [case(f"IVM nodes {i}", [ivm_point(rng.randint(0, 6)) for _ in range(4)]) for i in range(120)]
    bareiss = []
    for i in range(60):
        n = 1 + i % 6
        m = [[rng.randint(-9, 9) for _ in range(n)] for _ in range(n)]
        if i % 10 == 9:
            m[-1] = list(m[0])  # a repeated row: determinant zero
        bareiss.append({"matrix": m, "det": la.bareiss_determinant_int(m)})

    fixture = {
        "about": "Answers computed by QuadMath's own code (vendor/quadmath/) for tests/check.mjs. Regenerate with python3 -I tools/quadmath_fixtures.py.",
        "source": {
            "repository": source["repository"],
            "commit": source["commit"],
            "blobs": {f"vendor/quadmath/{name}": blob_id((VENDOR / name).read_bytes()) for name in ("quadray.py", "linalg_utils.py")},
        },
        "python": platform.python_version(),
        "seed": SEED,
        "ivm_neighbor_moves": moves,
        "default_embedding": [list(r) for r in qr.DEFAULT_EMBEDDING],
        "named": named,
        "random_integer": random_integer,
        "random_ivm": random_ivm,
        "bareiss": bareiss,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(fixture, indent=1) + "\n")
    print(f"wrote {OUT.relative_to(ROOT)}: {len(named)} named, {len(random_integer)} integer, {len(random_ivm)} IVM, {len(bareiss)} determinants")


if __name__ == "__main__":
    main()

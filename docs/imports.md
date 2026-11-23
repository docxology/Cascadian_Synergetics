# What the station borrows from QuadCraft and QuadMath

The field station's coordinates, its self-checks and its counting come from two sibling projects in the same Synergetics suite. They arrive in two ways: QuadCraft's JavaScript is copied byte for byte, and a small piece of QuadMath's Python is ported to JavaScript and held to QuadMath's own answers.

| In the grove | Comes from | Arrives as |
|---|---|---|
| Lattice addresses, the Ring gauge's coordinates | QuadCraft `games/4d_generic/quadray.js`: `Quadray`, `fromCartesian`, `toCartesian` | verbatim, [`vendor/quadcraft/quadray.js`](../vendor/quadcraft/quadray.js) |
| The beads on the station's instrument rail, the notebook's "Station instruments" | QuadCraft `games/4d_generic/synergetics.js`: `verifyGeometricIdentities` | verbatim, [`vendor/quadcraft/synergetics.js`](../vendor/quadcraft/synergetics.js) |
| The tally's count, the Ring gauge's volume | QuadMath `src/quadmath/core/quadray.py`: `ace_tetravolume_5x5`, `IVM_NEIGHBOR_MOVES`; `linalg_utils.py`: `bareiss_determinant_int` | ported, [`lib/tetravolume.js`](../lib/tetravolume.js); the Python is vendored beside it for reference and for the fixture |

Both projects are by Daniel Ari Friedman under Apache-2.0; their licence texts and citation files travel with the copies in `vendor/`. QuadMath's manuscript is [doi:10.5281/zenodo.16887791](https://doi.org/10.5281/zenodo.16887791).

## How the copies stay honest

- **Pinned bytes.** [`vendor/vendor.lock.json`](../vendor/vendor.lock.json) names the upstream commit of each project and, for each file, its Git blob id. A blob id is the hash Git itself gives the file's bytes, so a copy matches upstream exactly when `git hash-object` here equals `git ls-tree <commit> <path>` there. `node tools/vendor.mjs` checks the copies offline; `node tools/vendor.mjs --upstream` also asks local clones of both projects whether the locked commits really hold those blobs.
- **One file per artifact, one home per file.** A Claude artifact is a single page, so `tools/build.mjs` splices `quadray.js`, `synergetics.js` and `tetravolume.js` into `src/field-station.html` between `/* ==== splice … ==== */` markers, inside the game's own script. The checks fail if any block differs from its file by a byte. Edit the file, never the block.
- **QuadMath answers, not ours.** [`tools/quadmath_fixtures.py`](../tools/quadmath_fixtures.py) loads the vendored Python and records its answers in [`tests/fixtures/quadmath.json`](../tests/fixtures/quadmath.json): five named tetrahedra, 120 with arbitrary integer quadrays, 120 built from IVM moves, and 60 integer determinants up to 6×6. The fixture records the blob ids it was computed from, and the checks refuse it if they no longer match the lock. The JavaScript port must reproduce every answer exactly.
- **Local CI, upstream included.** `node tools/ci.mjs` runs everything on a clean export of a commit. When `../QuadCraft` and `../QuadMath` exist beside the checkout (the GitVault layout), it also runs the upstream check and records `verified`, `failed` or `skipped` in the receipt. A skipped upstream check is written as skipped, never as a pass.

## Three conventions, two bridges

Three ways of writing quadrays meet in this repository. The checks pin down how they relate.

**QuadCraft.** `toCartesian` sends the basis quadrays to the cube corners (1, 1, 1), (−1, −1, 1), (−1, 1, −1), (1, −1, −1), divided by √2. Each basis vector is √(3/2) long, and the twelve IVM neighbour moves (the permutations of (2, 1, 1, 0)) are each 2 long: one sphere diameter, the edge of the unit tetrahedron.

**QuadMath.** `DEFAULT_EMBEDDING` is QuadCraft's map multiplied by √2, with the second and third components (b and c) exchanged. Volumes are unaffected: Tom Ace's 5×5 determinant reads the quadrays alone, and exchanging two labels only flips its sign.

**The compass.** The field station's compass uses four unit rays with the first pointing straight up, so three spread around the horizon. Its quadray of any point is √(3/2) times QuadCraft's quadray of the same point, after one fixed proper rotation, with the labels unchanged. The checks find that rotation and confirm the identity on 500 random points.

The lattice needs no bridge at all. `ivmLattice` builds axis-aligned face-centred cubic points, which is QuadCraft's own frame: scale world metres by 2 ÷ (lattice edge) and every node's QuadCraft quadray is whole. Those whole quadrays are the addresses the tally prompt shows. The world's origin, at the foot of the Ring, is 0 · 0 · 0 · 0.

## Why every count is whole

Mark four nodes and the tally clicks out a whole number. It is never a fraction, and that follows from the lattice, not from the numbers being integers.

The 5×5 determinant of four quadrays equals, up to sign, the 3×3 determinant of their edge vectors written as (a − d, b − d, c − d); QuadMath states this, and the fixture shows both of its methods agreeing on all 245 cases. Every step between IVM nodes is a sum of moves e_i − e_j, and in that projection those moves span the lattice generated by (1, −1, 0), (1, 0, −1) and (2, 1, 1), whose determinant is 4. Any three edge vectors between nodes therefore have a determinant that is a multiple of 4, and the tetravolume |det| ÷ 4 is whole.

Quadrays that are merely integers do not have this property: QuadMath's primitive tetrahedron, the origin and three basis tips, holds 1/4. In the fixture, 73 of the 120 arbitrary integer tetrahedra come out fractional and none of the 120 IVM tetrahedra do. The checks also mark 400 random four-node sets on the stillness lattice and confirm each count against the tetrahedron's ordinary volume.

## The Ring's gauge

Inside the Ring, the compass rim becomes a dial. It reads the jitterbug's volume, in tetrahedra of the jitterbug's own edge, as the sum of cones from the centre to its eight triangles and its six squares. Each square folds on its shorter diagonal, and each cone is counted by the 5×5 determinant on QuadCraft quadrays.

At the three named stations the dial reads 20 (vector equilibrium), 5√2 φ² ≈ 18.512 (icosahedron) and 4 (octahedron); the dots on the rim are those readings. Between the stations the reading is the volume of the struts' convex hull, checked against an independent hull computation. It is not monotone. Leaving the vector equilibrium, the hull first swells to about 20.44, near a/b = 0.86, before it falls through the icosahedron to the octahedron. The checks print the exact peak, and the dial's full scale is measured from the same sweep.

## QuadCraft's eight self-checks

`verifyGeometricIdentities` checks basis lengths, the tetrahedral angle, the origin, round trips, distance symmetry, the triangle inequality, the S3 constant and the 1 : 4 : 20 volume ratios. The station runs it once at load; each result lights one bead on the brass rail by the station door and one lamp in the notebook. The last two checks compare constants with their definitions, so they confirm the constants rather than measure anything. The grove's volumes are measured by this repository's own checks, above.

## Updating the imports

With fresh clones of QuadCraft and QuadMath beside this checkout:

```bash
node tools/vendor.mjs --update
```

```bash
python3 -I tools/quadmath_fixtures.py
```

```bash
node tools/build.mjs
```

```bash
node tests/check.mjs
```

`--update` copies each file from the clone's `HEAD`; pass `--commit-quadcraft SHA` or `--commit-quadmath SHA` to pin another commit, and `--clone-quadcraft PATH` or `--clone-quadmath PATH` for clones elsewhere. Commit `vendor/`, the fixture, `src/` and the rebuilt pages together.

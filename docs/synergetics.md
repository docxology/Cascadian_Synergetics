# The geometry in the grove

Everything below is drawn from the code and checked by `tests/check.mjs` or by the field station's in-browser hooks. The coordinates and the counting come from QuadCraft and QuadMath; [imports.md](imports.md) says how.

## Tetravolumes and the cube

Fuller measured volume in regular tetrahedra. Take the tetrahedron whose edges are the face diagonals of a cube: the cube holds 3 of it. The rest of the cube is four trirectangular corner pieces, each holding one half:

    cube 3 = tetrahedron 1 + 4 × ½

When an incursion resolves, the cube's edges fade, the inscribed tetrahedron (vertices at alternate corners, `TET_V`) stays, and the four corner pieces fly off. Their edges meet at right angles, so the right angles leave the grove with them.

For reference, in the same units: octahedron 4, rhombic dodecahedron 6, vector equilibrium 20, and the icosahedron the jitterbug passes through, 5√2 φ² ≈ <!-- n:icosa2 -->18.51<!-- /n -->. The checks also count the cube with Tom Ace's 5×5 determinant on quadrays, and get the same 1 + 4 × ½.

## The jitterbug

The vector equilibrium (cuboctahedron) at the Cathedral Ring is built from eight triangles that never change size. The code places its twelve vertices at the cyclic permutations of (0, ±a, ±b) and scales so the edge stays fixed:

| a / b | Shape |
|-------|-------|
| 1 | vector equilibrium: radius equals edge, six square gaps |
| 1/φ ≈ <!-- n:invPhi -->0.618<!-- /n --> | icosahedron: the square gaps close into pairs of triangles |
| 0 | octahedron: the twelve vertices meet in pairs |

Each triangle turns about its own octant axis as `a` shrinks, which is the jitterbug's twist. The Ring's breathing range grows with the patrol's progress; the square gaps glow cyan while it is stiff.

Step inside the Ring and the compass rim turns into a dial that reads the jitterbug's volume as it breathes, with dots at the octahedron (4), the icosahedron (<!-- n:icosa2 -->18.51<!-- /n -->) and the vector equilibrium (20). Between those stations it reads the struts' convex hull, which first swells a little past 20 before it falls; [imports.md](imports.md#the-rings-gauge) has the measurement.

## Quadray coordinates

Four unit rays run from the centre of a regular tetrahedron to its corners. They sum to zero and every pair meets at the tetrahedral angle (cosine −1/3). Any point is a non-negative mix of them, written with one of the four values at zero.

The field station's compass shows your position relative to the Ring this way. With the four rays `q_i` as unit vectors, the conversion is

    α_i = ¾ (P · q_i),   then subtract the smallest α from all four

and the inverse is `P = Σ α_i q_i`. Subtracting a constant changes nothing, because the rays sum to zero. The compass draws three of the rays from above, with the fourth pointing up through its brass centre, and marks in scarlet whichever ray currently reads zero.

The lattice uses QuadCraft's convention instead, whose rays point at alternate corners of a cube and are √(3/2) long. The two agree up to that factor and one fixed rotation, which the checks confirm.

## The isotropic vector matrix

Stand still in the field station and a lattice appears around you: face-centred cubic points, each joined to its twelve nearest neighbours by equal edges. It fills space with tetrahedra and octahedra together, the octet truss. The lattice snaps to its own period, so it stays fixed in the world while you look around. `__fs.ivmCheck()` reports twelve edges at the centre node and a single edge length. The finale opens a larger copy through the whole Ring.

Every node has an address: its quadray in QuadCraft's convention, with one lattice edge as two units and the foot of the Ring as 0 · 0 · 0 · 0. Face a node and the action button shows it. Neighbouring addresses differ by one of QuadMath's twelve moves, the permutations of (2, 1, 1, 0).

## Counting in the lattice

Mark four nodes and the tetrahedron between them lights up while a brass counter clicks once for each tetravolume, using QuadMath's exact 5×5 determinant on the four addresses. However the four are chosen, the count is a whole number, or 0 when they lie in one plane. Integer quadrays alone would not guarantee that; the lattice does. [imports.md](imports.md#why-every-count-is-whole) has the reason, and the notebook keeps the last two dozen counts.

## Ash

The ash that drifts over the station falls in tiny vector equilibria, built from the jitterbug at its widest: eight triangles and six squares, 20 tetravolumes each. The checks rebuild a flake and measure it.

## Tensegrity masts

Each mast is three stacked three-strut prisms. In every stage the top triangle is turned 150° from the bottom one; struts join each bottom corner to its turned top corner, and cables close both triangles and run from each bottom corner to its nearer top corner. No strut touches another. Slack masts sag and lean; each clean pluck takes up a third of the slack. When the ground hums, a taut mast's cables shiver fast and it rings its three notes as a chord; a slack one rattles.

## Geodesic domes

The station is a frequency-two subdivision of the icosahedron, every face split into four with the new vertices pushed out to the sphere, trimmed at its equator. The lookout's lamp cab is the plain icosahedron's twelve vertices and thirty struts.

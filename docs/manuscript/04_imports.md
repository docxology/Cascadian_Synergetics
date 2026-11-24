# What the grove borrows {#sec:imports}

The coordinates, the self-checks and the counting in both games come from two
sibling projects in the same synergetics suite, QuadCraft [@quadcraft] and
QuadMath [@quadmath]. They arrive in two ways ([@tbl:imports]). QuadCraft's
JavaScript is copied byte for byte. A small piece of QuadMath's Python is
ported to JavaScript and held to QuadMath's own answers.

| In the grove | Comes from | Arrives as |
|:--|:--|:--|
| Lattice addresses; the gauge's coordinates | QuadCraft `quadray.js` | a verbatim copy |
| The beads on the instrument rail | QuadCraft `synergetics.js` | a verbatim copy |
| The tally's count; the gauge's volume | QuadMath `quadray.py` and `linalg_utils.py` | a JavaScript port, tested against QuadMath |
| The jitterbug, the lattice, the ash, the A modules | this repository, `lib/grove-geometry.js` | shared by both games |

: Where each piece of the games' geometry comes from. {#tbl:imports}

## Pinned bytes {#sec:pinned}

A lock file names the upstream commit of each project, {{QUADCRAFT_COMMIT}} for
QuadCraft and {{QUADMATH_COMMIT}} for QuadMath, and gives each copied file its
Git blob identifier. A blob identifier is the hash Git itself gives a file's
bytes, so a copy matches upstream exactly when the hash of the file here equals
the identifier that the locked commit lists for its path there. The tests check
every copy against the lock offline. When clones of both projects sit beside
the repository, the local CI also asks those clones whether the locked commits
hold exactly those blobs, and records the answer as verified, failed or
skipped; a skip is never written as a pass.

A game here is a single page, so a build step splices the two QuadCraft files,
the ported tetravolume and the shared geometry into both pages between marked
comments. The tests fail if any spliced block differs by a byte from its file,
so the file is the one place to edit.

## QuadMath's answers, not ours {#sec:fixture}

The port covers QuadMath's exact integer determinant, its
${{ACE_ORDER}}\times{{ACE_ORDER}}$ tetravolume ([@eq:ace]) and its list of
neighbour moves. To keep the port honest, the vendored Python itself is run to
record its answers in a fixture: {{FIXTURE_NAMED}} named tetrahedra,
{{FIXTURE_INTEGER}} with arbitrary integer quadrays, {{FIXTURE_IVM}} built from
lattice moves, and {{FIXTURE_DETS}} integer determinants of order up to
{{FIXTURE_MAX_ORDER}}. The fixture records the blob identifiers it was
computed from, and the tests refuse it if they no longer match the lock. The
JavaScript port must reproduce every answer exactly, as reduced fractions, and
QuadMath's own two volume methods must agree on every case. Among the named
tetrahedra, the unit lattice tetrahedron holds {{UNIT_IVM_VOLUME}}, the
primitive one ${{PRIMITIVE_TEX}}$, and the tetrahedron of frequency two
{{FREQ_TWO_VOLUME}}.

## Three conventions, two bridges {#sec:conventions}

Three ways of writing quadrays meet in the repository, and the tests pin down
how they relate. QuadCraft's map sends its basis quadrays to alternate corners
of a cube, scaled so that each basis vector is $\sqrt{3/2}$ long and each
neighbour move is {{IVM_MOVE_LENGTH}} long, one sphere diameter. QuadMath's default embedding
is QuadCraft's map multiplied by $\sqrt{2}$, with the second and third
components exchanged; volumes are unaffected, because [@eq:ace] reads the
quadrays alone and exchanging two labels only flips the determinant's sign. The
field station's compass uses unit rays with the first pointing straight up, and
its quadray of any point is $\sqrt{3/2}$ times QuadCraft's quadray of the same
point after one fixed proper rotation, with the labels unchanged; the tests find
that rotation and confirm the identity on random points.

The lattice needs no bridge. Built axis-aligned, it is in QuadCraft's own
frame, and scaling world lengths by two over the strut makes every node's
QuadCraft quadray whole. QuadCraft's own {{QUADCRAFT_CHECKS}} self-checks
(basis lengths, the tetrahedral angle, the origin, round trips, distance
symmetry, the triangle inequality, the synergetics constant and the classic
volume ratios) pass in the tests and again in the field station as it loads.

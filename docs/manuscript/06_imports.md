# What the grove borrows {#sec:imports}

The coordinates, the self-checks and the counting in both games come from two
sibling projects in the same synergetics suite, QuadCraft [@quadcraft] and
QuadMath [@quadmath]. They arrive in two ways ([@tbl:imports]). QuadCraft's
JavaScript is copied byte for byte. A small piece of QuadMath's Python is
ported to JavaScript and held to QuadMath's own answers.

| In the grove | Comes from | Arrives as |
|:-----------------|:------------------------|:-----------|
| Lattice addresses; the gauge's coordinates | QuadCraft `quadray.js` | a verbatim copy |
| The beads on the instrument rail | QuadCraft `synergetics.js` | a verbatim copy |
| The tally's count; the gauge's volume | QuadMath `quadray.py` and `linalg_utils.py` | a JavaScript port, tested against QuadMath |
| The jitterbug, the lattice, the ash, the A modules | this repository's `lib/grove-geometry.js` | shared by both games |

: Where each piece of the games' geometry comes from. {#tbl:imports}

## Pinned bytes {#sec:pinned}

::: {.definition #def:blob title="Git blob identifier"}
Git names the bytes $f$ of a file by the hash

$$
\operatorname{id}(f) = \operatorname{SHA\text{-}1}\bigl(\,\mathtt{blob}\ \langle\lvert f\rvert\rangle\ \mathtt{NUL}\ f\,\bigr),
$$ {#eq:blob}

where $\langle\lvert f\rvert\rangle$ is the length of $f$ in bytes written in
decimal, $\mathtt{NUL}$ is a zero byte and the parts are concatenated
[@chacon2014].
:::

A lock file names the upstream commit of each project, {{QUADCRAFT_COMMIT}} for
QuadCraft and {{QUADMATH_COMMIT}} for QuadMath, and gives each copied file its
blob identifier. A copy matches upstream exactly when [@eq:blob] of the file
here equals the identifier that the locked commit lists for its path there. The
tests check every copy against the lock offline. When clones of both projects
sit beside the repository, the local CI also asks those clones whether the
locked commits hold exactly those blobs, and records the answer as verified,
failed or skipped; a skip is never written as a pass. The copies are spliced
into both games as [@sec:architecture] describes.

## QuadMath's answers, not ours {#sec:fixture}

The port covers QuadMath's exact integer determinant, its
${{ACE_ORDER}}\times{{ACE_ORDER}}$ tetravolume ([@prop:ace]) and its list of
neighbour moves. To keep the port honest, the vendored Python itself is run to
record its answers in a fixture: {{FIXTURE_NAMED}} named tetrahedra,
{{FIXTURE_INTEGER}} with arbitrary integer quadrays, {{FIXTURE_IVM}} built from
lattice moves, and {{FIXTURE_DETS}} integer determinants of order up to
{{FIXTURE_MAX_ORDER}}. The fixture records the blob identifiers it was
computed from, and the tests refuse it if they no longer match the lock. The
JavaScript port must reproduce every answer exactly, as reduced fractions, and
QuadMath's own two volume methods, [@eq:ace] and the projected determinant of
[@eq:projection], must agree on every case. Among the named tetrahedra, the
unit lattice tetrahedron holds {{UNIT_IVM_VOLUME}}, the primitive one
${{PRIMITIVE_TEX}}$, and the tetrahedron of frequency two
{{FREQ_TWO_VOLUME}}.

## Three conventions, two bridges {#sec:conventions}

Three ways of writing quadrays meet in the repository: QuadCraft's, QuadMath's
default embedding, and the field station's compass of [@def:quadray]. The tests
pin down how they relate.

::: {.proposition #prop:bridges title="Two bridges"}
Write $x_{\mathrm{QC}}$ for QuadCraft's map from quadrays to points,
$x_{\mathrm{QM}}$ for QuadMath's default embedding, $q_{\mathrm{QC}}$ for
QuadCraft's quadray of a point and $\alpha$ for the compass quadray of
[@eq:quadray]. Then

$$
x_{\mathrm{QM}}(a, b, c, d) = \sqrt{2}\; x_{\mathrm{QC}}(a, c, b, d), \qquad
\alpha(P) = \sqrt{3/2}\; q_{\mathrm{QC}}(R\,P),
$$ {#eq:bridges}

for one fixed proper rotation $R$, with the labels of the four rays unchanged.
:::

QuadCraft's map sends its basis quadrays to alternate corners of a cube, scaled
so that each basis vector is $\sqrt{3/2}$ long and each neighbour move is
{{IVM_MOVE_LENGTH}} long, one sphere diameter. Volumes do not feel the first
bridge, because [@eq:ace] reads the quadrays alone and exchanging two labels
only flips the determinant's sign. The tests find the rotation of the second
bridge and confirm the identity on random points.

The lattice needs no bridge. Built axis-aligned, it is in QuadCraft's own
frame, and scaling world lengths by two over the strut makes every node's
QuadCraft quadray whole ([@prop:addresses]). QuadCraft's own
{{QUADCRAFT_CHECKS}} self-checks (basis lengths, the tetrahedral angle, the
origin, round trips, distance symmetry, the triangle inequality, the
synergetics constant and the classic volume ratios) pass in the tests and again
in the field station as it loads.

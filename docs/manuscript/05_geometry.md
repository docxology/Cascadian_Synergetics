# The geometry in the grove {#sec:geometry}

Everything in this section is drawn from the code both games run. Definitions
fix the terms. Each proposition states a result that the repository's tests
check, followed by the reason it holds where the reason is short;
[@prop:swell] is a measurement, and its reason is the measurement itself. The
volumes are collected in [@tbl:volumes], and the check behind each statement is
named in [@tbl:claims].

| Solid | Tetravolume | In the grove | Stated in |
|:------------------|:-----------|:-------------------|:----------|
| regular tetrahedron | {{TET_VOLUME}} | the unit of every count | [@def:tetravolume] |
| unit lattice tetrahedron | {{UNIT_IVM_VOLUME}} | the tally's smallest count | [@prop:ace] |
| QuadMath's primitive tetrahedron | ${{PRIMITIVE_TEX}}$ | off the lattice | [@prop:integer] |
| tetrahedron of frequency two | {{FREQ_TWO_VOLUME}} | QuadMath's fixture | [@sec:fixture] |
| A module | ${{A_MODULE_SHARE_TEX}}$ | the ants' slivers | [@prop:amodules] |
| cube on the tetrahedron's edges | {{CUBE_VOLUME}} | the incursions | [@prop:cube] |
| octahedron | {{OCTA_VOLUME}} | the jitterbug closed | [@prop:stations] |
| icosahedron | $5\sqrt{2}\,\varphi^{2} \approx {{ICOSA3}}$ | the jitterbug at $a/b = 1/\varphi$ | [@prop:stations] |
| vector equilibrium | {{VE_VOLUME}} | the jitterbug open; the ash | [@prop:stations] |
| largest hull on the way | {{HULL_PEAK}} | the dial's full scale | [@prop:swell] |

: The volumes in the grove, in tetravolumes, each computed by the games' code. {#tbl:volumes}

## Tetravolumes and quadrays {#sec:quadrays}

::: {.definition #def:tetravolume title="Tetravolume"}
The tetravolume of a solid $K$ is its volume measured in regular tetrahedra
whose edge $E$ is the unit of length:

$$
V_{\triangle}(K) = \frac{\operatorname{vol}(K)}{E^{3}/(6\sqrt{2})}
= \frac{6\sqrt{2}}{E^{3}}\,\operatorname{vol}(K).
$$ {#eq:tetravolume}

The regular tetrahedron of edge $E$ holds {{TET_VOLUME}}.
:::

::: {.definition #def:quadray title="Quadray coordinates"}
Let $q_0, \dots, q_3$ be unit vectors from the centre of a regular tetrahedron
to its corners, so that $\sum_i q_i = 0$ and $q_i \cdot q_j = -\tfrac{1}{3}$
for $i \neq j$. The quadray of a point $P$ is the non-negative quadruple

$$
\alpha_i = \tfrac{3}{4}\,(P \cdot q_i) - \min_j \tfrac{3}{4}\,(P \cdot q_j),
\qquad P = \sum_i \alpha_i\, q_i ,
$$ {#eq:quadray}

whose least entry is zero. Adding the same amount to all four entries leaves
$P$ where it is, because the rays sum to zero.
:::

The field station's compass shows the player's position relative to the Ring
this way. The lattice uses QuadCraft's convention instead, whose basis rays
point at alternate corners of a cube and are $\sqrt{3/2}$ long
([@fig:quadrays]a) [@quadcraft]; [@prop:bridges] relates the two.

## The isotropic vector matrix {#sec:ivm}

::: {.definition #def:ivm title="Isotropic vector matrix"}
With strut length $E$ and $s = E/\sqrt{2}$, the isotropic vector matrix is the
face-centred cubic set

$$
\Lambda = \bigl\{\, s\,(i, j, k) \;:\; i, j, k \in \mathbb{Z},\ i + j + k \equiv 0 \pmod{2} \,\bigr\},
$$ {#eq:ivm}

each point joined by a strut to its {{IVM_MOVES}} nearest neighbours, all at
distance $E$.
:::

The isotropic vector matrix fills space with tetrahedra and octahedra together,
the octet truss [@fuller1975]. The field station's stillness lattice is a ball
of it {{LATTICE_RADIUS}} m in radius with struts {{LATTICE_EDGE}} m long:
{{LATTICE_NODES}} nodes and {{LATTICE_STRUTS}} struts. It snaps to its own
period, so it stays fixed in the world while the player turns.

::: {.definition #def:address title="Lattice address"}
The address of a node $x \in \Lambda$ is QuadCraft's quadray of the scaled
point $\tfrac{2}{E}\,x$, so that one strut is two units long and the foot of
the Cathedral Ring is $(0,0,0,0)$.
:::

::: {.proposition #prop:addresses title="Whole addresses"}
Every node's address is a quadruple of integers, and the addresses of two
neighbouring nodes differ, once normalised, by one of QuadMath's
{{IVM_MOVES}} neighbour moves, the distinct permutations of $(2,1,1,0)$.
:::

On the scaled lattice every coordinate is $\sqrt{2}$ times an integer, and
QuadCraft's map adds the positive parts of the coordinates in fixed
combinations and divides by $\sqrt{2}$, so every entry of an address is an
integer. A strut along $s\,(1,1,0)$ maps to $(2,0,1,1)$, and the others follow
by symmetry. The tests confirm both claims across the whole stillness lattice,
and again after shifting it by whole periods as it is when it appears around a
ranger ([@fig:quadrays]b).

![Quadray coordinates as the lattice uses them. (a) QuadCraft's four basis rays run from the centre to alternate corners of a cube (dashed), and their tips are the corners of a regular tetrahedron. (b) From any node of the isotropic vector matrix, the {{IVM_MOVES}} neighbour moves of [@prop:addresses] reach the corners of a vector equilibrium; each neighbour is labelled with its address $abcd$. Drawn down a three-fold axis, where no two neighbours overlap. Coordinates computed by QuadCraft's own code as the games run it.](../../output/figures/fig_quadrays.png){#fig:quadrays width=96%}

## Counting tetravolumes exactly {#sec:tetravolume}

::: {.proposition #prop:ace title="Tom Ace's determinant"}
If $p_k = (a_k, b_k, c_k, d_k)$, $k = 0, \dots, 3$, are the addresses of four
nodes, the tetravolume of the tetrahedron they span, with the strut as the unit
edge, is

$$
V = \frac{1}{4}\left|\det M\right|, \qquad
M = \begin{pmatrix}
a_0 & b_0 & c_0 & d_0 & 1\\
a_1 & b_1 & c_1 & d_1 & 1\\
a_2 & b_2 & c_2 & d_2 & 1\\
a_3 & b_3 & c_3 & d_3 & 1\\
1 & 1 & 1 & 1 & 0
\end{pmatrix}.
$$ {#eq:ace}
:::

QuadMath attributes the formula to Tom Ace and implements it exactly
[@quadmath]. For integer quadrays the games compute $\det M$ by Bareiss's
fraction-free elimination [@bareiss1968] in arbitrary-precision integers and
return $V$ as a reduced fraction. The unit tetrahedron of the lattice, the
origin and three neighbour moves, holds {{UNIT_IVM_VOLUME}}. The tests hold the
port to QuadMath's own answers on {{FIXTURE_CASES}} tetrahedra
([@sec:fixture]) and confirm, on {{TALLY_SAMPLES}} random sets of four nodes,
that $V$ agrees with [@eq:tetravolume] applied to the tetrahedron's ordinary
volume.

## Why every count is whole {#sec:whole}

::: {.proposition #prop:whole title="Whole counts"}
For any four nodes of the isotropic vector matrix, the tetravolume of
[@eq:ace] is a non-negative integer.
:::

Subtract the fourth column of $M$ from the first three and expand along the
last row; then subtract the first row from the other three and expand along
the last column. Up to sign, $\det M$ is the $3 \times 3$ determinant of the
edge vectors $p_k - p_0$ under the projection $\pi$,

$$
\pi(a, b, c, d) = (a - d,\ b - d,\ c - d), \qquad
\det M = \pm \det\bigl(\pi(p_1 - p_0),\ \pi(p_2 - p_0),\ \pi(p_3 - p_0)\bigr).
$$ {#eq:projection}

Every step between nodes is a sum of neighbour moves ([@prop:addresses]), and
under $\pi$ the moves generate exactly the lattice whose basis is the rows of

$$
B = \begin{pmatrix} 1 & -1 & 0\\ 1 & 0 & -1\\ 2 & 1 & 1 \end{pmatrix},
\qquad \det B = {{LATTICE_DET}} .
$$ {#eq:basis}

Each projected edge vector is therefore $n B$ for some row $n$ of integers, the
determinant in [@eq:projection] is $\det B$ times an integer, and since
$\det B$ is exactly the divisor in [@eq:ace], $V$ is whole. The tests confirm
that the projected moves generate exactly this lattice, and that all
{{TALLY_SAMPLES}} random marks on the stillness lattice count whole.

::: {.proposition #prop:integer title="Integer coordinates are not enough"}
Whole counts come from the lattice, not from integer coordinates. QuadMath's
primitive tetrahedron, the origin and three of the basis tips, holds
${{PRIMITIVE_TEX}}$. Among {{FIXTURE_INTEGER}} tetrahedra with arbitrary
integer quadrays in QuadMath's fixture, {{INT_FRACTIONAL}} come out
fractional, against {{IVM_FRACTIONAL}} of {{FIXTURE_IVM}} built from lattice
moves ([@fig:counts]).
:::

![Denominators of the tetravolumes in QuadMath's fixture. Left, tetrahedra with arbitrary integer quadrays come out whole, in halves or in quarters. Right, tetrahedra whose corners are lattice nodes always come out whole, as [@prop:whole] requires. Computed by the vendored QuadMath and reproduced exactly by the games' port.](../../output/figures/fig_counts.png){#fig:counts width=86%}

## The cube {#sec:cube}

::: {.proposition #prop:cube title="The cube holds three"}
The cube whose face diagonals are the edges of a regular tetrahedron holds
{{CUBE_VOLUME}} tetravolumes: the tetrahedron itself, and {{CUBE_CORNERS}}
trirectangular corner pieces of ${{CUBE_CORNER_TEX}}$ each,

$$
{{CUBE_VOLUME}} = {{TET_VOLUME}} + {{CUBE_CORNERS}} \times {{CUBE_CORNER_TEX}} .
$$ {#eq:cube}
:::

A cube of edge $c$ has volume $c^{3}$. Each corner piece is a right
tetrahedron with three legs of length $c$, of volume $c^{3}/6$, and the
tetrahedron is what remains, $c^{3} - 4\,c^{3}/6 = c^{3}/3$. Each corner is
therefore half the tetrahedron, and the cube three times it. The tests measure
this twice, once from ordinary volumes and once with [@eq:ace] on QuadCraft
quadrays ([@fig:cube]). When an incursion resolves in either game, the cube's
edges fade, the inscribed tetrahedron stays, and the corner pieces fly off.
Their edges meet at right angles, so the right angles leave the grove with
them.

![[@prop:cube], drawn by the games' code. (a) The regular tetrahedron whose edges are the face diagonals of a cube. (b) The rest of the cube is {{CUBE_CORNERS}} trirectangular corner pieces, drawn away from the tetrahedron; each holds ${{CUBE_CORNER_TEX}}$, so the cube holds {{CUBE_VOLUME}}. These are the pieces an incursion sheds when it resolves.](../../output/figures/fig_cube.png){#fig:cube width=86%}

## The jitterbug and the Ring's gauge {#sec:jitterbug}

::: {.definition #def:jitterbug title="The jitterbug"}
For $r = a/b \in [0, 1]$, the jitterbug $J(r)$ has the vertices

$$
\frac{E}{e(r)}\;\sigma(0,\ \pm r,\ \pm 1), \qquad e(r) = \sqrt{r^{2} + 1 + (r - 1)^{2}},
$$ {#eq:jitterbug}

where $\sigma$ runs over the cyclic permutations of the three coordinates. They
are joined into eight equilateral triangles of edge $E$ and six four-sided
gaps.
:::

At $r = 1$ the jitterbug is the vector equilibrium; at
$r = 1/\varphi \approx {{INV_PHI}}$ it is the icosahedron, each gap closed into
a pair of triangles; and at $r = 0$ it is the octahedron, its vertices meeting
in pairs [@fuller1975]. The tests confirm that the triangles stay equilateral
with edge $E$ across the motion and that the three named shapes are what they
should be.

::: {.definition #def:gauge title="The Ring's gauge"}
The gauge reads

$$
G(r) = \sum_{T} V_{\triangle}(O, T) \;+\; \sum_{S} \bigl( V_{\triangle}(O, S^{+}) + V_{\triangle}(O, S^{-}) \bigr),
$$ {#eq:gauge}

where $O$ is the centre, $T$ runs over the eight triangles, each gap $S$ is
folded on its shorter diagonal into the triangles $S^{+}$ and $S^{-}$, and each
cone from $O$ is counted by [@eq:ace] on QuadCraft quadrays.
:::

::: {.proposition #prop:stations title="The stations"}
At the named stations the gauge reads the tetravolumes of the vector
equilibrium, the icosahedron and the octahedron:

$$
G(1) = {{VE_VOLUME}}, \qquad G(1/\varphi) = 5\sqrt{2}\,\varphi^{2} \approx {{ICOSA3}}, \qquad G(0) = {{OCTA_VOLUME}} .
$$ {#eq:stations}
:::

The icosahedron of edge $E$ has volume $\tfrac{5}{6}\,\varphi^{2}E^{3}$, and
[@eq:tetravolume] multiplies it by $6\sqrt{2}/E^{3}$. The vector equilibrium
and the octahedron follow the same way from their volumes,
$\tfrac{5}{3}\sqrt{2}\,E^{3}$ and $\tfrac{1}{3}\sqrt{2}\,E^{3}$. The tests read
the gauge at the three stations.

::: {.proposition #prop:swell title="The hull swells, measured"}
Between the stations the folded gaps make $G(r)$ the volume of the convex hull
of $J(r)$, which the tests confirm against an independent hull computation.
Measured at {{SWEEP_POINTS}} evenly spaced values of $r$, $G$ is not monotone:
leaving the vector equilibrium it first rises, to {{HULL_PEAK}} near
$r = {{HULL_PEAK_AT}}$, and only then falls through the icosahedron to the
octahedron ([@fig:jitterbug]).
:::

The named stations step down in volume; the path between them, measured this
way, does not. The dial's full scale is taken from the same sweep. The reading
belongs to this parametrization and this measurement: between the stations the
gaps are skew, their diagonals do not meet, and folding them on the longer
diagonal instead would read differently, as the tests confirm. The ash that drifts over the field station falls in
tiny vector equilibria built from the jitterbug at $r = 1$, eight triangles and
six squares closing {{VE_VOLUME}} tetravolumes, which the tests rebuild and
measure.

![The Ring's gauge across the jitterbug ([@def:gauge]). Below, the reading at {{SWEEP_POINTS}} evenly spaced values of $a/b$, from the octahedron at $a/b = 0$ to the vector equilibrium at $a/b = 1$; circles mark the stations of [@prop:stations], and the diamond the largest hull of [@prop:swell]. Above, the shape the gauge reads at each marked point: brass triangles keep their edge, cyan outlines are the gaps, and dotted lines are the folds the gauge uses. Computed by the games' own code.](../../output/figures/fig_jitterbug.png){#fig:jitterbug width=100%}

## A modules {#sec:amodules}

::: {.definition #def:amodule title="A quanta module"}
In a regular tetrahedron with centre $O$, choose a face $F$, a corner $C$ of
$F$ and an edge $e$ of $F$ at $C$. The A module of that choice is the
tetrahedron with corners $O$, $C$, the midpoint of $e$ and the centre of $F$.
There is one for each choice,

$$
N_{A} = 4 \times 3 \times 2 = {{A_MODULE_COUNT}} .
$$ {#eq:amodules}
:::

::: {.proposition #prop:amodules title="Equal A modules"}
Each A module holds exactly ${{A_MODULE_SHARE_TEX}}$ of the tetrahedron, and
the modules come in mirror pairs, {{A_MODULE_HAND}} of each hand.
:::

Each choice of a corner on an edge on a face is a flag of the tetrahedron, and
the A modules are the cells of its barycentric subdivision. The tetrahedron's
symmetries, rotations and reflections together, carry any flag to any other in
exactly one way, so the modules are congruent and share the volume equally. The
rotations alone carry each module only to modules of its own hand, and a
reflection exchanges the hands. The tests place the corners on quadrays scaled
so that every centre and midpoint is a whole quadray, and confirm with
[@eq:ace] that each module holds exactly ${{A_MODULE_SHARE_TEX}}$ and that the
hands split evenly ([@fig:amodules]). At Public Works in the field station,
the ants build a tetrahedron from the modules one sliver at a time, then let it
go and start again.

![Fuller's A modules, made by the games' own code ([@def:amodule]). (a) One module and the four points that define it: the centre, a corner, the midpoint of an edge at that corner, and the centre of a face holding both. (b) The tetrahedron assembled; its nearest face shows the modules that meet it. (c) All {{A_MODULE_COUNT}} drawn apart, face by face. The two colours are the two hands of [@prop:amodules].](../../output/figures/fig_amodules.png){#fig:amodules width=100%}

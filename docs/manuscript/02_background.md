# Background {#sec:background}

## Synergetics and its units {#sec:bg-synergetics}

Fuller's synergetics takes the regular tetrahedron, not the cube, as the unit
of volume, and the isotropic vector matrix, his name for the closest packing of
equal spheres seen as a frame of struts, as the frame of reference
[@fuller1975]. Measured this way the octahedron holds {{OCTA_VOLUME}}, the cube
built on the tetrahedron's edges {{CUBE_VOLUME}} and the vector equilibrium
{{VE_VOLUME}}. Edmondson's book explains the system's geometry
[@edmondson1987]. QuadCraft carries the classic volume
ratios among its self-checks [@quadcraft], and [@tbl:volumes] collects every
volume the games use.

## Quadray coordinates {#sec:bg-quadrays}

Quadrays address a point by four non-negative numbers along rays from the
centre of a regular tetrahedron to its corners. Urner's introduction presents
them as the four primitive directions of a turtle, in the spirit of Papert's
Logo, written so that at least one of the four is zero [@urner1997;
@papert1980]. Ace's
formulas treat them as tetrahedral, or simplicial, coordinates: adding the same
amount to all four leaves the point where it is, and fixing their sum instead
gives barycentric coordinates [@acequadray]. QuadCraft and QuadMath, the two
projects this repository imports, implement quadrays for games and for exact
computation [@quadcraft; @quadmath]; [@def:quadray] gives them as the games use
them.

## Lattices and closest packing {#sec:bg-lattices}

The isotropic vector matrix is the face-centred cubic lattice, in which every
sphere touches {{IVM_MOVES}} others [@conway1999]. Kepler conjectured that no
packing of equal spheres is denser, and Hales proved it [@hales2005]. Conway
and Sloane's treatment of lattices, their bases and their determinants
[@conway1999] is the setting for the argument of [@prop:whole], which turns on
the determinant of a lattice that the neighbour moves generate.

## The jitterbug, the A modules and tensegrity {#sec:bg-jitterbug}

Fuller's jitterbug joins the vector equilibrium's eight triangles at their
corners and lets them turn, so that the square gaps close and the shape passes
through the icosahedron to the octahedron [@fuller1975]. Verheyen classified
the whole family of such jitterbug transformers and analysed their motion
[@verheyen1989]. This paper measures one quantity along one of those motions,
the volume the games' gauge reads, and finds that it is not monotone
([@prop:swell]). Fuller also cut the tetrahedron into identical slivers, the A
quanta modules [@fuller1975; @edmondson1987], and [@prop:amodules] shows why
they are equal. The games' tensegrity masts, struts held apart by continuous
tension, follow the structural principle Fuller named, since developed into an
engineering theory of tensegrity systems [@fuller1975; @skelton2009].

## Play, explanation and learning {#sec:bg-play}

Papert proposed that children could learn mathematics by exploring a
microworld, such as the world of a Logo turtle, in which ideas can be tried out
[@papert1980]. Gee drew principles of learning out of good video games
[@gee2003], and Devlin argued for video games as a medium for learning
mathematics [@devlin2011]. Victor's reactive documents let a reader play with
an author's assumptions and analyses and see the consequences [@victor2011].
The games here borrow that stance, but they make no claim about learning: they
have not been tested with players, and [@sec:discussion] leaves that open.

## Reproducible and executable documents {#sec:bg-reproducible}

Knuth's literate programming wove a program and its explanation into one
document [@knuth1984]. Claerbout and Karrenbach proposed electronic
documents whose results a reader can reproduce from the files behind them
[@claerbout1992]; Peng put reproducibility forward as a minimum standard for
judging computational claims [@peng2011], and Sandve and colleagues condensed
the practice into rules [@sandve2013]. Software is cited and versioned
as a research output in its own right [@smith2016], and Git's content
addressing, which names every file by a hash of its bytes [@chacon2014], lets a
copy be checked against its source exactly. This paper is rendered by the
docxology/template pipeline [@template2026]; the repository adds a gate that
refuses any number in the paper that the games' own code did not compute
([@sec:verification]).

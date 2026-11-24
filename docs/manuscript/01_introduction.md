# Introduction {#sec:introduction}

Synergetics measures space in tetrahedra. Fuller took the regular tetrahedron
as the unit of volume, the closest packing of equal spheres as the frame of
reference, and the vector equilibrium, a cuboctahedron, as the shape that
closest packing makes around one sphere with its {{IVM_MOVES}} neighbours
[@fuller1975]. Its claims are concrete and checkable: whole-number volumes for
the octahedron, the cube and the vector equilibrium; a continuous motion, the
jitterbug, that carries the vector equilibrium through the icosahedron to the
octahedron; and a sliver, the A module, from which the tetrahedron is
assembled [@fuller1975; @edmondson1987]. They usually reach a reader on the
page.

This project puts them in a place instead: a grove of coast redwoods where an
Office of Synergetics Services keeps space from growing square, after the
gallery of that name [@ossgallery]. The games keep one rule: show, do not
tell. There is no briefing screen. The isotropic vector matrix appears around a
ranger who stands still; a brass counter clicks out the volume of a tetrahedron
the player marks; a dial at the Cathedral Ring follows the jitterbug as it
breathes. Nobody explains any of it.

That rule brings a second one with it. A game that shows a whole-number count
or a volume without saying why has to have the count and the volume right, and
the only way to know is to compute them with the code the game runs and to
test that code against a source that did not come from the same hands. This
paper reports what that discipline produced:

- two games that show synergetic geometry without explaining it, drawn from one
  body of geometry code ([@sec:games; @sec:architecture]);
- imports held to their sources: QuadCraft's quadray code copied byte for byte
  and pinned by Git blob identifiers, and QuadMath's exact tetravolume ported
  and held to QuadMath's own answers ([@sec:imports]);
- three results, stated as numbered definitions and propositions and
  checked by the repository's tests: whole counts on the lattice
  ([@prop:whole]), the stations and the swelling hull of the jitterbug's gauge
  ([@prop:stations; @prop:swell]), and the equal A modules ([@prop:amodules]);
- a paper whose numbers, figures and PDF are bound to the code by checks that
  fail on drift ([@sec:verification]).

The work these build on, from synergetics and lattices to games and
reproducible documents, is reviewed in [@sec:background]. The real places and
events behind the grove are in [@sec:cascadia]; [@sec:discussion] weighs what
showing demands and where the games stop; and [@sec:availability] says where to
play, read and cite the work.

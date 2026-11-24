# Discussion {#sec:discussion}

Showing instead of telling moves the burden of proof from the text to the code.
A lesson can hedge; a brass counter cannot. When the counter clicks out a
volume, the only honest support for it is the computation behind it, run where
it can be inspected and tested against a source that did not come from the same
hands. Here that source is QuadMath's own Python, run once to record its
answers, and QuadCraft's own bytes, pinned by the hash Git gives them. The same
discipline reaches the page: the paper states no number that the games' code
did not compute, which is literate programming's promise [@knuth1984] and the
reproducible paper's [@claerbout1992; @peng2011] applied to a game.

Two of the three results are known. That four lattice nodes always span a
whole number of tetravolumes ([@prop:whole]) is a fact of the lattice that
QuadMath also records [@quadmath], and the equal A modules of [@prop:amodules]
are Fuller's [@fuller1975]; what the repository adds is a check that the games'
code agrees with them, and a short reason for each. The third, [@prop:swell], is
a property of a measurement. The gauge reads the convex hull of the
jitterbug's vertices, and under the games' parametrization that hull grows on
leaving the vector equilibrium before it shrinks. It says nothing about
Fuller's account of the jitterbug [@fuller1975] or Verheyen's analysis of its
motion [@verheyen1989] beyond the named stations they share; it says what the
dial in the field station shows, and why the dial's scale runs past the vector
equilibrium's volume.

The games stop short in places. The jitterbug's breathing ends at the
octahedron rather than going on to the tetrahedron. Nothing in the grove counts
in A modules beyond the ants' tetrahedron, and the lattice is the only
structure a player can measure. The two frames of the games in this paper are
captured by a script rather than drawn from the series the other figures plot,
so the checks hold them to the script's record but cannot take them again
without a browser. And the games have not
been played by anyone under study: whatever they teach, in the sense that
Papert, Gee or Devlin would ask about [@papert1980; @gee2003; @devlin2011],
is not known. Each of these is a place where the same discipline could reach
further: a measurement the player can make, computed by code the tests already
hold to its source, or a question put to players with the same care.

This paper describes release {{VERSION}} of the repository, archived with its
source on Zenodo ([@sec:availability]).

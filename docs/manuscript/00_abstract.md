# Abstract {#sec:abstract .unnumbered}

Cascadian Synergetics is a pair of browser games set in a fog-bound Cascadian
redwood grove: a first-person field station built on three.js [@threejs] and an
illustrated storybook patrol drawn on a flat canvas. Both show Buckminster
Fuller's synergetic geometry [@fuller1975] in play rather than in explanation,
and both draw it from one shared body of code, so that what a player sees can be
checked. The games run QuadCraft's quadray coordinates byte for byte
[@quadcraft] and a JavaScript port of QuadMath's exact tetravolume [@quadmath],
held to QuadMath's own answers on {{FIXTURE_CASES}} tetrahedra.

Three results follow from that code, and each is tested. Any four nodes that a
player marks on the isotropic vector matrix span a whole number of
tetravolumes; this holds because of the lattice, not because the coordinates
are integers, since {{INT_FRACTIONAL}} of {{FIXTURE_INTEGER}} tetrahedra with
arbitrary integer quadrays come out fractional. The jitterbug's volume, read by
a gauge at the field station's Cathedral Ring, runs from {{VE_VOLUME}}
tetravolumes at the vector equilibrium through
$5\sqrt{2}\,\varphi^{2} \approx {{ICOSA3}}$ at the icosahedron to
{{OCTA_VOLUME}} at the octahedron, yet between those stations the convex hull
of its struts first swells to {{HULL_PEAK}}. Fuller's A modules divide the
regular tetrahedron into {{A_MODULE_COUNT}} pieces of exactly
${{A_MODULE_SHARE_TEX}}$ each, {{A_MODULE_HAND}} of either hand.

Every number in this paper that the repository computes or pins is injected
from its code when the paper is rendered, and the one fact taken from the
literature, a date, is bound to its citation. The repository's local checks
fail when a number, an imported file or this PDF drifts from its source.

# Abstract {#sec:abstract .unnumbered}

Buckminster Fuller's synergetics measures space in tetrahedra, and its geometry
usually reaches a reader as text, diagrams and tables of volumes
[@fuller1975; @edmondson1987]. Cascadian Synergetics puts that geometry into
two browser games set in a fog-bound Cascadian redwood grove, a first-person
field station built on three.js [@threejs] and an illustrated storybook patrol
drawn on a flat canvas, and holds what a player sees to the code that draws
it. Neither game explains anything. Both run QuadCraft's quadray coordinates
byte for byte [@quadcraft] and a JavaScript port of QuadMath's exact
tetravolume [@quadmath], held to QuadMath's own answers on {{FIXTURE_CASES}}
tetrahedra.

Three results follow from that code, each stated formally and each tested. Any
four nodes of the isotropic vector matrix span a whole number of tetravolumes,
and the lattice ensures it, not integer coordinates: {{INT_FRACTIONAL}} of
{{FIXTURE_INTEGER}} tetrahedra with arbitrary integer quadrays come out
fractional. The jitterbug's volume runs from {{VE_VOLUME}} at the vector
equilibrium through $5\sqrt{2}\,\varphi^{2} \approx {{ICOSA3}}$ at the
icosahedron to {{OCTA_VOLUME}} at the octahedron, yet on leaving the vector
equilibrium the convex hull of its vertices first swells to {{HULL_PEAK}}.
Fuller's A modules divide the regular tetrahedron into {{A_MODULE_COUNT}}
pieces of exactly ${{A_MODULE_SHARE_TEX}}$, {{A_MODULE_HAND}} of each hand.

The paper is built the same way. Every number in it is computed by the games'
code and injected as it renders, its figures are drawn from the same
computations, and the repository's local checks fail when a number, an
imported file or this PDF drifts from its source.

- Play both games: <{{PLAY_URL}}>
- The field station: <{{FIELD_STATION_URL}}>
- The storybook: <{{STORYBOOK_URL}}>
- Source code, tests and this paper: <{{REPOSITORY_URL}}>
- QuadCraft, imported: <{{QUADCRAFT_URL}}>
- QuadMath, imported: <{{QUADMATH_URL}}>
- Archived on Zenodo: <https://doi.org/{{CONCEPT_DOI}}>

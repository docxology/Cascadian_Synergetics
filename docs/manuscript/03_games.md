# Two patrols {#sec:games}

Patrol Trine is the player and two rangers, Sitka and Madrone. In both games
the patrol has the same work. Incursions, humming cubes that lay a square grid
over the moss, have to be folded away. Slack tensegrity masts have to be
plucked taut. Banana slugs have to be surveyed without hurrying them, and
insignia from the gallery found on the forest floor. At the centre of the grove
stands the Cathedral Ring, where a vector equilibrium floats with its square
gaps glitching; each finished task lets it breathe further through its
jitterbug, and when the grove is whole it breathes all the way and the view
lifts into the canopy. Both games run in a browser from the repository's own
site ([@sec:availability]).

The grove keeps one visible rule: nothing grows square. Trunks taper and lean,
the interface is circles and soft blobs, and the edge of the screen dissolves
into mist. The incursions are the only squares in the world, and resolving one
shows the cube giving way to the tetrahedron on its face diagonals while its
corner pieces flutter off ([@prop:cube]).

## The field station {#sec:field-station}

The field station is a first-person game in three dimensions, drawn with
three.js release {{THREE_REVISION}} [@threejs]. A player walks the grove, looks
around with the mouse or a thumb, and acts on what is in front of them.
Beyond the patrol's work, the station holds things that are never named: ash
drifting down in tiny vector equilibria, an ant crew building a tetrahedron out
of Fuller's A modules, a mailbox whose resident tetrahedron eats letters, elk in
the fog, and from the top of Lookout Rise a mountain standing up out of the
cloud ([@fig:field-station]). A brass rail by the station door carries one bead
for each of QuadCraft's {{QUADCRAFT_CHECKS}} geometric self-checks
[@quadcraft], lit when the check passes as the station loads.

![The field station from the top of Lookout Rise: a mountain stands up out of the fog under a lenticular cloud, the stays of a tensegrity mast cross the view, and a lantern glows in the foreground. A frame of the game, captured by script through its test hook ([@sec:unchecked]).](../../output/figures/fig_field_station.jpg){#fig:field-station width=86%}

## The storybook {#sec:storybook}

The storybook tells the same patrol as an illustrated walk along a looping
trail, drawn in perspective on a flat canvas. Its world is a loop of
{{SB_LOOP}} m, so its lattice is cut to fit: with a strut of {{SB_EDGE}} m,
exactly {{SB_PERIODS}} lattice periods close around the loop, and the
addresses never break where it joins. In the storybook a player taps a node to
mark it ([@fig:storybook]).

![The storybook at the Cathedral Ring. The stillness lattice glows around Patrol Trine, four marked nodes span a tetrahedron, and the brass counter reads the tetravolume of [@prop:ace]; Sitka calls it whole. The lattice's strut, {{SB_EDGE}} m, closes {{SB_PERIODS}} periods around the {{SB_LOOP}} m loop. A frame of the game, captured by script through its test hook ([@sec:unchecked]).](../../output/figures/fig_storybook.jpg){#fig:storybook width=86%}

## What both games share {#sec:shared}

Stand still for a few seconds and the isotropic vector matrix appears around
the ranger, fixed to the world rather than to the view. Every node carries a
whole quadray address counted out from the foot of the Ring
([@prop:addresses]), and the action button shows the address of the node the
player would mark. Mark four nodes and the tetrahedron between them lights
while the counter clicks once for each tetravolume, or stays silent when the
four lie in one plane. The notebook keeps the counts. At the Ring a brass dial
follows the jitterbug's volume, with dots at its named stations and no scale
words.

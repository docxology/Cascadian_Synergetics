# How the claims are kept true {#sec:verification}

## One source for every number {#sec:facts}

A single module, `tools/facts.mjs`, runs the games' spliced geometry and the
vendored code and computes every number this paper and the repository's notes
state. The notes carry each number between invisible markers that the module
rewrites; this paper carries each as a token that the docxology/template
renderer replaces when it hydrates the manuscript [@template2026]. The module
also prints the data the figures plot, so a figure and the sentence beside it
come from the same computation, and the addresses the paper prints, read from
the repository's citation file and its vendor lock.

A gate enforces the arrangement. In the paper no digit may be typed in prose;
inside mathematics a single digit is notation, as in $\sqrt{2}$ or the $\tfrac{1}{4}$
of [@eq:ace], but a number of two or more digits, or a decimal, is a result and
must be a token. A fact the repository cannot compute, such as the date of the
Cascadia earthquake, is a token too, bound to its citation, and the gate fails
if the paragraph that uses it does not cite that source. Every citation must
have a bibliography entry and every entry must be cited. Every display equation
must carry a label, so that it is numbered, and every cross-reference must name
a label that is declared once: a section, figure, table or equation, numbered
by pandoc-crossref, or a definition or proposition, numbered by the template's
formalism filter.

## Local checks, no hosted service {#sec:ci}

The repository has no hosted workflow; nothing runs on a remote service and
nothing is billed. Its checks run on the author's machine with Node and no
packages to install. They confirm that both pages parse and keep the rules of a
single-page game, that the standalone pages and the spliced blocks match a
fresh build, that every copied file matches its lock, that the port reproduces
the fixture, and each statement of [@sec:geometry] and [@sec:imports], as
[@tbl:claims] lists.

| Statement | What the checks do |
|:-----|:-------------------------|
| [@def:quadray] | four unit rays that sum to zero and meet at the tetrahedral angle; random points convert to quadrays with one zero and back exactly |
| [@prop:addresses] | every node of the stillness lattice has a whole address, also after shifting by whole periods; every strut steps by a neighbour move |
| [@prop:ace] | the port equals QuadMath on all {{FIXTURE_CASES}} fixture tetrahedra and Bareiss's determinant on {{FIXTURE_DETS}} matrices; counts agree with [@eq:tetravolume] on {{TALLY_SAMPLES}} random marks |
| [@prop:whole] | the projected moves generate the lattice of [@eq:basis]; every lattice tetrahedron in the fixture and every random mark counts whole |
| [@prop:integer] | QuadMath's primitive tetrahedron, and the fractional counts among arbitrary integer quadrays in its fixture against none among lattice tetrahedra |
| [@prop:cube] | the cube measured from ordinary volumes and again with [@eq:ace] |
| [@prop:stations] | the gauge at the three stations; the triangles equilateral through the motion; the shapes at the stations |
| [@prop:swell] | the gauge against an independent convex hull; the peak between the icosahedron and the vector equilibrium; every gap skew between the stations, and the other fold reading differently |
| [@prop:amodules] | {{A_MODULE_COUNT}} modules, each exactly ${{A_MODULE_SHARE_TEX}}$ by [@eq:ace], {{A_MODULE_HAND}} of each hand |
| [@prop:bridges] | QuadMath's embedding and the compass against QuadCraft on random points |

: Each formal statement and the checks that hold the games' code to it. {#tbl:claims}

A local CI script runs the same checks on a clean export of one commit, so
uncommitted edits can neither help nor hurt the verdict, and writes a receipt
named for that commit outside the checkout. A pre-push hook runs it before
every push. The records the checks read and write are listed in
[@tbl:records]; the vendor lock is `vendor/vendor.lock.json`, the fixture
`tests/fixtures/quadmath.json`, and the stamp sits beside the PDF in
`output/pdf/`.

| Record | Written by | Holds | Checked by |
|:----------|:----------|:--------------------|:------------|
| the vendor lock | the vendor script | each upstream commit, and each copied file's path and blob identifier | the tests, offline; the CI, against upstream clones |
| QuadMath's fixture | the vendored QuadMath | named, random and lattice tetrahedra and integer determinants, with the blob identifiers they came from | the tests, against the lock and the port |
| the PDF's stamp | the build script | the PDF's digest, its sources' digest and the template commit | the tests, by recomputing the sources' digest |
| the screenshot record | the capture script | each frame's digest, the page it shows and that page's digest, the viewport and what the scene reported | the tests, against the images |
| the CI receipt | the CI script | commit, tree, verdict, checks passed and failed, and the upstream check | kept outside the checkout, one per commit |

: The records the checks rely on. {#tbl:records}

## The rendered paper {#sec:render}

The paper is rendered by the docxology/template pipeline, which this repository
joins as an external project lane [@template2026]. A build script draws the
figures from the module's data, writes the tokens and hydrates the manuscript
with the template's own routine, runs the template's render stage, and then
reads the render back out of the PDF: the title, no unresolved token or
reference, every placed figure embedded, sections and formal statements
numbered in order, no missing glyph or undefined citation in the LaTeX log, and
every bibliography entry printed. It fails on a token left unresolved, which
the template alone only warns about.

The local checks cannot render, so the build ends by recording two digests
beside the PDF: the PDF's own, and one over every source it was rendered from,
the manuscript, the figure script, the screenshots, the tokens and the figure
data. The local checks recompute the second and compare both. A change to any
of those sources without a fresh render therefore fails the checks instead of
leaving a stale PDF in place.

## What is not checked here {#sec:unchecked}

The checks run without a browser. What only a browser shows, the drawing, the
sound and the feel of the controls, is exercised by hand through the test hooks
each page exposes, which report the lattice, the marks and the count, the
gauge's reading and the self-checks, among other things. The two frames of the
games in [@fig:field-station; @fig:storybook] are taken by a script,
`scripts/capture_screenshots.mjs`, which opens each page in headless Chrome at
a fixed size, seeds the page's random numbers and stops its animation loop
before any of its code runs, sets the scene through the page's test hook in
fixed time steps, and records each image's digest beside the digest of the page
it shows. The checks hold the images to that record, but they cannot take the
frames again, which needs a browser and the network; and a frame is the same
from run to run without always being the same byte for byte. The copies of the
games hosted as Claude artifacts are published by hand from the same source
files. No check, and no study, says what a player learns.

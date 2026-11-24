# How the claims are kept true {#sec:verification}

## One source for every number {#sec:facts}

A single module, `tools/facts.mjs`, runs the games' spliced geometry and the
vendored code and computes every number this paper and the repository's notes
state. The notes carry each number between invisible markers that the module
rewrites; this paper carries each as a token that the docxology/template
renderer replaces when it hydrates the manuscript. The module also prints the
data the figures plot, so a figure and the sentence beside it come from the
same computation.

A gate enforces the arrangement. In the paper, no digit may be typed in prose;
inside mathematics a single digit is notation, as in $\sqrt{2}$ or the
definition of $\varphi$, but a number of two or more digits, or a decimal, is a
result and must be a token. A fact the repository cannot compute, such as the
date of the Cascadia earthquake, is a token too, bound to its citation, and the
gate fails if the paragraph that uses it does not cite that source. Every
citation must have a bibliography entry and every entry must be cited.

## Local checks, no hosted service {#sec:ci}

The repository has no hosted workflow; nothing runs on a remote service and
nothing is billed. Its checks run on the author's machine with Node and no
packages to install. They confirm that both pages parse and keep the artifact
rules, that the standalone pages and the spliced blocks match a fresh build,
that every copied file matches its lock, that the port reproduces the fixture,
that the three quadray conventions relate as [@sec:conventions] says, and the
geometry of [@sec:geometry]: whole addresses and struts that are neighbour moves
across the stillness lattice, whole counts for {{TALLY_SAMPLES}} random marks,
the gauge's stations and its agreement with an independent hull, the ash, the
cube and the A modules.

A local CI script runs the same checks on a clean export of one commit, so
uncommitted edits can neither help nor hurt the verdict, and writes a receipt
named for that commit outside the checkout. A pre-push hook runs it before
every push.

## The rendered paper {#sec:render}

The paper is rendered by the docxology/template pipeline, which this repository
joins as an external project lane. A build script draws the figures from the
module's data, writes the tokens and hydrates the manuscript with the
template's own routine, runs the template's render stage, and then reads the
render back out of the PDF: the title, no unresolved token or reference, every
placed figure embedded, sections numbered in order, no missing glyph or
undefined citation in the LaTeX log, and every bibliography entry printed. It
fails on a token left unresolved, which the template alone only warns about.

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
gauge's reading and the self-checks, among other things. The copies of the
games hosted as artifacts are published by hand from the same source files.

# One body of code {#sec:architecture}

Everything the games show is computed by a small body of shared code, and
everything this paper states is computed by the same code again
([@fig:schema]). Two projects upstream supply the instruments: QuadCraft's
quadray class and its geometric self-checks, copied byte for byte, and
QuadMath's exact tetravolume, ported to JavaScript [@quadcraft; @quadmath].
Two files of the repository's own hold the rest: the port, and the grove's
shared geometry, which builds the jitterbug, the isotropic vector matrix and
its addresses, the ash and the A modules.

Each game is a single HTML page with one inline script, so that it can be
published as it is to any static host. A build step therefore splices the
copied and shared files into both pages between marked comments, and writes the
standalone copies the site serves from the same sources, with their links to
each other made relative. The local checks fail if a spliced block differs by
one byte from its file, so the file is the one place to edit. Both pages expose
a small test hook in the browser that reports what the page has computed: the
lattice, the marks and their count, the gauge's reading and the self-checks.

The paper is a third consumer of the same files. A module, `tools/facts.mjs`,
splices them as the games do, runs them, and prints the numbers this paper
states and the data its figures plot; the docxology/template pipeline
[@template2026] then hydrates the manuscript with those numbers and renders it.
Beneath all of it the local checks run on a clean export of each commit,
comparing the copies with their upstream, the port with QuadMath's answers, the
spliced blocks with their files, the geometry with the statements of
[@sec:geometry], every number with the code, and the PDF with its sources
([@sec:verification]).

![How the repository is built. Upstream projects (left) are copied byte for byte or ported; the copies, the port and the grove's own geometry are spliced into both games and run again by `tools/facts.mjs`, whose numbers and series become this paper's tokens and figures. The local checks (bottom) compare each stage with its source. The commit identifiers are the pinned upstream commits, read from the vendor lock.](../../output/figures/fig_schema.png){#fig:schema width=100%}

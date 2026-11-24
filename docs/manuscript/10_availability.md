# Availability {#sec:availability}

The games, their source, this paper and its build are public.

| What | Where |
|:-----------------|:------------------------------------------|
| Both games, in a browser | <{{PLAY_URL}}> |
| The field station, which needs WebGL | <{{FIELD_STATION_URL}}> |
| The storybook | <{{STORYBOOK_URL}}> |
| Source code, tests, notes and this manuscript | <{{REPOSITORY_URL}}> |
| Release {{VERSION}} with its paper and source, on Zenodo | <https://doi.org/{{VERSION_DOI}}> |
| The latest archived release | <https://doi.org/{{CONCEPT_DOI}}> |
| QuadCraft | <{{QUADCRAFT_URL}}> |
| QuadMath | <{{QUADMATH_URL}}> |
| QuadMath's software and manuscript, archived | <https://doi.org/{{QUADMATH_DOI}}> |
| The rendering pipeline, docxology/template [@template2026] | <https://github.com/docxology/template> |

: Where to play, read and cite the work. {#tbl:availability}

To rebuild this paper, clone the repository beside a checkout of the template;
the manuscript's own `README.md` lists what the build needs. From the
repository's root, the first command renders the paper and the second runs the
local checks:

```bash
python3 scripts/build.py
node tests/check.mjs
```

The repository, its games and this paper are under the MIT licence; the copied
QuadCraft and QuadMath files keep their Apache licence, whose text travels with
them.

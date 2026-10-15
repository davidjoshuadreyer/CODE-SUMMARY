# Physics tutorial coverage

Checked against PHYS 210 Fall 2026 D2L on October 14, 2026. The Tutorials module contains Tutorials 1–11 and a shortened Tutorial 2 JPG. Its separate Tutorial Solutions submodule was empty. Several question handouts include printed final answers; the website supplies independently worked explanations, not an instructor-issued solution key.

| Tutorial | Questions covered |
| --- | ---: |
| 1 | 10 |
| 2 | 10 |
| 3 | 8 |
| 4 | 9 |
| 5 | 9 |
| 6 | 8 |
| 7 | 10 |
| 8 | 10 |
| 9 | 11 |
| 10 | 10 |
| 11 | 10 |
| Total | 105 |

The vector-review handout in Handouts contributes 3 examples and 9 practice exercises (12 entries). Tutorial 2 short repeats questions 15, 16, 25–29 and is included as an original, without duplicating solution entries. Tutorial 9 has older internal Tutorial/Week labels; the site follows its current D2L filename.

Original bytes and SHA-256 hashes are retained in `tutorial-sources/` and `tutorial-manifest.json`. Worked records, original question numbers, all requested subparts, source page references, and checks are in `tutorial-data.json`. Source corrections and assumptions are noted in each affected solution. In particular, vector dot-product practice 5 corrects the first angle to about 140°, not the printed 94°.

All 117 entries have a dedicated, accessible SVG in `tutorial-diagrams/`, indexed by problem ID in `tutorial-diagrams.json`. The diagram appears directly below the question, with a full-size link and explanatory caption. The original source-page dropdown remains available. Figures are schematic unless a plotted scale is stated. Reduced circuits are explicitly labeled. Visually verify geometry, signs, directions, component connections, and labels against the source and worked solution when editing them.

New problems also require an SVG and manifest entry with `id`, `url`, `alt`, `caption`, `width`, and `height`; the builder fails if a diagram is missing. `tutorial-diagrams.css` is appended to the shared study styles by the builder, so edit that source rather than generated `tutorials.css`. The coverage check verifies every problem's diagram, accessibility metadata, and generated figure.

To extend: add the original file and manifest record, visually inspect every diagram, write and verify each new problem and subpart, then run `node dev/build-physics-tutorials.cjs`. Update expected coverage in `dev/check-physics-tutorials.cjs` and this document before running the check. Rebuild `dev/build-learning-paths.cjs` and `dev/build-workspace-catalog.cjs` to update discovery. The Physics lesson generator retains the tutorial navigation callout.

The page uses the existing optional Lab report theme. Review checkmarks have their own browser-storage key, `tesselate-physics-tutorials-reviewed-v1`, and do not alter homework progress or account-backed lab measurements. No grades or student submissions are included.

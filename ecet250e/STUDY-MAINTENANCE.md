# ECET study edition

Snapshot: October 14, 2026. Posted Weeks 1–6 only. The sequence is Chapters 1, 2, 3, 4, 6, 7; Chapter 5 and later weeks were not posted.

The bank contains 161 entries: 85 lecture examples, demonstrations, and practice exercises; 65 questions from Problem Sets 1–6; and 11 Quiz 1 questions. Source ambiguities and corrections are recorded in the affected entry. Example 6.9 is conditional because the source does not clearly establish its initial current. Laboratory measurements are not fabricated; use the original handouts and existing Lab 5 tools.

## Updating content

1. Put authorized course originals in `source-materials/`. Preserve the original bytes. Add title, URL, category, byte count, and SHA-256 to `source-manifest.json`; mark only original files `original: true`. PDF slide exports are reading copies.
2. Add or revise records in `study-data.json`. Each record needs a stable ID, chapter, kind, question, source URL and page numbers, figures, steps, LaTeX answer, verification check, and status. Include the released key separately where available. Read image-only questions visually and verify numerical results.
3. Keep the source diagram reference; add a clean SVG redraw when useful, preserving all node connections, polarity marks, and current arrows. Mark source excerpts that include answers.
4. Run `node dev/build-ecet-study.cjs`, `node dev/build-learning-paths.cjs`, `node dev/build-workspace-catalog.cjs`, and `node dev/install-report-theme.cjs` from the repository root. Update the snapshot/coverage wording and expected counts in `dev/check-ecet-study.cjs` when adding material.
5. Run `node dev/check-ecet-study.cjs`. Inspect desktop and mobile layouts, at least one expanded solution, source links, dark appearance, and both study styles before publishing.

## Alternative theme

`assets/report-theme.css` is opt-in under `html[data-study-style="report"]`. The original appearance remains the default. `assets/report-theme.js` stores only the presentation choice in `tesselate-study-style`; the existing `chem-theme` light/dark preference is independent. Extend the report rules here, not in the original course stylesheets. The installer adds the selector to academic pages and leaves games alone.

Reviewed-problem checkmarks use `tesselate-ecet-reviewed-v1` on the current browser. They are separate from existing account-backed lab measurements and workspace data. No D2L grades, submissions, or account credentials are included.

# ECET study edition

Lecture snapshot: October 26, 2026. Posted Weeks 1–8; Chapters 1, 2, 3, 4, 6, 7, 8, 9. Chapter 5 is not in the posted sequence. Assignments remain through Problem Set 7.

The bank contains 183 entries: 101 lecture examples, demonstrations, and practice exercises; 70 assigned questions from Problem Sets 1–7; 11 Quiz 1 questions; and one extra example (8.33) present only in the Problem Set 7 key. Source ambiguities and corrections are recorded in the affected entry. Example 6.9 is conditional because the source does not clearly establish its initial current. Laboratory measurements are not fabricated; use the original handouts and existing Lab 5 tools.

## Updating content

1. Put authorized course originals in `source-materials/`. Preserve the original bytes. Add title, URL, category, byte count, and SHA-256 to `source-manifest.json`; mark only original files `original: true`. PDF slide exports are reading copies.
2. Add or revise records in `study-data.json`. Each record needs a stable ID, chapter, kind, question, source URL and page numbers, figures, steps, LaTeX answer, verification check, and status. Include the released key separately where available. Read image-only questions visually and verify numerical results.
3. Keep the source diagram reference; add a clean SVG redraw when useful, preserving all node connections, polarity marks, and current arrows. Mark source excerpts that include answers.
4. Run `node dev/build-ecet-study.cjs`, `node dev/build-learning-paths.cjs`, `node dev/build-workspace-catalog.cjs`, and `node dev/install-report-theme.cjs` from the repository root. Update the snapshot/coverage wording and expected counts in `dev/check-ecet-study.cjs` when adding material.
5. Run `node dev/check-ecet-study.cjs`. Inspect desktop and mobile layouts, at least one expanded solution, source links, dark appearance, and both study styles before publishing.

## Alternative theme

`assets/report-theme.css` is opt-in under `html[data-study-style="report"]`. The original appearance remains the default. `assets/report-theme.js` stores only the presentation choice in `tesselate-study-style`; the existing `chem-theme` light/dark preference is independent. Extend the report rules here, not in the original course stylesheets. The installer adds the selector to academic pages and leaves games alone.

Reviewed-problem checkmarks use `tesselate-ecet-reviewed-v1` on the current browser. They are separate from existing account-backed lab measurements and workspace data. No D2L grades, submissions, or account credentials are included.

## Week 7 import

Five new originals (54 total): Chapter 8 PPTX, response-summary PDF, Problem Set 7 PDF/DOCX, and the released key. Chapter 8 example figures preserve the original embedded screenshot images and their slide positions. PPTX source page numbers refer to slides. The question-only assignment has five problems; the key has six, so map by textbook problem number. Problem 8.23 has an arithmetic error in the key: omega-zero is 31.62 rad/s, not 141.42.

`formula-sheet.html` remains the one-page midterm sheet (Chapters 1–4, 6); `formula-sheet-latest.html` is the cumulative one-page sheet through Chapter 8. Build with the corresponding `build-ecet-formula-sheet.cjs` and `build-ecet-latest-formula.cjs`. The midterm question filter explicitly includes chapters 0, 1, 2, 3, 4, 6 so later chapters cannot leak into it.

## Multiple-choice practice

`quiz.html` uses `mcq-data.js`, built by `node dev/build-ecet-mcq.cjs`: four original Quiz 1 MCQs (Q1, Q7, Q8, Q9) with exact wording/choices, and 30 authored practice questions (six each for Chapters 1, 2, 3, 4, 6). The extra questions are not instructor predictions. Original excerpts use SVG viewports into the untouched source page images, excluding the printed answers. Answers lock after checking; results and retry-missed use the first checked choice. Rounds are session-only.

## Week 8 import

Chapter 9 adds 11 lecture entries and the unchanged 68-slide PPTX (55 originals total). Includes the sine-to-cosine exercise and posted Examples 9.1–9.5, 9.7–9.11; Example 9.6 is not present. Source figures are untouched embedded excerpts, some including answers. Slide 31 is an unnumbered conversion exercise. The printed negative derivative term in Example 9.7 is retained; its answer is explicitly a sinusoidal particular solution, not a stable transient claim. Phasors use peak amplitudes and a cosine reference. The cumulative formula sheet still covers through Chapter 8.

# Personal study scheduling

Topic and flashcard reviews use FSRS-6 through pinned ts-fsrs 5.4.2. Desired retention is 90%, fuzz is disabled, and learning/relearning steps are empty: this planner uses daily intervals rather than minute-based drills. Review dates are displayed and selected by Vancouver calendar date. This uses the FSRS algorithm used by Anki; it does not sync with Anki or optimize personal parameters.

`topic/<id>` stores topic notes, FSRS state, latest grade and review logs together in one revision-checked cloud write. `card-review/<id>` stores independent flashcard review state/logs. Completing a checklist block is evidence of study, not a successful recall rating. Legacy ratings and completed blocks queue a first FSRS review without inventing historical successful recalls. A flashcard never changes its topic's schedule or confidence.

`material/<uuid>` adds any lecture, reading, lab or assignment topic to the course inventory. Users mark topics studied or review them to enter repetition. Existing topic checklist completions also qualify. New unstudied material is not automatically pulled into spaced review. Daily budgets can defer due topics; due status remains visible in Topic confidence. Previously saved daily checklists are preserved; Update remaining blocks applies current priorities.

Colours have text labels: grey = not studied; red = no recall evidence yet, last rating Again, or estimated recall below 80%; amber = due or last rating Hard; green = other reviewed topics. These are review priorities, not exam-grade predictions.

Twelve starter flashcards cover conceptual questions across all six courses. Cards activate when the associated topic has been studied. Custom cards should ask one short conceptual question requiring no calculator or written steps. Whole-topic review may include worked problems. Card content is rendered as text, never HTML.

The existing private `tesselate_study_items` table and row-level security support these record types; no database migration is needed.

Checks (from repository root):

```sh
node dev/study-memory-test.cjs
node dev/study-engine-test.cjs
node dev/study-cloud-test.cjs
# With Playwright available through NODE_PATH and Chrome installed:
node dev/study-smoke.cjs
```

Browser tests stub authentication and storage; they do not write to a real account.

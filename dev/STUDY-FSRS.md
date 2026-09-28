# Personal study scheduling

Topic and flashcard reviews use FSRS-6 through pinned ts-fsrs 5.4.2. Desired retention is 90%, fuzz is disabled, and learning/relearning steps are empty: this planner uses daily intervals rather than minute-based drills. Review dates are displayed and selected by Vancouver calendar date. This uses the FSRS algorithm used by Anki; it does not sync with Anki or optimize personal parameters.

`topic/<id>` stores topic notes, FSRS state, latest grade and review logs together in one revision-checked cloud write. `card-review/<id>` stores independent flashcard review state/logs. Completing a checklist block is evidence of study, not a successful recall rating. Legacy ratings and completed blocks queue a first FSRS review without inventing historical successful recalls. A flashcard never changes its topic's schedule or confidence.

`material/<uuid>` adds any lecture, reading, lab or assignment topic to the course inventory. Users mark topics studied or review them to enter repetition. Existing topic checklist completions also qualify. New unstudied material is not automatically pulled into spaced review. Daily budgets can defer due topics; due status remains visible in Topic confidence. Previously saved daily checklists are preserved; Update remaining blocks applies current priorities.

Colours have text labels: grey = not studied; red = no recall evidence yet, last rating Again, or estimated recall below 80%; amber = due or last rating Hard; green = other reviewed topics. These are review priorities, not exam-grade predictions.

The morning review contains up to ten multiple-choice questions, due cards first, balanced across available courses and topics. The default pool includes studied topics and topics previously introduced by a multiple-choice question. When that pool is empty, foundation questions from the first two lessons per course provide a starting point. Users can choose all topics or a particular topic explicitly. Not-yet-due cards are not used as filler.

188 multiple-choice questions cover all 109 current planner topic entries across six courses, with at least two questions per entry. Related lesson/section entries share card IDs and progress rather than creating duplicate cards. Original questions are in `dev/recall-content.cjs`; 36 short programming questions come from the existing `dev/comp139e-content.cjs`. Run `node dev/build-study-mcq.cjs` to validate coverage and rebuild `study-mcq.js`. Later circuit chapter associations follow the [publisher chapter list](https://www.mheducation.com/highered/product/fundamentals-of-electric-circuits-alexander.html) and are explicitly labelled supplemental, rather than instructor-confirmed question coverage.

`recall-set/<date>/<course>/<scope>/<topic>` stores the chosen card IDs and scope once, so a paused or reloaded session resumes consistently. Each answer is saved with its FSRS update in the existing `card-review/<id>` row, with a set ID as the idempotency key. Correct = Good; correct but marked guessed = Hard; incorrect or unknown = Again. Grades are not inferred from response time. Answer records preserve selected option, correctness, uncertainty, grade and timestamp. Ambiguous successful writes are reconciled by rereading the account before permitting retry. Incorrect answers are explained immediately, reviewed in the end-of-set recap, and scheduled earlier; recaps do not count as additional successful reviews.

The Flashcards view shows accumulated accuracy, and My progress includes recent recall sessions and daily answer counts. Topic cards show quick-check scores separately from whole-topic confidence. The twelve original open-answer cards and custom cards remain available under Self-rated cards; their progress is unchanged. All content is rendered as text, never HTML.

The existing private `tesselate_study_items` table and row-level security support these record types; no database migration is needed.

Checks (from repository root):

```sh
node dev/study-memory-test.cjs
node dev/study-engine-test.cjs
node dev/study-cloud-test.cjs
node dev/study-recall-test.cjs
# With Playwright available through NODE_PATH and Chrome installed:
node dev/study-smoke.cjs
node dev/study-recall-smoke.cjs
```

Browser tests stub authentication and storage; they do not write to a real account.

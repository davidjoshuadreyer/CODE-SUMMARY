# Tesselate study workspace

Open `index.html` through your usual local static server or the deployed site. The dashboard uses plain HTML, CSS, and JavaScript; there is no build step. Optional online storage uses the pinned Supabase browser SDK loaded from jsDelivr.

## Everyday use

1. Choose **Active semester → New semester** or use the semester initialized from today's date.
2. Select **Add course** and enter the code, name, and semester. **Edit course** can move a course to a different semester. Older semesters remain in **Past semesters**, and the selector can make them active again.
3. Open a course and **Upload references**. Multi-file selection and drag/drop are supported. Files start as **Unused**. Uploads from the global library can be left unassigned.
4. **Manage** a reference to add notes or mark it **In progress**.
5. **Add study page** to write plain-text notes or link a page, quiz, lab report, or exam. Select the reference materials used. Alternatively, open a reference and select the existing study pages made from it.
6. A reference becomes **Converted** whenever at least one study page links to it. Removing its last link restores the previous progress. This is a tracking workflow; it does not automatically generate summaries or quizzes.

The four original courses are grouped under Winter 2026 based on their existing course materials. ENGR 290 Engineering Materials is under Fall 2026, with five lessons, a review index, a topic quiz, and a timed practice test. Its opening materials coverage uses the supplied slides and Assignment 1; later polymers, phase diagrams, and thermodynamics topics are not yet covered. All old page URLs remain intact. The catalog also exposes Statistics and lab reports that weren't previously linked from the home page. Existing PDFs start as **Needs review**, since their conversion history is unknown.

## Storage and backups

New courses, notes, reference metadata, and uploaded file bytes always save locally in IndexedDB. To also store them privately online, open **Online storage**, sign in with Google, and select **Save this device online**. This uploads existing originals and enables automatic online saves for subsequent edits and uploads while that account is signed in. The status changes to **Saved online** only after both files and the workspace restore point are saved. Failed uploads leave the local copy intact; use **Save this device online** to retry. A reconnection also retries pending changes.

On another device, sign in and **Load** an online restore point. Loading replaces the local workspace, downloads and verifies originals, and retains a local recovery copy accessible through **Recover workspace from before last online restore**. Loading is explicit, not a live collaborative merge: use the latest restore point before working on another device. Each save creates a separate restore point rather than overwriting another device's work. The panel lists the 20 newest versions. Older restore points and their original files remain stored until an administrator removes them. Identical original bytes are deduplicated within an account.

Without signing in and making the first online save, the workspace remains local. Localhost and the deployed domain have separate local copies. No material is automatically published or committed to the repository. Quiz progress and World pages retain their existing code and tables; Google sign-in shares the site's existing Supabase session.

### One-time Supabase setup

1. Open https://supabase.com/dashboard/project/xsscvdooviztaxzuwbmr/sql/new and run **dev/supabase_workspace_storage.sql**. It creates the private `workspace-references` bucket and the `tesselate_workspace_snapshots` table, with authenticated users restricted to their own rows and file paths.
2. Under **Authentication → URL Configuration → Redirect URLs**, allow `https://tesselate.ca/index.html` (and the exact localhost URL if testing locally).
3. Sign in on the site, save a small reference online, then load it in a second browser signed in to the same account. Confirm that a different account cannot see the restore point or download its files. The app's public key cannot perform the initial schema/policy setup; no service key belongs in the browser.

Cloud adapters and UI are covered by mocked tests, including failure/retry, account path checks, integrity verification, automatic saves, and recovery. Live storage and RLS verification must be completed after running this SQL. Storage and bandwidth use your existing Supabase plan; this change does not upgrade it.

Use **Export backup** regularly, especially before clearing browser data or changing devices. It downloads JSON containing workspace metadata and every uploaded original. Built-in repository files are linked, not duplicated in the backup. **Restore backup** validates the file and offers a merge: matching IDs are updated, unrelated entries remain, and uploaded bytes are restored. Keep backups private if your source files are private. Large backups require enough browser memory to encode/decode their files.

Uploads are limited to 50 MB per file and 100 MB per batch; both browser capacity and your Supabase plan apply. Quota failures leave the prior local state intact. Stale tabs cannot overwrite changes saved by another tab; reload the stale tab before saving.

## Updating the public catalog

- `index.html`: accessible application shell and navigation.
- `assets/workspace/workspace.css`: responsive light/dark styling.
- `assets/workspace/workspace.js`: routing, forms, source relationships, IndexedDB transactions, and backup handling.
- `assets/workspace/cloud.js`: Google sign-in, private original uploads, and verified online restore points.
- `dev/supabase_workspace_storage.sql`: online table, private bucket, and access policies.
- `assets/workspace/catalog.js`: generated public course/page/reference catalog.
- `dev/build-workspace-catalog.cjs`: course definitions and filesystem indexing.

To add shared, repository-backed material, place the files in the appropriate course directory, update course definitions in the generator when needed, and run:

```sh
node dev/build-workspace-catalog.cjs
```

The generator includes HTML pages directly within course folders and PDFs within its configured reference directories. ENGR 290 also indexes its original DOCX and PPTX sources. Edit `engr290/content.json`, run `node dev/build-engr290.cjs`, then rebuild the catalog to update its static lessons and browser question bank. Quiz and test attempts save separately in localStorage; they are not included in workspace backups or online saves. New catalog entries merge into existing browser workspaces without replacing personal edits. Commit/deploy the referenced files together with the catalog; this workspace currently includes pre-existing untracked study material. To publish a wholly new course for everyone, add its definition and directory mapping in the generator. Courses added through the UI are personal to the browser.

## Verification

COMP 139E is in Fall 2026. `comp139e/workspace` is the portable copy of the existing C++/MATLAB setup (sources, lab starters, references, CMake, VS Code tasks, and local Python dashboard). The hosted Code Desk edits and runs 83 C++ projects plus a scratchpad through the public Judge0 CE API. It also displays the two MATLAB labs (MATLAB execution is separate). Source edits and stdin persist in browser localStorage, separate from workspace backups. Compile & run sends only the selected program files and input to Judge0; no credentials or local server are needed. Input is batched and ends with EOF. Each run has fresh fixture files, 5 seconds CPU / 10 seconds wall time, and a 90-second client wait deadline. Stop waiting cancels polling, not remote execution. File exercise output is appended to the console. Service outages and rate limits preserve edits. The optional local dashboard supports interactive input, EOF/stop, and native debugging. `comp139e/setup.html` explains launching it and provides a source-only ZIP. No local service is exposed remotely. The original course folder is preserved; completed submission folders and generated builds are not imported.

To refresh from the original setup, run `python dev/import-comp139e.py PATH_TO_Template/COMP139E`, `node dev/build-comp139e.cjs`, `python dev/package-comp139e.py`, and `node dev/build-workspace-catalog.cjs`. The builder generates independent online recipes with `dev/build-comp139e-online.cjs` and also adds selection links to the downloadable dashboard. The 18 lesson pages use the existing tutorial guide and commented code; 36 original practice questions live in `dev/comp139e-content.cjs`. Source files keep C++ syntax, while mathematical formulas use typeset fractions. Run `dev/comp139e-smoke.cjs` for hosted UI checks. `node dev/comp139e-online-build-check.cjs` compiles and links every online recipe with GCC. Serve the repo on port 8765 and run `node dev/comp139e-online-smoke.cjs --live` for real remote compilation, input, files, errors, saved drafts, and resilience checks (omit `--live` for mocked API checks). Override `COMP139E_TEST_URL` to verify the deployed desk. The protocol is documented at https://ce.judge0.com/. Build the imported workspace with its `scripts/build.ps1` and run `scripts/check_tutorials.py`, `scripts/check_examples.py`, and `scripts/check_dashboard.py` inside it to verify native behavior. MATLAB execution needs MATLAB and is not covered by these checks.

MATH 250B is in Fall 2026 and uses the supplied Fall 2025 PDFs as references. Its eight lessons and 48 original practice questions cover multivariable and vector calculus. Edit `dev/math250b-content.cjs`, run `node dev/build-math250b.cjs`, and then run `node dev/build-workspace-catalog.cjs`. The builder validates TeX and renders static lesson equations with KaTeX; local KaTeX assets also render interactive questions and feedback, with no CDN needed. The shared practice engine keeps each course's attempts in separate localStorage entries. `dev/math250b-smoke.cjs` verifies equations, all question answers, persistence, timed tests, and mobile layouts. As with ENGR 290, practice attempts are separate from workspace backups.

`dev/workspace-smoke.cjs` runs against a temporary local server and isolated Chrome contexts, covering catalog paths, course creation, uploads, persistent file bytes, reference linking/unlinking, note rendering, filtering, backup restore, invalid URLs/backups, stale-tab conflicts, and responsive layout. It does not touch your regular browser profile.

Install Playwright separately if it is not available; the site itself does not need it. Example in PowerShell:

```powershell
npm install --prefix "$env:TEMP\tesselate-browser-check" --no-audit --no-fund playwright
$env:NODE_PATH = "$env:TEMP\tesselate-browser-check\node_modules"
node dev/workspace-smoke.cjs
node dev/workspace-cloud-test.cjs
```

This uses an installed Chrome browser. Screenshots and a test backup are written under the system temporary directory in `tesselate-workspace-check`.

COMP 139E beginner support: `comp139e/beginner.js` supplies escaped C++ syntax colours, reading explanations, and tips for all 18 tutorials. `beginner-desk.js` synchronizes an accessible textarea with its coloured display and line numbers; compilation always uses the original textarea text. Beginner explanations default on and can be hidden with a saved browser preference. The line guide is a lexical reading aid, not a debugger or a full C++ parser. Lesson examples use the same renderer at build time. Run `node dev/comp139e-beginner-check.cjs` with Playwright and the local server on port 8765 to check text preservation, explanations, scrolling, themes, persistence, and mobile layout.

## MATH 252 course library

MATH 252 Applied Differential Equations is in Fall 2026. `math252/materials.json` records all 52 distinct resources linked from Gilles Cazelais’s course and notes pages on September 22, 2026, including 44 original PDFs (566 pages). Original URLs and download metadata are retained. A Desmos graph image is also preserved locally. The seven remaining items link to videos, further reading, and suggested homework. The homework page cites the 10th textbook edition while the notes page cites the 11th; the library displays this distinction. The catalog keeps originals unreviewed until users link actual study pages, rather than marking everything converted merely because the library lists it.

Run `node dev/build-math252.cjs` and `node dev/build-workspace-catalog.cjs` after changing the manifest or materials. The static library works without JavaScript; JavaScript adds filtering and the shared theme control. PDFs are preserved unmodified. No recurring sync is configured.

### MATH 252 simplified lessons

`dev/math252-lessons.cjs` contains 21 original beginner lessons in five units, 27 worked examples, and 21 practice problems with revealable worked solutions. Each lesson includes prerequisites, method selection, a checklist, explicit steps, an answer check, a common mistake, previous/next navigation, and source PDF links. `math252/lessons.html` is the searchable entry point and method chooser; `math252/review.html` remains the original source library.

Run `node dev/build-math252-lessons.cjs`, `node dev/build-math252.cjs`, and `node dev/build-workspace-catalog.cjs`. The lesson builder validates every TeX expression and renders KaTeX HTML/MathML at build time using the existing local fonts. Lessons, navigation, and native solution disclosures work without JavaScript; JavaScript adds topic filtering and theme selection. The manifest links lessons to their source reference IDs in the workspace. `dev/check-math252-math.py` uses SymPy to verify the worked example results, IVP conditions, transform pairs, and series recurrences.

## Fall 2026 D2L index (September 23)

`dev/d2l-materials.cjs` records verified visible material titles and source URLs for all six Fall courses. It contains 38 Physics topics, 26 Circuits topics, six Engineering references, 42 Computing topics, and five Math resource/assignment links. D2L links require the student's existing Camosun access; no credentials, grades, submissions, or class lists are stored. Source files were not downloaded by this import. Empty or unreleased modules are not presented as completed content. Links are a dated snapshot, not an automatic sync.

Run `node dev/build-fall-courses.cjs` and `node dev/build-workspace-catalog.cjs` after editing the source manifests. The first command builds six searchable material libraries and six original introductory Physics/Circuits lessons with typeset equations and labeled diagrams. Related D2L topic links are contextual reading, not claims that the instructor's file contents were reproduced. The previously created Physics Tutorial 2 worked-solutions PDF is included. Existing Math, Engineering, and Computing lessons remain intact. Existing browser workspaces receive new catalog entries without overwriting personal edits.

## September 23 course learning paths

Course pages now open on ordered **Lessons**, with separate **Practice**, **References**, and **My pages & tools** views. The managed path is read from `assets/workspace/learning-paths.js`, so existing personal course/page edits are not overwritten. Rebuild with `node dev/build-learning-paths.cjs`.

Physics source package: `2026F PHYS-210-X01A - Electricity and Magnetism - 9232026 - 112 PM.zip`, supplied by the user. The source package and the full Young/Freedman textbook remain outside this public repository. D2L originals remain authenticated links.

`dev/physics-course.cjs` contains 13 concise guides spanning the Fall 2026 syllabus and 14-week timeline, including a lab-skills companion. `dev/physics-practice.cjs` contains all seven problems from Homework 1 and 2 (source numbers 21.1, 21.3, 21.9, 21.63, 21.65, 21.78, 21.79). Values and requests are preserved; prompts and explanations are rewritten. Each answer and method was visually compared against the supplied instructor solution PDFs. Page references in the practice UI refer to those PDFs, not the 15th edition textbook. Other lesson examples are original practice, not claimed as instructor solutions.

Build: `node dev/build-physics-course.cjs`, `node dev/build-learning-paths.cjs`, then `node dev/build-workspace-catalog.cjs`. `build-fall-courses.cjs` also invokes the first two to avoid replacing the Physics hub with its old introduction. Verify with `node dev/check-physics-course.cjs`.

Practice notes and self-checks use the `tesselate-phys210-practice-v1:` localStorage namespace. They are browser-local and are not included in workspace cloud backup. A storage failure leaves practice usable and is reported in the status line. Numeric answer checks cover the specifically labelled result, allow 2% rounding, and never gate access to solutions.

Coverage is explicit in the learning-path data: Engineering remains limited to the supplied materials topics, Circuits has three introductory lessons, and Calculus uses the supplied 2025 references. These are not represented as full current-course conversions.

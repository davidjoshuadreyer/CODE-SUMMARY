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

COMP 139E is in Fall 2026. `comp139e/workspace` is the portable copy of the existing C++/MATLAB setup (sources, lab starters, references, CMake, VS Code tasks, and local Python dashboard). The hosted Code Desk searches 85 programs and previews their actual sources; native build/run, interactive input, EOF/stop, and generated files remain in the local dashboard. `comp139e/setup.html` explains launching it and provides a source-only ZIP. No local service is exposed remotely. The original course folder is preserved; completed submission folders and generated builds are not imported.

To refresh from the original setup, run `python dev/import-comp139e.py PATH_TO_Template/COMP139E`, `node dev/build-comp139e.cjs`, `python dev/package-comp139e.py`, and `node dev/build-workspace-catalog.cjs`. The builder also adds selection links to the downloadable dashboard. The 18 lesson pages use the existing tutorial guide and commented code; 36 original practice questions live in `dev/comp139e-content.cjs`. Source files keep C++ syntax, while mathematical formulas use typeset fractions. Run `dev/comp139e-smoke.cjs` for hosted UI checks. Build the imported workspace with its `scripts/build.ps1` and run `scripts/check_tutorials.py`, `scripts/check_examples.py`, and `scripts/check_dashboard.py` inside it to verify native behavior. MATLAB execution needs MATLAB and is not covered by these checks.

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

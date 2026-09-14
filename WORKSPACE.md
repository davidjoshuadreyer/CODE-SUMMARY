# Tesselate study workspace

Open `index.html` through your usual local static server or the deployed site. The dashboard uses plain HTML, CSS, and JavaScript; there is no build step or new runtime package dependency.

## Everyday use

1. Choose **Active semester → New semester** or use the semester initialized from today's date.
2. Select **Add course** and enter the code, name, and semester. **Edit course** can move a course to a different semester. Older semesters remain in **Past semesters**, and the selector can make them active again.
3. Open a course and **Upload references**. Multi-file selection and drag/drop are supported. Files start as **Unused**. Uploads from the global library can be left unassigned.
4. **Manage** a reference to add notes or mark it **In progress**.
5. **Add study page** to write plain-text notes or link a page, quiz, lab report, or exam. Select the reference materials used. Alternatively, open a reference and select the existing study pages made from it.
6. A reference becomes **Converted** whenever at least one study page links to it. Removing its last link restores the previous progress. This is a tracking workflow; it does not automatically generate summaries or quizzes.

The four existing courses are grouped under Winter 2026 based on their existing course materials. All old page URLs remain intact. The catalog also exposes Statistics and lab reports that weren't previously linked from the home page. Existing PDFs start as **Needs review**, since their conversion history is unknown.

## Storage and backups

New courses, notes, reference metadata, and uploaded file bytes live in IndexedDB in the current browser and site origin. They are **not automatically published, synced to Supabase, or committed to this repository**. Localhost and the deployed domain have separate workspaces. Existing quiz progress, account features, and World pages retain their original storage and code.

Use **Export backup** regularly, especially before clearing browser data or changing devices. It downloads JSON containing workspace metadata and every uploaded original. Built-in repository files are linked, not duplicated in the backup. **Restore backup** validates the file and offers a merge: matching IDs are updated, unrelated entries remain, and uploaded bytes are restored. Keep backups private if your source files are private. Large backups require enough browser memory to encode/decode their files.

Uploads are limited to 50 MB per file and 100 MB per batch; the browser's available storage is the total limit. Quota failures leave the prior state intact. Stale tabs cannot overwrite changes saved by another tab; reload the stale tab before saving.

## Updating the public catalog

- `index.html`: accessible application shell and navigation.
- `assets/workspace/workspace.css`: responsive light/dark styling.
- `assets/workspace/workspace.js`: routing, forms, source relationships, IndexedDB transactions, and backup handling.
- `assets/workspace/catalog.js`: generated public course/page/reference catalog.
- `dev/build-workspace-catalog.cjs`: course definitions and filesystem indexing.

To add shared, repository-backed material, place the files in the appropriate course directory, update course definitions in the generator when needed, and run:

```sh
node dev/build-workspace-catalog.cjs
```

The generator includes HTML pages directly within course folders and PDFs within its configured reference directories. New catalog entries merge into existing browser workspaces without replacing personal edits. Commit/deploy the referenced files together with the catalog; this workspace currently includes pre-existing untracked study material. To publish a wholly new course for everyone, add its definition and directory mapping in the generator. Courses added through the UI are personal to the browser.

## Verification

`dev/workspace-smoke.cjs` runs against a temporary local server and isolated Chrome contexts, covering catalog paths, course creation, uploads, persistent file bytes, reference linking/unlinking, note rendering, filtering, backup restore, invalid URLs/backups, stale-tab conflicts, and responsive layout. It does not touch your regular browser profile.

Install Playwright separately if it is not available; the site itself does not need it. Example in PowerShell:

```powershell
npm install --prefix "$env:TEMP\tesselate-browser-check" --no-audit --no-fund playwright
$env:NODE_PATH = "$env:TEMP\tesselate-browser-check\node_modules"
node dev/workspace-smoke.cjs
```

This uses an installed Chrome browser. Screenshots and a test backup are written under the system temporary directory in `tesselate-workspace-check`.

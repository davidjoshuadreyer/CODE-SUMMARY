# Business Lab automatic cycle updates

The scheduled research cycle updates `business-lab.html` directly, so nobody copies or pastes JSON. It does this with a **cycle key**: a random secret that can only read and replace the one Business Lab record of the account that created it. It cannot read study data, references, other accounts, or sign in as anyone.

Never commit lab data or the key to this repository. The repository is public and is served as tesselate.ca.

## One-time setup

1. **Server.** Run `dev/supabase_business_lab_cycle.sql` once in the Supabase SQL editor (after `dev/supabase_study_plan.sql`). It is safe to re-run.
2. **Key.** Sign in to Business Lab, open **Backup, restore and full replace**, and press **Create cycle key**. Copy the key it shows. It is shown once and only its SHA-256 hash is stored.
3. **Cycle environment.** In the cloud environment that runs the cycle:
   - add the key as the secret/environment variable `BUSINESS_LAB_KEY`;
   - allow network access to `xsscvdooviztaxzuwbmr.supabase.co`.

To revoke access, press **Turn off cycle key**. **Replace cycle key** issues a new key and stops the old one at once.

## What each cycle runs

```sh
# Latest saved lab, to plan from (prints JSON; or give a file name to write it)
node dev/business-lab-cycle.cjs pull lab.json

# Save a model's output: an idea round, a cross-review, a weekly update,
# items for the owner's approval queue, or a full lab file.
# Same JSON the page's paste box accepts.
node dev/business-lab-cycle.cjs apply round-claude.json --dry-run   # check only
node dev/business-lab-cycle.cjs apply round-claude.json
```

`apply` merges and validates with the code inside `business-lab.html` itself, so the script and the page always agree on the format. It saves with a revision check. If the page or the other model saved in the meantime, it re-reads and merges again (three tries), and it never overwrites a newer save. Invalid input is refused before anything is written, with the same message the page would show.

## The approval queue

The owner's only regular step is the approval queue at the top of Business Lab. Agents add work there with a `queue` file and act only on what was approved:

```json
{"kind": "queue", "model": "claude", "date": "2026-11-15",
 "items": [{"type": "short", "testId": "exp-03", "title": "…", "summary": "…", "link": "https://…"},
           {"type": "spend", "title": "…", "amount": 12},
           {"type": "start", "cardId": "c-007", "title": "…"}]}
```

Types are `short`, `page`, `release`, `issue`, `spend`, `start` (needs `cardId`), `kill` (needs `testId`) and `other`. An item expires 3 days after its date if nobody approves it, and expired work does not ship. Pull the lab to see each item's `status`. After publishing approved work, send an `update` with `"queue": [{"id": "q-0001", "status": "shipped"}]`. Agents can also set `withdrawn` on an item that is still waiting, but they can never approve one.

Dates follow `BUSINESS_LAB_TZ` (default `America/Vancouver`). `SUPABASE_URL` and `SUPABASE_ANON_KEY` default to the public values in `assets/workspace/cloud.js`.

## Tests

```sh
node dev/business-lab-cycle-test.cjs        # client, against a mocked Supabase
# SQL, against any scratch Postgres 16 database (never the real project):
psql -d scratch -v ON_ERROR_STOP=1 -f dev/business-lab-cycle-sql-shim.sql \
  -f dev/supabase_study_plan.sql -f dev/supabase_business_lab_cycle.sql \
  -f dev/business-lab-cycle-sql-test.sql
```

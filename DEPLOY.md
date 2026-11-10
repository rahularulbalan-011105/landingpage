# Deploying the landing page & dashboard

> **Merging on GitHub does not make anything live.** After merging into `main`,
> deploy by hand with the steps below.

| | |
|---|---|
| **Live at** | https://constructa-page.atumx.in |
| **Repo / branch that goes live** | `landingpage` / **`main`** |
| **Hosted on** | Vercel — team **Consstructa**, project **constructa** (account `constructaofficial`) |
| **How** | Vercel CLI from your machine (the project is not connected to GitHub) |

The 3D editor (constructa.atumx.in) is a **separate app** in the `Imaginarium` repo,
deployed with GitHub Pages — see `DEPLOY.md` in that repo.

---

## Deploy (every time)

```bash
cd /c/usman/atumx/landingpage
git checkout main
git pull origin main
npx vercel@latest --prod
git checkout development
```

`npx vercel@latest --prod` uploads this folder, builds it on Vercel with the
project's saved environment variables, and switches the live domain to the new
version. It does not touch GitHub or the database.

**Check:** Vercel → project **constructa** → Overview. *Source* shows your latest
commit and *Status* is **Ready**. Then open the site in an incognito window
(hard-refresh with Ctrl+Shift+R if needed).

## First time on a new computer

```bash
npx vercel@latest login     # "Continue with Email" → the constructaofficial account
npx vercel@latest link      # Yes → team Consstructa → link to EXISTING project → constructa
```

At `link`, **never choose "Create a new project"** — that makes an empty project
with no domain and no environment variables.

`link` writes `.vercel/` and `.env.local`; both are git-ignored. If it adds an
`.env*` line to `.gitignore`, discard it (`git checkout -- .gitignore`) —
`.env.local` is already ignored by `*.local`.

## If the deploy says "Not authorized"

```bash
npx vercel@latest logout
npx vercel@latest login
npx vercel@latest --prod
```

Still failing? Create a token in Vercel → Account Settings → Tokens (scope:
Consstructa) and run:

```bash
npx vercel@latest --prod --token <token>
```

Never commit or share the token. For details on what is refused, run
`npx vercel@latest --prod --debug`. Also check the Vercel dashboard for a warning
banner on the team (email verification, usage limit, blocked account).

## Roll back

Vercel → project **constructa** → **Instant Rollback** restores the previous
version in one click. Old deployments stay under *Deployments*.

---

## Usual flow for a change

1. Work on `development`, commit, `git push origin development`.
2. On GitHub, open a PR **`development` → `main`** and merge with
   **Create a merge commit** (keeps the same commits on both branches; this
   project syncs with Lovable, so avoid rewriting published history).
3. Deploy with the steps above.
4. Test in an incognito window.

## Database changes (Supabase)

SQL in `supabase/migrations/` is **not** applied by deploying. Run it once in
Supabase → **SQL Editor** (project `construta`, branch `main`) → New query →
paste → Run. Supabase warns about "destructive operations" for any `drop`;
read the query, then confirm. Keep the file in the repo as the record.

## Safe to ignore

- The red **"Vercel — Account is blocked"** check on PRs comes from an old Vercel
  account. It does not block merging and deploys nothing.
- `src/routeTree.gen.ts` showing as modified after `npm run dev` / `npm run build`
  is only line endings. Discard it: `git checkout -- src/routeTree.gen.ts`.

## Local development

```bash
npm run dev        # http://localhost:8080
```

To make Open/View in the local dashboard open the **local** editor instead of the
live one, create `.env.development.local` (git-ignored, read only by `npm run dev`):

```
VITE_EDITOR_ORIGIN=http://localhost:5173/Imaginarium
```

Never put this in `.env.local` — production builds made on your machine read that
file, and the live site would start sending users to localhost.

Local development uses the **production** Supabase database: changes to your own
robots locally are real changes.

# Lavender Language Center

English-first nonprofit website with an owner-only content dashboard, Cloudflare D1 persistence and ChatGPT sign-in through Sites.

## Live links
- Website: https://lavender-language-center-draft.thutazawjohan.chatgpt.site/
- Dashboard: https://lavender-language-center-draft.thutazawjohan.chatgpt.site/admin

The hosted site remains private. Sign in using the owning ChatGPT account. Only the account whose email matches the server-side ADMIN_EMAIL setting can access the dashboard or write content. There are no shared passwords in this source.

## Content workflow
1. Open `/admin` and choose **New entry**.
2. Choose **Post** or **Event**, then a content category.
3. Enter a title, short summary and full content. For events, add a date; describe any event time and timezone in the full content.
4. Optionally add an HTTPS source/registration link or an approved public image URL. Direct image upload is not included.
5. Choose **Draft** to keep it private to the dashboard, or **Published** to display it on the website; click **Save entry**.
6. Use **Edit** to update a saved entry. Change it back to Draft to remove it from the visitor-facing site without deleting it.
7. Refresh the website after saving. Content changes do not require a code deployment.
8. Download a JSON content backup from the dashboard. The backup includes drafts; keep it private. Backup import is not implemented.

Deletion requires confirmation and is permanent. New records are Draft by default. Unsaved changes trigger a warning before closing the page. Conflicting edits from another tab are rejected instead of silently overwriting newer content.

## Source map
- `content/home.html`: homepage markup and approved static copy.
- `content/admin.html`: dashboard form and layout.
- `public/style.css`, `public/script.js`: homepage style, filtering, published content and article/event dialogs.
- `public/admin.css`, `public/admin.js`: dashboard styling and editing behavior.
- `public/assets/llc-logo.jpeg`: user-supplied LLC logo.
- `app/api/admin/route.ts`: protected list, save and delete endpoints.
- `app/api/content/route.ts`: published content only.
- `lib/content.ts`: authorization, validation and database helpers.
- `db/schema.ts`, `drizzle/`: schema and versioned migration.
- `scripts/generate-pages.mjs`: generates HTML modules for the server. Build/dev run it automatically.
- `.openai/hosting.json`: existing Site identity and DB binding.

## Local development
Requires Node.js >=22.13.0 and npm.

```sh
npm ci
cp .dev.vars.example .dev.vars
npm run build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_cultured_agent_brand.sql
npm run dev -- --hostname 127.0.0.1 --port 5173
```

Apply a migration only once per local database. The supplied local example uses `seedy@sites.test`, the starter's loopback-only mock identity. Visit `http://127.0.0.1:5173/signin-with-chatgpt?return_to=%2Fadmin` to sign in locally. Production authentication is owned by Sites; local mock sign-in is excluded from production builds. Local test content and database files are not included in deployment or this code archive.

For a new schema change, update `db/schema.ts`, run `npm run db:generate`, inspect the resulting schema-only SQL, and apply the new local migration. Sites applies hosted migrations during deployment.

## Deployment and security
Publish through the Sites workflow to the existing project. Keep the server-side `ADMIN_EMAIL` secret configured to the authorized owner's account. Never put its actual value or any token in source or browser code. This source archive does not include hosted credentials or database records. A code ZIP alone is not a database backup.

The API checks identity and the admin allowlist server-side. Changes require same-origin JSON requests. Inputs have length limits, dates are validated, links permit HTTPS only, and article bodies render as plain text. Drafts are never returned from the visitor-facing endpoint. The source contains no HR PDFs or extracted personnel data.

If the site is later made public, keep the admin allowlist and authentication checks. Sharing access does not automatically authorize editors. This implementation currently supports the single configured owner, not multiple editor roles.

## Editorial status
The prototype contains no invented accomplishments, staff profiles, classes, events or published posts. Category cards are clearly labeled placeholders until approved posts are published. The public site uses only approved user-supplied social links and logo. Full-time CMS features such as direct uploads, scheduled publishing and revision history are not included.

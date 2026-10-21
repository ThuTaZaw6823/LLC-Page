# GitHub Pages and the dashboard

Expected frontend URL after Pages is enabled and deployment succeeds:
https://thutazaw6823.github.io/LLC-Page/

## Enable Pages
In repository **Settings → Pages → Build and deployment → Source**, choose **GitHub Actions**. The included workflow publishes on pushes to `main`. An empty repository must receive its first push before these controls are usable.

## What runs where
- GitHub Pages: public HTML/CSS/JavaScript homepage.
- Existing hosted backend: sign-in, owner-only dashboard and D1 database.
- The homepage reads only published entries from the backend's `/api/content` endpoint.
- `/LLC-Page/admin/` redirects to the secure hosted dashboard.

The backend must permit anonymous published-content reads and CORS from `https://thutazaw6823.github.io`. Changing the backend to public requires owner approval; the admin allowlist must remain enabled. GitHub Pages cannot run the existing server or D1 database. Do not put backend credentials in GitHub Pages or Actions.

Build locally: `node scripts/build-pages.mjs`. The generated `pages/` directory is ignored by Git; Actions regenerates it. The normal server-based project still uses `npm run dev`.

Published Post/Event changes appear after refreshing the public homepage; a GitHub push is needed only for source/design changes. This depends on the hosted backend remaining available and its content endpoint being readable by the public homepage.

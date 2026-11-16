# me-HR Admin Panel

Separate Next.js admin app for content (Insights, Case studies, Careers) and website analytics.

## Stack

- **Next.js 15** (App Router) · port **3001**
- **MongoDB** (Mongoose) — content + analytics events
- **Cloudinary** — image uploads (hero images); Mongo stores URLs
- **TipTap** — free rich-text editor (better DX than TinyMCE for React)
- **jose + bcryptjs** — secure HTTP-only cookie sessions

## Login

Set in `.env.local` (already scaffolded for local):

- Username: `Me@hradmin`
- Password: `Mehrpune@2027`

Password is hashed with bcrypt on first login / seed — never stored in plaintext in the database.

## Setup

1. Copy `.env.example` → `.env.local` and fill MongoDB + Cloudinary + `AUTH_SECRET`.
2. Run MongoDB locally or use Atlas URI.
3. Install & start:

```bash
cd admin
npm install
npm run dev
```

Open http://localhost:3001/login

## SEO & AEO (agency management)

Admin → **SEO & AEO** manages live page titles, metas, keywords, robots.txt, llms.txt, organization JSON-LD, redirects and scores.

Public endpoints (CORS open for the marketing site):

- `GET /api/public/seo` — all pages + settings
- `GET /api/public/seo?path=/services` — one page
- `GET /api/public/seo/robots` — robots.txt body
- `GET /api/public/seo/llms` — llms.txt body
- `GET /api/public/seo/sitemap` — XML sitemap

The public Next.js site applies page SEO at runtime via `DynamicSeo` when `NEXT_PUBLIC_ADMIN_API_URL` points at this admin. For IIS static hosting, proxy `robots.txt` / `llms.txt` / `sitemap.xml` to these APIs (see Publish tab in admin).

4. After login, open **Dashboard → Seed existing content** to import current Insights, Case studies and Careers from the public site data.

## Menus

| Menu | Features |
|------|----------|
| Dashboard | Page views, clicks, sessions, form submits, top pages, drop-off/scroll, content counts, charts |
| Insights | List + TipTap editor + Cloudinary hero + draft/publish CRUD |
| Case studies | List + editor + hero + draft/publish CRUD |
| Testimonials | List + editor + Active checkbox + seed of existing client voices |
| Careers | List + **Active checkbox** (checked = live, unchecked = draft) + full CRUD |

## Public APIs (for the website)

- `GET /api/public/insights`
- `GET /api/public/case-studies`
- `GET /api/public/careers` (active only)
- `POST /api/analytics/track` (CORS open for the marketing site)

## Frontend wiring

Set on the public site:

- Next.js: `NEXT_PUBLIC_ADMIN_API_URL=http://localhost:3001`
- Vite: `VITE_ADMIN_API_URL=http://localhost:3001`

The site posts pageviews, clicks, scroll depth and exits to the admin analytics API so the Dashboard fills in.

## Security notes

- Admin routes require a signed HTTP-only cookie.
- Upload / CRUD APIs require auth.
- Re-seed after first import requires `x-seed-secret: <AUTH_SECRET>` header.
- Do not commit `.env.local`.

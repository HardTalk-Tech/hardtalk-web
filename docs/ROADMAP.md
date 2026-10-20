# HardTalk website — development roadmap

How the site goes from today's static single page to a multi-page site with Firestore-backed Blog and Top Stories, managed through an admin dashboard. Project-wide coding rules live in [AGENTS.md](../AGENTS.md). This file covers *what* gets built, in *what order*, and the architecture decisions behind it.

| Phase | Goal | Status |
|---|---|---|
| 0 | Single-page build from the design export | Done |
| 1 | Split into separate pages once the design is final | Planned |
| 2 | Content layer abstraction (still static data) | Planned |
| 3 | Firebase setup and public read path | Planned |
| 4 | Admin authentication | Planned |
| 5 | Admin dashboard: Blog and Stories CRUD | Planned |
| 6 | Hardening, SEO, launch | Planned |

Phases 1 and 2 have no backend dependency and can be done in either order. Phase 2 must land before Phase 3.

---

## Phase 0 — Single page (done)

- All sections render from `src/app/page.tsx`, with content from `src/utils/site-data.ts`.
- Hash-link navigation. `#faq` and `#login` have no target yet.
- Hero background and blog cover photos are `ImageSlot` placeholders (the design had no images for them).

## Phase 1 — Multi-page split

Do this only after the single-page design is signed off.

**Route structure**

```
src/app/
  layout.tsx                  root: <html>, fonts, globals.css only
  (site)/
    layout.tsx                Navbar + <main> + Footer
    page.tsx                  home (condensed sections + teasers)
    about/page.tsx
    services/page.tsx
    stories/page.tsx
    stories/[slug]/page.tsx
    blog/page.tsx
    blog/[slug]/page.tsx
    contact/page.tsx
    faq/page.tsx
  (admin)/                    added in Phase 4; own layout, no marketing chrome
```

Route groups `(site)` and `(admin)` don't affect URLs. They let the public site and the dashboard have completely different layouts.

**Tasks**
- Move Navbar/Footer from `page.tsx` into `(site)/layout.tsx`.
- Change `navLinks` hrefs from `#hash` to routes and render them with `next/link`. Highlight the current link with `usePathname()` in Navbar (it's already a client component).
- Hero CTAs, "View All Stories/Blog Posts" and "Read Story/Article" links point to real routes.
- Each page exports its own `metadata` (or `generateMetadata` for `[slug]` pages).
- The home page keeps the hero, clients, services and CTA, plus a 3-item teaser of stories and blog posts (the current sections, fed with the latest 3 items).
- Sections that depend on scroll position (`ServicesDeck`, `TopStories`) should still work as standalone pages. Check that the sticky/pinned behaviour holds when the section is the first thing on the page.
- Add `not-found.tsx` in `(site)`.

## Phase 2 — Content layer abstraction

Goal: components stop caring *where* content comes from, so Phase 3 only swaps the internals of a few functions.

**Tasks**
1. Move content types from `site-data.ts` to `src/types/content.ts` and extend them to the target model (below). Add `slug` and `id`, and give blog posts a body.
2. Create `src/server/data/blog.ts` and `src/server/data/stories.ts` with async functions that, for now, return the static data:
   - `getPublishedPosts({ limit? })`, `getPostBySlug(slug)`
   - `getPublishedStories({ limit? })`, `getStoryBySlug(slug)`
3. Refactor client components that import dynamic content so they receive it via props from a Server Component parent:
   - `TopStories` → server `TopStories` calls `getPublishedStories({ limit: 3 })` and renders a client `StoriesScroller` with `stories` as a prop.
   - `LatestBlog` (already a server component) calls `getPublishedPosts({ limit: 3 })` instead of importing `blogPosts`.
   - If services become editable (see open decisions), give `ServicesDeck` the same treatment.
4. Services, clients, stats and features stay static in `site-data.ts` unless the scope changes (see open decisions).

## Phase 3 — Firebase setup and public read path

**Packages:** `firebase-admin` (server), `server-only`. The client `firebase` SDK isn't needed until Phase 4.

**Server-only modules**

```
src/server/
  firebase/admin.ts      initializeApp once (reuse existing app), export db, auth, storage
  data/blog.ts           Firestore queries + DTO mapping + caching
  data/stories.ts
```

Every file under `src/server/` starts with `import "server-only"`.

**Firestore data model**

`blogPosts/{postId}`

| Field | Type | Notes |
|---|---|---|
| `slug` | string | unique, URL-safe; enforced in the create/update action |
| `title` | string | |
| `excerpt` | string | card text |
| `body` | string | format TBD (see open decisions) |
| `category` | string | e.g. "Media Monitoring" |
| `coverImage` | map `{ url, path, alt }` | `path` = Storage object path, used for deletes |
| `status` | `"draft" \| "published"` | public queries filter on `published` |
| `featured` | boolean | featured card in the blog grid |
| `publishedAt` | Timestamp \| null | set on first publish; sort key |
| `createdAt`, `updatedAt` | Timestamp | server timestamps |
| `authorUid` | string | admin who created it |
| `seo` | map `{ title?, description? }` | optional overrides |

`stories/{storyId}`: same shape. `excerpt` maps to the current story `description`, and `category` covers "Mobility", "Healthcare", etc.

Indexes: composite `status ASC, publishedAt DESC` on both collections.

**Caching (Cache Components)**

```ts
// src/server/data/blog.ts (shape, not final code)
export async function getPublishedPosts(limit = 20) {
  "use cache";
  cacheTag("blog");
  cacheLife("hours");
  const snap = await db.collection("blogPosts")
    .where("status", "==", "published")
    .orderBy("publishedAt", "desc").limit(limit).get();
  return snap.docs.map(toBlogPostDTO); // plain objects, ISO date strings
}
```

Cache tags (writers in Phase 5 must use the same names):

| Tag | Covers |
|---|---|
| `blog` | any blog list (home teaser, /blog) |
| `blog:<slug>` | a single post page |
| `stories` | any stories list |
| `story:<slug>` | a single story page |

**Dynamic routes**
- `blog/[slug]` and `stories/[slug]` use `generateStaticParams` to prerender published slugs. With Cache Components on, it **must return at least one param**: an empty array is a build error. Guard against an empty collection (e.g. fall back to one known slug, or check the current docs for the recommended pattern).
- Call `notFound()` when a slug doesn't resolve or the item is a draft.

**Other tasks**
- Add Firebase Storage hosts to `images.remotePatterns` in `next.config.ts`.
- Write a one-off seed script (`scripts/seed-content.ts`, run locally with admin credentials) that imports the current static stories and blog posts into Firestore.
- Firestore security rules: **deny all client reads and writes** on content collections. All access goes through the Admin SDK on the server, which bypasses rules.

**Environment variables (server-only)**

```
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=          # keep \n escapes; replace(/\\n/g, "\n") when loading
FIREBASE_STORAGE_BUCKET=
```

## Phase 4 — Admin authentication

**Approach:** Firebase Auth in the browser for sign-in, then an httpOnly **session cookie** verified on the server. The server never trusts a client-side auth state.

Flow:
1. `/admin/login` (client component) signs in with the Firebase client SDK (email/password or Google; see open decisions).
2. It sends the ID token to a Server Action `createSession(idToken)`, which verifies it with `auth.verifyIdToken`, checks the `admin` custom claim, then calls `auth.createSessionCookie` and sets an httpOnly, secure, `sameSite=lax` cookie.
3. `src/server/auth/session.ts` exports `requireAdmin()`: read the cookie, `auth.verifySessionCookie(cookie, true)` (with revocation check), confirm the `admin` claim, and redirect to `/admin/login` otherwise. Every admin page and every admin Server Action calls this.
4. `signOut` action: clear the cookie and revoke refresh tokens.
5. `proxy.ts` (Next 16's replacement for middleware) may do an *optimistic* redirect from `/admin/*` to `/admin/login` when the cookie is missing. This is a convenience only. `requireAdmin()` is the actual security check.

**Admins** are granted with a custom claim (`admin: true`) set by a local script (`scripts/grant-admin.ts <email>`). There's no self-registration.

**Cache Components notes:** reading cookies is request-time work. Admin pages read the session inside a `<Suspense>` boundary, not at the top level of the admin layout. See `node_modules/next/dist/docs/01-app/02-guides/authentication-with-cache-components.md`.

**Client env vars:** `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, `NEXT_PUBLIC_FIREBASE_APP_ID`.

## Phase 5 — Admin dashboard (Blog and Stories CRUD)

**Routes**

```
src/app/(admin)/admin/
  layout.tsx              dashboard shell (sidebar, sign-out); session read behind Suspense
  login/page.tsx
  page.tsx                overview: counts, recent drafts
  blog/page.tsx           table: title, status, publishedAt, actions
  blog/new/page.tsx
  blog/[id]/edit/page.tsx
  stories/…               same set
```

Admin UI components go in `src/components/admin/`. Admin styles can live in a separate section of `globals.css` (or a dedicated `admin.css` imported by the admin layout). The dashboard can be plain and functional; it doesn't need the marketing site's look.

**Server Actions** (`src/server/actions/blog.ts`, `stories.ts`)

| Action | Invalidates |
|---|---|
| `createPost(formData)` | `blog` (+ `blog:<slug>` if published) |
| `updatePost(id, formData)` | `blog`, `blog:<oldSlug>`, `blog:<newSlug>` |
| `setPostStatus(id, status)` | `blog`, `blog:<slug>` |
| `deletePost(id)` | `blog`, `blog:<slug>`; also deletes the cover image from Storage |

Same set for stories with the `stories` / `story:<slug>` tags.

Each action:
1. `await requireAdmin()`.
2. Validates `FormData` with a schema (add `zod`).
3. Re-reads the existing document by id from Firestore for updates and deletes, never trusting client-sent fields beyond the edit itself.
4. Writes with `FieldValue.serverTimestamp()` for `createdAt`/`updatedAt`.
5. Calls `updateTag(...)` so the admin sees the change immediately.
6. Returns `{ ok, errors? }` for `useActionState`, or `redirect()`s after success. Revalidate before redirecting.

**Forms:** `<form action={…}>` with `useActionState` for field errors and pending state, with progressive enhancement where practical. See `node_modules/next/dist/docs/01-app/02-guides/forms.md`.

**Image uploads:** actions are capped at 1MB, so the editor uploads the cover image straight from the browser to Firebase Storage (client SDK, signed-in admin), then puts the resulting `path` and `url` in hidden form fields. Storage rules: public read on `content/**`, write only when `request.auth.token.admin == true`, with size and content-type limits.

**Slugs:** generated from the title, editable, validated for format and uniqueness in the action. Decide whether changing a published slug is allowed, or requires a redirect entry.

**Drafts:** draft items are never returned by the public data functions. A preview route (e.g. `/admin/blog/[id]/preview`) renders the public template using an uncached read behind `requireAdmin()`.

## Phase 6 — Hardening and launch

- `app/sitemap.ts` and `app/robots.ts` (sitemap includes published blog/story slugs), plus Open Graph images per post.
- `loading.tsx` / `error.tsx` where data is fetched, and `not-found.tsx` for slugs.
- Real contact details, social links, hero and blog photography (replace the `ImageSlot` placeholders), and a FAQ page.
- Contact form (Server Action + email service), with rate limiting and spam protection.
- Firestore and Storage rules reviewed and tested with the emulator.
- Scheduled Firestore backups.
- Set `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` if the host runs multiple instances.
- Accessibility pass: keyboard focus styles, `prefers-reduced-motion` for the JS-driven animations (currently only the CSS animations respect it).

## Open decisions

These need an answer before the phase that depends on them.

| Decision | Options | Needed by |
|---|---|---|
| Hosting | Vercel / Firebase App Hosting / other. Affects how the `use cache` server cache persists across instances. | Phase 3 |
| Post body format | Markdown (simple, portable) / rich-text JSON from an editor such as Tiptap | Phase 3 |
| Admin sign-in method | Email + password / Google (restricted to company domain) | Phase 4 |
| Which other sections become editable | Only blog + stories (current plan) / also clients, stats, services | Phase 2 |
| Login button in the nav | Admin login link / client portal (the design mentions "24/7 online portal access") / remove | Phase 1 |

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

---

# HardTalk website — project guide

Marketing site for HardTalk (PR and content distribution, Sri Lanka). Next.js 16 App Router, React 19, TypeScript, pnpm. `cacheComponents`, `partialPrefetching` and `reactCompiler` are enabled in `next.config.ts`.

## Current state (read this first)

- **Single page, static content.** Everything renders from `src/app/page.tsx` while the design is still being finalized. Navigation uses hash links (`#about`, `#blog`, …).
- **Content lives in `src/utils/site-data.ts`.** There is no backend yet.
- **Planned, not built:** separate pages, Firestore-backed Blog and Top Stories, and an admin dashboard to manage them. The phased plan is in [docs/ROADMAP.md](docs/ROADMAP.md). Don't start a later phase unless asked, but don't write code that blocks it either (see the rules below).
- The original design export is `index ht.html` in the repo root (untracked, 10MB with images inlined). Use it only as a visual reference; never import from it.

## Folder structure

```
src/
  app/            routes, layouts, globals.css (the single global stylesheet)
  components/
    layout/       Navbar, Footer (site chrome)
    sections/     page sections, grouped in folders when they have sub-parts
    ui/           small reusable pieces (FadeIn, CountUp, ImageSlot)
  utils/          pure helpers, hooks, static content (site-data.ts)
public/images/    static images, grouped by section (services/, stories/)
```

Planned additions (see the roadmap): `src/server/` for server-only code (Firebase Admin, data access, auth, Server Actions), `src/types/` for shared content types, `src/components/admin/` for dashboard UI, and route groups `app/(site)` and `app/(admin)`.

## Conventions

### Components
- Server Components by default. Add `"use client"` only to the component that needs interactivity or browser APIs, and keep that component as small as possible. For example, `ServicesNetwork` stays on the server and only `ServiceNetworkLines` is a client component.
- **Client components receive dynamic content via props; they don't import it.** Blog posts and stories will move to Firestore, which can only be read on the server. Fetch them in a Server Component parent and pass them down, as `LatestBlog` → `BlogCard` already does. Fixed site config (nav links, about copy, hero channels) may still be imported directly. (Known exception to fix in roadmap Phase 2: `TopStories` is a client component that imports `stories` from `site-data.ts`.)
- One component per file, PascalCase file names, default export. Use the `@/` import alias.
- Per-frame animation uses `useAnimationFrame` (`src/utils/use-animation-frame.ts`) and writes styles straight to DOM refs. Don't put per-frame values in React state. `setState` is fine for discrete changes (e.g. the active story).
- With React Compiler on, don't read `ref.current` during render, and don't mutate variables declared outside a callback during render.

### Styling
- All styles go in `src/app/globals.css`, organised by section with BEM-style class names (`.blog-card__title`, `.blog-card--featured`). Tailwind is imported, so utilities are available, but the design system is the named classes. Don't mix the two within a component.
- Use the tokens defined on `:root` (`--color-*`, `--font-*-stack`, `--gutter`, `--ease-*`) instead of new hex values.
- Use inline `style` only for values computed at runtime.
- Breakpoints in use: `1179px` (mobile nav, blog cards stack), `919px` (single-column layouts, hero visual hidden), `900px`/`560px` (services network).
- Fonts are Hanken Grotesk (body) and Playfair Display (headings), loaded via `next/font` in `layout.tsx` as `--font-hanken` / `--font-playfair`.

### Images
- Always use `next/image`. Use `fill` plus `sizes` inside positioned containers. Above the fold, use `loading="eager"` (`priority` is deprecated in Next 16).
- For photography that doesn't exist yet, use `ImageSlot` without a `src`. It renders a captioned placeholder.
- Remote images (Firebase Storage, later) need an entry in `images.remotePatterns` in `next.config.ts`.

### Content and data
- **Today:** edit `src/utils/site-data.ts`.
- **Once Firestore exists:** all reads go through data-access functions in `src/server/data/`. No component may import `firebase-admin` or query Firestore directly.
- Data-access functions return plain serialisable objects (DTOs), never Firestore documents. Convert `Timestamp` to ISO strings and pick only the fields the UI needs.
- Public reads are cached with `"use cache"` plus `cacheTag(...)`. Admin mutations invalidate with `updateTag(...)`. Tag names are listed in the roadmap and must stay consistent between readers and writers.

### Server Actions (admin, later)
- Treat every action as a public POST endpoint. Each action must: (1) verify the admin session itself via `requireAdmin()`, never trusting the UI, (2) validate input with a schema, (3) return only what the UI needs.
- `updateTag` works only inside Server Actions. Use `revalidateTag(tag, "max")` in Route Handlers.
- Default body limit is 1MB. Don't send image files through actions; upload them to Storage and pass the storage path.

### Secrets
- Firebase Admin credentials are server-only env vars (no `NEXT_PUBLIC_` prefix). Only the Firebase web config may be `NEXT_PUBLIC_*`.
- `.env*.local` is gitignored. Keep `.env.example` up to date when adding variables.
- Mark server-only modules with `import "server-only"`.

## Commands

```
pnpm dev      # dev server
pnpm lint     # ESLint (must pass)
pnpm build    # production build (must pass; also type-checks)
```

Before finishing a change, run `pnpm lint` and `pnpm build`. The site owner does visual and UI testing manually. Don't launch browsers or install browser-automation tooling unless asked.

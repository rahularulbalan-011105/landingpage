# AtumX Beta Landing Page

A single-page, dark, modern landing page built to your spec — Linear/Arc/Cursor energy with Geist typography, `#0A0A0A` base, and `#FF6B35` as the sole accent.

## Sections (in order)
1. **Nav** — fixed, transparent → blurred + border after 80px scroll. Wordmark left, "Why" link + "Get early access" button right.
2. **Hero** — full-viewport, eyebrow label, 3-line H1 ("imagine" in orange italic), subhead, credibility line, inline email+button form with expandable "Tell us about yourself" (user type dropdown + robot idea textarea), video placeholder top-right (480×270), scroll indicator.
3. **How it works** — 3 step cards (Build / Code / Run) with hover lift.
4. **Robot gallery** — 6-card grid (3×2 desktop) with image placeholders, name, description, build-time metadata.
5. **Why we built this** — surface-1 background, single-column narrative, signature line.
6. **What makes it different** — 3 split rows (label left, content right) with dividers.
7. **FAQ** — 6-item accordion with smooth expand.
8. **Final CTA** — centered, radial-glow background, repeated email form.
9. **Footer** — wordmark + address, copyright, LinkedIn + YouTube links (no Instagram per your note).

## Design system
- Tokens added to `src/styles.css`: background/surface-1/surface-2, text primary/secondary/tertiary, border, accent + accent-glow, all in oklch.
- **Geist + Geist Mono** loaded via `<link>` in `__root.tsx` head (Google Fonts), wired into Tailwind `@theme` as `--font-sans` / `--font-mono`.
- Motion: fade-in-up on scroll via IntersectionObserver hook; hero word stagger on mount; 200ms `cubic-bezier(0.4,0,0.2,1)` hover transitions; subtle scroll-indicator loop. No parallax, no mouse-follow.
- 6px radii, no pills, no gradients (except the two specified subtle radial glows), no emojis/sparkles.

## Backend (Lovable Cloud)
- Enable Cloud.
- Migration: `beta_signups` table — `id uuid pk`, `email text not null`, `user_type text`, `robot_idea text`, `created_at timestamptz default now()`. RLS on, public INSERT policy (anyone can sign up), no SELECT for anon. Grants per public-schema rules.
- Form submission via browser supabase client → insert row → swap form for "You're in." success state.
- Basic zod validation (email format, length caps) client-side before insert.

## SEO / meta
- `__root.tsx`: sitewide defaults, favicon "A".
- `routes/index.tsx` `head()`: title "Build any robot you imagine. Watch it run. | AtumX", matching description, og:title/og:description/og:type=website, canonical "/", og:url "/". No og:image yet (placeholder would preview worse than none).

## File plan
- `src/styles.css` — add tokens + Geist font-family in `@theme`.
- `src/routes/__root.tsx` — add Google Fonts `<link>` preconnect + Geist stylesheet; sitewide meta + favicon.
- `src/routes/index.tsx` — page composition.
- `src/components/landing/` — `Nav.tsx`, `Hero.tsx`, `SignupForm.tsx`, `HowItWorks.tsx`, `RobotGallery.tsx`, `WhyWeBuilt.tsx`, `WhatsDifferent.tsx`, `Faq.tsx`, `FinalCta.tsx`, `Footer.tsx`.
- `src/hooks/use-reveal.ts` — IntersectionObserver fade-in-up hook.
- `src/lib/beta-signup.ts` — zod schema + insert helper.
- Migration for `beta_signups`.

## Open items / placeholders
- Hero video, robot images, og:image — left as styled placeholders per your spec; swap in when you upload them.
- "Why" nav link currently has no target section name — I'll point it to the "Why we built this" section (smooth-scroll anchor) unless you'd rather it route somewhere else.
- Favicon is a temporary text "A"; replace with a real asset whenever ready.
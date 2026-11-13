# Favicon and SEO implementation plan

**Goal:** Use the user's favicon and add truthful, consistent search/share metadata for the application.

**Production origin:** `https://dance-crew-arts.vercel.app`, confirmed by the user. An optional `NEXT_PUBLIC_SITE_URL` can override this for a future domain change; never infer canonical URLs from request hosts or preview deployment URLs.

**Approach:** Use Next.js Metadata API plus native `app/sitemap.ts` and `app/robots.ts`. Keep the supplied `public/favicon.ico` as the sole `/favicon.ico` asset and remove the conflicting starter `app/favicon.ico`. Add route-specific titles/descriptions/canonicals, social previews using the real brand banner, and minimal factual Website/Organization JSON-LD. No invented locations, ratings, social accounts or last-modified dates.

**Indexing:** Include `/`, `/about`, `/services`, `/portfolio`, `/showcase`, `/contact`. Canonicalize showcase collection query URLs to the main showcase. Noindex all admin pages and unfinished `/booking`, `/blog`, `/testimonials`; omit these and nonexistent footer destinations from sitemap. Leave noindex pages crawlable so search engines can read their directives. Add X-Robots-Tag headers for these routes. Preview deployments get noindex metadata.

- [x] Test canonical origin, per-page metadata, sitemap membership, preview/admin/placeholder noindex, and supplied favicon routing.
- [x] Implement shared metadata configuration, favicon wiring, public/admin/placeholder metadata, sitemap, robots and structured data.
- [x] Run tests, TypeScript, scoped lint, production build and HTTP checks for rendered metadata, favicon bytes, XML, robots and noindex headers.
- [x] Independent review and deployment/search-console handoff instructions.

Work remains in this checkout. No deployment, search-console submission or production data changes are requested.

**Build ruling:** The existing Next.js 16.1.6 Google Fonts loader repeatedly failed on extensionless upstream font URLs (vercel/next.js#99114). Preserve the same Montserrat/Cinzel families and weight ranges, vendor their Latin WOFF2 assets and OFL licenses from official Google sources, and load with `next/font/local`. No package upgrade or typography redesign is required.

## Verification

- All 34 unit/regression tests pass; TypeScript and scoped lint pass (two existing unused imports in blog/services remain as warnings).
- Production build passes with local brand fonts and no Google Fonts download dependency.
- `node scripts/smoke-seo.mjs` passes against the production server: all six public head/title/canonical/social/icon tags, admin and three unfinished-page noindex metadata + headers, exact sitemap membership, robots discovery and supplied favicon byte equality.
- Rendered HTTP check caught the homepage/root title-template exception; an explicit absolute branded home title fixed it and is covered by the regression and smoke checks.
- Independent source reviews, including the font-loading follow-up, found no remaining important issues.
- No production deployment or Search Console submission was performed.

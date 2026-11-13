# SEO and favicon setup

The confirmed production website is `https://dance-crew-arts.vercel.app`. Metadata, canonical links, social sharing URLs, structured data and the XML sitemap use this origin. If the site later moves to a custom domain, set `NEXT_PUBLIC_SITE_URL` to its HTTPS origin and rebuild/redeploy. Preview deployment URLs are never inferred as canonical domains; Vercel preview deployments receive noindex metadata.

The supplied `public/favicon.ico` is served at `/favicon.ico` and referenced in the root metadata. The old Next.js starter `app/favicon.ico` has been removed so it cannot override the supplied file. Keep the public file when deploying.

Public titles, descriptions and canonical URLs are defined in `lib/seo.ts` and applied by the route pages. Open Graph and Twitter cards use the real brand banner. Minimal Organization/WebSite JSON-LD uses the actual name, logo and URL, without unverified contact details or ratings. Showcase collection query URLs canonicalize to `/showcase`.

The existing Montserrat and Cinzel variable fonts are bundled under `app/fonts` with their SIL Open Font Licenses. Font families, supported weights, CSS variables and swap loading remain in use; builds no longer fetch Google Fonts. This removes the repeated extensionless Google font URL parsing failure reported in [Next.js issue 99114](https://github.com/vercel/next.js/issues/99114). `scripts/vendor-site-fonts.mjs` can refresh the same Latin font assets from official Google sources if needed.

`/sitemap.xml` lists the six main public pages: home, about, services, portfolio, showcase and contact. It excludes admin routes, nonexistent pages and the unfinished booking/blog/testimonial pages. The unfinished routes and the whole admin subtree have noindex metadata; response headers provide an additional `X-Robots-Tag`. These routes remain crawlable in production so crawlers can see that directive. Authentication remains responsible for access control.

`/robots.txt` points to the canonical sitemap and allows public crawling. No fabricated modification timestamps, search verification tokens, business locations, social profiles or customer ratings have been added. Publish real content before enabling indexing for the unfinished pages by updating their metadata configuration and header rules.

After deploying, check `/favicon.ico`, `/robots.txt` and `/sitemap.xml` on the production domain, then submit the sitemap in your verified Google Search Console property. Native Next.js metadata conventions are documented in the [Metadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata) and [sitemap documentation](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap).

Local checks: `npm test`, `npm run build`, then start the production server on port 3100 and run `node scripts/smoke-seo.mjs`. The smoke check verifies actual rendered head metadata, noindex headers, XML membership, robots discovery and a byte-for-byte match with the supplied icon.

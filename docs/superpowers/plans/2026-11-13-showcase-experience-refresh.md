# Showcase experience refresh

**Goal:** Make the QR landing experience visually rich, mobile-readable and easy to browse, and keep admin creation controls in reach.

**Approach:** Keep the current black/gold branding and data model. Use real uploaded media as category covers and video card previews; when a collection is empty, use category-specific icon artwork and colour treatments. Use motion on entrance, hover and focus with reduced-motion support. Open the media viewer on explicit click/tap and begin video playback from that user gesture, with a muted fallback when browser audio policy requires it.

**Routing:** Use the full category name as a URL-encoded query token, including punctuation and Tamil, and convert old UUID links to canonical name links. This avoids bookmark collisions when similarly named services are added. No database migration is required. Renaming a category changes its name URL; old UUID bookmarks remain supported.

**Admin:** At xl (1280px and above), use two columns with a sticky, independently scrollable left editor. Use normal stacked flow at smaller widths. Ensure tall upload forms remain fully accessible.

## Tasks

- [x] Admin forms: sticky positions, usable laptop columns and bounded editor height.
- [x] Public design: media cover cards, distinctive empty collection artwork, readable mobile type and large controls, responsive gallery and motion.
- [x] Name routing: tested encoded-name creation/resolution, legacy link redirects, stable links after similarly named categories are added, no ID in generated category links.
- [x] Playback: tested autoplay helper, user-gesture playback, muted fallback/unmute UI, pause/cleanup on close.
- [x] Verify tests, types, scoped lint and production build; attempt responsive UI verification through available browser tool and record any limitation.

The user's detailed follow-up authorizes this reversible implementation in the existing checkout. Preserve prior uncommitted work, authentication and upload validation. Do not mutate live Supabase data or publish as part of this refresh.

## Verification

- All 29 Node tests pass, including category bookmark collision regression and video user-gesture/muted/cancellation tests.
- TypeScript, scoped ESLint and production build pass. Existing middleware deprecation warning remains.
- Independent review found and confirmed resolution of name-collision link transfer, Strict Mode source cleanup, and preview unmount pausing. Final review reports no remaining actionable findings.
- Production HTTP checks: showcase and existing portfolio 200, anonymous management redirect 307 to login. No category links were available in this environment response, so a populated collection's live navigation/playback remains unverified.
- Browser preview was attempted; the available browser access host is unavailable. Mobile/desktop visuals and actual browser interaction were source-reviewed, not visually verified.
- No new SQL/schema/bucket/dependencies required for this follow-up. No live data mutation, commit, push or deployment.

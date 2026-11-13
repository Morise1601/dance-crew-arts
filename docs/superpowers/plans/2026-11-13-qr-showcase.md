# QR Showcase Implementation Plan

> **For agentic workers:** Use focused parallel implementers and a fresh final review. Track completed work below.

**Goal:** Restore admin tabs and add an independent admin-managed public QR showcase.

**Architecture:** Reuse the existing Next.js App Router, Supabase auth and dark gold theme. Add isolated showcase tables/bucket, shared validation, signed uploads with server verification, admin management and category-first public display.

**Tech Stack:** Next.js 16, React 19, TypeScript, Supabase JS/SSR, Tailwind 4, lucide-react.

**Spec:** `docs/superpowers/specs/2026-11-13-qr-showcase-design.md`

## Global constraints

- Preserve existing portfolio content and behavior.
- New management and every mutation require admin; members retain own profile.
- JPEG/PNG/WebP/GIF images <= 10 MiB; MP4/WebM videos <= 50 MiB.
- Separate `qr_showcase_categories`, `qr_showcase_media`, `qr-showcase` bucket.
- No production schema mutation or deployment is part of this checkout change.

## Review focus

- Lowercase/whitespace roles, missing profiles and member privilege escalation.
- Spoofed types, empty and oversize files, mismatched uploaded content.
- Failed uploads/finalization/deletions and populated category deletion.
- Empty/offline/unconfigured Supabase, stale category links and mobile overflow.
- Viewer keyboard focus, video stopping on close, category navigation/back.

## Tasks

1. [x] Audit role lookup and live Supabase configuration; fix shared server authorization and regression tests.
2. [x] Define shared showcase types and validation; run failing then passing tests for file, metadata and signature rules.
3. [x] Add migration, RLS, seed categories, bucket policies and setup/audit instructions.
4. [x] Implement authenticated category/media actions, signed upload lifecycle, cleanup and server content verification.
5. [x] Build admin category/media management with preview, validation and recoverable error handling.
6. [x] Build responsive public category grid, category gallery and accessible media viewer.
7. [x] Run tests, TypeScript, build and HTTP smoke checks; record browser/live-data/review limits below.

## Progress

- Baseline `node node_modules/typescript/bin/tsc --noEmit`: passed.
- Ruling: implement in supplied checkout; no commit/push/deployment or production migration. Detailed user specification already authorizes reversible code work.
- Role fix includes normalized server-resolved roles, ID-first profile lookup, verified legacy email fallback, safe own-profile edits, guarded existing privileged actions, and preserving the admin session when creating a member.
- Signed upload validation tests and authorization tests passed: 19/19. Added failure-path tests cover MIME/size mismatches, spoofed file contents, trusted Storage URL derivation, file deletion failure and database cleanup failure.
- TypeScript and scoped ESLint passed (one existing profile image optimization warning). Production build passed; HTTP smoke checks returned 200 for showcase and existing portfolio, and 307 to login for anonymous showcase management.
- Live audit: new tables missing, service credential Admin API check returned 401, bucket listing inconclusive. No live schema mutation or authenticated upload was performed.
- Browser QA was attempted with the available computer-use tool; the tool blocked access because it could not verify the Windows browser URL. Responsive styles/accessibility were reviewed in source, not visually verified.
- Fresh independent reviewer was dispatched but failed at account usage limit before returning findings. Final security/correctness review was performed by the primary implementer; this is a verification limitation.

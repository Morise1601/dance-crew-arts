# QR showcase and role access

The existing Next.js/Supabase app needs consistent admin/member authorization and a separate public service showcase for a future printed QR link. Preserve the existing portfolio and its bucket/table.

## Approach

Extend the current application and theme with `/admin/qr-showcase` and `/showcase`. Separate categories and media tables plus a dedicated public `qr-showcase` bucket avoid mixing this content with the existing portfolio. Reusing portfolio types would couple unrelated content; an external gallery would duplicate authentication and branding. The requested Next.js/Supabase implementation is the chosen approach.

## Behavior

- Resolve roles consistently on the server from the trusted `admins` profile; normalize `Role`/`role`, casing and whitespace. Fail closed on missing or invalid profiles. Admin sees all management tabs; member sees own profile only. Protect mutations as well as navigation.
- Admin can create, edit, delete categories, choose an icon, and set ordering. Seed DJ, Firework, Doll Dance, Bouncers, Chenda Melam (சண்டா மேளம்), Low Fog, Welcome Girls. Category deletion is blocked while media exists, avoiding unexpected loss.
- Admin adds media with category, title, optional description and image/video file; edits metadata, visibility and order; deletes media and its stored file. Upload errors remain recoverable.
- Direct signed uploads bypass Next.js action body limits. Images: JPEG, PNG, WebP, GIF up to 10 MiB. Videos: MP4/WebM up to 50 MiB. Validate extension, declared MIME, nonempty/integer size and signature before upload and again on server before publishing. Browser decode checks catch unusable media. MP4 codec support depends on the visitor browser; H.264/AAC recommended.
- Store binary only in Storage; table holds URL, path and metadata. Pending uploads are never public gallery records. All write operations require admin, table and bucket RLS restrict writes, public reads expose published visible media only. Server uses session identity before any service-role operation.
- `/showcase` opens at an attractive icon/category grid. Selecting a category displays responsive media cards and a keyboard-accessible image/video viewer, native video controls, no autoplay, lazy images, mobile-friendly touch targets, loading/error/empty states. Query string supports category links and browser back.
- No QR generator is needed. Use the final deployed `/showcase` URL in an external QR generator.

## Database delivery and verification

Read-only audit attempts inspect existing table/bucket configuration without printing keys or personal data. Provide additive rerunnable SQL migration and setup instructions; do not modify production schema automatically. Document live audit limitations explicitly. Check validation/role regressions, TypeScript, production build and responsive browser views where available.

Implementation choices above fill unspecified limits and routes; the user's detailed request authorizes the feature and routine reversible implementation decisions. Work stays in the supplied checkout so all requested changes remain reviewable together.

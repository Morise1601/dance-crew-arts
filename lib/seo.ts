import type { Metadata, Viewport } from 'next';

export const SITE_NAME = "D'Art Crew";
export const DEFAULT_SITE_URL = 'https://dance-crew-arts.vercel.app';

export function getSiteOrigin(value = process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL): string {
  const url = new URL(value.trim());
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Site URL must use HTTP or HTTPS.');
  if (url.username || url.password) throw new Error('Site URL must not include credentials.');
  return url.origin;
}

export const SITE_ORIGIN = getSiteOrigin();
export const absoluteUrl = (pathname: string) => new URL(pathname, `${SITE_ORIGIN}/`).toString();

const PAGES = {
  '/': { title: 'Dance Training & Choreography', description: "Explore D'Art Crew's dance training, school annual day choreography, cultural performances, themed concepts and stage planning.", index: true },
  '/about': { title: 'About Our Crew & Founder', description: "Meet founder and choreographer Anto Reny and discover D'Art Crew's approach to dance training, creativity and confident stage performances.", index: true },
  '/services': { title: 'Dance Training & Choreography Services', description: 'Discover school annual day choreography, cultural event performances, kids dance training, themed concepts, costume design and stage planning.', index: true },
  '/portfolio': { title: 'Dance Photos & Performance Videos', description: "Browse D'Art Crew's portfolio of dance photographs and performance videos, capturing the rhythm, creativity and energy of our crew.", index: true },
  '/showcase': { title: 'Art Forms & Event Services Showcase', description: "Explore D'Art Crew's event services and art forms through curated photographs and performance videos. Choose a collection and discover the experience.", index: true },
  '/contact': { title: 'Contact Our Crew', description: "Contact D'Art Crew to discuss dance training, choreography, school annual days, cultural events and stage performances.", index: true },
  '/admin': { title: 'Admin Sign In', description: "Sign in to manage your D'Art Crew profile and authorised studio administration tools.", index: false },
  '/booking': { title: 'Class Booking', description: "Explore the D'Art Crew class booking page. Contact the crew directly for current class availability and training enquiries.", index: false },
  '/blog': { title: 'Dance Blog', description: "Dance training ideas and updates from D'Art Crew. Contact the crew to learn more about our classes and choreography services.", index: false },
  '/testimonials': { title: 'Community Stories', description: "Discover the D'Art Crew community. Contact the crew to learn more about dance training, choreography and performance experiences.", index: false },
} satisfies Record<string, { title: string; description: string; index: boolean }>;

export const INDEXABLE_PATHS = (Object.keys(PAGES) as (keyof typeof PAGES)[]).filter(pathname => PAGES[pathname].index);
const isPreview = () => process.env.VERCEL_ENV === 'preview';

export function getRobotsMetadata(preview = isPreview(), index = true): Metadata['robots'] {
  const allowIndex = index && !preview;
  return {
    index: allowIndex,
    follow: index,
    googleBot: allowIndex ? { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 } : { index: false, follow: index },
  };
}

export function createPageMetadata(pathname: keyof typeof PAGES): Metadata {
  const page = PAGES[pathname];
  const url = absoluteUrl(pathname);
  const shareTitle = `${page.title} | ${SITE_NAME}`;
  const images = [{ url: absoluteUrl('/Banner.png'), alt: "D'Art Crew — Dance, Rhythm, Technique" }];
  return {
    // The home page shares the root segment, where a layout title template does
    // not apply. Give it an explicit branded title rather than an unbranded one.
    title: pathname === '/' ? { absolute: shareTitle } : page.title,
    description: page.description,
    alternates: { canonical: url },
    robots: getRobotsMetadata(isPreview(), page.index),
    openGraph: { type: 'website', locale: 'en_IN', siteName: SITE_NAME, title: shareTitle, description: page.description, url, images },
    twitter: { card: 'summary_large_image', title: shareTitle, description: page.description, images: images.map(image => image.url) },
  };
}

export function createRootMetadata(): Metadata {
  const home = createPageMetadata('/');
  return {
    metadataBase: new URL(SITE_ORIGIN),
    applicationName: SITE_NAME,
    title: { default: `${SITE_NAME} | Dance Training & Choreography`, template: `%s | ${SITE_NAME}` },
    description: home.description,
    robots: home.robots,
    openGraph: home.openGraph,
    twitter: home.twitter,
    // No root canonical: each route defines its own, avoiding homepage inheritance.
    icons: { icon: [{ url: '/favicon.ico', type: 'image/x-icon' }], shortcut: '/favicon.ico' },
  };
}

export const siteViewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#000000', colorScheme: 'dark' };

export function getSiteStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Organization', '@id': `${SITE_ORIGIN}/#organization`, name: SITE_NAME, url: absoluteUrl('/'), logo: absoluteUrl('/D_arts_crew.png') },
      { '@type': 'WebSite', '@id': `${SITE_ORIGIN}/#website`, name: SITE_NAME, url: absoluteUrl('/'), inLanguage: 'en', publisher: { '@id': `${SITE_ORIGIN}/#organization` } },
    ],
  };
}

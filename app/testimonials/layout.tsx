import type { ReactNode } from 'react';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata('/testimonials');

export default function TestimonialsLayout({ children }: { children: ReactNode }) {
  return children;
}

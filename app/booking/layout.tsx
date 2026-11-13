import type { ReactNode } from 'react';
import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata('/booking');

export default function BookingLayout({ children }: { children: ReactNode }) {
  return children;
}

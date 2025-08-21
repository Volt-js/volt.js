import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Advanced Features | Volt.js',
  description:
    'Explore advanced Volt.js features like background job queues, caching with the Store adapter, real-time communication via WebSockets, and how to extend functionality with plugins.',
  keywords: [
    'Volt.js',
    'advanced features',
    'background jobs',
    'queues',
    'caching',
    'pub/sub',
    'store',
    'realtime',
    'WebSockets',
    'plugins',
  ],
  openGraph: {
    title: 'Advanced Features | Volt.js',
    description:
      'Dive deeper into the powerful, built-in features that make Volt.js a complete ecosystem for modern TypeScript applications.',
    type: 'article',
    url: 'https://volt.js.org/docs/advanced-features',
    images: [
      {
        url: 'https://volt.js.org/og/docs-advanced-features.png', // Assuming an OG image exists
        width: 1200,
        height: 630,
        alt: 'Volt.js Advanced Features',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Advanced Features | Volt.js',
    description:
      'Dive deeper into the powerful, built-in features that make Volt.js a complete ecosystem for modern TypeScript applications.',
    images: ['https://volt.js.org/og/docs-advanced-features.png'],
  },
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

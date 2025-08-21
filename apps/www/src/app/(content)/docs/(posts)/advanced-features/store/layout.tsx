import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Volt.js Store: High-Performance Caching & Messaging',
  description:
    'Learn to use the Volt.js Store for high-performance caching and Pub/Sub messaging. Leverage the Redis adapter to reduce database load and build event-driven features.',
  keywords: [
    'Volt.js',
    'caching',
    'cache-aside',
    'Pub/Sub',
    'messaging',
    'Redis',
    'ioredis',
    'key-value store',
    'performance',
    'TypeScript',
  ],
  openGraph: {
    title: 'Volt.js Store: High-Performance Caching & Messaging',
    description:
      'Master high-performance caching and decoupled messaging with the Volt.js Store. This guide covers setup, caching patterns, and pub/sub for event-driven architecture.',
    type: 'article',
    url: 'https://volt.js.org/docs/advanced-features/store',
    images: [
      {
        url: 'https://volt.js.org/og/docs-store.png', // Assuming an OG image exists
        width: 1200,
        height: 630,
        alt: 'Volt.js Store for Caching and Messaging',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Volt.js Store: High-Performance Caching & Messaging',
    description:
      'Master high-performance caching and decoupled messaging with the Volt.js Store. This guide covers setup, caching patterns, and pub/sub for event-driven architecture.',
    images: ['https://volt.js.org/og/docs-store.png'],
  },
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

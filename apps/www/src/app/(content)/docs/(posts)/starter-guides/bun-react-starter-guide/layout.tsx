import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Bun + React Starter Guide | Volt.js',
  description:
    'A comprehensive guide to building a high-performance, full-stack SPA with Volt.js, using Bun as the server and runtime, and React for the frontend.',
  keywords: [
    'Volt.js',
    'Bun',
    'React',
    'SPA',
    'full-stack starter',
    'performance',
    'type-safe API',
    'tutorial',
    'Bun.serve',
    'single page application',
  ],
  openGraph: {
    title: 'Full-Stack Guide: Building a High-Performance SPA with Bun, React, and Volt.js',
    description:
      'Learn to build an ultra-fast, type-safe Single Page Application using the combined power of Bun, React, and Volt.js.',
    type: 'article',
    url: 'https://volt.js.org/docs/starter-guides/bun-react-starter-guide',
    images: [
      {
        url: 'https://volt.js.org/og/docs-bun-react-starter.png', // Assuming an OG image exists
        width: 1200,
        height: 630,
        alt: 'Building a SPA with Bun, React, and Volt.js',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Full-Stack Guide: Building a High-Performance SPA with Bun, React, and Volt.js',
    description:
      'Learn to build an ultra-fast, type-safe Single Page Application using the combined power of Bun, React, and Volt.js.',
    images: ['https://volt.js.org/og/docs-bun-react-starter.png'],
  },
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

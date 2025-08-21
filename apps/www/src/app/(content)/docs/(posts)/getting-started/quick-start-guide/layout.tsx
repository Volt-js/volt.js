import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Quick Start Guide | Volt.js',
  description:
    'A step-by-step tutorial to build your first fully type-safe API endpoint with Volt.js in minutes. Learn to use `volt init`, create controllers, and test your API.',
  keywords: [
    'Volt.js',
    'quick start guide',
    'tutorial',
    'getting started',
    'hello world',
    'volt init',
    'type-safe API',
    'backend framework',
    'Node.js',
    'TypeScript',
  ],
  openGraph: {
    title: 'Quick Start Guide | Volt.js',
    description:
      'Your first step to mastering Volt.js. This guide walks you through creating a new project and building your first API endpoint from scratch.',
    type: 'article',
    url: 'https://volt.js.org/docs/getting-started/quick-start-guide',
    images: [
      {
        url: 'https://volt.js.org/og/docs-quick-start.png', // Assuming an OG image exists
        width: 1200,
        height: 630,
        alt: 'Volt.js Quick Start Guide',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Quick Start Guide | Volt.js',
    description:
      'Your first step to mastering Volt.js. This guide walks you through creating a new project and building your first API endpoint from scratch.',
    images: ['https://volt.js.org/og/docs-quick-start.png'],
  },
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

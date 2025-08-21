import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'REST API Starter Guide | Volt.js',
  description:
    'A comprehensive guide to building high-performance, type-safe REST APIs with Volt.js, covering starters for Express, Bun, and Deno.',
  keywords: [
    'Volt.js',
    'REST API',
    'headless',
    'backend service',
    'Express',
    'Bun',
    'Deno',
    'type-safe API',
    'Prisma',
    'tutorial',
  ],
  openGraph: {
    title: 'Guide: Building High-Performance, Type-Safe REST APIs with Volt.js',
    description:
      'Learn to build scalable, headless REST APIs using your choice of runtime (Express, Bun, Deno) with the structured, type-safe architecture of Volt.js.',
    type: 'article',
    url: 'https://volt.js.org/docs/starter-guides/rest-api-starter-guide',
    images: [
      {
        url: 'https://volt.js.org/og/docs-rest-api-starter.png', // Assuming an OG image exists
        width: 1200,
        height: 630,
        alt: 'Building a REST API with Volt.js',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Guide: Building High-Performance, Type-Safe REST APIs with Volt.js',
    description:
      'Learn to build scalable, headless REST APIs using your choice of runtime (Express, Bun, Deno) with the structured, type-safe architecture of Volt.js.',
    images: ['https://volt.js.org/og/docs-rest-api-starter.png'],
  },
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

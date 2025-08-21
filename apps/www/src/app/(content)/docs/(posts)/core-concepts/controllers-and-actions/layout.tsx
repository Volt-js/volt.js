import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Controllers & Actions: Building API Logic | Volt.js',
  description:
    'Learn how to structure your API with Controllers and implement business logic with Actions (query and mutation). Master the core of building endpoints in Volt.js.',
  keywords: [
    'Volt.js',
    'Controllers',
    'Actions',
    'query',
    'mutation',
    'API design',
    'backend development',
    'routing',
    'business logic',
    'type-safe API',
  ],
  openGraph: {
    title: 'Controllers & Actions: Building API Logic | Volt.js',
    description:
      'A comprehensive guide to building your API endpoints using Volt.js. Understand the role of Controllers for organization and Actions for implementing your business logic.',
    type: 'article',
    url: 'https://volt.js.org/docs/core-concepts/controllers-and-actions',
    images: [
      {
        url: 'https://volt.js.org/og/docs-controllers-actions.png', // Assuming an OG image exists
        width: 1200,
        height: 630,
        alt: 'Building APIs with Controllers and Actions in Volt.js',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Controllers & Actions: Building API Logic | Volt.js',
    description:
      'A comprehensive guide to building your API endpoints using Volt.js. Understand the role of Controllers for organization and Actions for implementing your business logic.',
    images: ['https://volt.js.org/og/docs-controllers-actions.png'],
  },
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

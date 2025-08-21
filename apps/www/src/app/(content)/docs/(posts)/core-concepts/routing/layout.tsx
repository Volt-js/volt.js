import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Routing: Assembling Your API | Volt.js',
  description:
    'Learn how to assemble your API using the Volt.js Router. Combine controllers, configure base paths, and integrate with frameworks like Next.js for a unified, type-safe API.',
  keywords: [
    'Volt.js',
    'Routing',
    'AppRouter',
    'API router',
    'basePATH',
    'baseURL',
    'Next.js integration',
    'Express integration',
    'type-safe API',
    'backend development',
  ],
  openGraph: {
    title: 'Routing: Assembling Your API | Volt.js',
    description:
      'A guide to the final step of building your backend: assembling all your controllers into a single, routable API with the Volt.js Router.',
    type: 'article',
    url: 'https://volt.js.org/docs/core-concepts/routing',
    images: [
      {
        url: 'https://volt.js.org/og/docs-routing.png', // Assuming an OG image exists
        width: 1200,
        height: 630,
        alt: 'Assembling an API with the Volt.js Router',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Routing: Assembling Your API | Volt.js',
    description:
      'A guide to the final step of building your backend: assembling all your controllers into a single, routable API with the Volt.js Router.',
    images: ['https://volt.js.org/og/docs-routing.png'],
  },
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

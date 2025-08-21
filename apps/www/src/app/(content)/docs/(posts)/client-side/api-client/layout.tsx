import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'The Type-Safe API Client | Volt.js',
  description:
    'Learn how the Volt.js API Client provides end-to-end type safety, connecting your frontend and backend seamlessly. Automatically generated from your API router.',
  keywords: [
    'Volt.js',
    'API client',
    'type-safe client',
    'createVoltClient',
    'AppRouter',
    'frontend integration',
    'React Server Components',
    'full-stack',
    'TypeScript',
  ],
  openGraph: {
    title: 'The Type-Safe API Client | Volt.js',
    description:
      'Discover how to create and use the automatically generated, type-safe API client in Volt.js for a seamless full-stack development experience.',
    type: 'article',
    url: 'https://volt.js.org/docs/client-side/api-client',
    images: [
      {
        url: 'https://volt.js.org/og/docs-api-client.png', // Assuming an OG image exists
        width: 1200,
        height: 630,
        alt: 'Volt.js Type-Safe API Client',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Type-Safe API Client | Volt.js',
    description:
      'Discover how to create and use the automatically generated, type-safe API client in Volt.js for a seamless full-stack development experience.',
    images: ['https://volt.js.org/og/docs-api-client.png'],
  },
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Client-Side Integration | Volt.js',
  description:
    'Learn how to integrate Volt.js with your frontend. Discover the type-safe API client, React hooks like useQuery and useMutation, and real-time features with useRealtime.',
  keywords: [
    'Volt.js',
    'client-side',
    'React',
    'Next.js',
    'API client',
    'useQuery',
    'useMutation',
    'useRealtime',
    'type-safe',
    'full-stack',
    'frontend integration',
  ],
  openGraph: {
    title: 'Client-Side Integration | Volt.js',
    description:
      'Seamlessly connect your frontend with Volt.js. This guide covers the type-safe client, React hooks for data fetching and mutations, and real-time updates.',
    type: 'article',
    url: 'https://volt.js.org/docs/client-side',
    images: [
      {
        url: 'https://volt.js.org/og/docs-client-side.png', // Assuming an OG image exists
        width: 1200,
        height: 630,
        alt: 'Volt.js Client-Side Integration',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Client-Side Integration | Volt.js',
    description:
      'Seamlessly connect your frontend with Volt.js. This guide covers the type-safe client, React hooks for data fetching and mutations, and real-time updates.',
    images: ['https://volt.js.org/og/docs-client-side.png'],
  },
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

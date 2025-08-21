import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: '<VoltProvider>: The Root of the Client-Side | Volt.js',
  description:
    'Learn how to set up the <VoltProvider>, the core component for managing client-side cache, real-time SSE connections, and providing context for React hooks.',
  keywords: [
    'Volt.js',
    'VoltProvider',
    'client-side',
    'React context',
    'query cache',
    'realtime',
    'SSE',
    'useQuery',
    'useMutation',
    'full-stack',
  ],
  openGraph: {
    title: '<VoltProvider>: The Root of the Client-Side | Volt.js',
    description:
      'Master the setup and configuration of the <VoltProvider>, the essential wrapper for all client-side features in your Volt.js application.',
    type: 'article',
    url: 'https://volt.js.org/docs/client-side/volt-provider',
    images: [
      {
        url: 'https://volt.js.org/og/docs-volt-provider.png', // Assuming an OG image exists
        width: 1200,
        height: 630,
        alt: 'Volt.js Provider Setup',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '<VoltProvider>: The Root of the Client-Side | Volt.js',
    description:
      'Master the setup and configuration of the <VoltProvider>, the essential wrapper for all client-side features in your Volt.js application.',
    images: ['https://volt.js.org/og/docs-volt-provider.png'],
  },
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

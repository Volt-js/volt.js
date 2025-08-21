import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Volt.js Queues: Reliable Background Processing',
  description:
    'Learn how to use Volt.js Queues for reliable background job processing. Offload long-running tasks like sending emails or processing images to keep your API fast and responsive.',
  keywords: [
    'Volt.js',
    'background jobs',
    'job queue',
    'BullMQ',
    'Redis',
    'worker process',
    'task offloading',
    'TypeScript',
    'backend development',
  ],
  openGraph: {
    title: 'Volt.js Queues: Reliable Background Processing',
    description:
      'Master background job processing in Volt.js. Our guide shows you how to use the BullMQ driver to manage long-running tasks and improve API performance.',
    type: 'article',
    url: 'https://volt.js.org/docs/advanced-features/queues',
    images: [
      {
        url: 'https://volt.js.org/og/docs-queues.png', // Assuming an OG image exists
        width: 1200,
        height: 630,
        alt: 'Volt.js Queues for Background Processing',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Volt.js Queues: Reliable Background Processing',
    description:
      'Master background job processing in Volt.js. Our guide shows you how to use the BullMQ driver to manage long-running tasks and improve API performance.',
    images: ['https://volt.js.org/og/docs-queues.png'],
  },
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'The Volt Builder: Application Foundation | Volt.js',
  description:
    'Learn about the Volt Builder, the fluent, type-safe API for composing your application. Understand how to configure context, services, and features like Store and Queues.',
  keywords: [
    'Volt.js',
    'Volt Builder',
    'builder pattern',
    'application setup',
    'type-safe',
    'fluent API',
    'dependency injection',
    'Context',
    'Store',
    'Queues',
    'Plugins',
  ],
  openGraph: {
    title: 'The Volt Builder: Your Application\'s Foundation | Volt.js',
    description:
      'Master the Volt Builder, the core of every Volt.js application. This guide covers the chainable API for a guided, type-safe configuration experience.',
    type: 'article',
    url: 'https://volt.js.org/docs/core-concepts/volt-builder',
    images: [
      {
        url: 'https://volt.js.org/og/docs-volt-builder.png', // Assuming an OG image exists
        width: 1200,
        height: 630,
        alt: 'The Volt.js Builder Pattern',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Volt Builder: Your Application\'s Foundation | Volt.js',
    description:
      'Master the Volt Builder, the core of every Volt.js application. This guide covers the chainable API for a guided, type-safe configuration experience.',
    images: ['https://volt.js.org/og/docs-volt-builder.png'],
  },
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

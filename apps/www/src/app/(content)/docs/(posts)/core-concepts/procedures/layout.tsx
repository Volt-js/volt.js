import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Procedures: Type-Safe Middleware | Volt.js',
  description:
    'Learn about Procedures in Volt.js, the powerful, type-safe middleware pattern for handling authentication, logging, and other cross-cutting concerns while extending the context.',
  keywords: [
    'Volt.js',
    'Procedures',
    'middleware',
    'type-safe',
    'authentication',
    'authorization',
    'rate limiting',
    'context extension',
    'backend development',
    'reusable logic',
  ],
  openGraph: {
    title: 'Procedures: Reusable, Type-Safe Middleware | Volt.js',
    description:
      'Master Procedures, the Volt.js implementation of middleware. Learn how to create reusable logic and dynamically extend the request context with full type safety.',
    type: 'article',
    url: 'https://volt.js.org/docs/core-concepts/procedures',
    images: [
      {
        url: 'https://volt.js.org/og/docs-procedures.png', // Assuming an OG image exists
        width: 1200,
        height: 630,
        alt: 'Creating Middleware with Procedures in Volt.js',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Procedures: Reusable, Type-Safe Middleware | Volt.js',
    description:
      'Master Procedures, the Volt.js implementation of middleware. Learn how to create reusable logic and dynamically extend the request context with full type safety.',
    images: ['https://volt.js.org/og/docs-procedures.png'],
  },
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Core Concepts | Volt.js',
  description:
    'Understand the fundamental building blocks of Volt.js: the Builder pattern, Context for dependency injection, Controllers, Actions, Procedures (middleware), Routing, and Validation with Zod.',
  keywords: [
    'Volt.js',
    'core concepts',
    'Volt Builder',
    'Context',
    'dependency injection',
    'Controllers',
    'Actions',
    'Procedures',
    'middleware',
    'Routing',
    'Validation',
    'Zod',
  ],
  openGraph: {
    title: 'Core Concepts | Volt.js',
    description:
      'Master the essential building blocks of every Volt.js application, from the builder pattern and dependency injection to type-safe routing and validation.',
    type: 'article',
    url: 'https://volt.js.org/docs/core-concepts',
    images: [
      {
        url: 'https://volt.js.org/og/docs-core-concepts.png', // Assuming an OG image exists
        width: 1200,
        height: 630,
        alt: 'Volt.js Core Concepts',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Core Concepts | Volt.js',
    description:
      'Master the essential building blocks of every Volt.js application, from the builder pattern and dependency injection to type-safe routing and validation.',
    images: ['https://volt.js.org/og/docs-core-concepts.png'],
  },
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

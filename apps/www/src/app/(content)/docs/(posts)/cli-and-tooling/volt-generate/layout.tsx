import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'CLI: `volt generate` for Scaffolding & Schemas | Volt.js',
  description:
    'Learn how to use the `volt generate` command to accelerate development by scaffolding entire features from your database schema and generating a type-safe client.',
  keywords: [
    'Volt.js',
    'volt generate',
    'CLI',
    'code generation',
    'scaffolding',
    'schema-first',
    'Prisma',
    'Zod schema',
    'type-safe client',
    'developer tools',
  ],
  openGraph: {
    title: 'CLI: `volt generate` for Scaffolding & Schemas | Volt.js',
    description:
      'Master the `volt generate` command to automatically create feature boilerplate from your database schema and generate a fully type-safe client for your frontend.',
    type: 'article',
    url: 'https://volt.js.org/docs/cli-and-tooling/volt-generate',
    images: [
      {
        url: 'https://volt.js.org/og/docs-volt-generate.png', // Assuming an OG image exists
        width: 1200,
        height: 630,
        alt: 'Volt.js Code and Schema Generation',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CLI: `volt generate` for Scaffolding & Schemas | Volt.js',
    description:
      'Master the `volt generate` command to automatically create feature boilerplate from your database schema and generate a fully type-safe client for your frontend.',
    images: ['https://volt.js.org/og/docs-volt-generate.png'],
  },
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'CLI: Scaffolding with `volt init` | Volt.js',
  description:
    'Learn how to use the `volt init` command to scaffold a new, production-ready Volt.js project in minutes with an interactive setup for frameworks, features, and database configuration.',
  keywords: [
    'Volt.js',
    'volt init',
    'CLI',
    'scaffolding',
    'project setup',
    'boilerplate',
    'Next.js',
    'Express',
    'Prisma',
    'Docker',
    'code generation',
  ],
  openGraph: {
    title: 'CLI: Scaffolding with `volt init` | Volt.js',
    description:
      'Get your project started in minutes. This guide covers how `volt init` scaffolds your application with a feature-based architecture, interactive setup, and optional Docker integration.',
    type: 'article',
    url: 'https://volt.js.org/docs/cli-and-tooling/volt-init',
    images: [
      {
        url: 'https://volt.js.org/og/docs-volt-init.png', // Assuming an OG image exists
        width: 1200,
        height: 630,
        alt: 'Volt.js Project Scaffolding with `volt init`',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CLI: Scaffolding with `volt init` | Volt.js',
    description:
      'Get your project started in minutes. This guide covers how `volt init` scaffolds your application with a feature-based architecture, interactive setup, and optional Docker integration.',
    images: ['https://volt.js.org/og/docs-volt-init.png'],
  },
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

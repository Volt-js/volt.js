import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Installation - Getting Started with Volt.js',
  description:
    'Learn how to install Volt.js. Start with official templates, use the `volt init` CLI for a custom setup, or add it manually to an existing project.',
  keywords: [
    'Volt.js',
    'installation',
    'setup',
    'volt init',
    'templates',
    'starters',
    'npm install',
    'yarn add',
    'pnpm add',
    'bun add',
    'ioredis',
    'bullmq',
    'zod',
    'peer dependencies',
    'quick start',
  ],
  openGraph: {
    title: 'Installation - Getting Started with Volt.js',
    description:
      'Step-by-step guide to installing Volt.js. Covers official templates, automated scaffolding with `volt init`, and manual setup for existing projects.',
    type: 'article',
    url: 'https://volt.js.org/docs/getting-started/installation',
    images: [
      {
        url: 'https://volt.js.org/og/docs-installation.png',
        width: 1200,
        height: 630,
        alt: 'Installing Volt.js using templates or CLI',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Installation - Getting Started with Volt.js',
    description:
      'Step-by-step guide to installing Volt.js. Covers official templates, automated scaffolding with `volt init`, and manual setup for existing projects.',
    images: ['https://volt.js.org/og/docs-installation.png'],
  },
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

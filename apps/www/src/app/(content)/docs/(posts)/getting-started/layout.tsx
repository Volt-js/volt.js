import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Getting Started | Volt.js',
  description:
    'Your guide to getting started with Volt.js. Learn how to install the framework, set up your project, and build your first type-safe API in minutes.',
  keywords: [
    'Volt.js',
    'getting started',
    'quick start',
    'tutorial',
    'installation',
    'project structure',
    'type-safe API',
    'full-stack',
    'TypeScript',
    'backend framework',
  ],
  openGraph: {
    title: 'Getting Started with Volt.js',
    description:
      'Follow our step-by-step guides to install Volt.js, understand the project structure, and build your first fully type-safe API.',
    type: 'article',
    url: 'https://volt.js.org/docs/getting-started',
    images: [
      {
        url: 'https://volt.js.org/og/docs-getting-started.png', // Assuming an OG image exists
        width: 1200,
        height: 630,
        alt: 'Getting Started with Volt.js',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Getting Started with Volt.js',
    description:
      'Follow our step-by-step guides to install Volt.js, understand the project structure, and build your first fully type-safe API.',
    images: ['https://volt.js.org/og/docs-getting-started.png'],
  },
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

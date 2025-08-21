import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'CLI: The `volt dev` Interactive Server | Volt.js',
  description:
    'Learn to use the `volt dev` command, the interactive development server for Volt.js projects. Monitor multiple processes and view real-time API request logs in a single dashboard.',
  keywords: [
    'Volt.js',
    'volt dev',
    'CLI',
    'development server',
    'interactive mode',
    'API monitoring',
    'hot reloading',
    'developer experience',
    'tooling',
  ],
  openGraph: {
    title: 'CLI: The `volt dev` Interactive Server | Volt.js',
    description:
      'Master the `volt dev` command and its interactive dashboard to streamline your full-stack development workflow, manage multiple processes, and monitor API requests in real-time.',
    type: 'article',
    url: 'https://volt.js.org/docs/cli-and-tooling/volt-dev',
    images: [
      {
        url: 'https://volt.js.org/og/docs-volt-dev.png', // Assuming an OG image exists
        width: 1200,
        height: 630,
        alt: 'Volt.js Interactive Dev Server',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CLI: The `volt dev` Interactive Server | Volt.js',
    description:
      'Master the `volt dev` command and its interactive dashboard to streamline your full-stack development workflow, manage multiple processes, and monitor API requests in real-time.',
    images: ['https://volt.js.org/og/docs-volt-dev.png'],
  },
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

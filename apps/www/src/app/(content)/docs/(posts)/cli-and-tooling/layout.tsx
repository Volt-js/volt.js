import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'CLI & Tooling | Volt.js',
  description:
    'Master the Volt.js CLI to streamline your development workflow. Learn about project scaffolding with `volt init`, running the dev server with `volt dev`, and code generation.',
  keywords: [
    'Volt.js',
    'CLI',
    'command line interface',
    'tooling',
    'scaffolding',
    'code generation',
    'volt init',
    'volt dev',
    'volt generate',
    'developer tools',
  ],
  openGraph: {
    title: 'CLI & Tooling | Volt.js',
    description:
      'Explore the powerful command-line tools that come with Volt.js to boost your productivity from project creation to deployment.',
    type: 'article',
    url: 'https://volt.js.org/docs/cli-and-tooling',
    images: [
      {
        url: 'https://volt.js.org/og/docs-cli-and-tooling.png', // Assuming an OG image exists
        width: 1200,
        height: 630,
        alt: 'Volt.js CLI and Tooling',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CLI & Tooling | Volt.js',
    description:
      'Explore the powerful command-line tools that come with Volt.js to boost your productivity from project creation to deployment.',
    images: ['https://volt.js.org/og/docs-cli-and-tooling.png'],
  },
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

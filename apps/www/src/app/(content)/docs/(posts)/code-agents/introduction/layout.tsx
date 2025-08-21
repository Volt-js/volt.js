import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Introduction to Code Agents | Volt.js',
  description:
    'Learn how to leverage AI Code Agents and Large Language Models (LLMs) with Volt.js. Discover our AI-Friendly architecture and integrations with tools like Cursor, Windsurf, and Claude.',
  keywords: [
    'Volt.js',
    'Code Agents',
    'AI-Friendly',
    'LLM',
    'Large Language Models',
    'Cursor',
    'Windsurf',
    'Claude',
    'Zed Editor',
    'AI development',
  ],
  openGraph: {
    title: 'Introduction to Code Agents | Volt.js',
    description:
      'Explore how the AI-Friendly design of Volt.js enhances your development workflow when paired with modern Code Agents and LLMs.',
    type: 'article',
    url: 'https://volt.js.org/docs/code-agents/introduction',
    images: [
      {
        url: 'https://volt.js.org/og/docs-code-agents-intro.png', // Assuming an OG image exists
        width: 1200,
        height: 630,
        alt: 'Volt.js and AI Code Agents',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Introduction to Code Agents | Volt.js',
    description:
      'Explore how the AI-Friendly design of Volt.js enhances your development workflow when paired with modern Code Agents and LLMs.',
    images: ['https://volt.js.org/og/docs-code-agents-intro.png'],
  },
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

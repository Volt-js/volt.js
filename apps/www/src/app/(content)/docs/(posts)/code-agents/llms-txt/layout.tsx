import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Guiding LLMs with llms.txt | Volt.js',
  description:
    'Learn about the llms.txt standard and how Volt.js provides a comprehensive, single-file documentation dump to train Code Agents and Large Language Models.',
  keywords: [
    'Volt.js',
    'llms.txt',
    'AI training',
    'LLM',
    'Code Agent',
    'AI-Friendly',
    'documentation',
    'context providing',
    'sitemap',
  ],
  openGraph: {
    title: 'Guiding LLMs with llms.txt | Volt.js',
    description:
      'Discover how the Volt.js llms.txt file serves as a complete knowledge base for training AI Code Agents, enabling deep contextual understanding of the framework.',
    type: 'article',
    url: 'https://volt.js.org/docs/code-agents/llms-txt',
    images: [
      {
        url: 'https://volt.js.org/og/docs-llms-txt.png', // Assuming an OG image exists
        width: 1200,
        height: 630,
        alt: 'Using llms.txt to guide AI agents',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Guiding LLMs with llms.txt | Volt.js',
    description:
      'Discover how the Volt.js llms.txt file serves as a complete knowledge base for training AI Code Agents, enabling deep contextual understanding of the framework.',
    images: ['https://volt.js.org/og/docs-llms-txt.png'],
  },
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

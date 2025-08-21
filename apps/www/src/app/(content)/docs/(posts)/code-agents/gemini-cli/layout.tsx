import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Using Gemini CLI as a Code Agent | Volt.js',
  description:
    "Learn how to use Google's Gemini CLI as a code agent for your Volt.js projects. Guide on providing context via `AGENT.md` and `llms.txt` for optimal results.",
  keywords: [
    'Volt.js',
    'Gemini',
    'Google Gemini',
    'Gemini CLI',
    'Code Agent',
    'AI development',
    'LLM',
    'AGENT.md',
    'llms.txt',
    'AI-Friendly',
  ],
  openGraph: {
    title: 'Using Gemini CLI as a Code Agent with Volt.js',
    description:
      'A step-by-step guide to integrating Google\'s Gemini CLI as an expert code agent for Volt.js development, enhancing your workflow with AI-powered assistance.',
    type: 'article',
    url: 'https://volt.js.org/docs/code-agents/gemini-cli',
    images: [
      {
        url: 'https://volt.js.org/og/docs-gemini-cli.png', // Assuming an OG image exists
        width: 1200,
        height: 630,
        alt: 'Using Gemini CLI with Volt.js',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Using Gemini CLI as a Code Agent with Volt.js',
    description:
      'A step-by-step guide to integrating Google\'s Gemini CLI as an expert code agent for Volt.js development, enhancing your workflow with AI-powered assistance.',
    images: ['https://volt.js.org/og/docs-gemini-cli.png'],
  },
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

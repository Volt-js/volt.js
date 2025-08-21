import { Metadata } from 'next';
import { ReactNode } from "react"

export const metadata: Metadata = {
  title: 'Volt Studio (API Playground) | Volt.js',
  description:
    'Explore and test your APIs interactively with Volt Studio, powered by Scalar API Reference. Learn how to enable the playground in development and production with proper security controls.',
  keywords: [
    'Volt.js',
    'Volt Studio',
    'API playground',
    'Scalar API Reference',
    'interactive API testing',
    'API explorer',
    'development tools',
    'API documentation',
    'REST API testing',
    'TypeScript',
  ],
  openGraph: {
    title: 'Volt Studio (API Playground) | Volt.js',
    description:
      'Test and explore your APIs interactively with Volt Studio. Enable the beautiful Scalar-powered playground in development and production with secure authentication controls.',
    type: 'article',
    url: 'https://volt.js.org/docs/advanced-features/volt-studio',
    images: [
      {
        url: 'https://volt.js.org/og/docs-volt-studio.png',
        width: 1200,
        height: 630,
        alt: 'Volt.js Studio API Playground',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Volt Studio (API Playground) | Volt.js',
    description:
      'Test and explore your APIs interactively with Volt Studio. Enable the beautiful Scalar-powered playground in development and production with secure authentication controls.',
    images: ['https://volt.js.org/og/docs-volt-studio.png'],
  },
};

interface VoltStudioLayoutProps {
  children: ReactNode
}

export default function VoltStudioLayout({ children }: VoltStudioLayoutProps) {
  return children
}
import { Metadata } from 'next';
import { ReactNode } from "react"

export const metadata: Metadata = {
  title: 'OpenAPI Documentation | Volt.js',
  description:
    'Learn how to generate OpenAPI specifications and serve interactive API documentation with Volt.js. Configure metadata, security schemes, and customize the Scalar API Reference UI.',
  keywords: [
    'Volt.js',
    'OpenAPI',
    'API documentation',
    'Scalar API Reference',
    'CLI',
    'volt generate docs',
    'API specs',
    'interactive documentation',
    'REST API',
    'TypeScript',
  ],
  openGraph: {
    title: 'OpenAPI Documentation | Volt.js',
    description:
      'Generate comprehensive OpenAPI specifications and serve beautiful interactive API documentation with Volt.js. Configure security, metadata, and customize the developer experience.',
    type: 'article',
    url: 'https://volt.js.org/docs/advanced-features/openapi-documentation',
    images: [
      {
        url: 'https://volt.js.org/og/docs-openapi-documentation.png',
        width: 1200,
        height: 630,
        alt: 'Volt.js OpenAPI Documentation',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OpenAPI Documentation | Volt.js',
    description:
      'Generate comprehensive OpenAPI specifications and serve beautiful interactive API documentation with Volt.js. Configure security, metadata, and customize the developer experience.',
    images: ['https://volt.js.org/og/docs-openapi-documentation.png'],
  },
};

interface OpenApiDocumentationLayoutProps {
  children: ReactNode
}

export default function OpenApiDocumentationLayout({
  children,
}: OpenApiDocumentationLayoutProps) {
  return children
}
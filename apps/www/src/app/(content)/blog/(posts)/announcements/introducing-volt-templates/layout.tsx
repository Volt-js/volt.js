import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Introducing Volt.js Templates: Build Full-Stack Apps Faster',
  description:
    'Discover Volt.js Templates, a collection of production-ready starters for Next.js, React, Bun, and more. Kickstart your next project in minutes with our best-practice templates.',
  keywords: [
    'Volt.js',
    'full-stack templates',
    'starter projects',
    'Next.js template',
    'React template',
    'Bun template',
    'Express API template',
    'Deno API template',
    'project scaffolding',
    'TypeScript',
    'Prisma',
  ],
  openGraph: {
    title: 'Introducing Volt.js Templates: Build Full-Stack Apps Faster',
    description:
      'Kickstart your next project in minutes. Discover our production-ready starters for Next.js, React, Bun, and more.',
    type: 'article',
    url: 'https://volt.js.org/blog/announcements/introducing-volt-templates',
    images: [
      {
        url: 'https://volt.js.org/og/introducing-templates.png', // Assuming an OG image exists at this path
        width: 1200,
        height: 630,
        alt: 'Volt.js Templates Announcement',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Introducing Volt.js Templates: Build Full-Stack Apps Faster',
    description:
      'Kickstart your next project in minutes. Discover our production-ready starters for Next.js, React, Bun, and more.',
    images: ['https://volt.js.org/og/introducing-templates.png'], // Assuming a Twitter card image exists at this path
  },
};

export default function PostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

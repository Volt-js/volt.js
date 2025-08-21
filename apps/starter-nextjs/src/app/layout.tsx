import type { Metadata } from "next";

import { Geist, Geist_Mono } from "next/font/google";
import { VoltProvider } from '@volt.js/core/client'

import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Volt.js Boilerplate",
  description: "A customizable boilerplate for Volt.js applications",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased dark`}
      >
        <VoltProvider
          options={{
            enableSSE: true,
            debug: true,
          }}
        >
          {children}
        </VoltProvider>
      </body>
    </html>
  );
}

import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { Analytics } from '@vercel/analytics/react';
import Header from '@/components/header';
import Footer from '@/components/footer';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: 'MovieMate - Your Personal Movie Recommendation Engine',
  description: 'Get personalized movie and TV show recommendations based on your preferences. Discover hidden gems and popular hits tailored just for you.',
  keywords: ['movies', 'tv shows', 'recommendations', 'entertainment', 'streaming', 'watchlist'],
  authors: [{ name: 'MovieMate Team' }],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://moviemate.vercel.app',
    title: 'MovieMate - Your Personal Movie Recommendation Engine',
    description: 'Get personalized movie and TV show recommendations based on your preferences.',
    siteName: 'MovieMate',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MovieMate - Your Personal Movie Recommendation Engine',
    description: 'Get personalized movie and TV show recommendations based on your preferences.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="dns-prefetch" href="https://api.themoviedb.org" />
        <link rel="preconnect" href="https://api.themoviedb.org" />
        <link rel="dns-prefetch" href="https://image.tmdb.org" />
        <link rel="preconnect" href="https://image.tmdb.org" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
          <Toaster />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
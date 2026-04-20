import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import './globals.css';

export const metadata: Metadata = {
  title: 'Setlist.Touched - 세트리스트 아카이브',
  description: '터치드 공연 기록 및 세트리스트 아카이브 서비스. 모든 공연의 세트리스트와 정보를 한곳에서 만나보세요.',
  keywords: ['Touched', 'setlist', 'archive', '세트리스트', '공연'],
  authors: [{ name: 'Setlist.Touched' }],
  openGraph: {
    title: 'Setlist.Touched',
    description: '터치드 공연 기록 및 세트리스트 아카이브',
    type: 'website',
    images: [{ url: '/og.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og.jpg'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" data-scroll-behavior="smooth">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="color-scheme" content="dark light" />
        <meta name="theme-color" content="#0f0f0f" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex flex-col min-h-screen" style={{ background: '#0f0f0f' }}>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

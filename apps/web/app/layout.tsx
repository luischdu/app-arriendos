import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'ArriendosPRO',
    template: '%s · ArriendosPRO',
  },
  description:
    'Plataforma integral de gestión y cobro de arriendos para Colombia',
  keywords: ['arriendos', 'arrendamiento', 'inmuebles', 'colombia', 'gestión'],
  authors: [{ name: 'ArriendosPRO' }],
  robots: { index: false, follow: false }, // cambiar a true en producción
};

export const viewport: Viewport = {
  themeColor: '#141E33',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-CO" suppressHydrationWarning>
      <body className={inter.variable}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

import type {Metadata} from 'next';
import { Inter, Manrope } from 'next/font/google';
import Header from '@/components/Header';
import './globals.css'; // Global styles

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope' });

export const metadata: Metadata = {
  title: 'Agri-SAW Pro — SPK Pemilihan Komoditas Pertanian',
  description: 'Sistem Pendukung Keputusan pemilihan komoditas pertanian berdasarkan kesesuaian lingkungan dan analisis keuntungan menggunakan metode Simple Additive Weighting (SAW).',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
<html lang="id" className={`${inter.variable} ${manrope.variable}`}>
      <body suppressHydrationWarning className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 w-full pt-20 pb-12">
          {children}
        </main>
      </body>
    </html>
  );
}

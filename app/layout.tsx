import type {Metadata} from 'next';
import { Inter, Manrope } from 'next/font/google';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ChatWidget from '@/components/ChatWidget';
import './globals.css'; // Global styles

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope' });

export const metadata: Metadata = {
  title: 'AgriLens DSS',
  description: 'High-stakes computational intelligence for sustainable and profitable crop selection based on Simple Additive Weighting.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable}`}>
      <body suppressHydrationWarning className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 w-full pb-12">
          {children}
        </main>
        <Footer />
        <ChatWidget />
      </body>
    </html>
  );
}

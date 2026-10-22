import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';

const geist = Geist({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Momentoku — Satu tempat untuk semua momen spesial',
  description: 'Undangan digital, berbagi foto, dan hadiah untuk setiap momen spesial.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body className={geist.className}><noscript><style>{'.hero-line,.hero-description,.hero-cta,.hero-decoration,.fan-card{opacity:1!important}'}</style></noscript>{children}</body></html>;
}

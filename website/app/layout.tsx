import type { Metadata } from 'next';
import MotionLayer from '@/components/MotionLayer';
import '@fontsource-variable/fraunces/full.css';
import '@fontsource-variable/fraunces/full-italic.css';
import '@fontsource-variable/figtree/wght.css';
import '@fontsource-variable/figtree/wght-italic.css';
import './globals.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://myculture-csrq.hew-11122011.chatgpt.site';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'MyCulture × CSRQ — Option-Free Deterministic Scoring',
    template: '%s · MyCulture × CSRQ',
  },
  description:
    'Between Multiple Choice and Open Response: evaluating LLMs with option-free deterministic scoring on MyCulture.',
  authors: [
    { name: 'Zhong Ken Hew' },
    { name: 'Sze Jue Yang' },
    { name: 'Chee Seng Chan' },
  ],
  icons: { icon: `${basePath}/assets/malaysia-flag.png` },
  openGraph: {
    type: 'website',
    title: 'MyCulture × CSRQ',
    description: 'Option-free. Deterministic. Auditable. A Malaysia-centered cultural benchmark for evaluating how instruments shape LLM scores.',
    images: [{ url: `${basePath}/og.png`, width: 1732, height: 908, alt: 'MyCulture × CSRQ — Option-free. Deterministic. Auditable.' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MyCulture × CSRQ',
    description: 'Option-free. Deterministic. Auditable.',
    images: [`${basePath}/og.png`],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body><MotionLayer>{children}</MotionLayer></body>
    </html>
  );
}

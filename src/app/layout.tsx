import type { Metadata } from 'next';
import { site } from '@/lib/site';
import '@fontsource-variable/golos-text';
import './globals.css';
import './soft-surfaces.css';
import './motion.css';
export const metadata: Metadata = { metadataBase: site.url ? new URL(site.url) : undefined, title: `${site.name} — сайты для малого бизнеса`, description: site.description, robots: { index: site.production && !!site.url, follow: site.production && !!site.url }, openGraph: { title: `${site.name} — сайт для твоего бизнеса`, description: site.description, locale: 'ru_RU', type: 'website', ...(site.url ? {url: site.url} : {}) } };
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) { return <html lang="ru"><body>{children}</body></html>; }

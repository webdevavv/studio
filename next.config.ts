import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
 images: { qualities: [75, 90] },
 async headers() {
  return [{ source: '/fonts/golos-text-v5.3.0/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] }];
 },
 async redirects() {
  return ['coffee', 'beauty', 'craft'].map(slug => ({ source: `/catalog/${slug}`, destination: '/catalog', permanent: true }));
 },
 outputFileTracingIncludes: {
  '/blog': ['./content/blog/**/*.md'],
  '/blog/*': ['./content/blog/**/*.md'],
  '/sitemap.xml': ['./content/blog/**/*.md'],
 },
};

export default nextConfig;

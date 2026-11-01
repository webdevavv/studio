import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
 images: { qualities: [75, 90] },
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

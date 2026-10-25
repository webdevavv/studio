import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
 outputFileTracingIncludes: {
  '/blog': ['./content/blog/**/*.md'],
  '/blog/*': ['./content/blog/**/*.md'],
  '/sitemap.xml': ['./content/blog/**/*.md'],
 },
};

export default nextConfig;

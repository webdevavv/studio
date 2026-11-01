import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';
import { publishedTemplates } from '@/lib/catalog';
import { getPosts } from '@/lib/blog';
import { portfolioProjects } from '@/lib/portfolio';
export const dynamic = 'force-dynamic';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
 return site.production && site.url ? [
  { url: site.url, changeFrequency: 'monthly', priority: 1 },
  ...['/services', '/prices', '/services/landing-page', '/services/business-card', '/portfolio', ...portfolioProjects.map(project => `/portfolio/${project.slug}`)].map(path => ({ url: `${site.url.replace(/\/$/, '')}${path}`, changeFrequency: 'monthly' as const, priority: .8 })),
  { url: `${site.url.replace(/\/$/, '')}/catalog`, changeFrequency: 'weekly', priority: .9 },
  ...publishedTemplates.map(template => ({ url: `${site.url.replace(/\/$/, '')}/catalog/${template.slug}`, changeFrequency: 'monthly' as const, priority: .7 })),
  { url: `${site.url.replace(/\/$/, '')}/blog`, changeFrequency: 'weekly', priority: .8 },
  ...(await getPosts()).map(post => ({ url: `${site.url.replace(/\/$/, '')}/blog/${post.slug}`, lastModified: new Date(`${post.date}T00:00:00Z`), changeFrequency: 'monthly' as const, priority: .6 })),
 ] : [];
}

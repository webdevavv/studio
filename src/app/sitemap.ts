import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';
import { catalogTemplates } from '@/lib/catalog';
import { getPosts } from '@/lib/blog';
export const dynamic = 'force-dynamic';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
 return site.production && site.url ? [
  { url: site.url, changeFrequency: 'monthly', priority: 1 },
  { url: `${site.url.replace(/\/$/, '')}/catalog`, changeFrequency: 'weekly', priority: .9 },
  ...catalogTemplates.map(template => ({ url: `${site.url.replace(/\/$/, '')}/catalog/${template.id}`, changeFrequency: 'monthly' as const, priority: .7 })),
  { url: `${site.url.replace(/\/$/, '')}/blog`, changeFrequency: 'weekly', priority: .8 },
  ...(await getPosts()).map(post => ({ url: `${site.url.replace(/\/$/, '')}/blog/${post.slug}`, lastModified: new Date(`${post.date}T00:00:00Z`), changeFrequency: 'monthly' as const, priority: .6 })),
 ] : [];
}

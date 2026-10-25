import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';
export default function sitemap(): MetadataRoute.Sitemap { return site.production && site.url ? [{url:site.url, changeFrequency:'monthly', priority:1}] : []; }

import path from 'node:path';
import { cache } from 'react';
import { createBlogStore } from './blog-content.mjs';
import type { PostMeta, TocItem } from './blog-content.mjs';

const store = createBlogStore(path.join(process.cwd(), 'content', 'blog'), {
 cacheMs: process.env.NODE_ENV === 'development' ? 0 : 10000,
});

export type BlogPost = PostMeta & { html: string; toc: TocItem[] };
export const getPosts = cache(async (): Promise<PostMeta[]> => store.all());
export const getPost = cache(async (slug: string): Promise<BlogPost | undefined> => store.get(slug));
export const formatPostDate = (date: string) => new Intl.DateTimeFormat('ru-RU', {
 day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
}).format(new Date(`${date}T12:00:00Z`));
export const BLOG_PAGE_SIZE = 12;

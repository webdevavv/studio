import path from 'node:path';
import { createBlogStore } from '../src/lib/blog-content.mjs';

const root = path.resolve(process.argv[2] || 'content/blog');
try {
 const { posts, errors } = await createBlogStore(root).audit();
 console.log(`Блог: ${root}`);
 console.log(`Опубликовано: ${posts.filter(post => !post.meta.draft).length}. Черновиков: ${posts.filter(post => post.meta.draft).length}.`);
 if (errors.length) {
  console.error(`Ошибок: ${errors.length}\n${errors.map(error => `- ${error}`).join('\n')}`);
  process.exitCode = 1;
 } else console.log('Все статьи прошли проверку.');
} catch (error) { console.error(error.message); process.exitCode = 1; }

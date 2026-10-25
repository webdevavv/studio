import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { parseDocument } from 'yaml';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeSlug from 'rehype-slug';
import rehypeSanitize from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';

/** @typedef {{slug: string, title: string, description: string, date: string, category: string, tags: string[], draft: boolean, readingMinutes: number}} PostMeta */
/** @typedef {{meta: PostMeta, body: string, file: string, stamp: string}} Post */
/** @typedef {{id: string, text: string, level: number}} TocItem */

const parser = unified().use(remarkParse).use(remarkGfm);
const alphabet = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя';
const latin = ['a','b','v','g','d','e','e','zh','z','i','y','k','l','m','n','o','p','r','s','t','u','f','h','ts','ch','sh','sch','','y','','e','yu','ya'];

export function slugFromFilename(filename) {
 return path.basename(filename, path.extname(filename)).toLowerCase()
  .split('').map(letter => alphabet.includes(letter) ? latin[alphabet.indexOf(letter)] : letter).join('')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function plainText(node) {
 if (node.type === 'html') return '';
 return node.value || node.alt || (node.children || []).map(plainText).join(' ');
}

function stringField(data, key, max, fallback = '') {
 const value = data[key] === undefined ? fallback : data[key];
 if (typeof value !== 'string' || !value.trim() || value.trim().length > max) throw new Error(`Поле ${key}: нужна строка от 1 до ${max} символов.`);
 return value.trim();
}

/** @returns {Post} */
export function parsePost(source, file, stamp = '') {
 const text = source.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
 const frontmatter = text.match(/^---\n([\s\S]*?)\n---(?:\n|$)/);
 if (!frontmatter) throw new Error('Нет YAML-шапки между строками ---; нужны title и date.');
 if (frontmatter[1].length > 16384) throw new Error('YAML-шапка превышает 16 КБ.');
 const document = parseDocument(frontmatter[1], { schema: 'core', uniqueKeys: true });
 if (document.errors.length) throw new Error(`Ошибка YAML: ${document.errors[0].message}`);
 const data = document.toJS({ maxAliasCount: 0 });
 if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('YAML-шапка должна содержать поля title и date.');
 const title = stringField(data, 'title', 140);
 const date = stringField(data, 'date', 10);
 if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(`${date}T00:00:00Z`)) || new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) !== date) throw new Error('Поле date: нужна существующая дата в формате YYYY-MM-DD.');
 const slug = stringField(data, 'slug', 100, slugFromFilename(file));
 if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error('Поле slug: используйте строчные латинские буквы, цифры и дефисы.');
 if (data.draft !== undefined && typeof data.draft !== 'boolean') throw new Error('Поле draft: используйте true или false без кавычек.');
 const tags = data.tags ?? [];
 if (!Array.isArray(tags) || tags.length > 12 || tags.some(tag => typeof tag !== 'string' || !tag.trim() || tag.length > 40)) throw new Error('Поле tags: список до 12 непустых строк, каждая до 40 символов.');
 const body = text.slice(frontmatter[0].length).trim();
 if (!body) throw new Error('После YAML-шапки нужен текст статьи.');
 const tree = parser.parse(body);
 const firstParagraph = tree.children.find(node => node.type === 'paragraph');
 const fallback = plainText(firstParagraph || tree).replace(/\s+/g, ' ').trim().slice(0, 180) || title;
 const description = stringField(data, 'description', 300, fallback);
 const category = stringField(data, 'category', 60, 'О сайтах');
 const words = plainText(tree).trim().split(/\s+/).filter(Boolean).length;
 return { meta: { slug, title, description, date, category, tags: [...new Set(tags.map(tag => tag.trim()))], draft: data.draft ?? false, readingMinutes: Math.max(1, Math.ceil(words / 180)) }, body, file, stamp };
}

async function listFiles(directory) {
 const result = [];
 for (const entry of await readdir(directory, { withFileTypes: true })) {
  if (entry.name.startsWith('.') || entry.name.startsWith('_') || entry.isSymbolicLink()) continue;
  const filename = path.join(directory, entry.name);
  if (entry.isDirectory()) result.push(...await listFiles(filename));
  else if (entry.isFile() && /\.md$/i.test(entry.name)) result.push(filename);
 }
 return result.sort();
}

/** A bounded scanner: no more than 16 files are read at once. */
async function mapFiles(files, read) {
 const results = new Array(files.length);
 let cursor = 0;
 await Promise.all(Array.from({ length: Math.min(16, files.length) }, async () => {
  while (cursor < files.length) { const index = cursor++; results[index] = await read(files[index]); }
 }));
 return results;
}

export function createBlogStore(root, { cacheMs = 10000 } = {}) {
 /** @type {Map<string, {stamp: string, post?: Post, error?: string}>} */
 const filesCache = new Map();
 /** @type {{posts: Post[], errors: string[]}} */
 let snapshot = { posts: [], errors: [] };
 let refreshedAt = 0;
 let pending;
 const htmlCache = new Map();

 async function refresh(force = false) {
  if (!force && refreshedAt && Date.now() - refreshedAt < cacheMs) return snapshot;
  if (pending) return pending;
  pending = (async () => {
   const files = await listFiles(root);
   const present = new Set(files);
   for (const filename of filesCache.keys()) if (!present.has(filename)) filesCache.delete(filename);
   const errors = [];
   const posts = (await mapFiles(files, async filename => {
    try {
     const info = await stat(filename);
     if (info.size > 2 * 1024 * 1024) throw new Error('Файл превышает 2 МБ.');
     const stamp = `${info.mtimeMs}:${info.ctimeMs}:${info.size}`;
     let entry = filesCache.get(filename);
     if (!entry || entry.stamp !== stamp) {
      try { entry = { stamp, post: parsePost(await readFile(filename, 'utf8'), filename, stamp) }; }
      catch (error) { entry = { stamp, error: error.message }; }
      filesCache.set(filename, entry);
     }
     if (entry.error) throw new Error(entry.error);
     return entry.post;
    } catch (error) { errors.push(`${path.relative(root, filename)}: ${error.message}`); return undefined; }
   })).filter(Boolean);
   const counts = new Map();
   for (const post of posts) counts.set(post.meta.slug, (counts.get(post.meta.slug) || 0) + 1);
   const unique = posts.filter(post => {
    if (counts.get(post.meta.slug) === 1) return true;
    errors.push(`${path.relative(root, post.file)}: повторяющийся slug «${post.meta.slug}». Задайте уникальный slug.`);
    return false;
   });
   unique.sort((a, b) => b.meta.date.localeCompare(a.meta.date) || a.meta.slug.localeCompare(b.meta.slug));
   snapshot = { posts: unique, errors: errors.sort() };
   refreshedAt = Date.now();
   return snapshot;
  })();
  try { return await pending; } finally { pending = undefined; }
 }

 return {
  audit: () => refresh(true),
  async all() { return (await refresh()).posts.filter(post => !post.meta.draft).map(post => post.meta); },
  async get(slug) {
   if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return undefined;
   const post = (await refresh()).posts.find(post => !post.meta.draft && post.meta.slug === slug);
   if (!post) return undefined;
   const key = `${post.file}:${post.stamp}`;
   if (!htmlCache.has(key)) {
    const rendered = await renderMarkdown(post.body, post.meta.title);
    htmlCache.set(key, rendered);
    if (htmlCache.size > 64) htmlCache.delete(htmlCache.keys().next().value);
   }
   return { ...post.meta, ...htmlCache.get(key) };
  },
 };
}

/** @returns {Promise<{html: string, toc: TocItem[]}>} */
export async function renderMarkdown(body, title) {
 /** @type {TocItem[]} */
 const toc = [];
 const result = await unified().use(remarkParse).use(remarkGfm)
  .use(() => tree => {
   if (tree.children[0]?.type === 'heading' && tree.children[0].depth === 1 && plainText(tree.children[0]).trim() === title) tree.children.shift();
   const visit = node => { if (node.type === 'heading' && node.depth === 1) node.depth = 2; node.children?.forEach(visit); };
   visit(tree);
  })
  .use(remarkRehype, { footnoteLabel: 'Примечания', footnoteBackLabel: 'Вернуться к тексту' })
  .use(rehypeSlug, { prefix: 'heading-' })
  .use(rehypeSanitize)
  .use(() => tree => {
   const ids = new Set();
   const visit = node => {
    if (node.properties?.id) ids.add(node.properties.id);
    if (node.tagName === 'h2' || node.tagName === 'h3') toc.push({ id: String(node.properties.id), text: plainText(node), level: Number(node.tagName[1]) });
    if (node.tagName === 'img') { node.properties.loading = 'lazy'; node.properties.decoding = 'async'; }
    node.children?.forEach(visit);
   };
   visit(tree);
   const links = node => {
    const href = node.properties?.href;
    if (typeof href === 'string' && href.startsWith('#') && !ids.has(href.slice(1)) && ids.has(`user-content-${href.slice(1)}`)) node.properties.href = `#user-content-${href.slice(1)}`;
    node.children?.forEach(links);
    if (node.children) node.children = node.children.map(child => child.tagName === 'table' ? { type: 'element', tagName: 'div', properties: { className: ['article-table'], tabIndex: 0, role: 'region', ariaLabel: 'Таблица с горизонтальной прокруткой' }, children: [child] } : child);
   };
   links(tree);
  })
  .use(rehypeStringify).process(body);
 return { html: String(result), toc };
}

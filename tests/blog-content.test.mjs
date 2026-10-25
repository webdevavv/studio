import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createBlogStore, parsePost, renderMarkdown, slugFromFilename } from '../src/lib/blog-content.mjs';

const markdown = (slug, extra = '', body = 'Текст статьи для читателя.') => `---\ntitle: "Статья ${slug}"\ndate: "2026-10-25"\nslug: "${slug}"\n${extra}\n---\n\n${body}`;

async function fixture(t) {
 const directory = await mkdtemp(path.join(os.tmpdir(), 'studio-blog-test-'));
 t.after(async () => {
  assert.ok(path.basename(directory).startsWith('studio-blog-test-'));
  assert.equal(path.dirname(directory), os.tmpdir());
  await rm(directory, { recursive: true, force: true });
 });
 return directory;
}

test('frontmatter validates dates, types and slugs; Cyrillic filenames have predictable URLs', () => {
 assert.equal(slugFromFilename('Как выбрать сайт.md'), 'kak-vybrat-sayt');
 assert.equal(parsePost('\uFEFF' + markdown('test').replaceAll('\n', '\r\n'), 'test.md').meta.title, 'Статья test');
 for (const source of [markdown('../escape'), markdown('test').replace('2026-10-25', '2026-02-30'), markdown('test', 'draft: "false"'), '# Без шапки', markdown('test', 'tags: plain-text')]) {
  assert.throws(() => parsePost(source, 'test.md'));
 }
});

test('batch import finds nested Markdown, excludes drafts and templates, and detects duplicates', async t => {
 const directory = await fixture(t);
 await mkdir(path.join(directory, 'batch'));
 await Promise.all(Array.from({ length: 64 }, (_, index) => writeFile(path.join(directory, 'batch', `post-${index}.md`), markdown(`post-${index}`))));
 await writeFile(path.join(directory, '_template.md'), 'ignored template');
 await writeFile(path.join(directory, 'draft.md'), markdown('hidden', 'draft: true'));
 const store = createBlogStore(directory, { cacheMs: 0 });
 assert.equal((await store.all()).length, 64);
 assert.equal(await store.get('hidden'), undefined);
 assert.equal(await store.get('../draft'), undefined);
 await writeFile(path.join(directory, 'duplicate.md'), markdown('post-0'));
 const audit = await store.audit();
 assert.equal(audit.errors.length, 2);
 assert.equal((await store.all()).length, 63);
 assert.equal(await store.get('post-0'), undefined);
});

test('running store picks up additions, edits, drafts and deletions without restart', async t => {
 const directory = await fixture(t);
 const store = createBlogStore(directory, { cacheMs: 0 });
 assert.equal((await store.all()).length, 0);
 const file = path.join(directory, 'new.md');
 await writeFile(file, markdown('new', '', 'Первый вариант текста.'));
 assert.match((await store.get('new')).html, /Первый вариант/);
 await writeFile(file, markdown('new', '', 'Полностью обновлённый вариант статьи.'));
 assert.match((await store.get('new')).html, /Полностью обновлённый/);
 await writeFile(file, markdown('new', 'draft: true'));
 assert.equal(await store.get('new'), undefined);
 await rm(file);
 assert.equal((await store.all()).length, 0);
});

test('bad files are reported by filename while valid posts remain readable', async t => {
 const directory = await fixture(t);
 await writeFile(path.join(directory, 'good.md'), markdown('good'));
 await writeFile(path.join(directory, 'bad.md'), '# Missing frontmatter');
 const store = createBlogStore(directory);
 assert.equal((await store.all()).length, 1);
 assert.match((await store.audit()).errors[0], /^bad.md:/);
});

test('Markdown has safe HTML, unique TOC anchors, tables and task lists', async () => {
 const body = '# Заголовок\n\nТекст **жирным**.\n\n## Раздел\n\n[x](javascript:alert%281%29)\n\n<script>alert(1)</script>\n\n## Раздел\n\n| A | B |\n| - | - |\n| 1 | 2 |\n\n- [x] Сделано\n\n```js\nconst x = 1;\n```';
 const { html, toc } = await renderMarkdown(body, 'Заголовок');
 assert.doesNotMatch(html, /<h1|<script|href="javascript:/);
 assert.match(html, /<strong>жирным<\/strong>/);
 assert.match(html, /article-table/);
 assert.match(html, /type="checkbox"/);
 assert.match(html, /<pre><code/);
 assert.equal(toc.length, 2);
 assert.notEqual(toc[0].id, toc[1].id);
 for (const item of toc) assert.ok(html.includes(`id="${item.id}"`));
});

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

test('static output preserves legacy post URLs, feeds and site pages', async () => {
  const home = await fs.readFile('dist/index.html', 'utf8');
  assert.ok(home.includes('recent-posts'));
  assert.ok(home.includes('lang="zh-CN"'));
  assert.ok(home.includes('企鹅的小站'));

  // 每篇文章的旧 Hexo 地址都输出为真实的平铺 HTML 文件。
  const sources = (await fs.readdir('src/content/posts')).filter((name) =>
    name.endsWith('.md'),
  );
  assert.ok(sources.length > 0);
  const search = await fs.readFile('dist/search.xml', 'utf8');
  for (const name of sources) {
    const source = await fs.readFile(`src/content/posts/${name}`, 'utf8');
    const url = source.match(/^url:\s*(\/[^\s]+)\s*$/m)?.[1];
    assert.ok(url, `${name} 缺少旧地址 url`);
    const file = url.replace(/^\//, '');
    const html = await fs.readFile(path.join('dist', file), 'utf8');
    assert.ok(html.includes('id="post"'), `${url} 不是文章页`);
    assert.ok(search.includes(url), `search.xml 缺少 ${url}`);
  }
  // Hexo 默认 Hello World（/posts/16107.html）未迁移。
  assert.ok(!search.includes('/posts/16107.html'));
  await assert.rejects(fs.stat('dist/posts/16107.html'));

  // 旧站的 Atom 订阅地址保留，同时保留新主题的 RSS 与站点文件。
  assert.ok(
    (await fs.readFile('dist/atom.xml', 'utf8')).includes(
      '<feed xmlns="http://www.w3.org/2005/Atom">',
    ),
  );
  for (const file of [
    'index.xml',
    'sitemap.xml',
    'robots.txt',
    'links.json',
    'manifest.json',
    '404.html',
  ])
    assert.ok((await fs.stat(path.join('dist', file))).isFile(), file);

  // 旧站地址通过静态重定向页保留。
  const redirects: [string, string][] = [
    ['link/index.html', '/links/'],
    ['comments/index.html', '/message/'],
    ['categories/CTF/index.html', '/categories/ctf/'],
    ['categories/CTF/Misc/index.html', '/categories/misc/'],
    ['tags/CTF/index.html', '/tags/ctf/'],
    ['tags/Write-UP/index.html', '/tags/write-up/'],
    ['archives/2023/index.html', '/archives/'],
    ['archives/2025/04/index.html', '/archives/'],
  ];
  for (const [file, target] of redirects) {
    const html = await fs.readFile(path.join('dist', file), 'utf8');
    assert.ok(
      html.includes(`content="0;url=${target}"`),
      `${file} 未重定向到 ${target}`,
    );
  }

  // 主题的示例内容不应残留在站点产物中。
  await assert.rejects(fs.stat('dist/p/components'));
  await assert.rejects(fs.stat('dist/p/writing'));
});

test('all emitted local asset and page URLs resolve', async () => {
  const root = path.resolve('dist');
  const files = await fs.readdir(root, { recursive: true });
  const urls = new Set<string>();
  for (const file of files.filter((name) => name.endsWith('.html'))) {
    const html = await fs.readFile(path.join(root, file), 'utf8');
    for (const match of html.matchAll(/\b(?:href|src)="(\/[^"\s]*)"/g)) {
      if (!match[1].startsWith('//')) urls.add(match[1]);
    }
  }
  for (const url of urls) {
    const file = path.join(
      root,
      decodeURIComponent(new URL(url, 'https://example.org').pathname),
    );
    await assert.doesNotReject(fs.stat(file), `Missing local URL: ${url}`);
  }
});

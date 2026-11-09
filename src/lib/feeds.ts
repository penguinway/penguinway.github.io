import { config, absolute, url } from './site';
import { contentPath, plainText, type Post } from './content';
export const xml = (s: unknown) =>
  String(s ?? '').replace(
    /[<>&"']/g,
    (c) =>
      ({
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
        "'": '&apos;',
      })[c]!,
  );
export function rss(posts: Post[], title = config.title) {
  return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${xml(title)}</title><link>${xml(absolute('/'))}</link><description>${xml(config.description)}</description>${posts.map((p) => `<item><title>${xml(p.data.title)}</title><link>${xml(absolute(contentPath(p)))}</link><guid isPermaLink="true">${xml(absolute(contentPath(p)))}</guid><pubDate>${p.data.date.toUTCString()}</pubDate><description>${xml(p.data.description ?? plainText(p.body ?? '').slice(0, 300))}</description></item>`).join('')}</channel></rss>`;
}
/**
 * 旧站由 Hexo 生成的订阅地址是 /atom.xml（Atom 1.0）。
 * 保留该地址，避免旧订阅者与外部链接失效；本站默认订阅仍是 /index.xml。
 */
export function atom(posts: Post[], title = config.title) {
  const updated = posts[0]
    ? (posts[0].data.lastmod ?? posts[0].data.date)
    : new Date();
  return `<?xml version="1.0" encoding="utf-8"?><feed xmlns="http://www.w3.org/2005/Atom"><title>${xml(title)}</title><subtitle>${xml(config.description)}</subtitle><link href="${xml(absolute('/'))}" rel="alternate"/><link href="${xml(absolute('/atom.xml'))}" rel="self" type="application/atom+xml"/><id>${xml(absolute('/'))}</id><updated>${updated.toISOString()}</updated><author><name>${xml(config.author.name)}</name></author>${posts
    .map((p) => {
      const updatedAt = p.data.lastmod ?? p.data.date;
      return `<entry><title>${xml(p.data.title)}</title><link href="${xml(absolute(contentPath(p)))}" rel="alternate"/><id>${xml(absolute(contentPath(p)))}</id><published>${p.data.date.toISOString()}</published><updated>${updatedAt.toISOString()}</updated><summary>${xml(p.data.description ?? plainText(p.body ?? '').slice(0, 300))}</summary></entry>`;
    })
    .join('')}</feed>`;
}
export function searchXml(posts: Post[]) {
  return `<?xml version="1.0" encoding="UTF-8"?><search>${posts.map((p) => `<entry><title>${xml(p.data.title)}</title><url>${xml(url(contentPath(p)))}</url><content>${xml(plainText(p.body ?? ''))}</content></entry>`).join('')}</search>`;
}

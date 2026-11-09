import {
  getPosts,
  getPages,
  homePosts,
  paginate,
  taxonomy,
  contentPath,
  assertUniquePaths,
  type Post,
  type Page,
} from './content';
import { config, cfg, t } from './site';
export interface Route {
  path: string;
  kind: 'home' | 'post' | 'page' | 'taxonomy' | 'term' | 'redirect';
  title: string;
  entry?: Post | Page;
  posts?: Post[];
  current?: number;
  total?: number;
  taxonomy?: 'tags' | 'categories' | 'series';
  type?: string;
  target?: string;
}
export async function getRoutes(): Promise<Route[]> {
  const posts = await getPosts(),
    pages = await getPages();
  const chunks = paginate(homePosts(posts), config.pagination);
  const routes: Route[] = chunks.map((items, i) => ({
    path: i ? `/page/${i + 1}/` : '/',
    kind: 'home',
    title: config.title,
    posts: items,
    current: i + 1,
    total: chunks.length,
  }));
  for (const entry of posts)
    routes.push({
      path: contentPath(entry),
      kind: 'post',
      title: entry.data.title,
      entry,
      type: 'post',
    });
  for (const kind of ['tags', 'categories', 'series'] as const) {
    const groups = taxonomy(posts, kind);
    // 没有文章使用系列时不生成空的 /series/ 页；标签、分类是站点固定入口，保持生成。
    if (kind === 'series' && !groups.length) continue;
    routes.push({
      path: `/${kind}/`,
      kind: 'taxonomy',
      title: t(kind),
      taxonomy: kind,
    });
    for (const group of groups)
      routes.push({
        path: group.path,
        kind: 'term',
        title: group.name,
        posts: group.posts,
        taxonomy: kind,
      });
  }
  // 仅生成启用中的主题页面；未启用的功能不发布空页或模板示例内容。
  const defaults: [string, string, string, boolean][] = [
    ['/archives/', 'archives', t('allPosts'), true],
    ['/about/', 'about', t('about'), true],
    ['/links/', 'links', t('links'), true],
    // 旧站没有装备页，模板数据是示例；需要时新建 src/content/pages/ 页面并填 src/data/kit.json。
    ['/equipment/', 'kit', t('equipment'), false],
    ['/music/', 'music', t('music'), cfg.music.enable],
    ['/message/', 'message', t('message'), true],
    ['/brevity/', 'brevity', t('brevity'), cfg.brevity.enable],
    [
      '/recentcomments/',
      'recentcomment',
      t('recentComments'),
      cfg.recent_comments.enable && Boolean(cfg.comment.use),
    ],
  ];
  for (const [path, type, title, enabled] of defaults)
    if (enabled && !pages.some((p) => contentPath(p) === path))
      routes.push({ path, kind: 'page', type, title });
  for (const entry of pages)
    routes.push({
      path: contentPath(entry),
      kind: 'page',
      title: entry.data.title,
      entry,
      type: entry.data.type ?? 'page',
    });
  for (const entry of [...posts, ...pages])
    for (const alias of entry.data.aliases)
      routes.push({
        path: contentPath({
          id: '',
          collection: 'pages',
          data: { url: alias },
        }),
        kind: 'redirect',
        title: entry.data.title,
        target: contentPath(entry),
      });
  assertUniquePaths([
    ...routes.map((r) => r.path),
    '/404.html',
    '/index.xml',
    '/atom.xml',
    '/search.xml',
    '/links.json',
    '/sitemap.xml',
    '/robots.txt',
    ...(cfg.pwa.enable ? [cfg.pwa.manifest] : []),
  ]);
  return routes;
}

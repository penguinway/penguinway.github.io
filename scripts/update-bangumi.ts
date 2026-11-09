/**
 * 从 Bangumi 番组计划（bgm.tv v0 公开接口）拉取动画收藏，写入 src/data/bangumis.json。
 * 取代 Hexo 插件 hexo-bilibili-bangumi 的 `hexo bangumi -u`（bgm v0 数据源）。
 *
 * 用法：pnpm bangumi:update <用户名或数字ID>
 *       或设置环境变量 BANGUMI_USER；未提供时沿用 JSON 中已记录的 userId。
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const API = 'https://api.bgm.tv/v0';
const UA = 'penguinway-blog/1.0 (https://github.com/penguinway)';
const PAGE_SIZE = 50;
const ANIME = 2;
// bgm 收藏类型：1 想看，2 看过，3 在看
const STATUS = { wantWatch: 1, watching: 3, watched: 2 } as const;

const file = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../src/data/bangumis.json',
);

interface Collection {
  subject_id: number;
  ep_status?: number;
  subject?: {
    id: number;
    name: string;
    name_cn?: string;
    images?: { common?: string; large?: string };
    eps?: number;
    score?: number;
    short_summary?: string;
    collection_total?: number;
    tags?: { name: string }[];
  };
}

async function get<T>(url: string, retries = 3): Promise<T> {
  for (let i = 1; ; i++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': UA, Accept: 'application/json' },
        signal: AbortSignal.timeout(20_000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
      return (await res.json()) as T;
    } catch (error) {
      if (i >= retries) throw error;
      await new Promise((r) => setTimeout(r, 1000 * i));
    }
  }
}

const formatItem = ({ subject: s, subject_id, ep_status }: Collection) => ({
  id: subject_id,
  title: s?.name_cn || s?.name || String(subject_id),
  type: '动画',
  cover: (s?.images?.common || s?.images?.large || '').replace(/^http:/, 'https:'),
  totalCount: s?.eps || null,
  ep_status: ep_status ?? 0,
  score: s?.score || null,
  collect: s?.collection_total ?? null,
  tags: s?.tags?.[0]?.name ?? '',
  des: s?.short_summary ? `${s.short_summary.trim()}...` : '',
});

async function fetchStatus(user: string, type: number) {
  const items: ReturnType<typeof formatItem>[] = [];
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const q = new URLSearchParams({
      subject_type: String(ANIME),
      type: String(type),
      limit: String(PAGE_SIZE),
      offset: String(offset),
    });
    const page = await get<{ total: number; data: Collection[] }>(
      `${API}/users/${encodeURIComponent(user)}/collections?${q}`,
    );
    items.push(...page.data.map(formatItem));
    if (offset + PAGE_SIZE >= page.total) return items;
  }
}

const previous = JSON.parse(await fs.readFile(file, 'utf8'));
const user = process.argv[2] || process.env.BANGUMI_USER || previous.userId;
if (!user) {
  console.error('缺少 Bangumi 用户名或 ID：pnpm bangumi:update <用户名或ID>');
  process.exit(1);
}

const result: Record<string, unknown> = {
  source: 'bgm.tv v0',
  userId: String(user),
  updatedAt: new Date().toISOString(),
};
for (const [key, type] of Object.entries(STATUS)) {
  result[key] = await fetchStatus(String(user), type);
  console.log(`${key}: ${(result[key] as unknown[]).length}`);
}
await fs.writeFile(file, `${JSON.stringify(result, null, 2)}\n`);
console.log(`已写入 ${path.relative(process.cwd(), file)}`);

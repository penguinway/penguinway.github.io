import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import site from './src/site.config.ts';
import mdx from '@astrojs/mdx';
import { satteri } from '@astrojs/markdown-satteri';
import outputLayout from './scripts/output-layout.ts';
import { solitudeMarkdown, solitudeMath } from './scripts/markdown-plugin.ts';

export default defineConfig({
  site: site.site,
  base: site.base,
  output: 'static',
  trailingSlash: 'ignore',
  // 旧 Hexo 站的分类、标签地址区分大小写，新主题生成小写路径。
  // 旧站的年/月归档页在新主题中统一收敛到 /archives/，按旧地址做重定向。
  redirects: {
    '/categories/CTF/': '/categories/ctf/',
    '/categories/CTF/Misc/': '/categories/misc/',
    '/tags/CTF/': '/tags/ctf/',
    '/tags/BUUCTF/': '/tags/buuctf/',
    '/tags/CISCN2023/': '/tags/ciscn2023/',
    '/tags/Write-UP/': '/tags/write-up/',
    '/archives/2023/': '/archives/',
    '/archives/2024/': '/archives/',
    '/archives/2025/': '/archives/',
    '/archives/2023/05/': '/archives/',
    '/archives/2023/09/': '/archives/',
    '/archives/2024/05/': '/archives/',
    '/archives/2025/03/': '/archives/',
    '/archives/2025/04/': '/archives/',
  },
  integrations: [mdx(), outputLayout()],
  vite: { plugins: [tailwindcss()] },
  markdown: {
    processor: satteri({
      features: { math: site.theme.katex.enable, headingAttributes: true },
      mdastPlugins: [solitudeMath(site)],
      hastPlugins: [solitudeMarkdown(site)],
    }),
    syntaxHighlight: site.theme.highlight.enable ? 'shiki' : false,
    shikiConfig: { themes: site.theme.highlight.themes, defaultColor: false },
  },
});

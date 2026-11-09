# PenguinWay Blog

企鹅的小站新博客，基于 [Astro Solitude](https://github.com/everfu/astro-solitude) 模板（Apache-2.0，见 `LICENSE`、`NOTICE`）。

## 当前决策

- 迁移方向：Astro + 接近现有 Hexo 安知鱼站点的主题，再补齐喜欢的功能。
- 优先级：好看、访问快速、省维护。
- 现有外观参考：https://penguinway.github.io/
- 待迁移的 WordPress 博客：`blog.penguinway.space`。
- 主题：Astro Solitude；部署位置未定。

## 本地开发

```sh
pnpm install --frozen-lockfile
pnpm dev      # 本地预览
pnpm build    # 输出到 dist/
```

文章在 `src/content/posts/`，站点配置在 `src/site.config.ts`，主题使用文档在 `docs/`。

## Agent 接续

先阅读 [AGENTS.md](AGENTS.md)，再阅读 [docs/PROJECT_HANDOFF.md](docs/PROJECT_HANDOFF.md)。

**已开始实施，进展与待办见交接记录。**

本目录中的交接文件用于让后续 Agent 继续理解任务，不代表宿主应用中的原会话已经切换项目或工作目录。

# PenguinWay Blog

企鹅的小站新博客，基于 [Astro Solitude](https://github.com/everfu/astro-solitude) 模板（Apache-2.0，见 `LICENSE`、`NOTICE`）。

## 当前决策

- 迁移方向：Astro + 接近现有 Hexo 安知鱼站点的主题，再补齐喜欢的功能。
- 优先级：好看、访问快速、省维护。
- 原站参考：旧 Hexo 站（GitHub Pages）与 WordPress 站 `blog.penguinway.space`；后者已确认曾长期失陷（wp2shell 未认证 RCE），不再作为博客使用。
- 主题：Astro Solitude。
- 部署：主站在 txcloud，线上地址 <https://blog.penguinway.space/>；反向代理与 HTTPS 由服务器现有 OpenResty 维护。GitHub Pages 继续作为自动构建的镜像。

## 本地开发

```sh
pnpm install --frozen-lockfile
pnpm dev      # 本地预览
pnpm build    # 输出到 dist/
```

文章在 `src/content/posts/`，站点配置在 `src/site.config.ts`，主题使用文档在 `docs/`。

## 部署

### 主站（txcloud）

构建静态产物后上传到服务器，由 `nginx:stable-alpine` 容器只读托管，再交给服务器现有的 OpenResty 反代。完整步骤、服务器路径与验证命令见 [`deploy/README.md`](deploy/README.md)。

### 镜像（GitHub Pages）

仓库 `penguinway/penguinway.github.io` 的 `main` 分支每次推送，或每天 04:00（Asia/Shanghai）的定时任务，都会触发 [GitHub Actions](.github/workflows/deploy.yml)：

1. 安装 Node 24 与 pnpm 12.18.0；
2. `pnpm install --frozen-lockfile`；
3. `pnpm bangumi:update 934887`：从 Bangumi 拉取最新追番收藏；接口不可用时沿用仓库中的数据，不阻断部署；
4. `pnpm check`（类型检查）、`pnpm build`（生成 `dist/`）、`pnpm test`（单元测试）；
5. 上传构建产物并部署到 GitHub Pages（canonical 指向主站 `https://blog.penguinway.space/`）。

- Pages 的 Build and deployment 来源已设为 **GitHub Actions**；`github-pages` 环境的部署分支策略放行 `main`。
- 追番无需手动更新：每次部署都会刷新；只想刷新追番时，在 Actions 页面手动运行一次工作流即可。
- 更换 Bangumi 账号时，修改 `.github/workflows/deploy.yml` 里的用户 ID `934887`（可再本地跑一次 `pnpm bangumi:update <ID>` 更新仓库里的兜底数据）。
- 旧 Hexo 站的生成文件仍保留在仓库 `master` 分支，仅作历史参考，不参与部署。

## Agent 接续

先阅读 [AGENTS.md](AGENTS.md)，再阅读 [docs/PROJECT_HANDOFF.md](docs/PROJECT_HANDOFF.md)。

**已开始实施，进展与待办见交接记录。**

本目录中的交接文件用于让后续 Agent 继续理解任务，不代表宿主应用中的原会话已经切换项目或工作目录。

# Blog 项目交接记录

记录日期：2026-11-09（Asia/Shanghai）。

## 用户最新指令与当前状态（2026-11-09 第八轮后）

用户在本会话的指令：**换站点 icon → 把新站部署到 txcloud（blog.penguinway.space，反代由用户自己维护）→ 取代 WordPress → 把这次排查与部署写成新的博客发布**。

当前状态：

- **主站已部署到 txcloud**：静态构建产物由 `nginx:stable-alpine` 容器 `blog-static` 托管在服务器 `127.0.0.1:8089`，容器只读挂载产物、无 PHP/数据库。DNS 的 A 记录本就指向 txcloud（82.157.254.160）。
- **反代尚未切换**：服务器 1Panel OpenResty 的 `blog.penguinway.space` 仍指向旧 WordPress（`127.0.0.1:8088`），用户将自行把上游改为 `127.0.0.1:8089`；切换并确认后停掉 WordPress 容器（用户已确认：保留数据和镜像）。
- **GitHub Pages 继续作为镜像**：https://penguinway.github.io/ 由 Actions 自动构建部署，canonical 已指向主站 `https://blog.penguinway.space/`。
- **站点 icon 已更换**：使用旧 WordPress 的 site icon 图，生成 `favicon.ico` 与 16/32/48/180/192/512 的 PNG；PWA manifest、apple-touch-icon、bookmark 同步指向新图标。
- **新文章已发布**：《WordPress 被入侵之后：我把博客搬到了 Astro 静态站》，地址 `/p/wordpress-incident-and-astro-migration/`，脱敏技术版（无攻击者 IP/账号/内部路径/凭据）。
- 本地可复现：`pnpm check` 0 错误，`pnpm build` 生成 37 页，`pnpm test` 26/26 通过，`pnpm docs:check` 通过；服务器 `127.0.0.1:8089` 关键地址全部 200，含自定义 404。
- 旧 Hexo 文章 URL（`/posts/<id>.html`）、分类/标签旧大小写地址、`/link/`、`/comments/`、年/月归档地址、`/atom.xml` 订阅均已保留或重定向。
- 模板自带的占位页（`/equipment/`、`/music/`、`/brevity/`、`/recentcomments/`、`/series/`）已按旧站形态移除，模板示例数据已清空。
- 封面/主题色维持第七轮定稿：本地中性深蓝渐变封面、关闭封面取色；浅色强调色 #425aef，深色强调色 #8ea6ff。
- Bangumi 已绑定用户 `934887`，追番在部署时自动更新；评论、音乐按用户之前的要求暂缓。

本文件其余部分保留历史记录（初期的“主题未选定、尚未实现”等描述是当时的边界，现已过时）。

## 已确定的目标

- 采用 Astro，并优先选择接近现有 Hexo 安知鱼风格的主题，再按需适配功能。
- 用户优先考虑外观、访问速度和维护成本；Markdown/Git 写作或网页后台两种方式均可。
- 现站参考：GitHub Pages 旧站（Hexo 安知鱼），2026-11-09 经用户授权已由 Astro 新站替换；WordPress 站点与 DNS 未动。
- 待迁移的 WordPress 博客：`blog.penguinway.space`。

Astro 是已接受的技术方向；主题已选 **Astro Solitude**（见“实施进展”）。部署方式是 txcloud 主站 + GitHub Pages 镜像，自定义域名 `blog.penguinway.space` 已启用；后台编辑方式仍未确认。不要重新把技术选型讨论当作从零开始。

## 前序只读调研所得

下列内容由此前会话的只读调研交接而来，本次未重新联网核验或测量。

### 现有 Hexo 站点

- 主题为安知鱼 AnZhiYu，基于 Butterfly。
- 主题仓库：https://github.com/anzhiyu-c/hexo-theme-anzhiyu
- 公开发布仓库：`penguinway/penguinway.github.io`，此前读取分支为 `master`。
- 此前看到的根目录是生成后的静态文件，尚未找到 Hexo 源工程、主题配置或 Markdown 源文。不能假定发布仓库中有可直接导入的源内容。
- 页面包含推荐文章、分类导航、文章卡片、个人资料侧栏，以及分类、标签、归档、友人帐、留言板和追番入口。
- 旧文章 URL 示例：`/posts/15605.html`。未来迁移需检查是否保持，或准备映射与重定向。
- 浏览器视觉验收已在第四轮补齐（见“实施进展”），性能测量仍未做。

### 功能线索

| 功能                                     | 前序观察                        | 后续处理方向                      |
| ---------------------------------------- | ------------------------------- | --------------------------------- |
| 推荐区、卡片、侧栏                       | 已在生成页中观察到              | 优先用候选主题原生能力还原体验    |
| 本地搜索                                 | 索引为 `/search.xml`            | 选择 Astro 适用实现，保留搜索体验 |
| 图片查看                                 | 有 Fancybox 6.1.6 标记          | 核实候选主题能力与按需加载方式    |
| 追番                                     | 有 `hexo-bilibili-bangumi` 标记 | 数据获取及生成逻辑需另行适配      |
| 音乐/播放器                              | 有菜单或播放器标记              | 尚未确认实际启用状态及配置        |
| 评论                                     | 首页 `twikooEnvId` 为空         | 尚不能确认已接入有效评论服务      |
| 右键菜单、中控台、二维码、繁简切换、统计 | 有相关脚本或界面线索            | 按用户实际使用情况决定是否保留    |
| PJAX、instant.page、懒加载               | 有相关脚本线索                  | 根据 Astro 路由与主题能力重新评估 |

不少资源来自第三方 CDN。框架切换不会自动改善图片、字体、第三方脚本和访问线路造成的性能问题；实施后应针对实际页面验证。

这些是功能线索，不代表用户要求全部实现。先确定真正想保留的体验。

## 主题候选

此前优先提出 **Astro Solitude**，因为其文档列出的卡片、侧栏、推荐区等能力与现站偏好更接近。

- 介绍：https://astro.build/themes/details/solitude/
- 仓库：https://github.com/everfu/astro-solitude
- 演示：https://astro-solitude.efu.me/
- 前序演示抓取失败，未完成视觉或交互验证；项目成熟度、维护状态、版本兼容性和授权需要在实施前复核。

此前也讨论过 Fuwari、Pure、AstroPaper 和 Shirone，但并未选定其中任何一个。若检查到旧资料推荐 Mizuki，应重新核实；前序调研记录其于 2026-11-02 归档，并指向 Shirone。

优先复用接近的 Astro 主题，避免一开始完整移植安知鱼。若复制原主题代码或资源，需要核实其 GPL-3.0 及第三方资源授权要求。

## 后续实施建议（尚未执行）

用户明确开始后，再按实际指令推进：

1. 核实现站外观、实际使用的功能，以及候选 Astro 主题的维护情况、许可与兼容性。
2. 查明 Hexo 源文位置；单独规划 WordPress 的文章和媒体导出、清洗与审核。
3. 先在独立预览中验证首页、一篇文章和追番页，重点核对卡片、侧栏、搜索、图片查看及移动端体验。
4. 验收后扩展其余功能，核对旧 URL、站内链接、媒体、元数据、RSS 与站点地图。
5. 按明确授权执行依赖安装、发布和域名切换；保留原站作为切换前的参考。

上列步骤只是上下文中的建议，不构成本次实施授权。不要自动执行。

## WordPress 安全背景

原 WordPress 已确认失陷。前序已完成只读调查、清理建议与有限攻击源核验，本博客项目不继续扩展该调查。

迁移只带走审核过的文章、媒体和必要元数据。不能按数据库记录总数推断文章数，也不能仅按作者 ID 决定哪些内容可信；前序报告记录原站长账号曾被删除。不要把旧数据库、插件、主题运行代码或带登录态资料直接复制到新站。

安全调查材料原保留在旧机器的 `/home/penguin/Projects/Code/SSH运维`；迁到当前机器（`/home/sakura`）后未找到该目录，需要时向用户索取位置。本项目不复制：

- `wordpress-incident-preliminary-report.md`
- `txcloud-incident-investigation-report-20261109.md`
- `txcloud-incident-cleanup-recommendations-20261109.md`
- `txcloud-incident-20261109/`

如未来需要导出内容，先按任务需要阅读相应报告与导出资料，不把原始证据加入公开博客工程。

## 实施进展（2026-11-09，迁到 `/home/sakura/yt/Blog` 后）

用户指令：“我搬到这台机器上，路径已经失效，你确认后开始实现吧”。

### 已完成

- 修正 `AGENTS.md` 中失效的旧机器路径；`RTK.md` 与 SSH运维 目录在本机不存在。
- 主题选定 **Astro Solitude**，核实结果：上游 `everfu/astro-solitude` 提交 `ed48c89b01bc03d24473c3dffb8928fc478b1597`（2026-10-06），Apache-2.0，Astro 7.3.2，Node ≥22.12，pnpm 11.24。项目仅约 13 星、单人维护，属风险项；它是模板，代码已全部复制进本仓库，后续由本仓库维护。
- 模板文件按上游原路径放入项目根目录（未带 `.git`、`.github`、上游 README 与社区文件；保留 `LICENSE`、`NOTICE`）。上游使用文档也在 `docs/` 下，与本交接文件并存。
- `src/site.config.ts` 已改为现站信息：标题、作者、头像、菜单、推荐、侧栏卡片、页脚、ICP 备案。音乐胶囊（模板示例歌单）、短文页已关闭；评论未接入。
- 9 篇文章从现站生成页 HTML 还原为 Markdown，放在 `src/content/posts/post-<id>.md`，用 `url: /posts/<id>.html` 保留旧地址。Hexo 默认的 Hello World（`/posts/16107.html`）未迁移。分类、标签来自现站页面。主题示例文章已删除。
- 友链页保留新路由 `/links/`，旧 `/link/` 通过 `aliases` 重定向；留言板 `/message/`，旧 `/comments/` 重定向。`about.json`、`links.json` 已替换为站长信息的最小内容。

转换脚本没有放进仓库，在会话临时目录；如需重跑，从现站重新抓取并转换。

### 第二轮（用户：“允许安装最新版pnpm，同意到本地，创建git仓库吧”）

- 全局安装 pnpm 12.18.0（当时最新），`package.json` 的 `packageManager` 改为 `pnpm@12.18.0`；`pnpm install --frozen-lockfile` 成功。
- 已 `git init -b main`，**未提交**。
- `pnpm check` 0 错误，`pnpm build` 生成 36 页；`/posts/<id>.html` 由主题的 `scripts/output-layout.ts` 输出为平铺文件，旧地址可直接访问。
- 新主题的分类、标签路径为小写（`/tags/ctf/`、`/categories/misc/`），已在 `astro.config.mjs` 的 `redirects` 中为旧的大小写路径加重定向。
- `about.json` 保留主题全部区块结构，未填写的区块设 `enabled: false`（`src/lib/about-types.ts` 依赖完整结构推导类型）。
- 本地预览：`pnpm preview --port 4321 --host 127.0.0.1`，以守护进程运行，`pnpm astro preview stop` 停止。

### 媒体核查结果（2026-11-09）

- `image.penguinway.space` 上文章所用的 25 张图全部 404，只有头像还在；头像已校验为 PNG，保存为 `public/img/avatar.png`。
- `www.penguinway.space` 对所有路径都返回同一个“登录入口站”HTML 页（要求输入用户名密码），原 WordPress 附件已无法获取。下载的响应只留在会话临时目录，未进入仓库。
- Internet Archive 没有这些文章图片的存档。
- 处理：52 处失效图片改为“_（图片已失效）_”，原地址保留在 HTML 注释中，构建产物里不会发出请求；两个 zip 附件链接已删除，正文注明失效，避免把读者引到登录页。
- 若用户能找到原图（旧电脑、兰空图床存储备份、WordPress uploads 备份），审核后放入 `public/` 并按注释里的地址替换。来自失陷服务器的备份须先检查文件类型和内容。

### 第三轮：追番页（用户：“先保留bangumis页面，你看看hexo的banggumi插件，评论，音乐先不管”）

- 旧站用 `hexo-bilibili-bangumi`（HCLonely，Apache-2.0，仍维护）的 bgm v0 数据源：构建前 `hexo bangumi -u` 拉取 bgm.tv 公开收藏写入 JSON，再由 Hexo 生成器渲染。它依赖 hexo-fs、hexo-log 和 Hexo 生成器，不能直接在 Astro 中使用，已自行移植（未复制插件代码）：
  - `scripts/update-bangumi.ts` + `pnpm bangumi:update <bgm用户名或ID>`：调用 `api.bgm.tv/v0/users/<id>/collections`，写入 `src/data/bangumis.json`（想看/在看/已看）。也可用环境变量 `BANGUMI_USER`。
  - `src/components/pages/Bangumi.astro`：纯 CSS 切换标签，无客户端脚本；封面外链 `lain.bgm.tv`，懒加载、不带 referrer。
  - `src/content/pages/bangumis.md`（`type: bangumi`，地址 `/bangumis/`，与旧站一致），`src/layouts/EntryPage.astro` 新增 `bangumi` 分支（改动主题文件，日后合并上游时注意）。菜单“文章”下新增“追番”。
- 当前数据从旧站页面提取（想看 17、在看 9、已看 21），`userId` 为空。bgm 用户 `penguinway` 不存在，`penguin` 不是站长（收藏为 0）。**需要用户提供 Bangumi 用户名或 ID** 才能自动更新。
- 本机 Firefox 无头截图失败（SWGL framebuffer 错误）；第四轮已改用系统 Chrome 完成追番页视觉与标签验收。
- 评论、音乐：用户要求暂不处理。

### 第四轮：接手剩余工作（2026-11-09，本机 `/home/penguin/Projects/Project/Blog`）

用户指令：“接手剩余工作”。

- **环境**：本机 `/home` 只读（工作目录被单独挂载为可写）。依赖已安装（`node_modules/`）；pnpm 12.18.0 由 corepack 提供，缓存、HOME、TMPDIR 均指向仓库内 `.toolchain/`（已写入 `.git/info/exclude`，不进仓库）。手工跑命令时需要：
  `export HOME=$PWD/.toolchain/home COREPACK_HOME=$PWD/.toolchain/corepack XDG_CACHE_HOME=$PWD/.toolchain/cache TMPDIR=$PWD/.toolchain/tmp`，再 `corepack pnpm <script>`。
  浏览器验收用系统 `/usr/bin/google-chrome-stable` + `@playwright/test`（本机未装 Playwright 自带浏览器）。
- **验证结果**：`pnpm check` 0 错误；`pnpm build` 生成 32 页；`pnpm test` 25/25 通过。
- **旧地址补全**：新增 `/atom.xml`（Atom 1.0，9 条 entry，对应旧站 Hexo 订阅地址；本站默认订阅仍是 `/index.xml`）；`astro.config.mjs` 增加旧年/月归档重定向（`/archives/2023|2024|2025/`、`/archives/2023/05|09/`、`/archives/2024/05/`、`/archives/2025/03|04/` → `/archives/`）。已核对 `/link/`、`/comments/`、分类与标签旧大小写地址的静态重定向页正常。
- **模板残留清理**：`src/lib/routes.ts` 改为只生成启用中的主题页面；移除 `/equipment/`、`/music/`、`/brevity/`、`/recentcomments/` 占位页，空系列不再生成 `/series/`；`src/data/kit.json`、`brevity.json` 的模板示例数据清空；`Equipment.astro` 增加显式类型以适配空数据。
- **测试适配**：`tests/content.test.ts` 的字数断言改为不依赖界面语言；`tests/output.test.ts` 改为本站验收（逐篇校验 9 个旧文章地址、`search.xml`、`/atom.xml`、站点文件、旧地址重定向、模板示例页不残留）。
- **视觉验收**：用 Chrome 无头 + Playwright 检查首页、文章页、追番页、友链、留言板、关于、归档、404 的桌面/移动端与明暗主题；无控制台错误、无本地资源 404。追番页三标签数据正确（想看 17 / 在看 9 / 已看 21），封面外链 `lain.bgm.tv` 正常加载。修复侧栏作者卡简介文字溢出（`aside-console.css` 单行省略）。
- **中文统计口径**：`site.config.ts` 增加 `hasCJKLanguage: true`，站内“总字数”由错误的 441 修正为 3183（旧站显示 2.8k），阅读时间同步按中文口径计算；`tests/content.test.ts` 相应改为显式传参。
- **独立 QA 验收**（子代理 `qa-verifier`，报告在 `.toolchain/qa-report/REPORT.md` + 28 张截图，未进仓库）：18 个必需页面 × 4 宽度 × 明暗共 144 次加载全部通过（无 pageerror、无 console error、无本地 404、无横向溢出）；6 组旧地址重定向正确；`/atom.xml` 9 条、RSS/search 各 9 条、sitemap 29 条，XML 合法；追番 47/47 封面加载；搜索、主题持久化、移动端菜单通过；31 个站内链接 0 死链；模板示例文字 0 命中；抽 2 篇文章与旧站标题一致。结论：0 FAIL，可交付。
- **QA 提示的非缺陷项**：每页仍从 `cdn.jsdelivr.net` 加载 4 个第三方资源（本次全 200，离线/被墙时会降级，建议日后自托管）；追番封面依赖 `lain.bgm.tv` 外链；友链页只有 1 条友链导致主题头像墙重复平铺（与旧站数据一致）；留言板无表单（评论未接入）；旧站 `/posts/16107.html`（Hello World）新站 404；`public/img/demo/` 等模板示例资源仍随构建发布但无引用。
- **未处理**：`pnpm test:e2e` 是模板自带用例，依赖已删除的模板示例内容（`/p/components/`、`/p/writing/` 等），当前不适用于本站，未运行也未改造；封面与首页主题色仍来自主题默认封面图（灰调）。
- 预览命令：`corepack pnpm preview --host 127.0.0.1 --port 4321`（本轮已在 4321 后台运行）。

### 第五轮：部署到 GitHub Pages（2026-11-09，用户授权）

用户指令：“同意，部署吧，在 github page penguinway.github.io，配置好 github action”。

- 仓库：`penguinway/penguinway.github.io`（GitHub Pages 用户站仓库）。Astro 源码提交到 `main` 分支，提交 `迁移旧站内容并启用 GitHub Pages 自动部署`（无 AI 署名）；默认分支已改为 `main`。旧 Hexo 生成站仍保留在 `master` 分支，仅作历史留档，不再参与部署。
- 工作流 [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml)：push 到 `main` 或手动触发；Node 24 + pnpm 12.18.0；`pnpm install --frozen-lockfile` → `pnpm check` → `pnpm build` → `pnpm test` → `actions/upload-pages-artifact` → `actions/deploy-pages`。Actions 版本按上游当前 major：checkout v7、setup-node v7、pnpm/action-setup v6、configure-pages v6、upload-pages-artifact v5、deploy-pages v5。
- Pages 设置：Build and deployment 来源由 legacy（master 分支根目录）切换为 **GitHub Actions**（`build_type=workflow`）；`github-pages` 环境的部署分支策略补上 `main`（保留 `master`）；custom 404 与 HTTPS 强制保持开启。
- 首次部署失败过一次：`Branch "main" is not allowed to deploy to github-pages due to environment protection rules`。原因是环境策略只放行 `master`；添加 `main` 后重跑成功（run `42609082740`）。
- 线上验证（2026-11-09，curl 绕过缓存）：首页、9 篇文章、关于、归档、分类、标签、追番、友链、留言板、404 全部 200；`/atom.xml` 9 条 entry、`/index.xml` 9 条 item、`/search.xml`、`/sitemap.xml`、`/robots.txt`、`/links.json`、`/manifest.json` 正常；14 个旧地址重定向（`/link/`、`/comments/`、分类/标签旧大小写、年/月归档）全部指向正确目标；不存在的路径返回 404 + 自定义 404 页；`_astro` 下的 CSS/JS 200。
- 后续发布流程：修改源码 → 提交到 `main` → push → Actions 自动构建并部署（提交/推送仍需用户授权）。无需再登录服务器或手动上传。
- 2026-11-09 时 `master` 分支旧站生成文件的最后部署记录为 2026-07-16；旧站内容仍可从 git 历史找回。

### 第六轮：封面、主题色与追番数据（2026-11-09，用户确认）

用户回复：“封面与主题色 B，域名就继续吧，bangumi ID 934887”。

- **封面**：新增 `public/img/cover-default.avif`（1920×1080，本地生成的深蓝中性渐变图，不使用模板素材），`theme.post.default.cover` 与 `theme.page.default.cover` 指向它；模板的 SOLITUDE 封面图不再出现在页面里。
- **主题色**：`theme_color.light = #425aef`、`theme_color.dark = #8ea6ff`（浅蓝保证深色背景上正文链接/目录的可读性）。`theme.post.covercolor.enable = false` 关闭封面取色；深色主题下文章页头部和侧栏作者卡在 `src/styles/custom.css` 中覆盖为深蓝底，保证白色文字对比度。副作用：不再加载 jsdelivr 的 color-thief，第三方 CDN 资源从 4 个降到 3 个（fancybox CSS/JS + vanilla-lazyload）。
- **域名**：确认继续使用 `https://penguinway.github.io`，不绑定自定义域名，`site` 配置保持现状。
- **追番**：`pnpm bangumi:update 934887` 成功，`src/data/bangumis.json` 记录 `userId: "934887"` 与 `updatedAt`（想看 17 / 在看 9 / 已看 21，与旧站一致）；第七轮已改为在部署时自动执行该命令。
- **验证**：本地 `pnpm check` / `build` / `test`（25/25）/ `docs:check` 通过；明暗两套主题下首页、文章页、追番、友链、关于截图检查通过，无控制台错误。已提交 `aa1092c` 并推送 `main`，GitHub Actions 部署成功；线上确认使用新封面、`--solitude-theme-light:#425aef`、`--solitude-theme-dark:#8ea6ff`，`/img/cover-default.avif` 返回 200。
- 顺带修复：提交时发现本机 `HOME` 被工具链覆盖会导致 git 身份读取失败，提交/推送命令需使用原始 `HOME`。

### 第七轮：追番改为部署时自动更新（2026-11-09，用户要求）

用户指令：“可不可以把追番改为自动在部署时更新获取”。

- `.github/workflows/deploy.yml` 在“安装依赖”之后、“类型检查/构建”之前新增 `更新追番数据` 步骤：`pnpm bangumi:update 934887`；设置 `continue-on-error: true` 与 5 分钟超时，Bangumi 接口失败时沿用仓库中已提交的 `src/data/bangumis.json`，不阻断部署。
- 工作流新增定时触发 `schedule: cron '0 20 * * *'`（UTC 20:00 = 每天 04:00 Asia/Shanghai）：即使不推送代码，也会每天重新构建部署并刷新追番；保留原有 `push` 与 `workflow_dispatch`。
- 本地演练：`pnpm bangumi:update 934887` 成功（想看 17 / 在看 9 / 已看 21，`updatedAt` 与收藏数刷新）；工作流 YAML 解析通过。
- 换 Bangumi 账号时改工作流里的 `934887`，并可在本地跑一次脚本更新仓库里的兜底数据。
- 验证：提交推送后 Actions 运行成功，构建日志包含 `wantWatch/watching/watched` 输出；线上站点仍为 200。

### 第八轮：换 icon、部署 txcloud、发布排查文章（2026-11-09，用户指令）

用户指令：“换一下站点的icon，然后部署到txcloud上，blog.penguinway.space，反代交给我，取代WordPress，把这次排查WordPress和部署新博客的事写成新的博客发布”。

**站点 icon**

- 用户选择沿用旧 WordPress 站的 site icon（940×940 粉发插画，原图在 `image.penguinway.space`，与旧站浏览器标签一致）。
- 新增 `public/favicon.ico`（16/32/48 多尺寸）与 `public/img/site-icon/icon-{16,32,48,180,192,512}.png`；`src/layouts/Base.astro` 改为输出完整 favicon 集（此前浏览器标签会落到主题自带的纸飞机图标），并移除 `mask-icon` 与 PWA 段里重复的 icon 链接。
- `src/site.config.ts` 的 `pwa` 配置改为新图标；两个 manifest 路由补充 192/512 图标。

**域名与部署**

- `site` 改为 `https://blog.penguinway.space`；`src/data/links.json` 里的本站友链同步。
- 服务器 txcloud（82.157.254.160）新建 `/data/disk/blog-static/{dist,conf}`；容器 `blog-static`（`nginx:stable-alpine`，`--restart unless-stopped`，`--security-opt no-new-privileges`，`127.0.0.1:8089->80`，产物与配置均只读挂载，日志 10m×3 轮转）。
- 仓库新增 `deploy/nginx-blog-static.conf` 与 `deploy/README.md`（首次部署、更新、验证、回滚、停 WordPress 的命令）。
- **反代未改**（用户明确“反代交给我”）：`/data/disk/1panel/www/conf.d/blog.penguinway.space.conf` 仍 `proxy_pass http://127.0.0.1:8088`。用户把上游改成 `http://127.0.0.1:8089` 即切换到新站；`*.penguinway.space` 通配证书有效期至 2026-12-09，无需调整。
- 切换后停止旧 WordPress：`sudo docker stop 1Panel-wordpress-ok95 && sudo docker update --restart=no 1Panel-wordpress-ok95`（用户已确认保留数据与镜像；该容器当前 restart 策略是 `always`，只 stop 会在 Docker 重启后恢复，所以加 `update --restart=no`）。
- 公网仍由旧 WordPress 提供服务（响应头 `x-powered-by: PHP`），直到用户切反代。

**新文章**

- `src/content/posts/post-wordpress-incident.md`：《WordPress 被入侵之后：我把博客搬到了 Astro 静态站》，地址 `/p/wordpress-incident-and-astro-migration/`，日期 2026-11-09 22:30，分类“服务器折腾那些事”，标签 WordPress / 安全 / Astro / 部署。
- 披露口径为脱敏技术版：写明 CVE-2026-63030 / CVE-2026-60137（wp2shell）、时间线与攻击手法类别、排查方法（访问日志、binlog、官方校验和、镜像与 webroot 版本错位）和部署架构；不含攻击者 IP/UA、后门账号名、内部路径、数据库名、凭据与载荷原文。

**验证**

- 本地：`pnpm check` 0 错误；`pnpm build` 37 页；`pnpm test` 26/26；`pnpm docs:check` 通过。新增断言覆盖 favicon 集、canonical 域名与新文章输出。
- 服务器：`127.0.0.1:8089` 首页、新文章、9 个旧文章地址、分类/标签、归档、`/atom.xml`、`/index.xml`、`/search.xml`、`/sitemap.xml`、`/links.json`、`/manifest.json`、`/favicon.ico` 与新图标均 200；不存在路径 404 + 自定义 404 页；经 DSH SSH 隧道从本机复验通过。
- 已提交并推送 `main`，GitHub Pages 镜像同步构建部署。

**遗留**

- 反代切换与停 WordPress 容器由用户执行（见上）。
- 系统 OpenSSH 客户端不可用（`/etc/ssh/ssh_config.d` 权限问题，`ssh`/`rsync` 报 “Bad owner or permissions”），本轮用 DSH 的 `ssh_upload`/`ssh_exec` 完成上传与执行；后续部署同样需要可用 SSH 通道。

### 待用户决定

1. **原图来源**：见“媒体核查结果”；若有旧图床/WordPress 备份，需用户提供位置（52 处图片仍是“图片已失效”占位）。
2. **测试与占位页**：模板 E2E 用例是否裁剪/改造成本站冒烟用例，或暂时保留不运行；是否还有想保留的模板功能页（装备页等）。
3. **旧站 Hello World**：`/posts/16107.html` 是 Hexo 默认脚手架文章，未迁移；是否要加一条重定向（如 → `/archives/`）以免旧链接 404。
4. **第三方 CDN**：仍有 3 个资源走 `cdn.jsdelivr.net`（fancybox CSS/JS、vanilla-lazyload），国内访问可能变慢或失败；是否自托管到 `public/`。
5. **评论、音乐**：此前用户要求暂缓，需要时再接入。

## 给下一位 Agent 的接续提示

主站部署在 txcloud（`/data/disk/blog-static` + 容器 `blog-static`，上游 `http://127.0.0.1:8089`），GitHub Pages 是镜像；源码在仓库 `penguinway/penguinway.github.io` 的 `main` 分支。部署、更新、回滚步骤见 `deploy/README.md`。本地可构建、测试和预览：`corepack pnpm check && corepack pnpm build && corepack pnpm test`（在本机需按第四轮的环境变量说明设置 HOME 等；`pnpm test:e2e` 暂不适用）。

**本机环境注意**：系统 OpenSSH 客户端因 `/etc/ssh/ssh_config.d` 权限问题不可用，`ssh`/`rsync` 会报 “Bad owner or permissions”；本轮部署改用 DSH 自带的 `ssh_upload`/`ssh_exec`。CC Safety Net 还拦截了读取 `~/.ssh/config`、`~/.ssh` 目录和服务器证书 `.pem` 的只读检查，不要尝试绕过。

按用户指令处理上面的待决定事项；后续新的提交、推送、部署仍需用户另行授权。反代仍由用户维护，不要擅自修改共享 OpenResty 配置；旧 WordPress 容器在反代切换确认后停止，数据与取证材料保留，不得把旧漏洞环境恢复公网。

# txcloud 部署说明

生产地址：<https://blog.penguinway.space>（服务器 `txcloud`，82.157.254.160）。

## 架构

- 本地构建 Astro 静态站点，产物在 `dist/`（约 12 MB），不含 PHP、数据库或运行时。
- 构建产物上传到服务器 `/data/disk/blog-static/dist/`。
- 容器 `blog-static`（镜像 `nginx:stable-alpine`）只读挂载该目录，监听容器内 80，宿主只发布 `127.0.0.1:8089`。
- 服务器现有的 1Panel OpenResty 负责 `blog.penguinway.space` 的 HTTPS 和反向代理，上游为 `http://127.0.0.1:8089`。反代配置由站长维护，仓库只提供上游约定。
- 容器内 nginx 配置模板见 [`nginx-blog-static.conf`](nginx-blog-static.conf)，部署到 `/data/disk/blog-static/conf/default.conf`。

## 首次部署（2026-11-09 已执行）

```sh
# 本地
pnpm install --frozen-lockfile
pnpm check && pnpm build && pnpm test
tar -C dist -czf blog-dist.tar.gz .

# 上传 blog-dist.tar.gz 与 nginx-blog-static.conf 后，在服务器执行
sudo mkdir -p /data/disk/blog-static/dist /data/disk/blog-static/conf
sudo tar -xzf /tmp/blog-dist.tar.gz -C /data/disk/blog-static/dist
sudo install -o root -g root -m 644 /tmp/blog-static.conf /data/disk/blog-static/conf/default.conf
sudo docker run -d --name blog-static --restart unless-stopped \
  --security-opt no-new-privileges \
  -p 127.0.0.1:8089:80 \
  -v /data/disk/blog-static/dist:/usr/share/nginx/html:ro \
  -v /data/disk/blog-static/conf/default.conf:/etc/nginx/conf.d/default.conf:ro \
  --log-opt max-size=10m --log-opt max-file=3 \
  nginx:stable-alpine
```

## 更新发布

1. 本地 `pnpm build`，把 `dist/` 打包后上传到服务器 `/tmp/`。
2. 覆盖解压到站点目录（同名文件会被替换）：
   ```sh
   sudo tar -xzf /tmp/blog-dist.tar.gz -C /data/disk/blog-static/dist
   sudo chmod -R a+rX /data/disk/blog-static/dist
   ```
   当前发布流程只做覆盖和新增；如果删除了文章或页面，旧文件不会自动消失，需要在 1Panel 文件管理里手工删除对应路径。
3. 静态文件即改即生效，无需重启容器；改过 nginx 配置才需要 `sudo docker exec blog-static nginx -t && sudo docker exec blog-static nginx -s reload`。

## 验证

- 服务器本机：`curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:8089/`，以及文章页、`/atom.xml`、`/favicon.ico`；不存在的路径应返回 404 和自定义 404 页。
- 公网：`curl -I https://blog.penguinway.space/` 应为 200，响应头不应再出现 `x-powered-by: PHP`。
- 反代切换完成后停止旧 WordPress 容器，保留数据与镜像：
  `sudo docker stop 1Panel-wordpress-ok95 && sudo docker update --restart=no 1Panel-wordpress-ok95`。
- 需要回滚到 GitHub Pages 镜像时，直接访问 <https://penguinway.github.io/>；服务器侧回滚只需把反代上游改回旧端口（旧 WordPress 容器需先 `docker start`）。

## 注意

- 反向代理与证书由 1Panel OpenResty 管理；修改前先备份 `blog.penguinway.space.conf`，改完做配置语法检查再 reload，避免影响同机其他站点。
- 站点目录对容器只读，容器无状态；删除容器只影响发布，不影响构建源码。

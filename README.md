# SecLog · 网络安全个人博客

一个**纯静态、零构建**的网络安全个人博客。文章以 Markdown 存于仓库，前端在浏览器里渲染，无后端、无数据库、无构建步骤。

> 技术栈：HTML / CSS / 原生 JS + CDN 库（[marked](https://marked.js.org/) 渲染 Markdown、[DOMPurify](https://github.com/cure53/DOMPurify) 防 XSS、[highlight.js](https://highlightjs.org/) 代码高亮）。哈希路由（hash routing），任意静态托管均可直接打开。

## 特性

- 📝 文章即 Markdown 文件（`content/posts/*.md`），加文件即发文章
- 🏷️ 标签云、标签筛选、首页搜索（标题/标签）
- 🌓 明暗主题切换（记忆偏好）
- 🛡️ 渲染层经 DOMPurify 净化，防 XSS
- 📱 响应式布局，移动端友好
- ⚡ 零构建、零依赖，推送到仓库即上线

## 目录结构

```
seclog/
├── index.html               # 单页外壳（哈希路由）
├── build.js                 # 零依赖：扫描 posts 生成 manifest.json
├── smoke-test.js            # 开发用 jsdom 冒烟测试
├── .nojekyll                # 防止 GitHub 当 Jekyll 处理
├── .github/workflows/       # GitHub Pages 自动部署
├── assets/
│   ├── css/style.css        # 主题样式（明/暗）
│   └── js/
│       ├── config.js        # 站点配置（标题/作者/社交）
│       ├── markdown.js      # Markdown 渲染 + 净化 + 高亮
│       ├── store.js         # 加载 manifest/文章/about
│       ├── ui.js            # DOM 辅助函数
│       ├── router.js        # 哈希路由
│       ├── app.js           # 启动与接线
│       └── pages/           # 各页面：home/post/tag/about/notfound
└── content/
    ├── about.md             # 关于页内容
    └── posts/
        ├── *.md             # 文章（带 YAML frontmatter）
        └── manifest.json    # 由 build.js 生成（勿手改）
```

## 本地预览

静态站点需通过 HTTP 访问（不能用 `file://`，否则 `fetch` 被浏览器拦截）：

```bash
# 任选其一，在项目根目录启动静态服务器
python3 -m http.server 8000
# 或
npx serve .
```

然后打开 `http://localhost:8000`。

> 首次运行需先生成清单：`node build.js`（生成 `content/posts/manifest.json`）。

## 写文章

1. 在 `content/posts/` 新建一个 `.md` 文件，文件名即 slug（建议 `编号-短横标题.md`）：
   ```markdown
   ---
   id: 1006
   title: 你的文章标题
   date: 2026-10-21
   tags: [Web安全, 笔记]
   status: published
   author: K4
   ---

   正文用 Markdown 书写，支持代码块、表格、引用等。
   ```
2. 运行 `node build.js` 重新生成清单。
3. 提交并推送：`git add -A && git commit -m "add post" && git push`。
4. 部署平台拉取后自动生效（见下）。

> `tags` 支持行内数组 `tags: [A, B]` 或 YAML 列表写法；`status: hidden` 可隐藏某篇但不删文件；`excerpt` 不写则自动截取正文首段。

## 部署

### GitHub Pages（推荐，自动）

仓库已含 `.github/workflows/pages.yml`：每次 push `master` 自动部署。

1. 仓库 **Settings → Pages → Build and deployment → Source** 选 **GitHub Actions**。
2. 推送后到 **Actions** 标签页查看部署，完成后获得 `https://<用户名>.github.io/seclog/`。

### Gitee Pages / 其他静态托管

因仓库根即站点根、使用哈希路由（无需服务端 404 回退），可直接部署整个仓库到任何静态托管（Gitee Pages、Cloudflare Pages、Netlify、对象存储 + CDN 等）。`.nojekyll` 已就位，避免被当作 Jekyll 处理。

## 自测

```bash
node build.js        # 生成清单
node smoke-test.js   # jsdom 冒烟测试（需本地安装 jsdom）
```

## 许可

MIT —— 见 [LICENSE](LICENSE)。

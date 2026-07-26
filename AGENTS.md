# AGENTS.md — 项目级记忆 / 给 AI 助手的项目上下文

> 本文件供 AI 编码助手（如 Codex、Cursor、Copilot 等）读取，以理解项目的架构、约定和工作流。
> 修改时请同步保持准确。

---

## 项目概述

**Fujiko 的个人小站** — 基于静态 Markdown 构建的个人知识库网站，部署于 GitHub Pages。

- **定位**：极低维护成本，「包罗万象」的个人站点
- **内容范围**：学习笔记、小说创作、AIRP 体验等可无限扩展的分区
- **构建方式**：所有内容以 Markdown 书写，`build.mjs` 一次构建生成全站静态 HTML

---

## 技术栈

| 层面 | 技术 |
|------|------|
| 构建脚本 | Node.js（`build.mjs`），纯原生 API，无外部依赖 |
| 内容格式 | Markdown（含 YAML front matter：`title`/`date`/`category`） |
| 模板 | 手写 HTML 模板（`templates/page.html`） |
| 样式 | 纯 CSS，无框架（`style.css`） |
| 部署 | GitHub Pages |

---

## 目录结构

```
/
├── build.mjs           # 构建脚本：content/ + site/ → 渲染 → 输出完整站点到 dist/
├── content/            # Markdown 源文件（写作只碰这里）
│   ├── notes/          # 学习笔记分区（database/ linux/ python/）
│   ├── novels/         # 小说创作分区
│   └── airp/           # AIRP 体验分区
├── site/               # 站点骨架
│   ├── index.html      # 首页（手动维护）
│   ├── templates/
│   │   └── page.html   # 文章页 HTML 模板
│   └── assets/         # style.css、avatar.jpeg 等静态资源
├── dist/               # 构建产物 = 完整站点（不入 git，CI 生成并部署）
├── .github/workflows/  # deploy.yml：push 后自动构建部署 Pages
├── README.md · AGENTS.md
└── .gitignore · .gitattributes
```

---

## 构建命令

```bash
# 构建全站（读取 content/ → 生成 dist/）
node build.mjs
```

构建脚本 `build.mjs` 会：
1. 遍历 `content/` 下所有 Markdown 文件
2. 解析 YAML front matter（`title`、`date`、`category`）
3. 将 Markdown 正文通过自制 `mdToHtml()` 转为 HTML
4. 注入 `templates/page.html` 模板
5. 输出到 `dist/` 对应路径

**部署方式**：push 到 main 后 GitHub Actions（`.github/workflows/deploy.yml`）自动构建 dist/ 并部署 Pages。`dist/` 不入 git；本地运行 `node build.mjs` 仅用于预览（每次全量重建，先清空再生成）。线上 URL 与 dist/ 结构一致（无 /dist/ 前缀），如 `/notes/linux/vim.html`。

---

## 设计规范

### 风格定位

**极简日系（Minimal Japanese）**

| 维度 | 规范 |
|------|------|
| 字体 | `'Noto Serif SC', 'Georgia', 'SimSun', serif`（衬线体，日系感） |
| 背景色 | `#fafaf8`（暖白/米白） |
| 文字色 | `#3a3a3a`（深灰，柔和） |
| 辅助色 | `#eee`（分割线）、`#ec4899`（粉红强调色） |
| 卡片/面板 | 白色半透明 + 毛玻璃模糊（backdrop-filter） |
| 布局 | 居中窄栏，最大宽度 600-720px |
| 整体氛围 | 安静、留白、干净、阅读友好 |

### 交互规范

| 元素 | 悬停效果 |
|------|---------|
| 首页导航链接 | 右移跳动（padding-left:20px） |
| 抽屉导航链接 | 底色变浅 + 右移跳动 |
| 文章列表 | 文字变粉红色（#ec4899）+ 右移跳动 |
| 分类折叠标题 | 文字变粉红 + 右移跳动 |
| 头像 | 放大（scale:1.12） |

### 动效

- **花瓣粒子** — 所有页面包含浮动花瓣粒子（粉白色系），由 JS 生成 + CSS animation 驱动

---

## Git 工作流

- 每次完成一个基础功能后，**及时 commit**
- 默认主分支
- 构建产物（`dist/`）也纳入版本控制

---

## 给 AI 助手的提示

1. **线上部署已由 GitHub Actions 自动完成**，只需提交 content/ 修改并推送；本地 `node build.mjs` 仅用于预览
2. 所有新分区需要在 `content/` 下创建文件夹并包含 `_index.md`
3. 新增分区要同步 3 处：`build.mjs` 的 `SECTIONS`、`site/index.html` 首页导航、`site/templates/page.html` 抽屉菜单
4. 保持设计一致性：不要引入新的 CSS 框架或风格
5. Markdown 解析器是自制的（`build.mjs` 中 `mdToHtml()`，基于行的状态机），支持：标题、围栏代码块、无序/有序列表（嵌套，2 空格一层）、表格、引用、分割线、图片/链接、粗斜体/行内代码。添加其他语法前先在解析器中扩展
6. 换行符统一为 LF（`.gitattributes` 已配置），构建输出也是 LF，勿改动

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
├── build.mjs          # 构建脚本：读取 content/ → 渲染 → 输出到 dist/
├── index.html          # 首页（手动维护）
├── style.css           # 全局样式
├── templates/
│   └── page.html       # 文章页 HTML 模板
├── content/            # Markdown 源文件
│   ├── _index.md       # 首页的 about 区域内容
│   ├── notes/          # 学习笔记分区
│   │   ├── _index.md
│   │   ├── database/
│   │   ├── linux/
│   │   └── python/
│   ├── novels/         # 小说创作分区
│   │   └── _index.md
│   └── airp/           # AIRP 体验分区
│       └── _index.md
├── dist/               # 构建产物（git 跟踪，用于 GitHub Pages）
├── avatar.jpeg         # 头像
├── .gitignore
└── README.md
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

**注意**：`dist/` 是提交到 git 的（GitHub Pages 直接从 dist/ 部署），构建后务必重新生成并提交。

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

1. **构建后务必运行 `node build.mjs`**，否则对 content/ 的修改不会反映到 dist/
2. **提交时记得同时提交 content/ 和 dist/ 的变化**
3. 所有新分区需要在 `content/` 下创建文件夹并包含 `_index.md`
4. 首页导航链接在 `index.html` 中手动维护，新增分区后记得同步更新导航
5. 保持设计一致性：不要引入新的 CSS 框架或风格
6. Markdown 解析器是自制的，不支持所有 CommonMark 语法。在添加新格式前请检查 `build.mjs` 中的 `mdToHtml()` 函数是否支持

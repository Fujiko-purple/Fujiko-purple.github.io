# Fujiko 的个人小站

> 一个基于静态 Markdown 构建的个人知识库网站，部署于 GitHub Pages，极简日系设计风格。
> 线上地址：<https://fujiko-purple.github.io/>

**本 README 是项目唯一的说明文档**（供人类和 AI 助手共同阅读）。任何结构性操作——新增分区、调整构建流程、修改目录结构、更改关键配置——完成后**必须同步更新本文件对应章节**，保证只读本文件即可获得完整上下文。

---

## 项目定位

以极低的维护成本，构建一个「包罗万象」的个人网站。内容覆盖学习笔记、小说创作、AIRP 体验等可无限扩展的分区。一切内容以 Markdown 书写，一次构建生成全站静态 HTML。

## 技术栈

| 层面 | 技术 |
|------|------|
| 构建脚本 | Node.js（`build.mjs`），纯原生 API，**零外部依赖（刻意设计，勿引入 npm）** |
| 内容格式 | Markdown（含 YAML front matter：`title`/`date`/`category`，均可选） |
| 模板 | 手写 HTML 模板（`site/templates/page.html`） |
| 样式 | 纯 CSS，无框架（`site/assets/style.css`） |
| 部署 | GitHub Pages + GitHub Actions 自动构建 |

## 项目结构

```
┌─ content/              ← ✍️ 内容源：写 Markdown 的地方
│   ├─ notes/            ← 学习笔记（python/ database/ linux/ 分类）
│   ├─ novels/           ← 小说创作
│   ├─ airp/             ← AIRP 体验
│   └─ .../              ← 可无限扩展的分区
│
├─ site/                 ← 🏗️ 站点骨架
│   ├─ index.html        ←    首页（手动维护）
│   ├─ templates/        ←    文章页模板（page.html）
│   └─ assets/           ←    静态资源：style.css、头像、以后所有图片
│
├─ dist/                 ← 📦 构建产物 = 完整站点（不入 git，CI 自动生成部署）
│
├─ build.mjs             ← 🔧 构建脚本（全站唯一的「程序」）
├─ .github/workflows/    ← CI：push 后自动构建部署 Pages
└─ README.md             ← 本文件
```

---

## 构建与部署

```bash
node build.mjs   # 全量构建：清空 dist/ → 拷入 site/ 骨架 → 渲染 content/ 全部 Markdown
```

- **日常写作无需本地构建**：push 到 `main` 后，`.github/workflows/deploy.yml` 自动构建 `dist/` 并部署，1-2 分钟后线上更新
- 本地构建仅用于预览：构建后直接用浏览器打开 `dist/index.html`（全站相对链接）
- 线上 URL 与 `dist/` 内部结构一致，如 `/notes/linux/vim.html`

## 构建脚本工作原理（build.mjs）

**两遍处理**：

1. `processFiles()` 递归遍历分区目录，把每个 `.md` 渲染成 HTML（`_index.md` → `index.html`），并收集文章元数据；取 front matter 的 `title` 或正文第一个 h1 作为标题（该 h1 会从正文移除，避免与模板重复）
2. `injectArticleLists()` 向每一级目录 `index.html` 的 `{{ARTICLE_LIST}}` 占位符注入文章列表——按 `category` 自动分组，`<details>` 折叠展示（默认收起），组名映射在 `CAT_NAMES` 常量

**自制 Markdown 解析器 `mdToHtml()`**（基于行的状态机），仅支持以下语法子集：

标题 `#`~`######`、围栏代码块 ```` ``` ````、无序/有序列表（**支持嵌套，2 空格一层**）、表格（`| a | b |` 形式，需分隔行）、引用 `>`、分割线 `---`、图片/链接、粗体/斜体/行内代码。以 `<` 开头的行和 `{{占位符}}` 行原样输出。

> ⚠️ 在笔记中使用其他语法前，先在 `mdToHtml()` 中扩展支持。

**分区注册表 `SECTIONS` 常量**：content/ 下的顶级目录需在此注册（名称 + 图标）才会被构建。

## 内容组织规范

**content/ 下每个顶级目录 = 一个分区；分区内每个子目录 = 一个分类。** 源文件结构与网页结构严格一一对应。每个目录（分区根或分类子目录）需有 `_index.md` 作为该级入口页，正文中放 `{{ARTICLE_LIST}}` 占位符。

front matter 示例（均可选）：

```yaml
---
title: 自定义页面标题     # 未设置则取正文第一个 h1
date: 2026-06-27
category: linux          # 决定文章在列表页的分组
---
```

### 场景一：在现有分类下加一篇笔记

```bash
# 1. 新建 content/notes/linux/我的新笔记.md，写内容（front matter 建议声明 category）
# 2. 提交推送即上线：
git add . && git commit -m "笔记: xxx" && git push
```

### 场景二：在现有分区下加一个新分类

```bash
# 1. mkdir content/notes/docker
# 2. 创建 content/notes/docker/_index.md（含 {{ARTICLE_LIST}} 占位符）
# 3. 把笔记放进去；想显示中文分类名则在 build.mjs 的 CAT_NAMES 加一行
```

### 场景三：加一个全新分区

```bash
# 1. mkdir content/diary，创建 _index.md
# 2. 同步 3 处：
#    - build.mjs 的 SECTIONS 加一条：'diary': { name:'日记', icon:'📔' }
#    - site/index.html 首页导航加链接
#    - site/templates/page.html 抽屉菜单加链接
```

---

## 设计风格规范

### 风格定位：极简日系（Minimal Japanese）

| 维度 | 规范 |
|------|------|
| 字体 | `'Noto Serif SC', 'Georgia', 'SimSun', serif`（衬线体，日系感） |
| 背景色 | `#fafaf8`（暖白/米白） |
| 文字色 | `#3a3a3a`（深灰，柔和） |
| 辅助色 | `#eee`（分割线）、`#ec4899`（粉红强调色） |
| 卡片/面板 | 白色半透明 + 毛玻璃模糊（backdrop-filter） |
| 布局 | 居中窄栏，最大宽度 600-720px |
| 整体氛围 | 安静、留白、干净、阅读友好 |

**保持设计一致性：不引入 CSS 框架或新风格。**

### 交互规范

所有可点击元素遵循统一的悬停反馈——悬停时字体颜色不变（仅文章列表和分类标题变粉色），通过位移和背景变化提供反馈：

| 元素 | 悬停效果 |
|------|---------|
| 首页导航链接 | 右移跳动（padding-left:20px） |
| 抽屉导航链接 | 底色变浅 + 右移跳动 |
| 文章列表 | 文字变粉色（#ec4899）+ 右移跳动 |
| 分类折叠标题 | 文字变粉色 + 右移跳动 |
| 头像 | 放大（scale:1.12） |

### 动效与导航

- **花瓣粒子**：所有页面包含浮动花瓣粒子（粉白色系），JS 生成 + CSS animation 驱动
- **抽屉导航**：右上角 ☰ 按钮，从右侧滑入（cubic-bezier 缓动），带半透明遮罩
- **分类折叠**：展开/折叠时 ▶ 旋转 90 度
- 导航层级：首页（极简导航页）→ 分区页（按分类折叠的文章列表）→ 文章页（顶栏面包屑）

### 主题定制

- **颜色**：全局 CSS 变量定义在 `site/assets/style.css` 的 `:root`
- **头像**：`site/assets/avatar.jpeg`，直接替换同名文件即可
- **代码块配色**：浅灰底（#f5f3f7）+ 紫色文字（#6d28d9）配细边框，行内代码紫字浅紫底；调整改 `.content-page pre` 和 `.content-page code`

---

## 项目 Skills（Claude Code）

`.claude/skills/` 下有两个项目级技能，覆盖日常写作闭环：

| Skill | 用法 | 做什么 |
|-------|------|--------|
| `/publish` | 写完说「发布」即可 | 本地构建 + 链接检查 → 中文提交信息 → 推送 → 等 CI → 验证线上 |
| `/new-note` | `/new-note linux 防火墙配置` | 建带 front matter 的笔记骨架；新分类自动补 `_index.md` 和 `CAT_NAMES` |

## 给 AI 助手与开发者的关键约定

1. **零依赖是刻意设计**——不引入 npm 依赖、package.json、CSS 框架
2. **Pages 部署源已固定为 GitHub Actions 模式**（build_type=workflow，2026-07 通过 API 切换），不要改回「从分支部署」——旧模式的 Jekyll 构建会与 workflow 竞争并覆盖产物
3. **换行符统一 LF**（`.gitattributes` 强制），构建输出也是 LF；模板读入时已做 CRLF 净化，保证本地 Windows 与 CI Linux 产物一致
4. `dist/` 不入 git，勿手动提交
5. 内容用新 Markdown 语法前，先确认/扩展 `mdToHtml()`
6. 新增分区同步 3 处（见「场景三」）
7. 注释与提交信息一律中文；完成一个功能及时 commit
8. 结构性变更后同步更新本 README

## 后续可能的优化方向

- [x] 支持 YAML Front Matter（title、date、category）
- [x] 文章列表按 category 自动分组、折叠展示
- [x] GitHub Actions 自动构建部署
- [ ] 文章列表按日期排序
- [ ] 标签/分类筛选
- [ ] 搜索功能
- [ ] RSS 订阅
- [ ] 深色模式切换
- [ ] 构建脚本 watch 模式

---

*最后更新：2026-07-26*

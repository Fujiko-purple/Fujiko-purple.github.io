# Fujiko 的个人小站

> 一个基于静态 Markdown 构建的个人知识库网站，部署于 GitHub Pages。
> 极简日系设计风格。

---

## 项目定位

本项目的目标是以极低的维护成本，构建一个「包罗万象」的个人网站。
内容覆盖学习笔记、小说创作、AIRP 体验等可无限扩展的分区。
一切内容以 Markdown 书写，一次构建生成全站静态 HTML。---

## 🎨 设计风格规范

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

所有可点击的元素遵循统一的悬停反馈：

| 元素 | 悬停效果 |
|------|---------|
| 首页导航链接 | 右移跳动（padding-left:20px） |
| 抽屉导航链接 | 底色变浅 + 右移跳动 |
| 文章列表 | 文字变粉色（#ec4899）+ 右移跳动 |
| 分类折叠标题 | 文字变粉色 + 右移跳动 |
| 头像 | 放大（scale:1.12） |

> **基本原则：** 悬停时字体颜色不变（仅文章列表和分类标题变为粉色），通过位移和背景变化提供反馈。

### 动效规范

- **花瓣粒子** — 所有页面包含浮动花瓣粒子（粉白色系），使用 JS 生成 + CSS animation 驱动
- **抽屉导航** — 从右侧滑入（cubic-bezier 缓动），带半透明遮罩
- **分类折叠** — 展开/折叠时▶旋转90度
- **头像悬停** — transform:scale 平滑放大

### 导航体系

| 层级 | 说明 |
|------|------|
| 首页 | 极简导航页，链接到各分区 |
| 分区页 | 显示该分区下的所有文章，按 category 分组，默认折叠 |
| 文章页 | 具体内容页，顶栏显示面包屑导航 |
| 全局导航 | 右上角 ☰ 按钮，滑出抽屉显示全站分区链接 |

---

---

## 技术架构

```
┌─ content/              ← 你写 Markdown 的地方
│   ├─ notes/            ← 学习笔记（已分类）
│   │   ├─ _index.md
│   │   ├─ python/       ← Python 笔记
│   │   ├─ database/     ← 数据库笔记
│   │   └─ linux/        ← Linux 笔记
│   ├─ novels/           ← 小说创作
│   ├─ airp/             ← AIRP 体验
│   └─ .../              ← 可无限扩展的分区
│
├─ templates/
│   └─ page.html
│
├─ dist/                 ← 构建产物（自动生成）
│   ├─ notes/
│   │   ├─ index.html
│   │   ├─ python/
│   │   ├─ database/
│   │   └─ linux/
│   ├─ novels/
│   └─ airp/
│
├─ index.html
├─ style.css
├─ build.mjs
└─ README.md
```

---

## 📌 重要约定

**本 README.md 是项目的"入口说明书"，任何对本项目的结构性操作（包括但不限于新增分区、调整构建流程、修改目录结构、更改关键配置、引入新依赖）后，必须同步更新本文件。**

具体来说，以下操作后需更新 README.md 的对应章节：

| 操作 | 需更新章节 |
|------|-----------|
| 新增/删除分区 | 「项目结构」「如何添加新内容」 |
| 修改构建脚本 | 「构建脚本 (build.mjs)」 |
| 修改样式/主题 | 「主题定制」 |
| 修改部署方式 | 「部署方式」 |
| 新增功能或优化 | 「后续可能的优化方向」 |
| 整体结构变动 | 「项目结构」「核心思路」 |

> 此约定的目的是：无论人类还是 AI 工具，在开始操作本项目前，只需阅读 README.md 即可获得完整上下文，无需再逐一翻阅源码做逆向推断。

---

### 核心思路

| 概念 | 说明 |
|------|------|
| **内容与样式分离** | Markdown 只管内容，模板管 HTML 骨架，CSS 管视觉 |
| **分区目录结构** | content/ 下每个子目录 = 一个独立分区，无限扩展 |
| **子目录分类** | 分区内按主题建子目录，一个子目录 = 一个分类 |
| **自动生成导航** | 构建脚本自动递归扫描 content/，生成文章列表 |
| **纯静态输出** | 最终产物全是 .html，可直接部署到 GitHub Pages |

---

## 文件结构规范（重要开发准则）

### 总原则

**content/ 下的每个顶级目录 = 网站的一个分区。**
**分区内的每个子目录 = 该分区下的一个分类。**

源文件结构（content/）与网页结构（dist/）严格一一对应。

### 目录结构样例

以「学习笔记」分区为例：

```
content/notes/               ← 分区根目录
  _index.md                   ← 分区首页（汇总所有子分类的文章列表）
  python/                     ← 分类目录
    _index.md                 ← 分类首页（只显示本分类的文章列表）
    python-基础.md             ← 具体文章
    python-进阶.md
  database/
    _index.md
    database-基础.md
  linux/
    _index.md
    ansible自动化运维工具.md
    docker简介和应用.md
    ...
```

构建后自动生成：

```
dist/notes/
  index.html                  ← 学习笔记主页（按分类折叠展示所有文章）
  python/
    index.html                ← Python 分类页
    python-基础.html
    python-进阶.html
  database/
    index.html                ← 数据库分类页
    database-基础.html
  linux/
    index.html                ← Linux 分类页（23 篇文章）
    ansible自动化运维工具.html
    docker简介和应用.html
    ...
```

### 适用范围

**此规范适用于所有分区，包括但不限于：**

- `notes/`（学习笔记）—— 已按 python / database / linux 分类
- `novels/`（小说创作）—— 后续可按作品或系列建子目录
- `airp/`（AIRP 体验）—— 后续可按游戏或角色建子目录
- **任何未来新增的分区**—— 一旦某个分区内的文章数量增多，就应该按主题拆分为子目录

### 工作原理

构建脚本（`build.mjs`）对 `content/` 下的每个分区执行**递归扫描**：

1. 遍历分区目录下的所有 `.md` 文件和子目录
2. 对每个 `.md` 文件生成对应的 `.html`，输出到 `dist/` 下相同路径
3. 对每个目录中的 `_index.md` 生成 `index.html`，并自动注入该目录（含子目录）下的文章列表
4. 文章列表按 `category` 字段（YAML Front Matter）自动分组

因此，**只需在 `content/` 下按规范建好目录和文件，构建后网页结构自动镜像**，无需手动修改导航或链接。

---

## 如何添加新内容

### 场景一：在现有分区下加一篇笔记

```bash
# 1. 在对应分类的子目录下新建 .md 文件
touch content/notes/linux/我的新笔记.md

# 2. 用 Markdown 写内容，顶部可选加 YAML Front Matter
# ---
# category: linux
# ---
# # 我的新笔记
# 
# 这是笔记内容……

# 3. 运行构建脚本
node build.mjs

# 4. 刷新浏览器看效果（http://localhost:8080/）
```

### 场景二：在现有分区下加一个新的分类

```bash
# 1. 在分区下建一个新子目录
mkdir content/notes/docker

# 2. 创建分类首页 _index.md
# content/notes/docker/_index.md 内容：
# # Docker
# 
# {{ARTICLE_LIST}}

# 3. 把笔记放进去
touch content/notes/docker/docker基础.md

# 4. 构建
node build.mjs
```

### 场景三：加一个全新的分区

```bash
# 1. 在 content/ 下建新目录
mkdir content/diary

# 2. 创建分区首页
# content/diary/_index.md 内容：
# # 📔 日记
# 
# {{ARTICLE_LIST}}

# 3. 注册到构建脚本
# 编辑 build.mjs，在 SECTIONS 对象里加一条：
# 'diary': { name:'日记', icon:'📔' },

# 4. 更新首页导航
# 打开 index.html，复制一个卡片改为新分区的链接

# 5. 构建
node build.mjs
```

### 关于 _index.md 和分类

- 每个目录（分区根目录或分类子目录）下的 `_index.md` 是该目录的入口页
- `{{ARTICLE_LIST}}` 占位符在构建时自动替换为文章列表
- 文章列表按 `category` 字段分组。在文章的 YAML Front Matter 中声明：
  ```yaml
  ---
  category: linux
  ---
  ```
- 同一子目录下的文章建议声明相同的 `category`，以便在父级页面中正确分组展示

---

## 构建脚本 (build.mjs)

负责将 `content/` 下的 Markdown 文件转换为 `dist/` 下的 HTML 文件。

关键行为：

1. 遍历 `content/` 下每个分区目录
2. 对每个 `.md` 文件：
   - 用正则解析简易 Markdown（支持标题、代码块、加粗、列表、链接、图片）
   - 检测 YAML Front Matter（可选的 title、date、category）
   - 获取第一个 h1 作为页面标题
   - 移除正文中的第一个 h1，避免与模板标题重复
   - 用 `templates/page.html` 包裹内容，生成完整 HTML
3. 对每个分区的 `index.html`（由 `_index.md` 生成），注入 `{{ARTICLE_LIST}}` 文章列表
   - **自动按 category 分组**，每个分组使用 `<details>` 折叠展示
   - 所有分组**默认收起**，用户点击展开
   - 分组标题后显示笔记数量，如 `Linux (23)`
4. 输出到 `dist/` 目录

暂无文件监听/watch 模式 —— 每次修改内容后需手动运行 `node build.mjs`

### Markdown 中的 YAML Front Matter

在 `.md` 文件顶部可选声明以下字段：

```yaml
---
title: 自定义页面标题
date: 2026-06-27
category: linux        # 用于在文章列表中自动分组
---
```

- **title**: 页面标题（未设置则取正文第一个 h1）
- **date**: 日期显示
- **category**: 分组标识（如 `python`、`database`、`linux`），影响文章列表的归类

---

## 代码块配色

当前 code block 使用浅灰色底色（#f5f3f7）+ 紫色文字（#6d28d9），配细边框。
行内代码使用紫色文字 + 浅紫背景。
如需调整，修改 `style.css` 中的 `.content-page pre` 和 `.content-page code`。

> **注意：** 源文件需使用 Unix 换行符 (`\n`)，Windows 换行符 (`\r\n`) 会导致代码块解析失败。
> 构建脚本已兼容两种换行格式，但建议统一使用 `\n`。

---

## 主题定制

- **颜色**：全局 CSS 变量定义在 `:root`，修改 `style.css` 前几行即可
- **字体**：默认使用衬线体（Noto Serif SC / Georgia / SimSun），在 `style.css` 中修改 `body` 的 `font-family`
- **头像**：当前使用 `avatar.jpeg`，替换图片后修改 `index.html` 中 `<img src="avatar.jpeg">` 的路径即可
- **花瓣粒子**：所有页面包含浮动花瓣粒子动画，由 `<div id="particles">` + JavaScript 生成，样式在 `style.css` 的 `.particle` 和 `@keyframes floatPetals` 中定义

---

## 部署方式

本仓库关联 GitHub Pages，推送到 `main` 分支后自动部署。

```bash
git add .
git commit -m "更新内容"
git push origin main
```

部署网址：`https://fujiko-purple.github.io/`

---

## 后续可能的优化方向

- [x] 支持 Markdown 文件中的 YAML Front Matter（title、date、category）
- [x] 文章列表按 category 自动分组
- [x] 分组折叠/展开（`<details>` 实现）
- [ ] 文章列表按日期排序
- [ ] 添加标签/分类筛选
- [ ] 搜索功能
- [ ] RSS 订阅
- [ ] 深色模式切换
- [ ] 构建脚本添加 watch 模式，文件修改后自动构建

---

*最后更新：2026-06-27*

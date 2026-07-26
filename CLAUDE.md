# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目

Fujiko 的个人小站：零依赖的 Markdown 静态站点生成器 + 内容，部署于 GitHub Pages（用户主页仓库，线上地址 https://fujiko-purple.github.io/）。全站唯一的「程序」是 `build.mjs`（纯 Node 原生 API）。

详细规范见 `AGENTS.md`（项目上下文/设计规范）和 `README.md`（入口说明书）。**README 有强约定：任何结构性变更（新增分区、改构建流程、改目录结构）后必须同步更新 README.md 对应章节。**

## 命令

```bash
node build.mjs   # 全量构建：清空 dist/ → 拷入 site/ 骨架 → 渲染 content/ 全部 Markdown
```

- 没有 package.json、测试和 lint —— **零依赖是刻意设计，不要引入 npm 依赖**
- 本地预览：构建后直接用浏览器打开 `dist/index.html`（全站相对链接）
- 部署无需手动操作：push 到 main 后 `.github/workflows/deploy.yml` 自动构建 `dist/` 并部署 Pages

## 架构

数据流：`content/**/*.md`（内容）+ `site/`（骨架：首页 index.html、templates/page.html 模板、assets/ 静态资源）→ `build.mjs` → `dist/`（完整站点，**不入 git**）→ CI 部署。线上 URL 与 dist/ 内部结构一致（如 `/notes/linux/vim.html`）。

`build.mjs` 关键结构：

- **两遍处理**：`processFiles()` 递归渲染所有 md 为 HTML 并收集文章元数据 → `injectArticleLists()` 向各级 index.html 的 `{{ARTICLE_LIST}}` 占位符注入按 category 分组的文章列表
- **自制 Markdown 解析器** `mdToHtml()`：基于行的状态机，仅支持子集——标题、围栏代码块、无序/有序列表（嵌套，2 空格一层）、表格、引用、分割线、图片/链接、粗斜体/行内代码。以 `<` 开头的行和 `{{占位符}}` 行原样输出。**内容中使用新语法前，先在解析器中扩展**
- **分区注册表** `SECTIONS` 常量：新增分区必须同步 3 处——`build.mjs` 的 `SECTIONS`、`site/index.html` 首页导航、`site/templates/page.html` 抽屉菜单
- **front matter**：`title`/`date`/`category`（均可选）；`category` 决定文章在列表页的分组，中文组名映射在 `CAT_NAMES`

内容组织约定：`content/` 下每个顶级目录 = 一个分区（需在 SECTIONS 注册），分区内每个子目录 = 一个分类；每个目录需有 `_index.md` 作为该级入口页。

## 关键约定与坑

- **Pages 部署源已固定为 GitHub Actions 模式**（build_type=workflow，通过 API 切换过），不要改回「从分支部署」——旧模式的 Jekyll 构建会与 workflow 竞争并覆盖产物
- 换行符统一 LF（`.gitattributes` 强制），`build.mjs` 输出也是 LF；模板读入时已做 CRLF 净化，保证本地 Windows 与 CI Linux 构建产物一致
- 设计风格为「极简日系」（规范见 AGENTS.md/README），不引入 CSS 框架；样式集中在 `site/assets/style.css`，首页样式内联在 `site/index.html`
- 注释一律中文；Git 提交信息使用中文，完成一个功能及时 commit

---
name: new-note
description: 新建一篇笔记：在正确的分类目录创建带 front matter 的 Markdown 骨架；分类不存在时自动创建分类结构。用户说「新笔记」「建一篇笔记」「/new-note <分类> <标题>」时使用。
---

# 新建笔记

参数格式：`/new-note <分类> <标题>`，例如 `/new-note linux 防火墙配置`。
缺少参数时询问用户分类和标题（现有分类：linux、python、database，也可以是新分类）。

## 步骤

1. **确定目标目录** `content/notes/<分类>/`：

   - **分类已存在**：直接进入下一步
   - **分类不存在**（新分类）：
     a. 创建目录和 `content/notes/<分类>/_index.md`，内容为：

     ```markdown
     # <分类中文名>

     {{ARTICLE_LIST}}
     ```

     b. 检查 `build.mjs` 的 `CAT_NAMES` 常量是否包含该分类的中文名映射，没有则加一行（如 `'docker':'Docker',`）

2. **创建笔记文件** `content/notes/<分类>/<标题>.md`（文件名直接用标题，中文没问题）：

   ```markdown
   ---
   category: <分类>
   date: <今天日期，YYYY-MM-DD，用 date 命令获取>
   ---
   # <标题>

   （正文从这里开始）
   ```

3. **汇报**：告知文件完整路径，提醒用户写完内容后可用 `/publish` 一键上线。

## 注意

- 只建骨架，**不要自动提交**——用户还没写内容
- Markdown 语法支持范围见 README「构建脚本工作原理」一节：解析器只支持列出的子集，嵌套列表用 2 空格缩进
- 小说（novels/）和 AIRP（airp/）分区的文章同理，只是目录换成对应分区，且无分类子目录时直接放分区根目录

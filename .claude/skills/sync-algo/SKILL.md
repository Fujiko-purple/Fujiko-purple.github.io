---
name: sync-algo
description: 增量同步算法笔记：从「秋招培训/每日算法」目录把新增的题目笔记导入站点 algorithm 分类并发布。用户说「同步算法笔记」「导入算法笔记」「/sync-algo」时使用。
---

# 同步算法笔记

把 `C:\Users\Administrator\Desktop\秋招培训\每日算法` 下**站点里还没有的**新笔记导入 `content/notes/algorithm/`，然后走发布流程。

## 转换规则（与首次批量导入保持一致）

源文件 `NN_题目名/笔记.md` → `content/notes/algorithm/NN_题目名去空格.md`，并在开头加 front matter：

```yaml
---
title: NN. 题目名          # 序号 + 点 + 空格 + 题目名（保留原空格）
date: YYYY-MM-DD           # 从正文「**日期：** YYYY-MM-DD」提取；没有则用文件修改日期
category: algorithm
---
```

正文原样保留（不要改动内容）。`Java语法速查.md` 若源文件比站内版本新，也同步更新。

## 步骤

1. 运行以下脚本做增量导入（只导入站点缺少的编号）：

```bash
node -e "
const fs=require('fs');
const SRC='C:/Users/Administrator/Desktop/秋招培训/每日算法';
const DST='C:/Users/Administrator/Desktop/github个人项目/content/notes/algorithm';
const have=new Set(fs.readdirSync(DST).map(f=>f.match(/^(\d+)_/)?.[1]).filter(Boolean));
let added=[];
for(const e of fs.readdirSync(SRC,{withFileTypes:true})){
  if(!e.isDirectory())continue;
  const m=e.name.match(/^(\d+)_(.+)$/);
  if(!m||have.has(m[1]))continue;
  const p=SRC+'/'+e.name+'/笔记.md';
  if(!fs.existsSync(p)){console.log('⚠ 缺笔记.md:',e.name);continue}
  const body=fs.readFileSync(p,'utf-8').replace(/^\uFEFF/,'');
  const date=body.match(/\*\*日期：?\*\*\s*(\d{4}-\d{2}-\d{2})/)?.[1]
    ||new Date(fs.statSync(p).mtime).toISOString().slice(0,10);
  fs.writeFileSync(DST+'/'+m[1]+'_'+m[2].replace(/\s+/g,'')+'.md',
    '---\ntitle: '+m[1]+'. '+m[2].trim()+'\ndate: '+date+'\ncategory: algorithm\n---\n\n'+body);
  added.push(m[1]+'. '+m[2].trim());
}
console.log(added.length?'新增 '+added.length+' 篇:\n'+added.join('\n'):'没有新笔记，站点已是最新');
"
```

2. 没有新笔记 → 告知用户后停止。有新笔记 → 继续执行 **publish** skill 的完整流程（构建验证 → 链接检查 → 提交推送 → 等 CI → 线上验证），提交信息格式：`笔记: 算法 NN、NN（共 N 篇）`。

3. 汇报新上线的题目和线上链接（`https://fujiko-purple.github.io/notes/algorithm/NN_题目名.html`）。

## 注意

- 判断「新」的依据是**题目编号**：站内已有该编号则跳过（即使内容有改动也不覆盖，避免误覆盖站内修改；用户明确说「重新导入 NN」时才覆盖）
- 源目录里的 `作业*.txt` 和代码文件不导入

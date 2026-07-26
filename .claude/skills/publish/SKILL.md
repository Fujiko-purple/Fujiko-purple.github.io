---
name: publish
description: 发布站点更新：本地构建验证 → 生成中文提交信息 → 推送 → 等待 CI 部署 → 验证线上。用户说「发布」「上线」「推送笔记」「/publish」时使用。
---

# 发布站点更新

把当前工作区的内容变更完整地发布到线上，并验证成功。严格按以下步骤执行：

## 步骤

1. **检查变更**：`git status --short`。没有任何变更时告知用户并停止。

2. **本地构建验证**：运行 `node build.mjs`，失败则报告错误并停止（不要提交坏的构建）。

3. **全站链接检查**：运行以下脚本，发现坏链接则报告并停止：

```bash
node -e "
const fs=require('fs'),path=require('path');
let files=[],bad=[];
(function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);e.isDirectory()?walk(p):e.name.endsWith('.html')&&files.push(p)}})('dist');
for(const f of files){
  const s=fs.readFileSync(f,'utf-8');
  for(const m of s.matchAll(/(?:href|src)=\"([^\"]+)\"/g)){
    const u=m[1];
    if(/^(https?:|mailto:|#|data:)/.test(u)) continue;
    if(!fs.existsSync(path.resolve(path.dirname(f),u.split('#')[0]))) bad.push(f+' -> '+u);
  }
}
console.log('检查',files.length,'个页面 —',bad.length?'坏链接:\n'+bad.join('\n'):'全部有效');
process.exit(bad.length?1:0);
"
```

4. **提交推送**：根据变更内容生成简洁的中文提交信息（如「笔记: 新增 xxx」「样式: 调整 xxx」），`git add` 相关文件后 commit + push。注意：
   - `dist/` 已在 .gitignore 中，无需理会
   - 如果本次变更涉及 build.mjs、workflow、目录结构等结构性内容，提醒用户（或代为）同步更新 README.md 对应章节

5. **等待 CI 部署**（用后台命令轮询，不要前台 sleep）：

```bash
until curl -s "https://api.github.com/repos/Fujiko-purple/Fujiko-purple.github.io/actions/runs?per_page=1" | grep -q '"status": *"completed"'; do sleep 15; done
```

   然后读取最新 run 的 `conclusion`。失败则查询失败步骤（`/actions/runs/<id>/jobs`）并报告。

6. **线上验证**：CI 成功后，对本次修改涉及的页面 URL（以及首页）确认全部 200。URL 规则：`https://fujiko-purple.github.io/` + dist/ 内相对路径，如 `content/notes/linux/vim.md` → `/notes/linux/vim.html`。
   **⚠️ 中文文件名必须 percent-encode 后再请求**（curl 不会自动编码，直接请求会假 404），用 node 最稳：

```bash
node -e "
(async()=>{
  for(const p of ['notes/linux/vim.html','notes/algorithm/01_二分查找.html']){  // 换成实际页面
    const r=await fetch('https://fujiko-purple.github.io/'+p.split('/').map(encodeURIComponent).join('/'),{method:'HEAD'});
    console.log(r.status,p);
  }
})()"
```

7. **汇报**：一句话总结上线了什么 + 可点击的线上链接。

## 注意

- CDN 生效可能有约 1 分钟延迟，404 时等 20 秒重试一次再下结论
- 任何一步失败都停下报告，不要带病发布

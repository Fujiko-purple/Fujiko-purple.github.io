import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync, rmSync, cpSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const CONTENT = join(ROOT, 'content');   // Markdown 内容源
const SITE = join(ROOT, 'site');         // 站点骨架：首页、模板、静态资源
const TEMPLATES = join(SITE, 'templates');
const DIST = join(ROOT, 'dist');         // 构建产物 = 完整站点（不入 git）

// ============ Markdown 转 HTML（自制解析器，零依赖） ============
// 支持的语法子集：
//   标题 #~######、围栏代码块 ```、无序列表 -/*、有序列表 1.（均支持嵌套，2 空格一层）、
//   表格（| a | b | 形式，需分隔行）、引用 >、分割线 ---、图片/链接、粗体/斜体/行内代码
// 手写 HTML 行（以 < 开头）和 {{占位符}} 行原样输出，不做转义
// 添加新语法前请先在此扩展，勿在笔记中使用未支持的格式

function esc(t) { return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// ============ 构建时代码高亮（零依赖） ============
// 思路：注释/字符串先提取为占位符 → 其余文本转义后染关键字/数字 → 还原占位
// 仅覆盖本站实际使用的语言；新语言在 LANGS 加词表即可
const LANGS = {
  java: {
    kw: 'public private protected class interface enum static final void int long double float boolean char byte short new return if else for while do switch case break continue default try catch finally throw throws import package this super null true false extends implements instanceof abstract String'.split(' '),
    line: '//', block: true,
  },
  python: {
    kw: 'def class return if elif else for while in not and or is None True False import from as with try except finally raise lambda pass break continue global nonlocal yield assert del self print range len'.split(' '),
    line: '#',
  },
  shell: {
    kw: 'if then else elif fi for while until do done case esac function echo cd export local return exit source in read'.split(' '),
    line: '#',
  },
  sql: {
    kw: 'select from where insert into values update set delete create table database drop alter add primary key foreign references not null default index join left right inner on group by order having limit and or in like between is distinct union all as show use describe grant flush privileges identified'.split(' '),
    line: '--', ci: true,
  },
};
const LANG_ALIAS = { py:'python', sh:'shell', bash:'shell', zsh:'shell', mysql:'sql' };

function highlightCode(raw, lang) {
  const cfg = LANGS[LANG_ALIAS[lang] || lang];
  if (!cfg) return esc(raw);

  const slots = [];
  const hold = (text, cls) => {
    slots.push('<span class="' + cls + '">' + esc(text) + '</span>');
    return '\u0000' + (slots.length - 1) + '\u0000';
  };

  // 注释与字符串合并为一个交替正则、单遍提取：谁在文本中先出现谁生效，
  // 天然处理「注释里有引号 / 字符串里有 //」的相互包含（分两遍提取会产生占位符嵌套残留）
  const parts = [];
  if (cfg.block) parts.push('\\/\\*[\\s\\S]*?\\*\\/');
  if (cfg.line === '//') parts.push('\\/\\/[^\\n]*');
  else if (cfg.line === '#') parts.push('#[^\\n]*');
  else if (cfg.line === '--') parts.push('--[^\\n]*');
  parts.push('"(?:[^"\\\\\\n]|\\\\.)*"', "'(?:[^'\\\\\\n]|\\\\.)*'");
  const extractRe = new RegExp(parts.join('|'), 'g');
  let s = raw.replace(extractRe, m =>
    hold(m, (m[0] === '"' || m[0] === "'") ? 'tok-s' : 'tok-c'));

  const kwRe = new RegExp('\\b(' + cfg.kw.join('|') + ')\\b', cfg.ci ? 'gi' : 'g');
  // 按占位符分段：只对普通代码段做转义+染色，避免破坏占位符里的数字
  s = s.split(/(\u0000\d+\u0000)/).map(seg => {
    if (/^\u0000\d+\u0000$/.test(seg)) return seg;
    let t = esc(seg);
    t = t.replace(kwRe, '<span class="tok-k">$1</span>');
    t = t.replace(/\b\d+(?:\.\d+)?\b/g, '<span class="tok-n">$&</span>');
    return t;
  }).join('');

  return s.replace(/\u0000(\d+)\u0000/g, (_, i) => slots[i]);
}

// 行内格式：先保护行内代码（内容转义，防止 < > 破坏页面），再处理图片/链接/粗斜体
function inline(text) {
  const codes = [];
  let t = text.replace(/`([^`]+)`/g, (_, c) => {
    codes.push('<code>' + esc(c) + '</code>');
    return '\u0000C' + (codes.length - 1) + '\u0000';
  });
  t = t
    .replace(/!\[(.*?)\]\((.+?)\)/g, '<img src="$2" alt="$1">')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');
  return t.replace(/\u0000C(\d+)\u0000/g, (_, n) => codes[n]);
}

function mdToHtml(md) {
  md = md.replace(/\r/g, '');

  // 第一步：提取围栏代码块为占位符，避免代码内容被当作 Markdown 解析
  const blocks = [];
  md = md.replace(/```(\w*)\n([\s\S]*?)\n?```/g, (_, lang, code) => {
    blocks.push('<pre><code' + (lang ? ' class="language-' + lang + '"' : '') + '>' + highlightCode(code, lang.toLowerCase()) + '</code></pre>');
    return '\u0000B' + (blocks.length - 1) + '\u0000';
  });

  const lines = md.split('\n');
  const out = [];

  // 列表状态栈：每层记录列表类型和当前 <li> 是否未闭合（子列表要嵌在父 <li> 内部）
  const stack = [];
  function closeLevel() {
    const top = stack.pop();
    out.push((top.liOpen ? '</li>' : '') + '</' + top.type + '>');
  }
  function closeAllLists() { while (stack.length) closeLevel(); }

  // 引用缓冲：连续的 > 行合并为同一个 blockquote
  let quoteBuf = [];
  function flushQuote() {
    if (quoteBuf.length) {
      out.push('<blockquote>' + quoteBuf.join('<br>') + '</blockquote>');
      quoteBuf = [];
    }
  }

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // ---- 表格：| a | b | 行，且下一行是 |---|---| 分隔行 ----
    if (/^\s*\|(.+)\|\s*$/.test(line) && i + 1 < lines.length && /^\s*\|[\s:|-]+\|\s*$/.test(lines[i + 1])) {
      closeAllLists(); flushQuote();
      const cells = l => l.trim().slice(1, -1).split('|').map(c => inline(c.trim()));
      let t = '<table><thead><tr>' + cells(line).map(c => '<th>' + c + '</th>').join('') + '</tr></thead><tbody>';
      i += 2;
      while (i < lines.length && /^\s*\|(.+)\|\s*$/.test(lines[i])) {
        t += '<tr>' + cells(lines[i]).map(c => '<td>' + c + '</td>').join('') + '</tr>';
        i++;
      }
      out.push(t + '</tbody></table>');
      continue;
    }

    // ---- 列表项：-/* 为无序，"数字." 为有序，缩进每 2 空格深一层 ----
    const lm = line.match(/^(\s*)(?:([-*])|(\d+)\.) (.+)$/);
    if (lm) {
      flushQuote();
      const depth = Math.floor(lm[1].replace(/\t/g, '  ').length / 2);
      const type = lm[2] ? 'ul' : 'ol';
      while (stack.length > depth + 1) closeLevel();
      if (stack.length === depth + 1 && stack[stack.length - 1].type !== type) closeLevel();
      while (stack.length < depth + 1) {
        out.push('<' + type + '>');
        stack.push({ type, liOpen: false });
      }
      const top = stack[stack.length - 1];
      if (top.liOpen) out.push('</li>');
      // 任务列表：- [x] / - [ ] 渲染为只读勾选框
      const task = lm[4].match(/^\[([ x])\] (.*)$/);
      const liHtml = task
        ? '<input type="checkbox"' + (task[1] === 'x' ? ' checked' : '') + ' disabled> ' + inline(task[2])
        : inline(lm[4]);
      out.push('<li>' + liHtml);
      top.liOpen = true;
      i++;
      continue;
    }

    // ---- 引用行 ----
    const qm = line.match(/^> ?(.*)$/);
    if (qm) { closeAllLists(); quoteBuf.push(inline(qm[1])); i++; continue; }
    flushQuote();

    // ---- 空行：结束当前列表 ----
    if (/^\s*$/.test(line)) { closeAllLists(); i++; continue; }
    closeAllLists();

    // ---- 标题 ----
    const hm = line.match(/^(#{1,6}) (.+)$/);
    if (hm) { out.push('<h' + hm[1].length + '>' + inline(hm[2]) + '</h' + hm[1].length + '>'); i++; continue; }

    // ---- 分割线 ----
    if (/^-{3,}\s*$/.test(line)) { out.push('<hr>'); i++; continue; }

    // ---- 代码块占位符 / {{模板占位符}} / 手写 HTML 行：原样输出 ----
    if (/^\u0000B\d+\u0000$/.test(line.trim()) || /^\{\{[A-Z_]+\}\}$/.test(line.trim()) || /^</.test(line)) {
      out.push(line); i++; continue;
    }

    // ---- 普通段落：每行一个 <p> ----
    out.push('<p>' + inline(line) + '</p>');
    i++;
  }
  closeAllLists();
  flushQuote();

  // 最后一步：恢复围栏代码块
  return out.join('\n').replace(/\u0000B(\d+)\u0000/g, (_, n) => blocks[n]);
}

function parseFM(text) {
  let cat='';
  let title='', date='', body=text;
  if (text.startsWith('---')) {
    const e = text.indexOf('---',3);
    if (e>0) {
      const fm = text.slice(3,e).trim();
      body = text.slice(e+3).trim();
      fm.split('\n').forEach(l => {
        const [k,...v] = l.split(':');
        const val = v.join(':').trim();
        if (k.trim()==='title') title=val;
        if (k.trim()==='date') date=val;
        if (k.trim()==='category') cat=val;
      });
    }
  }
  return {title,date,body,cat};
}

const SECTIONS = {
  'notes':  { name:'学习笔记', icon:'📖' },
  'novels': { name:'小说创作', icon:'✍️' },
  'airp':   { name:'AIRP 体验', icon:'🎭' },
};
const CAT_NAMES = { 'python':'Python', 'database':'数据库', 'linux':'Linux', 'algorithm':'算法', '':'所有笔记' };

function build() {
  console.log('Building site...\n');
  // 统一为 LF：保证本地（Windows）和 CI（Linux）构建产物字节级一致
  const tpl = readFileSync(join(TEMPLATES, 'page.html'), 'utf-8').replace(/\r\n/g, '\n');

  // 每次全量重建：先清空 dist/，避免已删除的文章残留在线上
  rmSync(DIST, { recursive: true, force: true });
  mkdirSync(DIST, { recursive: true });

  // 拷贝站点骨架：dist/ 自身就是完整可部署的站点
  cpSync(join(SITE, 'index.html'), join(DIST, 'index.html'));
  cpSync(join(SITE, 'assets'), join(DIST, 'assets'), { recursive: true });
  console.log('  ✓ index.html + assets/（站点骨架）');

  for (const [dk, sec] of Object.entries(SECTIONS)) {
    const sdir = join(CONTENT, dk);
    const odir = join(DIST, dk);
    if (!existsSync(sdir)) continue;

    // 第一遍：递归渲染所有 .md；文章页在 dist 下第一层（如 notes/），深度为 1
    const allArticles = [];
    processFiles(sdir, odir, 1, tpl, sec, dk, allArticles);

    // 第二遍：向每一层目录的 index.html 注入文章列表
    injectArticleLists(sdir, odir, dk);
  }
  console.log('\n✨ Build complete!');
}

function processFiles(srcDir, outDir, depth, tpl, sec, dk, articles) {
  mkdirSync(outDir, { recursive: true });
  const rootDir = '../'.repeat(depth);

  const entries = readdirSync(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith('.md')) {
      const mdc = readFileSync(join(srcDir, entry.name), 'utf-8');
      const {title,date,body,cat} = parseFM(mdc);
      let bhtml = mdToHtml(body.replace(/\r/g, ''));
      const pt = title || bhtml.match(/<h1>(.*?)<\/h1>/)?.[1] || basename(entry.name, '.md');
      const pd = date || '';
      bhtml = bhtml.replace(/<h1>.*?<\/h1>\n*/s, '');

      const outName = (entry.name === '_index.md') ? 'index.html' : basename(entry.name, '.md') + '.html';
      const outRel = join(outDir.replace(DIST+'\\', '').replace(DIST+'/', ''), outName);
      
      let pg = tpl
        .replaceAll('{{TITLE}}', pt)
        .replaceAll('{{DATE}}', pd)
        .replaceAll('{{CONTENT}}', bhtml)
        .replaceAll('{{SECTION_NAME}}', sec.name)
        .replaceAll('{{SECTION_INDEX}}', rootDir + dk + '/index.html')
        .replaceAll('{{ROOT}}', rootDir);

      writeFileSync(join(outDir, outName), pg, 'utf-8');

      if (entry.name !== '_index.md') {
        articles.push({ title:pt, date:pd, href:'./' + outName, cat:cat, dir:outDir });
      }
      console.log('  ✓ ' + outRel);
    }
  }

  // Recurse into subdirectories
  for (const entry of entries) {
    if (entry.isDirectory() && !entry.name.startsWith('.')) {
      processFiles(join(srcDir, entry.name), join(outDir, entry.name), depth + 1, tpl, sec, dk, articles);
    }
  }
}

function injectArticleLists(srcDir, outDir, dk) {
  const indexPath = join(outDir, 'index.html');
  if (!existsSync(indexPath)) return;

  // Collect articles from this dir and subdirectories with correct relative hrefs
  const articles = [];
  collectArticleInfo(outDir, srcDir, outDir, articles);

  let idx = readFileSync(indexPath, 'utf-8');
  let listHtml = '';
  if (articles.length > 0) {
    const groups = {};
    for (const a of articles) {
      const g = a.cat || '';
      if (!groups[g]) groups[g] = [];
      groups[g].push(a);
    }
    for (const [g, items] of Object.entries(groups)) {
      // 组内按日期降序（新笔记在前）；无日期的排最后，同日期保持文件名序
      items.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      const heading = CAT_NAMES[g] || g;
      const open = '';
      listHtml += '<details class="cat-group"' + open + '>';
      listHtml += '<summary><h2>' + heading + ' <span class="cat-count">(' + items.length + ')</span></h2></summary>';
      listHtml += '\n<ul class="article-list">\n';
      for (const a of items) {
        const ds = a.date ? '<span class="article-meta">' + a.date + '</span>' : '';
        listHtml += '<li><a href="' + a.href + '"><span class="article-title">' + a.title + '</span>' + ds + '</a></li>\n';
      }
      listHtml += '</ul>';
      listHtml += '</details>';
    }
  } else {
    listHtml = '\n<p style="color:var(--text-light)">暂无内容，敬请期待……</p>';
  }
  idx = idx.replace('{{ARTICLE_LIST}}', listHtml);
  writeFileSync(indexPath, idx, 'utf-8');
  const rel = outDir.replace(DIST+'\\', '').replace(DIST+'/', '');
  console.log('  \u279c Updated article list in ' + rel + '/index.html');

  // Recurse into subdirectories
  const subEntries = readdirSync(srcDir, { withFileTypes: true });
  for (const subEntry of subEntries) {
    if (subEntry.isDirectory() && !subEntry.name.startsWith('.')) {
      injectArticleLists(join(srcDir, subEntry.name), join(outDir, subEntry.name), dk);
    }
  }
}

function collectArticleInfo(baseOutDir, srcDir, outDir, articles) {
  const entries = readdirSync(srcDir, { withFileTypes: true });
  const relFromBase = outDir.replace(baseOutDir, '').replace(/\\/g, '/');
  
  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith('.md') && entry.name !== '_index.md') {
      const mdc = readFileSync(join(srcDir, entry.name), 'utf-8');
      const {title,date,body,cat} = parseFM(mdc);
      let bhtml = mdToHtml(body.replace(/\r/g, ''));
      const pt = title || bhtml.match(/<h1>(.*?)<\/h1>/)?.[1] || basename(entry.name, '.md');
      const href = '.' + relFromBase + '/' + basename(entry.name, '.md') + '.html';
      articles.push({ title:pt, date:date||'', href:href.replace(/\\/g, '/'), cat:cat });
    }
    if (entry.isDirectory() && !entry.name.startsWith('.')) {
      collectArticleInfo(baseOutDir, join(srcDir, entry.name), join(outDir, entry.name), articles);
    }
  }
}

build();

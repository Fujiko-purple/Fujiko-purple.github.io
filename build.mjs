import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const CONTENT = join(ROOT, 'content');
const TEMPLATES = join(ROOT, 'templates');
const DIST = join(ROOT, 'dist');

function mdToHtml(md) {
  let html = md
    .replace(/```(\w*)\r?\n([\s\S]*?)\r?\n```/g, (_, lang, code) => {
      return '<pre><code' + (lang ? ' class="language-' + lang + '"' : '') + '>' + esc(code) + '</code></pre>';
    })
    .replace(/^\r?\n?---\r?\n?/gm, '<hr>')
    .replace(/^###### (.+)$/gm, '<h6>$1</h6>')
    .replace(/^##### (.+)$/gm, '<h5>$1</h5>')
    .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/^\* (.+)$/gm, '<li>$1</li>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    .replace(/!\[(.*?)\]\((.+?)\)/g, '<img src="$2" alt="$1">');
  html = html.replace(/^(?!<[hHpPuUoObBli]|<\/|<pre|\s|$)(.+)$/gm, '<p>$1</p>');
  return html;
}
function esc(t) { return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

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
const CAT_NAMES = { 'python':'Python', 'database':'数据库', 'linux':'Linux', '':'所有笔记' };

function build() {
  console.log('Building site...\n');
  const tpl = readFileSync(join(TEMPLATES, 'page.html'), 'utf-8');

  for (const [dk, sec] of Object.entries(SECTIONS)) {
    const sdir = join(CONTENT, dk);
    const odir = join(DIST, dk);
    if (!existsSync(sdir)) continue;

    // First pass: recursively process all .md files, collect articles
    const allArticles = [];
    processFiles(sdir, odir, 2, tpl, sec, dk, allArticles);

    // Second pass: inject article lists into index.html at each directory level
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
        .replaceAll('{{SECTION_INDEX}}', rootDir + 'dist/' + dk + '/index.html')
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

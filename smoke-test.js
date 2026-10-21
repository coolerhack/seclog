#!/usr/bin/env node
'use strict';

/**
 * SecLog 冒烟测试（开发用）
 * 用 jsdom 加载前端脚本，stub 掉 CDN 库与 fetch，验证：
 *  - 清单解析 / 首页列表 / 文章详情渲染 / 标签过滤 / 404 / XSS 净化管线
 * 运行：node smoke-test.js
 */

const fs = require('fs');
const path = require('path');

let JSDOM;
try { JSDOM = require('jsdom').JSDOM; }
catch (e) {
  try { JSDOM = require('C:/Users/coole/.workbuddy-ai/binaries/node/workspace/node_modules/jsdom').JSDOM; }
  catch (e2) { console.error('缺少 jsdom，无法运行冒烟测试。'); process.exit(2); }
}

const ROOT = __dirname;
const SHELL = `<!DOCTYPE html><html><head></head><body>
<header><input id="search"/><button id="theme-toggle"></button></header>
<main id="app" tabindex="-1"></main>
<footer><span id="footer-copy"></span></footer>
</body></html>`;

const dom = new JSDOM(SHELL, { url: 'http://localhost/', runScripts: 'dangerously', pretendToBeVisual: true });
const { window } = dom;
const settle = (ms) => new Promise(r => setTimeout(r, ms));

// ---- stubs（模拟 CDN 库的行为）----
window.marked = {
  setOptions() {},
  parse(md) {
    return String(md)
      .replace(/^### (.*)$/gm, '<h3>$1</h3>')
      .replace(/^## (.*)$/gm, '<h2>$1</h2>')
      .replace(/^# (.*)$/gm, '<h1>$1</h1>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .split('\n\n').map(p => '<p>' + p + '</p>').join('\n');
  }
};
window.DOMPurify = {
  addHook() {},
  sanitize(html) {
    return String(html)
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^ >]+)/gi, '');
  }
};
window.hljs = { highlightElement() {} };
window.fetch = async function (url) {
  const p = path.join(ROOT, decodeURIComponent(url));
  if (!fs.existsSync(p)) return { ok: false, status: 404, async text() { return ''; }, async json() { return {}; } };
  const body = fs.readFileSync(p, 'utf8');
  return { ok: true, status: 200, async text() { return body; }, async json() { return JSON.parse(body); } };
};

// ---- 按 index.html 顺序加载前端脚本 ----
const files = [
  'config.js', 'markdown.js', 'store.js', 'ui.js', 'router.js',
  'pages/home.js', 'pages/post.js', 'pages/tag.js', 'pages/about.js', 'pages/notfound.js', 'app.js'
];
for (const f of files) {
  const code = fs.readFileSync(path.join(ROOT, 'assets/js', f), 'utf8');
  const s = window.document.createElement('script');
  s.textContent = code;
  window.document.body.appendChild(s);
}

// ---- 断言 ----
let pass = 0, fail = 0;
function check(name, cond) {
  if (cond) { pass++; console.log('  ✅ ' + name); }
  else { fail++; console.log('  ❌ ' + name); }
}

(async function run() {
  await settle(400);

  check('SB 命名空间已初始化', !!window.SB && !!window.SB.store);
  check('清单解析出 5 篇已发布文章', window.SB.store.published().length === 5);
  check('标签集合非空', window.SB.store.tags().length > 0);
  check('store.filter("CTF") 命中 1 篇', window.SB.store.filter('CTF').length === 1);

  // 首页
  window.SB.router.go('#/');
  await settle(200);
  const cards = window.document.querySelectorAll('#app .post-card');
  check('首页渲染 5 张卡片', cards.length === 5);
  check('首页含 hero 标题', !!window.document.querySelector('#app .hero h1'));
  check('首页含标签云', window.document.querySelectorAll('#app .tag-cloud .tag-pill').length > 0);

  // 文章详情
  window.SB.router.go('#/post/1005-ctf-sql-injection-waf');
  await settle(200);
  const article = window.document.querySelector('#app article.prose');
  check('文章详情渲染 prose 容器', !!article);
  check('Markdown 标题已转换(<h2>)', !!window.document.querySelector('#app article.prose h2'));
  check('文章详情含上一篇/下一篇导航', window.document.querySelectorAll('#app .pager a').length === 2);

  // XSS 净化管线（依赖 DOMPurify.sanitize 被调用）
  const xss = window.SB.md.render('hi <script>alert(1)</script> <img src=x onerror=alert(1)>');
  check('渲染去除 <script>', !/<script/i.test(xss));
  check('渲染去除 onerror 属性', !/onerror/i.test(xss));

  // 标签页
  window.SB.router.go('#/tag/CTF');
  await settle(200);
  check('标签页按标签过滤（1 篇）', window.document.querySelectorAll('#app .post-card').length === 1);

  // 404
  window.SB.router.go('#/no-such-page');
  await settle(200);
  check('未知路由显示 404', /404/.test(window.document.querySelector('#app .empty').textContent || ''));

  console.log('\n结果：' + pass + ' 通过 / ' + fail + ' 失败');
  process.exit(fail ? 1 : 0);
})();

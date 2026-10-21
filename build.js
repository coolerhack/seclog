#!/usr/bin/env node
'use strict';

/**
 * SecLog 构建脚本（零依赖）
 * 扫描 content/posts/*.md，解析 frontmatter，生成 content/posts/manifest.json。
 * 用法：node build.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const POSTS_DIR = path.join(ROOT, 'content', 'posts');
const MANIFEST = path.join(POSTS_DIR, 'manifest.json');

function parseFrontmatter(raw) {
  const m = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
  if (!m) return { meta: {}, body: raw };
  const meta = {};
  const lines = m[1].split('\n');
  let listKey = null;
  for (const line of lines) {
    if (listKey) {
      const item = line.trim().replace(/^-\s*/, '').replace(/^["']|["']$/g, '');
      if (item) meta[listKey].push(item);
      if (!line.startsWith(' ') && !line.startsWith('-')) listKey = null;
      continue;
    }
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    if (val === '') { listKey = key; meta[key] = []; continue; }
    if (val.startsWith('[') && val.endsWith(']')) {
      meta[key] = val.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
    } else if (/^(true|false)$/i.test(val)) {
      meta[key] = val.toLowerCase() === 'true';
    } else if (/^-?\d+(\.\d+)?$/.test(val)) {
      meta[key] = Number(val);
    } else {
      meta[key] = val.replace(/^["']|["']$/g, '');
    }
  }
  return { meta, body: raw.slice(m[0].length) };
}

function makeExcerpt(body, max) {
  max = max || 120;
  const text = body
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)
    .find(l => !/^#{1,6}\s/.test(l) && !/^```/.test(l) && !/^>/ .test(l) && !/^[-*]\s/.test(l));
  if (!text) return '';
  let clean = text
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_]/g, '')
    .trim();
  return clean.length > max ? clean.slice(0, max) + '…' : clean;
}

function main() {
  if (!fs.existsSync(POSTS_DIR)) {
    console.error('未找到目录：' + POSTS_DIR);
    process.exit(1);
  }
  const files = fs.readdirSync(POSTS_DIR)
    .filter(f => f.endsWith('.md'))
    .sort();

  const posts = files.map((file, i) => {
    const full = path.join(POSTS_DIR, file);
    const raw = fs.readFileSync(full, 'utf8');
    const { meta, body } = parseFrontmatter(raw);
    const slug = meta.slug || file.replace(/\.md$/, '');
    const id = meta.id != null ? meta.id : (parseInt(slug, 10) || i + 1);
    const stat = fs.statSync(full);
    const date = meta.date || stat.mtime.toISOString().slice(0, 10);
    const tags = Array.isArray(meta.tags) ? meta.tags : (meta.tags ? [meta.tags] : []);
    const excerpt = meta.excerpt || makeExcerpt(body);
    return {
      id,
      slug,
      title: meta.title || slug,
      date,
      tags,
      status: meta.status || 'published',
      author: meta.author || null,
      cover: meta.cover || null,
      excerpt,
      file: 'content/posts/' + file
    };
  });

  posts.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  const out = {
    generatedAt: new Date().toISOString(),
    count: posts.length,
    posts
  };

  fs.writeFileSync(MANIFEST, JSON.stringify(out, null, 2) + '\n', 'utf8');
  console.log('✓ 已生成 manifest.json，共 ' + posts.length + ' 篇文章：');
  posts.forEach(p => console.log('  - [' + p.date + '] ' + p.title + '  (' + p.slug + ')'));
}

main();

window.SB = window.SB || {};

SB.store = (function () {
  var manifest = null;
  var aboutCache = null;
  var postCache = {};

  function stripHtml(s) {
    var d = document.createElement('div');
    d.textContent = s == null ? '' : s;
    return d.textContent;
  }

  function stripFrontmatter(raw) {
    var m = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
    return m ? raw.slice(m[0].length) : raw;
  }

  async function load() {
    var res = await fetch(SB.config.manifestPath, { cache: 'no-cache' });
    if (!res.ok) throw new Error('清单加载失败：HTTP ' + res.status);
    var data = await res.json();
    manifest = (data.posts || []).filter(function (p) { return p.status !== 'hidden'; });
  }

  function all() {
    return (manifest || []).slice().sort(function (a, b) {
      return (b.date || '').localeCompare(a.date || '');
    });
  }
  function published() {
    return all().filter(function (p) { return !p.status || p.status === 'published'; });
  }
  function get(slugOrId) {
    if (!manifest) return null;
    return manifest.find(function (p) {
      return p.slug === slugOrId || String(p.id) === String(slugOrId);
    }) || null;
  }
  function tags() {
    var map = {};
    (manifest || []).forEach(function (p) {
      (p.tags || []).forEach(function (t) { map[t] = (map[t] || 0) + 1; });
    });
    return Object.keys(map).sort();
  }
  function byTag(tag) {
    return published().filter(function (p) {
      return (p.tags || []).indexOf(tag) !== -1;
    });
  }
  function filter(q) {
    q = (q || '').trim().toLowerCase();
    if (!q) return published();
    return published().filter(function (p) {
      var hay = (p.title + ' ' + (p.tags || []).join(' ') + ' ' + (p.excerpt || '')).toLowerCase();
      return hay.indexOf(q) !== -1;
    });
  }

  async function postMarkdown(post) {
    if (postCache[post.slug]) return postCache[post.slug];
    var res = await fetch(post.file, { cache: 'no-cache' });
    if (!res.ok) throw new Error('文章加载失败：HTTP ' + res.status);
    var raw = await res.text();
    var body = stripFrontmatter(raw);
    postCache[post.slug] = body;
    return body;
  }

  async function about() {
    if (aboutCache !== null) return aboutCache;
    try {
      var res = await fetch(SB.config.aboutPath, { cache: 'no-cache' });
      aboutCache = res.ok ? await res.text() : '';
    } catch (e) { aboutCache = ''; }
    return aboutCache;
  }

  return {
    load: load,
    all: all,
    published: published,
    get: get,
    tags: tags,
    byTag: byTag,
    filter: filter,
    postMarkdown: postMarkdown,
    about: about,
    stripHtml: stripHtml
  };
})();

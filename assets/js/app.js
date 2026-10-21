window.SB = window.SB || {};

(function () {
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('seclog_theme', theme); } catch (e) { /* 忽略 */ }
  }

  function initTheme() {
    var saved = null;
    try { saved = localStorage.getItem('seclog_theme'); } catch (e) { /* 忽略 */ }
    if (!saved) {
      saved = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
    }
    applyTheme(saved);
  }

  function wireThemeToggle() {
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var cur = document.documentElement.getAttribute('data-theme');
      applyTheme(cur === 'dark' ? 'light' : 'dark');
    });
  }

  function wireSearch() {
    var input = document.getElementById('search');
    if (!input) return;
    input.addEventListener('input', SB.ui.debounce(function () {
      var q = input.value.trim();
      if (q) {
        if (location.hash.indexOf('#/') !== 0 || location.hash.indexOf('?q=') !== -1) {
          SB.router.go('#/?q=' + encodeURIComponent(q));
        } else {
          SB.router.go('#/?q=' + encodeURIComponent(q));
        }
      } else if (location.hash.indexOf('?q=') !== -1) {
        SB.router.go('#/');
      }
    }, 250));
  }

  function setFooter() {
    var el = document.getElementById('footer-copy');
    if (el) el.textContent = '© ' + new Date().getFullYear() + ' ' + (SB.config.author || 'SecLog') + ' · SecLog';
  }

  async function boot() {
    initTheme();
    setFooter();
    if (SB.md && SB.md.configure) SB.md.configure();

    try {
      await SB.store.load();
    } catch (e) {
      var app = document.getElementById('app');
      if (app) {
        app.innerHTML = '<div class="notice">文章清单加载失败（' + ((e && e.message) || e) +
          '）。请先运行 <code>node build.js</code> 生成 manifest.json，并通过 HTTP 服务（而非 file://）访问本站。</div>';
      }
      return;
    }

    SB.router.add(/^\/$/, SB.pages.home);
    SB.router.add(/^\/post\/(.+)$/, SB.pages.post);
    SB.router.add(/^\/tag\/(.+)$/, SB.pages.tag);
    SB.router.add(/^\/about$/, SB.pages.about);
    SB.router.setNotFound(SB.pages.notfound);

    wireThemeToggle();
    wireSearch();
    await SB.router.start(document.getElementById('app'));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

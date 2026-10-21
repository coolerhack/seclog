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

  function renderSidebar() {
    var el = document.getElementById('sidebar');
    if (!el) return;
    var ui = SB.ui, store = SB.store, cfg = SB.config;
    var postsCount = store.published().length;
    var tagsCount = store.tags().length;

    var termBar = ui.el('div', { class: 'term-bar' }, [
      ui.el('span', { class: 'win-dot' }),
      ui.el('span', { class: 'win-dot' }),
      ui.el('span', { class: 'win-dot' }),
      ui.el('span', { class: 'term-title', text: '~/seclog — zsh' })
    ]);
    var body = ui.el('div', { class: 'author-body' }, [
      ui.el('div', { class: 'author-avatar', text: '🛡️' }),
      ui.el('div', { class: 'author-name', text: cfg.author || 'SecLog' }),
      ui.el('div', { class: 'author-handle', text: '@' + (cfg.author || 'seclog').toLowerCase() }),
      ui.el('p', { class: 'author-bio', text: cfg.authorBio || '' })
    ]);
    var stats = ui.el('div', { class: 'author-stats' }, [
      ui.el('div', { class: 'stat' }, [ ui.el('span', { class: 'num', text: String(postsCount) }), ui.el('span', { class: 'label', text: '文章' }) ]),
      ui.el('div', { class: 'stat' }, [ ui.el('span', { class: 'num', text: String(tagsCount) }), ui.el('span', { class: 'label', text: '标签' }) ])
    ]);
    body.appendChild(stats);
    var links = ui.el('div', { class: 'author-links' });
    if (cfg.social && cfg.social.github) links.appendChild(ui.el('a', { href: cfg.social.github, target: '_blank', rel: 'noopener', text: '▸ GitHub' }));
    if (cfg.social && cfg.social.email) links.appendChild(ui.el('a', { href: 'mailto:' + cfg.social.email, text: '▸ Email' }));
    if (cfg.repo) links.appendChild(ui.el('a', { href: cfg.repo, target: '_blank', rel: 'noopener', text: '▸ 仓库' }));
    body.appendChild(links);
    var card = ui.el('div', { class: 'author-card' }, [ termBar, body ]);

    var sideBlock = ui.el('div', { class: 'side-block' }, [ ui.el('div', { class: 'side-title', text: '// 标签云' }) ]);
    var cloud = ui.el('div', { class: 'tag-cloud' });
    store.tags().forEach(function (t) { cloud.appendChild(ui.tagPill(t)); });
    sideBlock.appendChild(cloud);

    var frag = ui.el('div', {}, [ card, sideBlock ]);
    el.innerHTML = '';
    el.appendChild(frag);
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
    renderSidebar();
    await SB.router.start(document.getElementById('app'));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

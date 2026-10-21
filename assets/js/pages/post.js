window.SB = window.SB || {};
SB.pages = SB.pages || {};

function buildToc(article) {
  var heads = article.querySelectorAll('h2, h3');
  if (!heads.length) return null;
  var ul = document.createElement('ul');
  Array.prototype.forEach.call(heads, function (h, i) {
    if (!h.id) h.id = 'toc-' + i;
    var a = document.createElement('a');
    a.textContent = h.textContent;
    a.href = '#' + h.id;
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var t = document.getElementById(h.id);
      if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    var li = document.createElement('li');
    if (h.tagName === 'H3') li.className = 'h3';
    li.appendChild(a);
    ul.appendChild(li);
  });
  var nav = document.createElement('nav');
  nav.className = 'toc';
  var title = document.createElement('div');
  title.className = 'toc-title';
  title.textContent = '// 目录';
  nav.appendChild(title);
  nav.appendChild(ul);
  return nav;
}

SB.pages.post = async function (ctx) {
  var ui = SB.ui, store = SB.store, md = SB.md;
  var slug = ctx.params[0];
  var post = store.get(slug);
  if (!post) return ui.el('div', { class: 'empty', text: '文章不存在或已隐藏。' });

  var raw = await store.postMarkdown(post);
  var html = md.render(raw);

  var frag = ui.el('div');
  frag.appendChild(ui.el('a', { class: 'back-link', href: '#/', text: '← 返回首页' }));

  var header = ui.el('header', { class: 'post-header' }, [
    ui.el('h1', { text: post.title })
  ]);
  var meta = ui.el('div', { class: 'post-meta' }, [ ui.el('span', { text: ui.formatDate(post.date) }) ]);
  if (post.author) meta.appendChild(ui.el('span', { text: '作者：' + post.author }));
  header.appendChild(meta);
  var tagWrap = ui.el('div', { class: 'pc-tags', style: 'margin-top:8px' });
  (post.tags || []).forEach(function (t) { tagWrap.appendChild(ui.tagPill(t)); });
  header.appendChild(tagWrap);
  frag.appendChild(header);

  var article = ui.el('article', { class: 'prose' });
  article.innerHTML = html;

  var toc = buildToc(article);
  if (toc) {
    var wrap = ui.el('div', { class: 'post-layout' });
    wrap.appendChild(article);
    wrap.appendChild(toc);
    frag.appendChild(wrap);
  } else {
    frag.appendChild(article);
  }

  var all = store.published();
  var idx = all.findIndex(function (p) { return p.slug === post.slug; });
  var prev = idx > 0 ? all[idx - 1] : null;
  var next = idx < all.length - 1 ? all[idx + 1] : null;

  var pager = ui.el('nav', { class: 'pager' });
  if (prev) {
    pager.appendChild(ui.el('a', { href: '#/post/' + encodeURIComponent(prev.slug) }, [
      ui.el('span', { class: 'pager-label', text: '← 上一篇' }),
      ui.el('span', { class: 'pager-title', text: prev.title })
    ]));
  } else {
    pager.appendChild(ui.el('a', { class: 'disabled' }, [ ui.el('span', { class: 'pager-label', text: '没有更早的文章' }) ]));
  }
  if (next) {
    pager.appendChild(ui.el('a', { href: '#/post/' + encodeURIComponent(next.slug), style: 'text-align:right' }, [
      ui.el('span', { class: 'pager-label', text: '下一篇 →' }),
      ui.el('span', { class: 'pager-title', text: next.title })
    ]));
  } else {
    pager.appendChild(ui.el('a', { class: 'disabled', style: 'text-align:right' }, [ ui.el('span', { class: 'pager-label', text: '没有更新的文章' }) ]));
  }
  frag.appendChild(pager);
  return frag;
};

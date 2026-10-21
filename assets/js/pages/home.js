window.SB = window.SB || {};
SB.pages = SB.pages || {};

SB.pages.home = async function (ctx) {
  var ui = SB.ui, store = SB.store;
  var q = ctx.query.q || '';
  var posts = store.filter(q);
  var tags = store.tags();
  var frag = ui.el('div');

  var hero = ui.el('section', { class: 'hero' }, [
    ui.el('h1', { text: SB.config.title }),
    ui.el('p', { class: 'tagline', text: SB.config.tagline })
  ]);
  hero.appendChild(ui.el('div', { class: 'hero-meta' }, [
    ui.el('span', { class: 'tag-pill', text: store.published().length + ' 篇文章' }),
    ui.el('span', { class: 'tag-pill', text: tags.length + ' 个标签' })
  ]));
  frag.appendChild(hero);

  if (q) {
    frag.appendChild(ui.el('div', { class: 'notice', text: '搜索「' + q + '」找到 ' + posts.length + ' 篇' }));
  }

  if (tags.length) {
    var tc = ui.el('div', { class: 'tag-cloud' });
    tags.forEach(function (t) { tc.appendChild(ui.tagPill(t)); });
    frag.appendChild(ui.el('div', { class: 'section-title' }, [
      ui.el('h2', { text: '# 标签' }),
      ui.el('span', { class: 'count', text: String(tags.length) })
    ]));
    frag.appendChild(tc);
  }

  frag.appendChild(ui.el('div', { class: 'section-title' }, [
    ui.el('h2', { text: q ? '## 搜索结果' : '## 最新文章' }),
    ui.el('span', { class: 'count', text: posts.length + ' 篇' })
  ]));

  if (!posts.length) {
    frag.appendChild(ui.el('div', {
      class: 'empty',
      text: q ? '没有匹配的文章。' : '还没有发布文章，去 content/posts 放一篇 .md 吧。'
    }));
    return frag;
  }

  var list = ui.el('div', { class: 'post-list' });
  posts.forEach(function (p) {
    var card = ui.el('a', { class: 'post-card', href: '#/post/' + encodeURIComponent(p.slug) });
    card.appendChild(ui.el('div', { class: 'pc-top' }, [
      ui.el('h3', { text: p.title }),
      ui.el('span', { class: 'pc-date', text: ui.formatDate(p.date) })
    ]));
    if (p.excerpt) card.appendChild(ui.el('p', { class: 'pc-excerpt', text: p.excerpt }));
    var tagWrap = ui.el('div', { class: 'pc-tags' });
    (p.tags || []).slice(0, 6).forEach(function (t) { tagWrap.appendChild(ui.tagPill(t)); });
    card.appendChild(tagWrap);
    list.appendChild(card);
  });
  frag.appendChild(list);
  return frag;
};

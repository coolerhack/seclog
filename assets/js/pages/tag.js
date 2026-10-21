window.SB = window.SB || {};
SB.pages = SB.pages || {};

SB.pages.tag = async function (ctx) {
  var ui = SB.ui, store = SB.store;
  var tag = decodeURIComponent(ctx.params[0]);
  var posts = store.byTag(tag);
  var frag = ui.el('div');

  frag.appendChild(ui.el('a', { class: 'back-link', href: '#/', text: '← 返回首页' }));
  frag.appendChild(ui.el('div', { class: 'section-title' }, [
    ui.el('h2', { text: '# ' + tag }),
    ui.el('span', { class: 'count', text: posts.length + ' 篇' })
  ]));

  if (!posts.length) {
    frag.appendChild(ui.el('div', { class: 'empty', text: '该标签下暂无文章。' }));
    return frag;
  }

  var list = ui.el('div', { class: 'post-list' });
  posts.forEach(function (p) {
    var card = ui.el('a', { class: 'post-card', href: '#/post/' + encodeURIComponent(p.slug) }, [
      ui.el('div', { class: 'pc-top' }, [
        ui.el('h3', { text: p.title }),
        ui.el('span', { class: 'pc-date', text: ui.formatDate(p.date) })
      ])
    ]);
    if (p.excerpt) card.appendChild(ui.el('p', { class: 'pc-excerpt', text: p.excerpt }));
    list.appendChild(card);
  });
  frag.appendChild(list);
  return frag;
};

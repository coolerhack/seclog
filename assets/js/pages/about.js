window.SB = window.SB || {};
SB.pages = SB.pages || {};

SB.pages.about = async function () {
  var ui = SB.ui, store = SB.store, md = SB.md;
  var raw = await store.about();
  var frag = ui.el('div');
  frag.appendChild(ui.el('a', { class: 'back-link', href: '#/', text: '← 返回首页' }));
  var card = ui.el('div', { class: 'about-card prose' });
  card.innerHTML = raw
    ? md.render(raw)
    : '<p>关于页内容缺失（content/about.md）。</p>';
  frag.appendChild(card);
  return frag;
};

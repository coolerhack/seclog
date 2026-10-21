window.SB = window.SB || {};
SB.pages = SB.pages || {};

SB.pages.notfound = function () {
  var ui = SB.ui;
  return ui.el('div', { class: 'empty' }, [
    ui.el('p', { text: '404 · 页面不存在' }),
    ui.el('a', { href: '#/', text: '回到首页' })
  ]);
};

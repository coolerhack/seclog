window.SB = window.SB || {};

SB.router = (function () {
  var routes = [];
  var notFoundHandler = null;
  var mountEl = null;

  function parse() {
    var hash = location.hash.replace(/^#/, '') || '/';
    var qi = hash.indexOf('?');
    var path = qi === -1 ? hash : hash.slice(0, qi);
    var query = {};
    if (qi !== -1) {
      hash.slice(qi + 1).split('&').forEach(function (kv) {
        if (!kv) return;
        var p = kv.split('=');
        query[decodeURIComponent(p[0])] = decodeURIComponent(p[1] || '');
      });
    }
    return { path: path, query: query };
  }

  function match(path) {
    for (var i = 0; i < routes.length; i++) {
      var m = path.match(routes[i].re);
      if (m) return { handler: routes[i].handler, params: m.slice(1) };
    }
    return null;
  }

  function updateNav(path) {
    document.querySelectorAll('.nav a[data-route]').forEach(function (a) {
      var r = a.getAttribute('data-route');
      var active = (r === 'home' && (path === '/' || path === '')) ||
                   (r === 'about' && path.indexOf('/about') === 0);
      a.classList.toggle('active', active);
    });
  }

  async function resolve() {
    var ctx = parse();
    var m = match(ctx.path);
    var node;
    try {
      if (m) node = await m.handler({ params: m.params, query: ctx.query, path: ctx.path });
      else if (notFoundHandler) node = await notFoundHandler(ctx);
      else node = SB.ui.el('div', { class: 'empty', text: '页面不存在' });
    } catch (e) {
      node = SB.ui.el('div', { class: 'notice', text: '加载出错：' + ((e && e.message) || e) });
    }
    mountEl.innerHTML = '';
    if (node) mountEl.appendChild(node);
    if (SB.md && SB.md.highlight) SB.md.highlight(mountEl);
    updateNav(ctx.path);
    window.scrollTo(0, 0);
  }

  function add(re, handler) { routes.push({ re: re, handler: handler }); }
  function setNotFound(h) { notFoundHandler = h; }
  function start(el) {
    mountEl = el;
    window.addEventListener('hashchange', resolve);
    return resolve();
  }
  function go(path) { location.hash = path; }

  return { add: add, setNotFound: setNotFound, start: start, go: go, parse: parse };
})();

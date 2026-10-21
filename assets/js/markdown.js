window.SB = window.SB || {};

SB.md = (function () {
  function configure() {
    if (window.marked && typeof marked.setOptions === 'function') {
      marked.setOptions({ gfm: true, breaks: false, headerIds: true, mangle: false });
    }
    if (window.DOMPurify) {
      DOMPurify.addHook('afterSanitizeAttributes', function (node) {
        if (node.tagName === 'A' && node.getAttribute('href')) {
          node.setAttribute('target', '_blank');
          node.setAttribute('rel', 'noopener noreferrer');
        }
      });
    }
  }

  function render(rawMarkdown) {
    if (!window.marked) {
      // 降级：marked 未加载（如离线）时展示纯文本
      var pre = document.createElement('pre');
      pre.style.whiteSpace = 'pre-wrap';
      pre.textContent = rawMarkdown || '';
      return pre.outerHTML;
    }
    var html = marked.parse(rawMarkdown || '');
    if (window.DOMPurify) {
      return DOMPurify.sanitize(html, {
        ADD_ATTR: ['target', 'rel'],
        FORBID_TAGS: ['style', 'iframe'],
        FORBID_ATTR: ['onerror', 'onload', 'onclick']
      });
    }
    return html;
  }

  function highlight(container) {
    if (!window.hljs) return;
    container.querySelectorAll('pre code').forEach(function (block) {
      try { hljs.highlightElement(block); } catch (e) { /* 忽略单语言高亮失败 */ }
    });
  }

  return { configure: configure, render: render, highlight: highlight };
})();

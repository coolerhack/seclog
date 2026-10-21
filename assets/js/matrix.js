window.SB = window.SB || {};

SB.matrix = (function () {
  var canvas = null, ctx = null, raf = null, cols = [], fontSize = 14;
  var chars = '01ｱｲｳｴｵｶｷｸｹｺ<>{}[]/*-+=$#@%&ABCDEF硒安漏洞渗透防防护权提权RCEXSSSQL'.split('');
  var running = false;

  function color() {
    var s = getComputedStyle(document.documentElement);
    var accent = s.getPropertyValue('--accent').trim() || '#ffb000';
    return accent;
  }

  function resize() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    var n = Math.floor(canvas.width / fontSize);
    cols = [];
    for (var i = 0; i < n; i++) cols[i] = Math.random() * -canvas.height;
  }

  function frame() {
    if (!ctx) return;
    ctx.fillStyle = 'rgba(10, 8, 5, 0.08)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = fontSize + 'px ui-monospace, monospace';
    var c = color();
    for (var i = 0; i < cols.length; i++) {
      var ch = chars[(Math.random() * chars.length) | 0];
      var x = i * fontSize;
      var y = cols[i];
      // 头部亮、尾部暗
      ctx.fillStyle = Math.random() > 0.975 ? '#fff' : c;
      ctx.fillText(ch, x, y);
      if (y > canvas.height && Math.random() > 0.975) cols[i] = 0;
      else cols[i] = y + fontSize;
    }
    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (running) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    canvas = document.createElement('canvas');
    canvas.className = 'matrix-canvas';
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
    running = true;
    frame();
  }

  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
    canvas = ctx = null;
  }

  return { start: start, stop: stop };
})();

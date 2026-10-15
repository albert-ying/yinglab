(function () {
  'use strict';
  // An alternate art series can be shown with ?art=tang; image names differ only by prefix.
  if (document.documentElement.getAttribute('data-art') === 'tang') {
    Array.prototype.forEach.call(document.querySelectorAll('img[src*="assets/img/uk-"], img[src*="assets/img/p-"]'), function (im) {
      im.src = im.getAttribute('src').replace('assets/img/uk-', 'assets/img/tang-').replace('assets/img/p-', 'assets/img/p-tang-').replace(/\.webp(\?.*)?$/, '.webp?v=t5');
    });
  }
  var NS = 'http://www.w3.org/2000/svg';

  function el(name, attrs, parent, text) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (text != null) n.textContent = text;
    if (parent) parent.appendChild(n);
    return n;
  }

  /* ---------- Hero: lifespan on a log axis ---------- */

  // Maximum recorded lifespan in years (AnAge). Bowhead is an indirect estimate.
  var HUMAN = 122;
  var SPECIES = [
    { key: 'mouse', name: 'House mouse', years: 4, h: 24, lift: 22, hv: 20 },
    { key: 'naked-mole-rat', name: 'Naked mole-rat', years: 31, h: 24, lift: 22, hv: 20 },
    { key: 'human', name: 'Human', years: HUMAN, h: 62, lift: 22, hv: 30, anchor: 'end' },
    { key: 'bowhead', name: 'Bowhead whale', years: 211, h: 44, lift: 138, hv: 20 },
    { key: 'shark', name: 'Greenland shark', years: 392, h: 15, lift: 64, hv: 12 }
  ];
  var HUMAN_SHAPE = { w: 24, h: 62, d: 'M4 16 Q4 12.5 8 12.5 H16 Q20 12.5 20 16 V36 H17.6 V19 H16.8 V62 H12.6 V40 H11.4 V62 H7.2 V19 H6.4 V36 H4 Z M12 0.8 A5.2 5.2 0 1 1 11.99 0.8 Z' };
  var MAX = 2400;
  var TICKS = [[1, '1 year'], [10, '10'], [100, '100'], [1000, '1,000 years']];

  function t(v) { return Math.log10(v) / Math.log10(MAX); }
  function shape(key) { return key === 'human' ? HUMAN_SHAPE : (window.SPECIES_SHAPES || {})[key]; }

  function drawShape(g, s, x, y, height, d) {
    var sh = shape(s.key);
    if (!sh) return 0;
    var k = height / sh.h;
    // The entrance animates transform, so it sits on a wrapper and leaves the placement transform alone.
    var w = el('g', { class: 'ax-in' }, g);
    w.style.setProperty('--d', d + 's');
    el('path', { d: sh.d, class: 'ax-shape', 'fill-rule': 'evenodd', transform: 'translate(' + x + ' ' + y + ') scale(' + k + ')' }, w);
    return sh.w * k;
  }

  function renderHorizontal(host, W) {
    var H = 330, y0 = 232, pad = 10, span = W - pad * 2;
    var X = function (v) { return pad + t(v) * span; };
    var svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, width: W, height: H, 'aria-hidden': 'true' }, host);

    // The solid axis ends at the longest measured lifespan; beyond it only the dashed extension continues.
    var line = el('line', { x1: X(1), y1: y0, x2: X(211), y2: y0, class: 'ax-line' }, svg);
    line.style.setProperty('--len', (X(211) - X(1)).toFixed(0));

    TICKS.forEach(function (tk) {
      var x = X(tk[0]);
      var g = el('g', { class: 'ax-in' }, svg);
      g.style.setProperty('--d', (0.2 + 1.5 * t(tk[0]) / t(1000)) + 's');
      el('line', { x1: x, y1: y0 - 5, x2: x, y2: y0 + 5, class: 'ax-tick' }, g);
      el('text', { x: tk[0] === 1000 ? x + 5 : x, y: y0 + 26, class: 'ax-ticklabel', 'text-anchor': tk[0] === 1 ? 'start' : (tk[0] === 1000 ? 'end' : 'middle') }, g, tk[1]);
    });

    SPECIES.forEach(function (s) {
      var x = X(s.years), d = 0.3 + 1.5 * t(s.years) / t(1000);
      var sh = shape(s.key), w = sh ? sh.w * s.h / sh.h : 0;
      var bottom = y0 - s.lift, top = bottom - s.h;
      var g = el('g', {}, svg);
      var lead = el('line', { x1: x, y1: y0 - 6, x2: x, y2: bottom + 6, class: 'ax-lead ax-in' }, g);
      lead.style.setProperty('--d', d + 's');
      var dot = el('circle', { cx: x, cy: y0, r: 4, class: 'ax-dot ax-in' }, g);
      dot.style.setProperty('--d', d + 's');
      drawShape(g, s, x - w / 2, top, s.h, d + 0.1);
      var lx = s.anchor === 'end' ? x - w / 2 - 12 : x;
      var ly = s.anchor === 'end' ? bottom - 26 : top - 28;
      var label = el('g', { class: 'ax-in' }, g);
      label.style.setProperty('--d', (d + 0.2) + 's');
      el('text', { x: lx, y: ly, class: 'ax-name', 'text-anchor': s.anchor || 'middle' }, label, s.name);
      el('text', { x: lx, y: ly + 18, class: 'ax-years', 'text-anchor': s.anchor || 'middle' }, label, s.years + ' years');
    });

    var xa = X(HUMAN), xb = X(HUMAN * 10);
    el('line', { x1: xa, y1: y0, x2: xb - 9, y2: y0, class: 'ax-ext' }, svg);
    el('circle', { cx: xb, cy: y0, r: 7, class: 'ax-halo' }, svg);
    var goal = el('g', { class: 'ax-in' }, svg);
    goal.style.setProperty('--d', '3s');
    el('circle', { cx: xb, cy: y0, r: 7, class: 'ax-goal' }, goal);
    var by = y0 + 50;
    el('path', { d: 'M' + xa + ' ' + (by - 7) + ' V' + by + ' H' + xb + ' V' + (by - 7), class: 'ax-bracket' }, goal);
    el('text', { x: (xa + xb) / 2, y: by + 22, class: 'ax-goal-label', 'text-anchor': 'middle' }, goal, 'One order of magnitude');
  }

  function renderVertical(host, W) {
    var x0 = 14, top = 14, span = 520, H = 558;
    var Y = function (v) { return top + t(v) * span; };
    var svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, width: W, height: H, 'aria-hidden': 'true' }, host);

    var line = el('line', { x1: x0, y1: Y(1), x2: x0, y2: Y(211), class: 'ax-line' }, svg);
    line.style.setProperty('--len', (Y(211) - Y(1)).toFixed(0));

    TICKS.forEach(function (tk) {
      var y = Y(tk[0]);
      var g = el('g', { class: 'ax-in' }, svg);
      g.style.setProperty('--d', (0.2 + 1.5 * t(tk[0]) / t(1000)) + 's');
      el('line', { x1: x0 - 5, y1: y, x2: x0 + 5, y2: y, class: 'ax-tick' }, g);
      el('text', { x: x0 + 14, y: y + 4.5, class: 'ax-ticklabel' }, g, tk[1]);
    });

    var sx = 72;
    SPECIES.forEach(function (s) {
      var y = Y(s.years), d = 0.3 + 1.5 * t(s.years) / t(1000);
      var g = el('g', {}, svg);
      var lead = el('line', { x1: x0 + 6, y1: y, x2: sx - 8, y2: y, class: 'ax-lead ax-in' }, g);
      lead.style.setProperty('--d', d + 's');
      var dot = el('circle', { cx: x0, cy: y, r: 4, class: 'ax-dot ax-in' }, g);
      dot.style.setProperty('--d', d + 's');
      var w = drawShape(g, s, sx, y - s.hv / 2, s.hv, d + 0.1);
      var label = el('g', { class: 'ax-in' }, g);
      label.style.setProperty('--d', (d + 0.2) + 's');
      var lx = sx + Math.max(w, 20) + 12;
      el('text', { x: lx, y: y - 2, class: 'ax-name' }, label, s.name);
      el('text', { x: lx, y: y + 15, class: 'ax-years' }, label, s.years + ' years');
    });

    var ya = Y(HUMAN), yb = Y(HUMAN * 10);
    el('line', { x1: x0, y1: ya, x2: x0, y2: yb - 9, class: 'ax-ext' }, svg);
    el('circle', { cx: x0, cy: yb, r: 7, class: 'ax-halo' }, svg);
    var goal = el('g', { class: 'ax-in' }, svg);
    goal.style.setProperty('--d', '3s');
    el('circle', { cx: x0, cy: yb, r: 7, class: 'ax-goal' }, goal);
    el('text', { x: x0 - 8, y: yb + 30, class: 'ax-goal-label' }, goal, 'One order of magnitude');
  }

  var axis = document.getElementById('axis');
  var plot = document.getElementById('axis-plot');
  var lastMode = null, lastW = 0;
  function renderAxis() {
    if (!plot) return;
    var W = Math.round(plot.clientWidth);
    if (!W) return;
    var mode = window.matchMedia('(max-width: 760px)').matches ? 'v' : 'h';
    if (mode === lastMode && Math.abs(W - lastW) < 2) return;
    // Only the first render plays the sequence; later resizes redraw in place.
    if (lastMode !== null) axis.classList.remove('animate');
    lastMode = mode; lastW = W;
    plot.textContent = '';
    axis.classList.toggle('vertical', mode === 'v');
    (mode === 'v' ? renderVertical : renderHorizontal)(plot, W);
  }
  renderAxis();
  var rt;
  window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(renderAxis, 120); });

  /* ---------- Research loop ---------- */

  var STEPS = ['measure', 'model', 'nominate', 'design', 'test'];
  var LABELS = { measure: 'Measure', model: 'Model', nominate: 'Nominate', design: 'Design', test: 'Test' };
  var loopHost = document.getElementById('loop');
  var stepNodes = {};
  (function buildLoop() {
    var cx = 230, cy = 210, r = 128;
    var svg = el('svg', { viewBox: '0 0 460 420' }, loopHost);
    el('circle', { cx: cx, cy: cy, r: r, class: 'lp-ring' }, svg);
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // A point travels the ring clockwise from Measure, the direction the loop runs.
      var orbit = el('circle', { r: 3.5, class: 'lp-orbit' }, svg);
      el('animateMotion', { dur: '16s', repeatCount: 'indefinite', path: 'M' + cx + ' ' + (cy - r) + ' a' + r + ' ' + r + ' 0 1 1 -0.01 0 Z' }, orbit);
    }
    var pt = function (deg, rad) { var a = deg * Math.PI / 180; return [cx + rad * Math.cos(a), cy + rad * Math.sin(a)]; };
    STEPS.forEach(function (s, i) {
      var a0 = -90 + i * 72, a1 = a0 + 72;
      var g = el('g', { class: 'lp-step', 'data-step': s }, svg);
      var p0 = pt(a0 + 5, r), p1 = pt(a1 - 5, r);
      el('path', { d: 'M' + p0[0].toFixed(1) + ' ' + p0[1].toFixed(1) + ' A' + r + ' ' + r + ' 0 0 1 ' + p1[0].toFixed(1) + ' ' + p1[1].toFixed(1), class: 'lp-arc' }, g);
      // direction marker at the middle of each arc
      var m = pt(a0 + 36, r), ang = a0 + 36 + 90;
      el('path', { d: 'M-5 -4 L4 0 L-5 4 Z', class: 'lp-arrow', transform: 'translate(' + m[0].toFixed(1) + ' ' + m[1].toFixed(1) + ') rotate(' + ang + ')' }, svg);
      var n = pt(a0, r);
      el('circle', { cx: n[0].toFixed(1), cy: n[1].toFixed(1), r: 7, class: 'lp-node' }, g);
      var l = pt(a0, r + 26);
      var anchor = Math.abs(l[0] - cx) < 10 ? 'middle' : (l[0] > cx ? 'start' : 'end');
      el('text', { x: l[0].toFixed(1), y: (l[1] + 5).toFixed(1), class: 'lp-label', 'text-anchor': anchor }, g, LABELS[s]);
      stepNodes[s] = g;
    });
    el('text', { x: cx, y: cy - 6, class: 'lp-center', 'text-anchor': 'middle' }, svg, 'Each result returns');
    el('text', { x: cx, y: cy + 18, class: 'lp-center', 'text-anchor': 'middle' }, svg, 'to the model');
  })();

  var cards = Array.prototype.slice.call(document.querySelectorAll('#directions article'));
  function activate(card) {
    cards.forEach(function (c) { c.classList.toggle('on', c === card); });
    var on = card ? card.getAttribute('data-steps').split(' ') : [];
    STEPS.forEach(function (s) { stepNodes[s].classList.toggle('on', on.indexOf(s) !== -1); });
  }
  cards.forEach(function (c) {
    c.addEventListener('mouseenter', function () { activate(c); });
    c.addEventListener('click', function () { activate(c); });
  });
  activate(cards[0]);

  /* ---------- Work and publications ---------- */

  function h(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function link(text, url, cls) {
    var a = h('a', cls, text);
    a.href = url; a.rel = 'noopener';
    return a;
  }

  var workList = document.getElementById('work-list');
  (workList ? window.LAB_WORK || [] : []).forEach(function (w) {
    var item = h('article', 'work-item');
    item.appendChild(h('h3', null, w.name));
    item.appendChild(h('span', 'work-status', w.status));
    item.appendChild(h('span', 'work-kind', w.kind));
    item.appendChild(h('p', null, w.text));
    var ls = h('div', 'work-links');
    w.links.forEach(function (l) { ls.appendChild(link(l[0], l[1])); });
    item.appendChild(ls);
    workList.appendChild(item);
  });

  var pubList = document.getElementById('pub-list');
  // Each paper is a full-width band of its painting with the title on a plate in the middle; it opens a detail view.
  var dlg = document.getElementById('pub-dialog');
  var TANGART = document.documentElement.getAttribute('data-art') === 'tang';
  (window.LAB_PUBS || []).forEach(function (p, k) {
    var li = h('li', 'pub');
    li.setAttribute('data-tag', p.tag);
    var band = h('button', 'pub-band'); band.type = 'button';
    var art = TANGART && p.img ? p.img.replace('assets/img/paper-', 'assets/img/tang-paper-') : p.img;
    p.art = art;
    if (art) band.style.backgroundImage = 'url(' + art.replace('.webp', '-wide.webp') + '?v=t4), url(' + art + '?v=t4)';
    var plate = h('span', 'pub-plate');
    plate.appendChild(h('span', 'pub-meta', p.venue + ' · ' + p.year + (p.preprint ? ' · Preprint' : '')));
    plate.appendChild(h('span', 'pub-title', p.title));
    var a = h('span', 'pub-authors');
    p.authors.split(/(Ying, K\.)/).forEach(function (part) { a.appendChild(part === 'Ying, K.' ? h('b', null, part) : document.createTextNode(part)); });
    plate.appendChild(a);
    if (TANGART) { li.appendChild(band); li.appendChild(plate); plate.addEventListener('click', function () { openPub(p); }); plate.classList.add('pub-under'); }
    else band.appendChild(plate);
    band.setAttribute('aria-label', p.title + ', ' + p.venue + ' ' + p.year + '. Open details.');
    band.addEventListener('click', function () { openPub(p); });
    if (!TANGART) li.appendChild(band);
    pubList.appendChild(li);
  });
  function openPub(p) {
    if (!dlg) { window.open(p.url, '_blank', 'noopener'); return; }
    dlg.querySelector('.pd-img').src = p.art ? p.art + '?v=t4' : '';
    dlg.querySelector('.pd-meta').textContent = p.venue + ' · ' + p.year + (p.preprint ? ' · Preprint' : '');
    dlg.querySelector('.pd-title').textContent = p.title;
    var au = dlg.querySelector('.pd-authors'); au.textContent = '';
    p.authors.split(/(Ying, K\.)/).forEach(function (part) { au.appendChild(part === 'Ying, K.' ? h('b', null, part) : document.createTextNode(part)); });
    dlg.querySelector('.pd-finding').textContent = p.finding || '';
    dlg.querySelector('.pd-link').href = p.url;
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
  }
  if (dlg) {
    dlg.querySelector('.pd-close').addEventListener('click', function () { dlg.close(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  }

  var filters = Array.prototype.slice.call(document.querySelectorAll('.filter button'));
  filters.forEach(function (b) {
    b.addEventListener('click', function () {
      var f = b.getAttribute('data-filter');
      filters.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      Array.prototype.forEach.call(pubList.children, function (li) {
        li.hidden = f !== 'all' && li.getAttribute('data-tag') !== f;
      });
    });
  });

  /* ---------- Navigation state ---------- */

  var nav = document.getElementById('nav');
  var navLinks = Array.prototype.slice.call(nav.querySelectorAll('nav a'));
  function onScroll() {
    // While the hero film is on screen it decides when the bar turns to paper.
    var hero = document.getElementById('top');
    if (hero.classList.contains('is-film') && window.scrollY < hero.offsetHeight - window.innerHeight) return;
    nav.classList.toggle('scrolled', window.scrollY > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        // Sections without a nav link (hero, mission, scales) clear the marker.
        navLinks.forEach(function (a) {
          var id = { brain: 'research', agents: 'research', 'directions-sec': 'research' }[e.target.id] || e.target.id;
          if (a.getAttribute('href') === '#' + id) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['top', 'mission', 'research', 'brain', 'agents', 'directions-sec', 'publications', 'people', 'join'].forEach(function (id) {
      var s = document.getElementById(id);
      if (s) io.observe(s);
    });
  }
  /* ---------- Scroll reveal ---------- */

  (function reveal() {
    var sel = 'main section:not(.hero) h2, main section:not(.hero) .label, .section-lede, .prose, .statement, .lineup, .directions article, .loop, .tenets > div, .work-item, .pub, .portrait, .pi-name, .pi-role, .links, .founding, .values li, .button, .join-lede, .join-note, .filter';
    var nodes = Array.prototype.slice.call(document.querySelectorAll(sel));
    var extra = Array.prototype.slice.call(document.querySelectorAll('.scales-fig, .axis'));
    if (!('IntersectionObserver' in window)) {
      nodes.concat(extra).forEach(function (n) { n.classList.add('in'); });
      return;
    }
    var seen = new Map();
    nodes.forEach(function (n) {
      var k = seen.get(n.parentNode) || 0;
      seen.set(n.parentNode, k + 1);
      n.setAttribute('data-reveal', '');
      n.style.setProperty('--i', Math.min(k, 5));
    });
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        ro.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    var all = nodes.concat(extra);
    all.forEach(function (n) { ro.observe(n); });
    // Safety net: anything already on screen after a jump (anchor link, restored scroll) is shown.
    var st;
    function sweep() {
      var vh = window.innerHeight;
      all.forEach(function (n) {
        if (n.classList.contains('in')) return;
        var r = n.getBoundingClientRect();
        if (r.top < vh && r.bottom > 0) n.classList.add('in');
      });
    }
    window.addEventListener('scroll', function () { clearTimeout(st); st = setTimeout(sweep, 160); }, { passive: true });
    window.addEventListener('load', sweep);
  })();
})();

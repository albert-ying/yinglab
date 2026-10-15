(function () {
  'use strict';
  // An alternate art series can be shown with ?art=tang; image names differ only by prefix.
  if (document.documentElement.getAttribute('data-art') === 'tang') {
    Array.prototype.forEach.call(document.querySelectorAll('img[src*="assets/img/uk-"], img[src*="assets/img/p-"]'), function (im) {
      im.src = im.getAttribute('src').replace('assets/img/uk-', 'assets/img/tang-').replace('assets/img/p-', 'assets/img/p-tang-').replace(/\.webp(\?.*)?$/, '.webp?v=t13');
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

  /* ---------- Research loop ---------- */

  var STEPS = ['measure', 'model', 'nominate', 'design', 'test'];
  var LABELS = { measure: 'Measure', model: 'Model', nominate: 'Nominate', design: 'Design', test: 'Test' };
  var loopHost = document.getElementById('loop');
  var stepNodes = {};
  (function buildLoop() {
    if (!loopHost) return;
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
    STEPS.forEach(function (s) { if (stepNodes[s]) stepNodes[s].classList.toggle('on', on.indexOf(s) !== -1); });
  }
  cards.forEach(function (c) {
    c.addEventListener('mouseenter', function () { activate(c); });
    c.addEventListener('click', function () { activate(c); });
  });
  if (cards.length) activate(cards[0]);

  /* ---------- Publications ---------- */

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

  var pubList = document.getElementById('pub-list');
  // Each paper is a full-width band of its painting with the text beneath; it opens a detail view.
  var dlg = document.getElementById('pub-dialog');
  var TANGART = document.documentElement.getAttribute('data-art') === 'tang';
  (window.LAB_PUBS || []).forEach(function (p, k) {
    var li = h('li', 'pub');
    li.setAttribute('data-tag', p.tag);
    var band = h('button', 'pub-band'); band.type = 'button';
    var art = TANGART && p.img ? p.img.replace('assets/img/paper-', 'assets/img/tang-paper-') : p.img;
    p.art = art;
    if (art) { var bi = h('img'); bi.alt = ''; bi.loading = 'lazy'; bi.decoding = 'async'; bi.width = 1600; bi.height = 614; bi.onerror = function () { this.remove(); }; bi.src = art.replace('.webp', '-wide.webp') + '?v=t12'; band.appendChild(bi); }
    var plate = h('span', 'pub-plate');
    var vline = h('span', 'pub-venue-line');
    vline.appendChild(h('b', 'pub-journal', p.venue));
    vline.appendChild(h('span', 'pub-meta', p.year + (p.preprint ? ' · Preprint' : '')));
    plate.appendChild(vline);
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
    dlg.querySelector('.pd-img').src = p.art ? p.art + '?v=t12' : '';
    var pm = dlg.querySelector('.pd-meta'); pm.textContent = '';
    pm.appendChild(h('b', 'pub-journal', p.venue)); pm.appendChild(h('span', 'pub-meta', p.year + (p.preprint ? ' · Preprint' : '')));
    dlg.querySelector('.pd-title').textContent = p.title;
    var au = dlg.querySelector('.pd-authors'); au.textContent = '';
    p.authors.split(/(Ying, K\.)/).forEach(function (part) { au.appendChild(part === 'Ying, K.' ? h('b', null, part) : document.createTextNode(part)); });
    dlg.querySelector('.pd-finding').textContent = p.finding || '';
    dlg.querySelector('.pd-link').href = p.url;
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
    dlg.scrollTop = 0; dlg.querySelector('.pd-close').focus();
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
    var sel = 'main section:not(.hero) h2, .deck, main section:not(.hero) .label, .section-lede, .prose, .theme figure, .theme h3, .track figure, .track h3, .brain-block figure, .brain-block h3, .directions article, .loop, .pub, .portrait, .pi-name, .pi-role, .links, .founding, .values li, .join-lede, .join-note, .filter';
    var nodes = Array.prototype.slice.call(document.querySelectorAll(sel));
    var extra = Array.prototype.slice.call(document.querySelectorAll('.scales-fig'));
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

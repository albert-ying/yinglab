/* Motion layer: line-by-line headlines, rules that draw in, eased wheel scrolling,
   and the hero film (a pinned WebGL scene whose camera is driven by scroll). */
(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var smooth = function (a, b, v) { var t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

  /* ---------- Headlines split into lines ---------- */

  var splitTargets = Array.prototype.slice.call(document.querySelectorAll('.hero h1, main section:not(.hero) h2, .statement'));
  splitTargets.forEach(function (n) { n.setAttribute('data-text', n.textContent.trim().replace(/\s+/g, ' ')); n.setAttribute('aria-label', n.getAttribute('data-text')); });
  function splitLines(node) {
    var words = node.getAttribute('data-text').split(' ');
    node.textContent = '';
    var spans = words.map(function (w, i) {
      var s = document.createElement('span');
      s.textContent = w + (i < words.length - 1 ? ' ' : '');
      s.style.display = 'inline-block';
      s.style.whiteSpace = 'pre';
      node.appendChild(s);
      return s;
    });
    var lines = [], top = null;
    spans.forEach(function (s) {
      var t = s.offsetTop;
      if (top === null || Math.abs(t - top) > 4) { lines.push(''); top = t; }
      lines[lines.length - 1] += s.textContent;
    });
    node.textContent = '';
    lines.forEach(function (text, i) {
      var ln = document.createElement('span'); ln.className = 'ln'; ln.setAttribute('aria-hidden', 'true');
      var inner = document.createElement('i'); inner.textContent = text.replace(/\s+$/, ''); inner.style.setProperty('--l', i);
      ln.appendChild(inner); node.appendChild(ln);
    });
  }
  function splitAll() { splitTargets.forEach(splitLines); }
  if (!reduced) {
    splitAll();
    var sw = window.innerWidth, st;
    window.addEventListener('resize', function () {
      if (window.innerWidth === sw) return;
      sw = window.innerWidth; clearTimeout(st); st = setTimeout(splitAll, 200);
    });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(splitAll);
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      var h1 = document.querySelector('.hero h1'); if (h1) h1.classList.add('lines-in');
    }); });
  }

  /* ---------- Rules draw in as each sheet arrives ---------- */

  var sections = Array.prototype.slice.call(document.querySelectorAll('main > section'));
  if ('IntersectionObserver' in window) {
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('ruled'); so.unobserve(e.target); } });
    }, { threshold: 0.04 });
    sections.forEach(function (s) { so.observe(s); });
  } else sections.forEach(function (s) { s.classList.add('ruled'); });

  /* ---------- Eased wheel scrolling (pointer devices only) ---------- */

  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var S = { target: window.scrollY, current: window.scrollY, on: fine && !reduced, busy: false };
  function maxScroll() { return document.documentElement.scrollHeight - window.innerHeight; }
  if (S.on) {
    document.documentElement.style.scrollBehavior = 'auto';
    window.addEventListener('wheel', function (e) {
      if (e.ctrlKey || e.metaKey) return;
      e.preventDefault();
      var unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1;
      if (!S.busy) { S.target = S.current = window.scrollY; }
      S.target = clamp(S.target + e.deltaY * unit, 0, maxScroll());
      if (!S.busy) { S.busy = true; requestAnimationFrame(glide); }
    }, { passive: false });
    // Anchor links travel the same way.
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a) return;
      var el = document.getElementById(a.getAttribute('href').slice(1));
      if (!el) return;
      e.preventDefault();
      S.current = window.scrollY;
      S.target = clamp(el.getBoundingClientRect().top + window.scrollY - (el.id === 'top' ? 0 : 60), 0, maxScroll());
      history.replaceState(null, '', a.getAttribute('href'));
      if (!S.busy) { S.busy = true; requestAnimationFrame(glide); }
    });
  }
  function glide() {
    var d = S.target - S.current;
    if (Math.abs(d) < 0.4) { S.current = S.target; window.scrollTo(0, S.current); S.busy = false; return; }
    S.current += d * 0.11;
    window.scrollTo(0, S.current);
    requestAnimationFrame(glide);
  }

  /* ---------- Hero film: a field of points that draws the engravings ---------- */

  var hero = document.getElementById('top');
  var canvas = document.getElementById('film');
  var nav = document.getElementById('nav');
  if (!hero || !canvas || reduced || window.innerWidth < 761) return;
  var gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'high-performance' });
  if (!gl) return;

  var N = window.innerWidth > 1500 ? 170000 : 130000;

  // Six drawings, each given to the same points. The first is the lifespan line; the rest are the scales.
  var ART = document.documentElement.getAttribute('data-art') === 'tang' ? 'p-tang-' : 'p-';
  // Where each figure sits in the procession image (fraction of its width), where the baseline is
  // (offset from the image centre as a fraction of its height) and where the drawn line ends.
  var TANG = ART === 'p-tang-';
  // baseline offset from the painting's centre (fraction of its height) and where the drawn line ends
  var LAY = TANG ? { base: 0.1923, right: 0.49 } : { base: 0.4576, right: 0.487 };
  var SOURCES = [
    { src: 'assets/img/' + ART + 'lineup.webp?v=t3', boostTo: 0.22, boost: 2.6 },   // the small animals get more points than their area would earn
    { src: 'assets/img/' + ART + (TANG ? 'brain' : 'species') + '.webp?v=t3' },   // Tang: the brain among the longest-lived species
    { src: 'assets/img/' + ART + 'human.webp?v=t3' },
    { src: 'assets/img/' + ART + 'tissue.webp?v=t3' },
    { src: 'assets/img/' + ART + 'cell.webp?v=t3' },
    { src: 'assets/img/' + ART + 'molecule.webp?v=t3' }
  ];

  /* The road. p is scroll progress through the hero, 0..1. Three perspectives, each passed through quickly:
     species (one sweep along the procession), scales (the points re-form from species to molecule) and the model
     (the points gather into a network). x is the place along the procession (0 left, 1 right); z is the push-in. */
  var STOPS = [
    { p: 0.00, x: 0.50, z: 1.00 },
    { p: 0.04, x: 0.50, z: 1.00 },
    { p: 0.10, x: 0.10, z: 1.75 },
    { p: 0.27, x: 0.92, z: 1.75 },
    { p: 0.32, x: 0.50, z: 1.00 },
    { p: 1.00, x: 0.50, z: 1.00 }
  ];
  // Which drawing the points hold: [p, stage]. 0 procession, 1-5 species to molecule, 6 the network.
  var STAGE = [[0, 0], [0.33, 0], [0.37, 1], [0.44, 1], [0.48, 2], [0.50, 2], [0.54, 3], [0.56, 3], [0.60, 4], [0.62, 4], [0.66, 5], [0.68, 5], [0.73, 6], [1, 6]];
  var BEATS = [
    { p: 0.185, name: 'Across species', sub: 'Maximum lifespan spans more than a hundredfold, from a 4-year mouse to a 507-year ocean quahog', w: 0.09 },
    { p: 0.405, name: 'Brain resilience', sub: 'The longest-lived species may have the most resilient brains', w: 0.045 },
    { p: 0.58, name: 'Across scales', sub: 'Human &nbsp;/&nbsp; tissue &nbsp;/&nbsp; cell &nbsp;/&nbsp; molecule', w: 0.11 },
    { p: 0.785, name: 'AI that does research', sub: 'Models and agents that learn from every species and scale, and propose what to test', w: 0.05, last: true }
  ];
  var PEND = 0.30;
  var SOAK_FROM = 0.84, SOAK_TO = 0.95;

  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function camera(p) {
    for (var i = 1; i < STOPS.length; i++) {
      if (p <= STOPS[i].p) {
        var a = STOPS[i - 1], b = STOPS[i], t = ease(clamp((p - a.p) / (b.p - a.p), 0, 1));
        return { x: a.x + (b.x - a.x) * t, z: a.z + (b.z - a.z) * t };
      }
    }
    var l = STOPS[STOPS.length - 1]; return { x: l.x, z: l.z };
  }
  function stageAt(p) {
    for (var i = 1; i < STAGE.length; i++) {
      if (p <= STAGE[i][0]) {
        var a = STAGE[i - 1], b = STAGE[i];
        return a[1] + (b[1] - a[1]) * clamp((p - a[0]) / (b[0] - a[0] || 1), 0, 1);
      }
    }
    return 6;
  }

  /* ---- programs ---- */

  function program(vsSrc, fsSrc) {
    function sh(type, src) {
      var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; }
      return s;
    }
    var v = sh(gl.VERTEX_SHADER, vsSrc), f = sh(gl.FRAGMENT_SHADER, fsSrc);
    if (!v || !f) return null;
    var p = gl.createProgram(); gl.attachShader(p, v); gl.attachShader(p, f); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) { console.warn(gl.getProgramInfoLog(p)); return null; }
    return p;
  }
  function uniforms(p, names) { var u = {}; names.forEach(function (n) { u[n] = gl.getUniformLocation(p, n); }); return u; }

  var NOISE = [
    'float hash(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }',
    'float vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);',
    '  return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y); }',
    'float fbm(vec2 p){ float v = 0.0, a = 0.5; for(int i=0;i<4;i++){ v += a*vnoise(p); p *= 2.03; a *= 0.5; } return v/0.9375; }'
  ].join('\n');

  // The sheet: painted blue that drifts, the open dotted rule, and the turn to paper.
  var GROUND = ART === 'p-tang-' ? 'vec3(0.753, 0.569, 0.357)' : 'vec3(1.0, 0.996, 0.988)';
  var PAPER = ART === 'p-tang-' ? 'vec3(0.937, 0.890, 0.796)' : 'vec3(0.949, 0.945, 0.929)';   // the section after the hero
  var GLOW = ART === 'p-tang-' ? 'vec3(0.07, 0.05, 0.02)' : 'vec3(0.04, 0.06, 0.10)';
  var ground = program(
    'attribute vec2 a; varying vec2 vUv; void main(){ vUv = a*0.5+0.5; gl_Position = vec4(a,0.,1.); }',
    ['precision highp float;', 'varying vec2 vUv;',
      'uniform vec2 uRes, uMouse; uniform float uTime, uSoak, uLineY, uLineX, uBeyond, uGrain, uTex;', NOISE,
      'void main(){',
      '  vec2 px = vec2(vUv.x, 1.0-vUv.y)*uRes;',
      '  float asp = uRes.x/uRes.y;',
      '  vec3 blue = ' + GROUND + ';',
      '  float drift = fbm(vec2(vUv.x*asp, vUv.y)*1.6 + vec2(uTime*0.012, -uTime*0.008));',
      '  float brush = fbm(vec2(vUv.x*asp*9.0, vUv.y*3.0) + 7.0);',
      '  vec3 col = blue*(1.0 + uTex*(0.25*(drift-0.5) + 0.07*(brush-0.5)));',
      // a soft pool of light follows the pointer
      '  float md = length((px - uMouse)/uRes.y);',
      '  col += ' + GLOW + '*exp(-md*md*9.0);',
      '  col += (hash(px + fract(uTime)*71.0) - 0.5)*uGrain;',
      '  if (px.x > uLineX) {',
      '    float onLine = 1.0 - smoothstep(0.6, 1.7, abs(px.y - uLineY));',
      '    float dash = step(0.5, fract((px.x - uLineX)/14.0));',
      '    col = mix(col, vec3(0.11), onLine*(1.0-dash)*uBeyond*0.9);',
      '  }',
      '  vec3 paper = ' + PAPER + ';',
      '  vec2 rr = (vUv - vec2(0.5, 0.5))*vec2(asp, 1.0);',
      '  float front = uSoak*(0.62*asp + 0.75) - length(rr) + (fbm(vUv*vec2(asp,1.0)*3.5 + 3.0)-0.5)*0.55 + (fbm(vUv*vec2(asp,1.0)*15.0)-0.5)*0.12;',
      '  float k = smoothstep(0.0, 0.035, front) * step(0.0001, uSoak);',
      '  float rim = (1.0 - smoothstep(0.0, 0.11, front)) * k;',
      '  col = mix(col, mix(paper, blue*0.9, rim*0.55), k);',
      '  gl_FragColor = vec4(col, 1.0);',
      '}'].join('\n'));

  // The points. Each carries its place in all six drawings and moves between them.
  var points = program(
    ['precision highp float;',
      'attribute vec4 aA, aB, aC, aR, aK0, aK1, aK2, aK3, aK4, aK5; attribute vec2 aN;',
      'uniform vec2 uRes, uOff0, uOffC, uMouse;',
      'uniform float uSc0, uScC, uS, uTime, uIntro, uPix, uFade, uSize, uBurst; uniform vec3 uFlight, uNetCol; uniform vec2 uOffN; uniform float uScN;',
      'varying float vAlpha; varying vec3 vCol;',
      'void main(){',
      '  vec2 p0 = aA.xy*uSc0 + uOff0;',
      '  vec2 p1 = aA.zw*uScC + uOffC, p2 = aB.xy*uScC + uOffC, p3 = aB.zw*uScC + uOffC, p4 = aC.xy*uScC + uOffC, p5 = aC.zw*uScC + uOffC, p6 = aN*uScN + uOffN;',
      // each point leaves and arrives on its own clock, so a drawing dissolves and gathers rather than slides
      '  float i = floor(uS); float t = uS - i;',
      '  float tt = smoothstep(aR.x*0.5, 0.5 + aR.x*0.5, t);',
      '  tt = tt*tt*(3.0-2.0*tt);',
      '  float s = i + tt;',
      '  vec2 pos = p0*max(0.0, 1.0-abs(s)) + p1*max(0.0, 1.0-abs(s-1.0)) + p2*max(0.0, 1.0-abs(s-2.0))',
      '           + p3*max(0.0, 1.0-abs(s-3.0)) + p4*max(0.0, 1.0-abs(s-4.0)) + p5*max(0.0, 1.0-abs(s-5.0)) + p6*max(0.0, 1.0-abs(s-6.0));',
      '  float mid = sin(3.14159*tt);',
      '  vCol = aK0.rgb*max(0.0, 1.0-abs(s)) + aK1.rgb*max(0.0, 1.0-abs(s-1.0)) + aK2.rgb*max(0.0, 1.0-abs(s-2.0))',
      '       + aK3.rgb*max(0.0, 1.0-abs(s-3.0)) + aK4.rgb*max(0.0, 1.0-abs(s-4.0)) + aK5.rgb*max(0.0, 1.0-abs(s-5.0)) + uNetCol*max(0.0, 1.0-abs(s-6.0));',
      // in flight a point lightens toward the colour of paper, so a dissolve reads as light, then settles into paint
      '  vCol = mix(vCol, uFlight, mid*0.55);',
      // in flight the points ride a slow turning current
      '  float ang = aR.y*6.2832 + uTime*0.35 + pos.y*0.0021 + pos.x*0.0013;',
      '  vec2 flow = vec2(cos(ang), sin(ang)) * (0.35 + aR.w) + vec2(sin(pos.y*0.006 + uTime*0.5), cos(pos.x*0.006 - uTime*0.4))*0.6;',
      '  pos += flow * mid * uRes.y * 0.13;',
      // at the start they come out of a scattered cloud and settle from left to right
      '  vec2 chaos = uRes*0.5 + (vec2(aR.y, aR.z)-0.5)*uRes*vec2(1.9, 2.3);',
      '  chaos += vec2(cos(aR.w*40.0 + uTime), sin(aR.x*40.0 + uTime*0.8))*uRes.y*0.05;',
      '  float lag = clamp(p0.x/uRes.x, 0.0, 1.0)*0.5 + aR.x*0.3;',
      '  float it = smoothstep(lag, lag + 0.2, uIntro);',
      '  it = 1.0 - pow(1.0 - it, 3.0);',
      '  pos = mix(chaos, pos, it);',
      // a faint tremor keeps the drawing alive
      '  pos += vec2(sin(uTime*1.3 + aR.y*90.0), cos(uTime*1.1 + aR.z*90.0)) * 0.55 * uPix;',
      // near the pointer the paint stirs slightly: a small swirl and a faint lift, not a push
      '  vec2 d = pos - uMouse; float dl = length(d) + 0.0001;',
      '  float rad = uRes.y*0.11;',
      '  float f = exp(-dl*dl/(rad*rad));',
      '  vec2 tang = vec2(-d.y, d.x)/dl;',
      '  pos += (tang*0.10 + (d/dl)*0.04) * f * rad * (0.6 + aR.w*0.6) * (1.0 + 0.4*sin(uTime*1.7 + aR.y*20.0));',
      // when the sheet turns to paper they scatter outward and go out
      '  vec2 away = pos - uRes*0.5;',
      '  pos += normalize(away + 0.001) * uBurst * uRes.y * (0.2 + aR.w*0.9);',
      '  gl_Position = vec4(pos.x/uRes.x*2.0-1.0, 1.0-pos.y/uRes.y*2.0, 0.0, 1.0);',
      '  gl_PointSize = uPix * uSize * (0.75 + aR.w*0.9) * (1.0 + mid*0.9 + f*0.3);',
      '  vAlpha = uFade * (0.62 + 0.38*aR.z) * (1.0 - mid*0.35) * (0.25 + 0.75*it);',
      '}'].join('\n'),
    ['precision mediump float;', 'varying float vAlpha; varying vec3 vCol;',
      'void main(){ float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.18, d) * vAlpha; gl_FragColor = vec4(vCol, a); }'].join('\n'));
  if (!ground || !points) return;

  var GU = uniforms(ground, ['uTex', 'uRes', 'uMouse', 'uTime', 'uSoak', 'uLineY', 'uLineX', 'uBeyond', 'uGrain']);
  var PU = uniforms(points, ['uNetCol', 'uOffN', 'uScN', 'uFlight', 'uRes', 'uOff0', 'uOffC', 'uMouse', 'uSc0', 'uScC', 'uS', 'uTime', 'uIntro', 'uPix', 'uFade', 'uSize', 'uBurst']);

  var quad = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  var pbuf = gl.createBuffer(), cbuf = gl.createBuffer(), nbuf = gl.createBuffer();
  var gA = gl.getAttribLocation(ground, 'a');
  var pA = ['aA', 'aB', 'aC', 'aR'].map(function (n) { return gl.getAttribLocation(points, n); });
  var nA = gl.getAttribLocation(points, 'aN');
  var cA = ['aK0', 'aK1', 'aK2', 'aK3', 'aK4', 'aK5'].map(function (n) { return gl.getAttribLocation(points, n); });

  /* ---- sample the drawings into point positions ---- */

  var seed = 20270101;
  function rnd() { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; }
  var aspect0 = 1536 / 391;

  function sample(img, opts) {
    // Returns N positions in a unit frame (height 1, centred on 0), denser where the engraving is lighter.
    var w = Math.min(img.naturalWidth, 1536), h = Math.round(w * img.naturalHeight / img.naturalWidth);
    var c = document.createElement('canvas'); c.width = w; c.height = h;
    var cx = c.getContext('2d', { willReadFrequently: true }); cx.drawImage(img, 0, 0, w, h);
    var px = cx.getImageData(0, 0, w, h).data, cdf = new Float32Array(w * h), acc = 0;
    var xmax = (opts.xmax || 1) * w;
    for (var y = 0, k = 0; y < h; y++) for (var x = 0; x < w; x++, k++) {
      var v = px[k * 4 + 3] / 255;
      v = (v < 0.25 || x > xmax) ? 0 : v;
      if (opts.boost && x < opts.boostTo * w) v *= opts.boost;
      acc += v; cdf[k] = acc;
    }
    var out = new Float32Array(N * 2), col = new Uint8Array(N * 4), asp = w / h;
    for (var n = 0; n < N; n++) {
      var r = rnd() * acc, lo = 0, hi = w * h - 1;
      while (lo < hi) { var mid = (lo + hi) >> 1; if (cdf[mid] < r) lo = mid + 1; else hi = mid; }
      out[n * 2] = ((lo % w + rnd()) / w - 0.5) * asp;
      out[n * 2 + 1] = (Math.floor(lo / w) + rnd()) / h - 0.5;
      col[n * 4] = px[lo * 4]; col[n * 4 + 1] = px[lo * 4 + 1]; col[n * 4 + 2] = px[lo * 4 + 2]; col[n * 4 + 3] = 255;
    }
    return { pos: out, col: col, aspect: asp };
  }

  var ready = false, introStart = 0;
  Promise.all(SOURCES.map(function (s) {
    return new Promise(function (res, rej) { var im = new Image(); im.onload = function () { res(im); }; im.onerror = rej; im.src = s.src; });
  })).then(function (imgs) {
    var sets = imgs.map(function (im, i) { return sample(im, SOURCES[i]); });
    aspect0 = sets[0].aspect;
    // Points are paired at random between drawings, so each change is a dissolve and not a slide.
    var data = new Float32Array(N * 16);
    for (var n = 0; n < N; n++) {
      var o = n * 16;
      for (var k = 0; k < 6; k++) { data[o + k * 2] = sets[k].pos[n * 2]; data[o + k * 2 + 1] = sets[k].pos[n * 2 + 1]; }
      data[o + 12] = rnd(); data[o + 13] = rnd(); data[o + 14] = rnd(); data[o + 15] = rnd();
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, pbuf); gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    // Each point also carries its colour in all six paintings.
    var cols = new Uint8Array(N * 24);
    for (var n2 = 0; n2 < N; n2++) for (var k2 = 0; k2 < 6; k2++) cols.set(sets[k2].col.subarray(n2 * 4, n2 * 4 + 4), n2 * 24 + k2 * 4);
    gl.bindBuffer(gl.ARRAY_BUFFER, cbuf); gl.bufferData(gl.ARRAY_BUFFER, cols, gl.STATIC_DRAW);
    // The last drawing is the model itself: a layered network. Points sit on its nodes and along its edges.
    var LAYERS = [6, 9, 9, 6, 1], nodes = [];
    LAYERS.forEach(function (cnt, li) { for (var q = 0; q < cnt; q++) nodes.push({ x: (li / (LAYERS.length - 1) - 0.5) * 1.6, y: (cnt === 1 ? 0 : (q / (cnt - 1) - 0.5)) * 0.9, l: li }); });
    var edges = [];
    nodes.forEach(function (a) { nodes.forEach(function (b) { if (b.l === a.l + 1) edges.push([a, b]); }); });
    var net = new Float32Array(N * 2);
    for (var n3 = 0; n3 < N; n3++) {
      var x, y;
      if (rnd() < 0.42) { var nd = nodes[Math.floor(rnd() * nodes.length)], ang = rnd() * 6.2832, rr = Math.sqrt(rnd()) * (nd.l === 4 ? 0.055 : 0.032); x = nd.x + Math.cos(ang) * rr; y = nd.y + Math.sin(ang) * rr; }
      else { var e = edges[Math.floor(rnd() * edges.length)], u = rnd(); x = e[0].x + (e[1].x - e[0].x) * u; y = e[0].y + (e[1].y - e[0].y) * u + (rnd() - 0.5) * 0.004; }
      net[n3 * 2] = x; net[n3 * 2 + 1] = y;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, nbuf); gl.bufferData(gl.ARRAY_BUFFER, net, gl.STATIC_DRAW);
    ready = true; introStart = performance.now() + 200;
    hero.classList.add('is-film');
    if (!reduced) splitAll();
    resize(); start();
  }).catch(function () { /* the static hero stays */ });

  /* ---- captions ---- */

  var stage = hero.querySelector('.stage');
  var copy = hero.querySelector('.hero-copy'), foot = hero.querySelector('.hero-foot'), cue = hero.querySelector('.scroll-cue');
  var caps = BEATS.map(function (b) {
    var el = document.createElement('p'); el.className = 'film-cap'; el.setAttribute('aria-hidden', 'true');
    el.innerHTML = '<b>' + b.name + '</b><span>' + b.sub + '</span>';
    stage.appendChild(el);
    return { el: el, beat: b };
  });
  var meter = document.createElement('div'); meter.className = 'film-meter'; meter.setAttribute('aria-hidden', 'true');
  meter.innerHTML = '<i></i>'; stage.appendChild(meter);
  var meterBar = meter.firstChild;

  /* ---- frame ---- */

  var W = 0, H = 0, dpr = 1, running = false, raf = 0, pShown = -1;
  var mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999 };
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.round(stage.clientWidth * dpr); H = Math.round(stage.clientHeight * dpr);
    canvas.width = W; canvas.height = H; gl.viewport(0, 0, W, H);
  }
  var rz; window.addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(resize, 120); });
  stage.addEventListener('pointermove', function (e) {
    var r = canvas.getBoundingClientRect();
    mouse.tx = (e.clientX - r.left) * dpr; mouse.ty = (e.clientY - r.top) * dpr;
    if (mouse.x < -9000) { mouse.x = mouse.tx; mouse.y = mouse.ty; }
  });
  stage.addEventListener('pointerleave', function () { mouse.tx = mouse.ty = -9999; mouse.x = mouse.y = -9999; });

  function progress() {
    var span = hero.offsetHeight - window.innerHeight;
    return span > 0 ? clamp((window.scrollY - hero.offsetTop) / span, 0, 1) : 0;
  }

  function tick(now) {
    now = now || performance.now();
    var p = progress(), cam = camera(p), s = stageAt(p);
    var intro = clamp((now - introStart) / 3400, 0, 1);
    var soak = smooth(SOAK_FROM, SOAK_TO, p);
    if (mouse.tx > -9000) { mouse.x += (mouse.tx - mouse.x) * 0.16; mouse.y += (mouse.ty - mouse.y) * 0.16; }

    // lifespan drawing: a wide strip standing on a baseline
    var sc0 = cam.z * W * 0.84 / aspect0;
    var off0x = W * 0.5 - (cam.x - 0.5) * aspect0 * sc0;
    var baseY = H * 0.84;
    var off0y = baseY - LAY.base * sc0;
    // scale drawings: a disc on the right, beside the caption
    var wide = W / dpr > 1100;
    var scC = H * (wide ? 0.70 : 0.52);
    var offCx = W * (wide ? 0.665 : 0.5), offCy = H * (wide ? 0.53 : 0.62);

    gl.disable(gl.BLEND);
    gl.useProgram(ground);
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.enableVertexAttribArray(gA); gl.vertexAttribPointer(gA, 2, gl.FLOAT, false, 0, 0);
    gl.uniform2f(GU.uRes, W, H); gl.uniform2f(GU.uMouse, mouse.x, mouse.y);
    gl.uniform1f(GU.uTime, now / 1000); gl.uniform1f(GU.uSoak, soak);
    gl.uniform1f(GU.uLineY, baseY); gl.uniform1f(GU.uLineX, off0x + aspect0 * sc0 * LAY.right);
    gl.uniform1f(GU.uBeyond, 0.0);
    gl.uniform1f(GU.uGrain, TANG ? 0.035 : 0.006);
    gl.uniform1f(GU.uTex, TANG ? 1.0 : 0.12);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(points);
    gl.bindBuffer(gl.ARRAY_BUFFER, pbuf);
    for (var a = 0; a < 4; a++) { gl.enableVertexAttribArray(pA[a]); gl.vertexAttribPointer(pA[a], 4, gl.FLOAT, false, 64, a * 16); }
    gl.bindBuffer(gl.ARRAY_BUFFER, cbuf);
    for (var c6 = 0; c6 < 6; c6++) { if (cA[c6] < 0) continue; gl.enableVertexAttribArray(cA[c6]); gl.vertexAttribPointer(cA[c6], 4, gl.UNSIGNED_BYTE, true, 24, c6 * 4); }
    gl.bindBuffer(gl.ARRAY_BUFFER, nbuf); if (nA >= 0) { gl.enableVertexAttribArray(nA); gl.vertexAttribPointer(nA, 2, gl.FLOAT, false, 8, 0); }
    gl.uniform3f(PU.uNetCol, TANG ? 0.18 : 0.11, TANG ? 0.12 : 0.11, TANG ? 0.06 : 0.10);
    gl.uniform2f(PU.uOffN, W * (wide ? 0.66 : 0.5), H * (wide ? 0.52 : 0.66)); gl.uniform1f(PU.uScN, wide ? H * 0.5 : Math.min(H * 0.34, W * 0.5));
    gl.uniform2f(PU.uRes, W, H); gl.uniform2f(PU.uOff0, off0x, off0y); gl.uniform2f(PU.uOffC, offCx, offCy);
    gl.uniform2f(PU.uMouse, mouse.x, mouse.y);
    gl.uniform3f(PU.uFlight, 0.11, 0.11, 0.10);
    gl.uniform1f(PU.uSc0, sc0); gl.uniform1f(PU.uScC, scC); gl.uniform1f(PU.uS, s);
    gl.uniform1f(PU.uTime, now / 1000); gl.uniform1f(PU.uIntro, intro); gl.uniform1f(PU.uPix, dpr);
    var disc = clamp(s, 0, 1);                       // 0 on the lifespan strip, 1 on the discs and the network
    gl.uniform1f(PU.uSize, (1.7 + 0.6 * (cam.z - 1)) * (1 - disc) + 2.7 * disc);
    gl.uniform1f(PU.uFade, (0.9 * (1 - disc) + 0.85 * disc) * (1 - smooth(SOAK_FROM, SOAK_FROM + 0.05, p)));
    gl.uniform1f(PU.uBurst, smooth(SOAK_FROM - 0.012, SOAK_FROM + 0.05, p));
    gl.drawArrays(gl.POINTS, 0, N);

    if (p !== pShown) {
      pShown = p;
      var out = 1 - smooth(0.008, 0.035, p);
      copy.style.opacity = out; copy.style.transform = 'translateY(' + (-(1 - out) * 50) + 'px)';
      foot.style.opacity = out; cue.style.opacity = out;
      copy.style.pointerEvents = out < 0.5 ? 'none' : '';
      caps.forEach(function (c) {
        var b = c.beat, w = b.w || 0.03;
        var dist = Math.abs(p - b.p);
        var o = 1 - smooth(w * 0.6, w * 1.2, dist);
        if (b.last && p > b.p) o = 1 - smooth(SOAK_FROM, SOAK_FROM + 0.03, p);
        c.el.style.opacity = o;
        c.el.style.transform = 'translateY(' + ((p - b.p) * -160) + 'px)';
      });
      meterBar.style.transform = 'scaleY(' + p + ')';
      meter.style.opacity = (1 - out) * (1 - soak);
      nav.classList.toggle('scrolled', soak > 0.3);
    }
    if (running) raf = requestAnimationFrame(tick);
  }

  function start() { if (!running && ready) { running = true; raf = requestAnimationFrame(tick); } }
  function stop() { running = false; cancelAnimationFrame(raf); }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { es[0].isIntersecting ? start() : stop(); }).observe(hero);
  }
  document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else if (hero.getBoundingClientRect().bottom > 0) start(); });
})();

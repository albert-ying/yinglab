/* Motion layer, shared by every page: line-by-line headlines, rules that draw in, eased wheel scrolling,
   and on the home page the hero film (a pinned WebGL scene whose camera is driven by scroll). */
(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var smooth = function (a, b, v) { var t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

  /* ---------- Headlines split into lines ---------- */

  var splitTargets = Array.prototype.slice.call(document.querySelectorAll('.hero h1, .page-title, main section:not(.hero) h2, .statement'));
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
    // reveal the headline on the second frame; the timer covers tabs that hold back animation frames
    var showH1 = function () { Array.prototype.forEach.call(document.querySelectorAll('.hero h1, .page-title'), function (h1) { h1.classList.add('lines-in'); }); };
    requestAnimationFrame(function () { requestAnimationFrame(showH1); });
    setTimeout(showH1, 600);
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
      if (document.querySelector('dialog[open]')) return;
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
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
      if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
      e.preventDefault();
      S.current = window.scrollY;
      S.target = clamp(el.getBoundingClientRect().top + window.scrollY - (el.id === 'top' ? 0 : 60), 0, maxScroll());
      history.replaceState(null, '', a.getAttribute('href'));
      if (!S.busy) { S.busy = true; requestAnimationFrame(glide); }
      el.focus({ preventScroll: true });
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
  if (gl.getParameter(gl.MAX_VERTEX_ATTRIBS) < 13) return;   // the points use 13 attributes: four of position, one of random numbers and eight of colour

  var N = window.innerWidth > 1500 ? 170000 : 130000;

  // Six drawings, each given to the same points. The first is the lifespan line; the rest are the scales.
  var ART = document.documentElement.getAttribute('data-art') === 'tang' ? 'p-tang-' : 'p-';
  // Where each figure sits in the procession image (fraction of its width), where the baseline is
  // (offset from the image centre as a fraction of its height) and where the drawn line ends.
  var TANG = ART === 'p-tang-';
  // baseline offset from the painting's centre (fraction of its height) and where the drawn line ends
  var LAY = TANG ? { base: 0.1586, right: 0.49 } : { base: 0.4576, right: 0.487 };
  var SOURCES = [
    { src: 'assets/img/' + ART + 'lineup.webp?v=t14', boostTo: 0.22, boost: 2.6, figures: true },   // the small animals get more points than their area would earn
    { src: 'assets/img/' + ART + (TANG ? 'population' : 'species') + '.webp?v=t14' },
    { src: 'assets/img/' + ART + 'human.webp?v=t14' },
    { src: 'assets/img/' + ART + 'tissue.webp?v=t14' },
    { src: 'assets/img/' + ART + 'cell.webp?v=t14' },
    { src: 'assets/img/' + ART + 'molecule.webp?v=t14' },
    { src: 'assets/img/' + ART + (TANG ? 'brain' : 'species') + '.webp?v=t14' },  // the brain among the longest-lived species
    { src: 'assets/img/' + (TANG ? 'p-tang-agents' : 'p-human') + '.webp?v=t14' }   // the agents at work; the other series has no agents painting
  ];
  var NP = SOURCES.length - 1;   // the agents painting is the last stage, NP
  var FIGS = 12;             // most figures the procession may hold

  /* The road. p is scroll progress through the hero, 0..1. Three perspectives, each passed through quickly:
     species (one sweep along the procession), scales (the points re-form from species to molecule) and the model
     (the points gather into the agents at work). x is the place along the procession (0 left, 1 right); z is the push-in. */
  var STOPS = [
    { p: 0.00, x: 0.50, z: 1.00 },
    { p: 0.04, x: 0.50, z: 1.00 },
    { p: 0.09, side: -1, z: 1.45 },   // the first figure just inside the left fade band
    { p: 0.24, side: 1, z: 1.45 },    // the last figure just inside the right fade band
    { p: 0.29, x: 0.50, z: 1.00 },
    { p: 1.00, x: 0.50, z: 1.00 }
  ];
  // Which drawing the points hold: [p, stage]. 0 procession, 1-5 species to molecule, 6 the brain, 7 the agents.
  var STAGE = [[0, 0], [0.29, 0], [0.315, 1], [0.35, 1], [0.375, 2], [0.41, 2], [0.435, 3], [0.47, 3], [0.495, 4], [0.53, 4], [0.555, 5], [0.59, 5], [0.62, 6], [0.71, 6], [0.75, 7], [1, 7]];
  // Each caption fades in over `into` and out over `out`, so one caption hands over to the next with no empty frame.
  var BEATS = [
    { into: [0.035, 0.065], out: [0.235, 0.265], name: 'Across species', sub: 'Maximum lifespan runs from 4 years in a mouse to 507 in an ocean quahog' },
    { into: [0.27, 0.30], out: [0.565, 0.588], name: 'Across scales', scales: true, sub: '<em>Species</em> &nbsp;/&nbsp; <em>Population</em> &nbsp;/&nbsp; <em>Individual</em><br><em>Tissue</em> &nbsp;/&nbsp; <em>Cell</em> &nbsp;/&nbsp; <em>Molecule</em>' },
    { into: [0.592, 0.615], out: [0.69, 0.71], name: 'Brain resilience', sub: 'The longest-lived species may have the most resilient brains' },
    { into: [0.705, 0.73], name: 'AI for discovery', sub: 'Models and agents that learn across species and scales and propose what to test', last: true }
  ];
  var PEND = 0.30;
  // The paper turn covers the frame at about p = 0.975 and is complete at p = 1, as the Vision rule enters
  // at the foot of the frame; the rest of the hero's scroll carries that rule up under the nav.
  var SOAK_FROM = 0.93, SOAK_TO = 1.0;

  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function camera(p) {
    for (var i = 1; i < STOPS.length; i++) {
      if (p <= STOPS[i].p) {
        var a = STOPS[i - 1], b = STOPS[i], t = ease(clamp((p - a.p) / (b.p - a.p), 0, 1));
        var ax = a.side ? stopX(a.side, a.z) : a.x, bx = b.side ? stopX(b.side, b.z) : b.x;
        return { x: ax + (bx - ax) * t, z: a.z + (b.z - a.z) * t };
      }
    }
    var l = STOPS[STOPS.length - 1]; return { x: l.x, z: l.z };
  }
  // Where along the procession the camera stops at each end of the sweep: the end figure stands just
  // inside the band where figures fade, so the frame is full and nothing is cut.
  var BAND = 0.08;
  function stopX(side, z) {
    var half = (W / 2 - padL - BAND * W - 8 * dpr) / (z * Math.max(1, W - 2 * padL)) * (figR - figL);
    return side < 0 ? figL + half : figR - half;
  }
  function stageAt(p) {
    for (var i = 1; i < STAGE.length; i++) {
      if (p <= STAGE[i][0]) {
        var a = STAGE[i - 1], b = STAGE[i];
        return a[1] + (b[1] - a[1]) * clamp((p - a[0]) / (b[0] - a[0] || 1), 0, 1);
      }
    }
    return NP;
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
      'uniform vec2 uRes, uMouse, uFrame; uniform float uTime, uSoak, uLineY, uLineX, uBeyond, uGrain, uTex;', NOISE,
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
      // outside the margin rules the paper keeps pace with the frame edge beside it and runs slightly ahead toward the page edge
      '  float ux = clamp(vUv.x, uFrame.x/uRes.x, uFrame.y/uRes.x);',
      '  vec2 rr = (vec2(ux, vUv.y) - vec2(0.5, 0.5))*vec2(asp, 1.0);',
      '  float gutter = clamp(max(uFrame.x - px.x, px.x - uFrame.y) / max(uFrame.x, 1.0), 0.0, 1.0);',
      '  float front = uSoak*(0.62*asp + 0.75) - length(rr) + (fbm(vUv*vec2(asp,1.0)*3.5 + 3.0)-0.5)*0.55 + (fbm(vUv*vec2(asp,1.0)*15.0)-0.5)*0.12 + gutter*0.07*step(0.0001, uSoak);',
      '  float k = smoothstep(0.0, 0.035, front) * step(0.0001, uSoak);',
      '  float rim = (1.0 - smoothstep(0.0, 0.11, front)) * k;',
      '  float bleed = fbm(vUv*vec2(asp,1.0)*24.0 + 11.0);',
      '  vec3 inkc = vec3(0.12, 0.11, 0.10);',
      '  col = mix(col, mix(paper, inkc, rim*(0.35 + 0.45*bleed)), k);',
      '  gl_FragColor = vec4(col, 1.0);',
      '}'].join('\n'));

  // The points. Each carries its place in all eight drawings and moves between them.
  var points = program(
    ['precision highp float;',
      'attribute vec4 aA, aB, aC, aD, aR, aK0, aK1, aK2, aK3, aK4, aK5, aK6, aK7;',
      'uniform vec2 uRes, uOff0, uOffC, uMouse;',
      'uniform float uSc0, uScC, uS, uTime, uIntro, uPix, uFade, uSize, uBurst; uniform vec3 uFlight;',
      'uniform vec4 uCap; uniform float uCapO, uTop; uniform vec2 uEdge; uniform vec4 uFig; uniform float uAsp0; uniform vec2 uSpan[' + FIGS + '];',
      'varying float vAlpha; varying vec3 vCol;',
      'void main(){',
      '  vec2 p0 = aA.xy*uSc0 + uOff0;',
      '  vec2 p1 = aA.zw*uScC + uOffC, p2 = aB.xy*uScC + uOffC, p3 = aB.zw*uScC + uOffC, p4 = aC.xy*uScC + uOffC, p5 = aC.zw*uScC + uOffC, p6 = aD.xy*uScC + uOffC, p7 = aD.zw*uScC + uOffC;',
      // each point leaves and arrives on its own clock, so a drawing dissolves and gathers rather than slides
      '  float i = floor(uS); float t = uS - i;',
      '  float tt = smoothstep(aR.x*0.5, 0.5 + aR.x*0.5, t);',
      '  tt = tt*tt*(3.0-2.0*tt);',
      '  float s = i + tt;',
      '  vec2 pos = p0*max(0.0, 1.0-abs(s)) + p1*max(0.0, 1.0-abs(s-1.0)) + p2*max(0.0, 1.0-abs(s-2.0))',
      '           + p3*max(0.0, 1.0-abs(s-3.0)) + p4*max(0.0, 1.0-abs(s-4.0)) + p5*max(0.0, 1.0-abs(s-5.0)) + p6*max(0.0, 1.0-abs(s-6.0)) + p7*max(0.0, 1.0-abs(s-7.0));',
      '  float mid = sin(3.14159*tt);',
      '  vCol = aK0.rgb*max(0.0, 1.0-abs(s)) + aK1.rgb*max(0.0, 1.0-abs(s-1.0)) + aK2.rgb*max(0.0, 1.0-abs(s-2.0))',
      '       + aK3.rgb*max(0.0, 1.0-abs(s-3.0)) + aK4.rgb*max(0.0, 1.0-abs(s-4.0)) + aK5.rgb*max(0.0, 1.0-abs(s-5.0)) + aK6.rgb*max(0.0, 1.0-abs(s-6.0)) + aK7.rgb*max(0.0, 1.0-abs(s-7.0));',
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
      // points in flight or in the burst stay out of the caption column and out from under the nav
      '  float m = 18.0*uPix;',
      '  float inCap = smoothstep(uCap.x - m, uCap.x, pos.x) * (1.0 - smoothstep(uCap.z, uCap.z + m, pos.x))',
      '              * smoothstep(uCap.y - m, uCap.y, pos.y) * (1.0 - smoothstep(uCap.w, uCap.w + m, pos.y));',
      '  vAlpha *= 1.0 - uCapO * inCap * clamp(mid*4.0 + uBurst*4.0 + (1.0 - it), 0.0, 1.0);',
      '  vAlpha *= smoothstep(uTop, uTop + 28.0*uPix, pos.y);',
      // and they fade out before the margin rules, so nothing is cut by the edge of the frame
      '  float fw = 40.0*uPix;',
      '  vAlpha *= smoothstep(uEdge.x, uEdge.x + fw, pos.x) * (1.0 - smoothstep(uEdge.y - fw, uEdge.y, pos.x));',
      // in the procession a figure that nears either side of the frame fades out whole, never cut through
      '  int fi = int(aK0.a*255.0 + 0.5); vec2 sp = vec2(0.0, 1.0);',
      '  for (int j = 0; j < ' + FIGS + '; j++) { if (j == fi) sp = uSpan[j]; }',
      '  float fl = (sp.x - 0.5)*uAsp0*uSc0 + uOff0.x, fr = (sp.y - 0.5)*uAsp0*uSc0 + uOff0.x;',
      '  float whole = smoothstep(uFig.x, uFig.y, fl) * (1.0 - smoothstep(uFig.z, uFig.w, fr));',
      '  vAlpha *= mix(1.0, whole, max(0.0, 1.0 - abs(s)));',
      '}'].join('\n'),
    ['precision mediump float;', 'varying float vAlpha; varying vec3 vCol;',
      'void main(){ float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.18, d) * vAlpha; gl_FragColor = vec4(vCol, a); }'].join('\n'));
  if (!ground || !points) return;

  var GU = uniforms(ground, ['uFrame', 'uTex', 'uRes', 'uMouse', 'uTime', 'uSoak', 'uLineY', 'uLineX', 'uBeyond', 'uGrain']);
  var PU = uniforms(points, ['uSpan[0]', 'uFig', 'uAsp0', 'uCap', 'uCapO', 'uTop', 'uEdge', 'uFlight', 'uRes', 'uOff0', 'uOffC', 'uMouse', 'uSc0', 'uScC', 'uS', 'uTime', 'uIntro', 'uPix', 'uFade', 'uSize', 'uBurst']);

  var quad = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  var pbuf = gl.createBuffer(), cbuf = gl.createBuffer();
  var gA = gl.getAttribLocation(ground, 'a');
  // per point: eight painting positions (16 floats) and four random numbers, 20 floats in all
  var pA = [['aA', 4, 0], ['aB', 4, 16], ['aC', 4, 32], ['aD', 4, 48], ['aR', 4, 64]].map(function (d) { return { loc: gl.getAttribLocation(points, d[0]), size: d[1], off: d[2] }; });
  var cA = ['aK0', 'aK1', 'aK2', 'aK3', 'aK4', 'aK5', 'aK6', 'aK7'].map(function (n) { return gl.getAttribLocation(points, n); });

  /* ---- sample the drawings into point positions ---- */

  var seed = 20270101;
  function rnd() { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; }
  var aspect0 = 1536 / 391, top0 = 0;   // the procession's width over height, and its highest painted row

  function sample(img, opts) {
    // Returns N positions in a unit frame (height 1, centred on 0), denser where the engraving is lighter.
    var w = Math.min(img.naturalWidth, 1536), h = Math.round(w * img.naturalHeight / img.naturalWidth);
    var c = document.createElement('canvas'); c.width = w; c.height = h;
    var cx = c.getContext('2d', { willReadFrequently: true }); cx.drawImage(img, 0, 0, w, h);
    var px = cx.getImageData(0, 0, w, h).data, cdf = new Float32Array(w * h), acc = 0;
    var xmax = (opts.xmax || 1) * w, top = -1;
    for (var y = 0, k = 0; y < h; y++) for (var x = 0; x < w; x++, k++) {
      var v = px[k * 4 + 3] / 255;
      v = (v < 0.25 || x > xmax) ? 0 : v;
      if (v > 0 && top < 0) top = y;
      if (opts.boost && x < opts.boostTo * w) v *= opts.boost;
      acc += v; cdf[k] = acc;
    }
    var figs = opts.figures ? figures(px, w, h) : null;
    var out = new Float32Array(N * 2), col = new Uint8Array(N * 4), span = figs ? new Uint8Array(N) : null, asp = w / h;
    for (var n = 0; n < N; n++) {
      var r = rnd() * acc, lo = 0, hi = w * h - 1;
      while (lo < hi) { var mid = (lo + hi) >> 1; if (cdf[mid] < r) lo = mid + 1; else hi = mid; }
      out[n * 2] = ((lo % w + rnd()) / w - 0.5) * asp;
      out[n * 2 + 1] = (Math.floor(lo / w) + rnd()) / h - 0.5;
      col[n * 4] = px[lo * 4]; col[n * 4 + 1] = px[lo * 4 + 1]; col[n * 4 + 2] = px[lo * 4 + 2]; col[n * 4 + 3] = 255;
      if (figs) span[n] = figs.at(lo % w, Math.floor(lo / w));
    }
    return { pos: out, col: col, span: span, figs: figs, aspect: asp, top: Math.max(0, top) / h };
  }

  // The figures of the procession, found as connected painted areas on a quarter-scale mask. Each point
  // learns the left and right edge of its figure, so a figure leaving the frame fades out whole.
  function figures(px, w, h) {
    var q = 4, mw = Math.ceil(w / q), mh = Math.ceil(h / q), mask = new Uint8Array(mw * mh), lab = new Int32Array(mw * mh);
    for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) if (px[(y * w + x) * 4 + 3] >= 180) mask[((y / q) | 0) * mw + ((x / q) | 0)] = 1;
    var boxes = [], stack = [];
    for (var i0 = 0; i0 < mw * mh; i0++) {
      if (!mask[i0] || lab[i0]) continue;
      var b = { id: boxes.length + 1, x0: mw, x1: -1, n: 0 }; boxes.push(b);
      lab[i0] = b.id; stack.push(i0);
      while (stack.length) {
        var c = stack.pop(), cx = c % mw, cy = (c / mw) | 0; b.n++;
        if (cx < b.x0) b.x0 = cx; if (cx > b.x1) b.x1 = cx;
        for (var dy = -1; dy <= 1; dy++) for (var dx = -1; dx <= 1; dx++) {
          var nx = cx + dx, ny = cy + dy; if (nx < 0 || ny < 0 || nx >= mw || ny >= mh) continue;
          var ni = ny * mw + nx; if (mask[ni] && !lab[ni]) { lab[ni] = b.id; stack.push(ni); }
        }
      }
    }
    // the largest areas, at most FIGS of them, are the figures; specks and ground strokes join the nearest
    var big = boxes.filter(function (b) { return b.n > 30; }).sort(function (a, b) { return b.n - a.n; }).slice(0, FIGS)
      .map(function (b) { return { id: b.id, x0: b.x0 * q / w, x1: Math.min(1, (b.x1 + 1) * q / w) }; });
    if (!big.length) big = [{ id: 0, x0: 0, x1: 1 }];
    var byId = {}; big.forEach(function (b, i) { byId[b.id] = i; });
    return {
      list: big,
      at: function (x, y) {
        var own = byId[lab[((y / q) | 0) * mw + ((x / q) | 0)]];
        if (own !== undefined) return own;
        var fx = x / w, best = 0, bd = Infinity;
        big.forEach(function (b, i) { var d = fx < b.x0 ? b.x0 - fx : fx > b.x1 ? fx - b.x1 : 0; if (d < bd) { bd = d; best = i; } });
        return best;
      }
    };
  }
  var figL = 0, figR = 1, spans = new Float32Array(FIGS * 2);   // figure spans and the painted extent, as fractions of the procession's width
  for (var f0 = 0; f0 < FIGS; f0++) spans[f0 * 2 + 1] = 1;

  var ready = false, introStart = 0;
  Promise.all(SOURCES.map(function (s) {
    // a missing painting is replaced by the one before it, so the film never drops to the static hero
    return new Promise(function (res) {
      var im = new Image(); im.onload = function () { res(im); };
      im.onerror = function () { console.warn('film: missing', s.src); res(null); };
      im.src = s.src;
    });
  })).then(function (imgs) {
    if (!imgs[0]) return;
    for (var q0 = 1; q0 < imgs.length; q0++) if (!imgs[q0]) imgs[q0] = imgs[q0 - 1];
    var sets = imgs.map(function (im, i) { return sample(im, SOURCES[i]); });
    aspect0 = sets[0].aspect; top0 = sets[0].top;
    if (sets[0].figs) {
      var fl0 = sets[0].figs.list;
      figL = Math.min.apply(null, fl0.map(function (b) { return b.x0; }));
      figR = Math.max.apply(null, fl0.map(function (b) { return b.x1; }));
      fl0.forEach(function (b, i) { spans[i * 2] = b.x0; spans[i * 2 + 1] = b.x1; });
    }
    // Points are paired at random between drawings, so each change is a dissolve and not a slide.
    var data = new Float32Array(N * 20);
    for (var n = 0; n < N; n++) {
      var o = n * 20;
      for (var k = 0; k <= NP; k++) { data[o + k * 2] = sets[k].pos[n * 2]; data[o + k * 2 + 1] = sets[k].pos[n * 2 + 1]; }
      data[o + 16] = rnd(); data[o + 17] = rnd(); data[o + 18] = rnd(); data[o + 19] = rnd();
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, pbuf); gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    // Each point also carries its colour in all eight paintings.
    var cols = new Uint8Array(N * 32);
    for (var n2 = 0; n2 < N; n2++) for (var k2 = 0; k2 <= NP; k2++) cols.set(sets[k2].col.subarray(n2 * 4, n2 * 4 + 4), n2 * 32 + k2 * 4);
    // the spare alpha byte of the first colour carries the point's figure in the procession
    var sp = sets[0].span;
    for (var n4 = 0; n4 < N; n4++) cols[n4 * 32 + 3] = sp ? sp[n4] : 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, cbuf); gl.bufferData(gl.ARRAY_BUFFER, cols, gl.STATIC_DRAW);
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

  var W = 0, H = 0, dpr = 1, running = false, raf = 0, pShown = -1, footTop = 0, navBottom = 0, capFloor = 0, edgeL = 0, edgeR = 0, padL = 0, gut = 0, tail = 0;
  var mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999 };
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.round(stage.clientWidth * dpr); H = Math.round(stage.clientHeight * dpr);
    canvas.width = W; canvas.height = H; gl.viewport(0, 0, W, H);
    footTop = (foot.getBoundingClientRect().top - stage.getBoundingClientRect().top) * dpr;
    navBottom = nav.getBoundingClientRect().bottom * dpr;
    // the margin rules: the meter hangs on the right one
    var sr = stage.getBoundingClientRect();
    var mr = meter.getBoundingClientRect();
    edgeR = mr.right > sr.left ? (mr.right - sr.left) * dpr : W; edgeL = W - edgeR;
    // the text field: the procession rests on its outer lines, and a figure fades out a gutter before a rule
    var cs = getComputedStyle(copy);
    padL = (parseFloat(cs.paddingLeft) || 0) * dpr; gut = (parseFloat(cs.columnGap) || 16) * dpr;
    // Vision rises over the last stretch of the hero; the film runs over the scroll before it
    var next = hero.nextElementSibling;
    tail = next ? Math.max(0, -parseFloat(getComputedStyle(next).marginTop) || 0) : 0;
    measureCaps();
  }
  // Each caption's column, before its scroll offset, in device pixels with a small margin.
  function measureCaps() {
    caps.forEach(function (c) {
      var e = c.el, pad = 14;
      c.box = [(e.offsetLeft - pad) * dpr, (e.offsetTop - pad) * dpr, (e.offsetLeft + e.offsetWidth + pad) * dpr, (e.offsetTop + e.offsetHeight + pad) * dpr];
    });
    // The species caption drifts down by up to about 18px while the camera pushes in; the procession
    // keeps 40px clear of its lowest point.
    capFloor = (caps[0].el.offsetTop + caps[0].el.offsetHeight + 18 + 40) * dpr;
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (W) measureCaps(); });
  var rz; window.addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(resize, 120); });
  stage.addEventListener('pointermove', function (e) {
    var r = canvas.getBoundingClientRect();
    mouse.tx = (e.clientX - r.left) * dpr; mouse.ty = (e.clientY - r.top) * dpr;
    if (mouse.x < -9000) { mouse.x = mouse.tx; mouse.y = mouse.ty; }
  });
  stage.addEventListener('pointerleave', function () { mouse.tx = mouse.ty = -9999; mouse.x = mouse.y = -9999; });

  function progress() {
    var span = hero.offsetHeight - window.innerHeight - tail;
    return span > 0 ? clamp((window.scrollY - hero.offsetTop) / span, 0, 1) : 0;
  }

  function tick(now) {
    now = now || performance.now();
    var p = progress(), cam = camera(p), s = stageAt(p);
    var intro = clamp((now - introStart) / 3400, 0, 1);
    var soak = smooth(SOAK_FROM, SOAK_TO, p);
    if (mouse.tx > -9000) { mouse.x += (mouse.tx - mouse.x) * 0.16; mouse.y += (mouse.ty - mouse.y) * 0.16; }

    // lifespan drawing: a wide strip standing on a baseline
    // the procession stands clear of the chip and the lede, including the part of the strip below the waterline
    var sc1 = (W - 2 * padL) / ((figR - figL) * aspect0);
    var baseY = Math.min(H * 0.84, footTop - 24 * dpr - 0.26 * sc1);
    // the push-in stops where the tallest figure (the whale's spray) would come within 40px of the caption
    var sc0 = Math.max(sc1, Math.min(cam.z * sc1, (baseY - capFloor) / (LAY.base + 0.5 - top0)));
    var zEff = sc0 / sc1;
    var off0x = W * 0.5 - (cam.x - 0.5 + (figL + figR) / 2 - 0.5) * aspect0 * sc0;
    var off0y = baseY - LAY.base * sc0;
    // scale drawings, the brain and the agents: a disc on the right, beside the caption column, at every width
    var colL = W * 0.44, room = W - colL - W * 0.05;
    var scC = Math.min(H * 0.70, room * 0.95);
    var offCx = colL + room / 2, offCy = H * 0.54;

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
    gl.uniform2f(GU.uFrame, edgeL, edgeR);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(points);
    gl.bindBuffer(gl.ARRAY_BUFFER, pbuf);
    pA.forEach(function (d) { if (d.loc < 0) return; gl.enableVertexAttribArray(d.loc); gl.vertexAttribPointer(d.loc, d.size, gl.FLOAT, false, 80, d.off); });
    gl.bindBuffer(gl.ARRAY_BUFFER, cbuf);
    for (var c6 = 0; c6 <= NP; c6++) { if (cA[c6] < 0) continue; gl.enableVertexAttribArray(cA[c6]); gl.vertexAttribPointer(cA[c6], 4, gl.UNSIGNED_BYTE, true, 32, c6 * 4); }
    gl.uniform2f(PU.uRes, W, H); gl.uniform2f(PU.uOff0, off0x, off0y); gl.uniform2f(PU.uOffC, offCx, offCy);
    gl.uniform2f(PU.uMouse, mouse.x, mouse.y);
    gl.uniform3f(PU.uFlight, 0.11, 0.11, 0.10);
    gl.uniform1f(PU.uSc0, sc0); gl.uniform1f(PU.uScC, scC); gl.uniform1f(PU.uS, s);
    gl.uniform1f(PU.uTime, now / 1000); gl.uniform1f(PU.uIntro, intro); gl.uniform1f(PU.uPix, dpr);
    var capO = 0, capBox = [0, 0, 0, 0];
    caps.forEach(function (c) {
      var b = c.beat;
      // the last caption is gone before the paper turn begins, so the soak front never crosses it
      c.o = smooth(b.into[0], b.into[1], p) * (1 - (b.last ? smooth(SOAK_FROM - 0.03, SOAK_FROM, p) : smooth(b.out[0], b.out[1], p)));
      c.ty = (p - (b.last ? b.into[1] : (b.into[1] + b.out[0]) / 2)) * -160;
      if (c.o > capO && c.box) { capO = c.o; capBox = [c.box[0], c.box[1] + c.ty * dpr, c.box[2], c.box[3] + c.ty * dpr]; }
    });
    gl.uniform4f(PU.uCap, capBox[0], capBox[1], capBox[2], capBox[3]); gl.uniform1f(PU.uCapO, capO);
    gl.uniform1f(PU.uTop, navBottom);
    gl.uniform2f(PU.uEdge, edgeL + 4 * dpr, edgeR - 4 * dpr);
    // Figure fades. At rest the procession fills the text field and nothing fades. While the camera sweeps,
    // a figure fades whole as it crosses a band inside the field and is gone a gutter before the rule. The
    // right side engages as the sweep starts (the strip moves right), the left side as the strip turns left.
    var band = BAND * W, gone = Math.min(padL, edgeL + gut);
    var kR = smooth(0.04, 0.046, p) * (1 - smooth(0.235, 0.25, p));
    var kL = smooth(0.088, 0.096, p) * (1 - smooth(0.27, 0.29, p));
    gl.uniform4f(PU.uFig, gone - 0.5, padL + band * kL, W - padL - band * kR, W - gone + 0.5);
    gl.uniform1f(PU.uAsp0, aspect0);
    gl.uniform2fv(PU['uSpan[0]'], spans);
    var disc = clamp(s, 0, 1);                       // 0 on the lifespan strip, 1 on the discs
    gl.uniform1f(PU.uSize, (1.7 + 0.6 * (zEff - 1)) * (1 - disc) + 2.7 * disc);
    gl.uniform1f(PU.uFade, (0.9 * (1 - disc) + 0.85 * disc) * (1 - smooth(SOAK_FROM, SOAK_FROM + 0.03, p)));
    gl.uniform1f(PU.uBurst, smooth(SOAK_FROM - 0.012, SOAK_FROM + 0.05, p));
    gl.drawArrays(gl.POINTS, 0, N);

    if (p !== pShown) {
      pShown = p;
      var out = 1 - smooth(0.008, 0.035, p);
      copy.style.opacity = out; copy.style.transform = 'translateY(' + (-(1 - out) * 50) + 'px)';
      foot.style.opacity = out; cue.style.opacity = out;
      copy.style.pointerEvents = foot.style.pointerEvents = cue.style.pointerEvents = out < 0.5 ? 'none' : '';
      caps.forEach(function (c) {
        var b = c.beat;
        c.el.style.opacity = c.o;
        c.el.style.transform = 'translateY(' + c.ty + 'px)';
        if (b.scales) { var kk = Math.round(clamp(s, 0, 5)); Array.prototype.forEach.call(c.el.querySelectorAll('em'), function (e, i) { e.classList.toggle('now', i === kk); }); }
      });
      meterBar.style.transform = 'scaleY(' + p + ')';
      // the meter leaves with the points, before the paper shows
      meter.style.opacity = (1 - out) * (1 - smooth(SOAK_FROM - 0.02, SOAK_FROM + 0.02, p));
      // the bar takes on paper as the soak front reaches the top of the frame
      var navA = smooth(0.3, 0.8, soak);
      nav.style.backgroundColor = navA > 0 ? 'rgba(239, 227, 203, ' + navA.toFixed(3) + ')' : '';
      nav.classList.toggle('scrolled', navA >= 1);
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

/* Sandy Ortega · Sitio personal — JS sin dependencias.
   El contenido en español vive en el HTML; el inglés en atributos data-en / data-en-<atributo>. */
(function () {
  'use strict';

  var doc = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* almacenamiento no disponible */ } }
  };

  // Textos que no están en el HTML (meta, mensajes generados por JS).
  var T = {
    es: {
      title: 'Sandielly Ortega · Power BI & Data Analytics Engineer',
      description: "Sandielly 'Sandy' Ortega Polanco — Ingeniero en Data Analytics & BI, Microsoft Certified Power BI Data Analyst. +10 años convirtiendo datos en KPIs para la alta dirección. Autor Packt, speaker y creador de contenido.",
      mailSubject: 'Contacto web — ',
      waText: 'Hola Sandy, vi tu sitio web y me gustaría conversar.',
      dashPh: '[IMAGEN] dashboard ',
      enlarge: 'Ampliar'
    },
    en: {
      title: 'Sandielly Ortega · Power BI & Data Analytics Engineer',
      description: "Sandielly 'Sandy' Ortega Polanco — Data Analytics & BI Engineer, Microsoft Certified Power BI Data Analyst. 10+ years turning data into KPIs for the C-suite. Packt author, speaker and content creator.",
      mailSubject: 'Website contact — ',
      waText: 'Hi Sandy, I saw your website and would like to talk.',
      dashPh: '[IMAGE] dashboard ',
      enlarge: 'Enlarge'
    }
  };

  /* ---------------- Idioma ---------------- */
  var lang = 'es';
  var textEls = $$('[data-en]');
  var attrEls = [];
  $$('*').forEach(function (el) {
    var pairs = [];
    for (var i = 0; i < el.attributes.length; i++) {
      var a = el.attributes[i];
      if (a.name.indexOf('data-en-') === 0) {
        var target = a.name.slice(8);
        pairs.push({ attr: target, en: a.value, es: el.getAttribute(target) || '' });
      }
    }
    if (pairs.length) attrEls.push({ el: el, pairs: pairs });
  });
  textEls.forEach(function (el) { el.setAttribute('data-es', el.textContent); });

  function applyLang(next, persist) {
    lang = next === 'en' ? 'en' : 'es';
    var en = lang === 'en';
    textEls.forEach(function (el) { el.textContent = en ? el.getAttribute('data-en') : el.getAttribute('data-es'); });
    attrEls.forEach(function (item) {
      item.pairs.forEach(function (p) { item.el.setAttribute(p.attr, en ? p.en : p.es); });
    });
    doc.lang = lang;
    document.title = T[lang].title;
    var md = $('meta[name="description"]');
    if (md) md.setAttribute('content', T[lang].description);
    $$('[data-set-lang]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-set-lang') === lang)); });
    $$('a[data-wa]').forEach(function (a) { a.href = 'https://wa.me/18292637865?text=' + encodeURIComponent(T[lang].waText); });
    $$('.case-btn').forEach(function (b) {
      var t = $('.title', b);
      b.setAttribute('aria-label', T[lang].enlarge + ': ' + (t ? t.textContent : ''));
    });
    if (persist) {
      store.set('so-lang', lang);
      try {
        var url = new URL(window.location.href);
        if (url.searchParams.has('lang')) {
          url.searchParams.set('lang', lang);
          history.replaceState(null, '', url.toString());
        }
      } catch (e) { /* sin soporte de URL */ }
    }
    if (typeof lbIndex === 'number') renderLightbox();
  }

  $$('[data-set-lang]').forEach(function (b) {
    b.addEventListener('click', function () { applyLang(b.getAttribute('data-set-lang'), true); });
  });

  /* ---------------- Tema claro / oscuro ---------------- */
  var themeBtn = $('#theme-toggle');
  function syncThemeIcon() {
    themeBtn.textContent = doc.getAttribute('data-theme') === 'dark' ? '☀' : '☾';
  }
  themeBtn.addEventListener('click', function () {
    var next = doc.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    doc.setAttribute('data-theme', next);
    store.set('so-theme', next);
    syncThemeIcon();
  });
  syncThemeIcon();

  /* ---------------- Menú móvil ---------------- */
  var menuBtn = $('#menu-toggle');
  var mobileNav = $('#mobile-nav');
  function setNav(open) {
    mobileNav.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
  }
  menuBtn.addEventListener('click', function (e) { e.stopPropagation(); setNav(mobileNav.hidden); });
  $$('a', mobileNav).forEach(function (a) { a.addEventListener('click', function () { setNav(false); }); });

  /* ---------------- Menús desplegables (CV, llamada, CV móvil) ---------------- */
  var dds = $$('[data-dd]').map(function (wrap) {
    var btn = $('button[aria-haspopup]', wrap);
    var menu = document.getElementById(btn.getAttribute('aria-controls'));
    return { wrap: wrap, btn: btn, menu: menu };
  });
  function closeMenus(except) {
    dds.forEach(function (d) {
      if (d === except) return;
      d.menu.hidden = true;
      d.btn.setAttribute('aria-expanded', 'false');
    });
  }
  dds.forEach(function (d) {
    d.wrap.addEventListener('click', function (e) { e.stopPropagation(); });
    d.btn.addEventListener('click', function () {
      var open = d.menu.hidden;
      closeMenus(d);
      d.menu.hidden = !open;
      d.btn.setAttribute('aria-expanded', String(open));
    });
    $$('a', d.menu).forEach(function (a) { a.addEventListener('click', function () { closeMenus(); }); });
  });
  document.addEventListener('click', function () { closeMenus(); });

  /* ---------------- Lightbox de dashboards ---------------- */
  var cases = $$('.case');
  var lb = $('#lightbox');
  var lbImg = $('#lb-img');
  var lbPh = $('#lb-ph');
  var lbIndex = null;
  var lbReturnFocus = null;

  function renderLightbox() {
    var card = cases[lbIndex];
    var img = $('.case-media img', card);
    $('#lb-title').textContent = $('.title', card).textContent;
    $('#lb-sub').textContent = $('.sector', card).textContent + ' · ' + (lbIndex + 1) + ' / ' + cases.length;
    if (img) {
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = $('.title', card).textContent;
      lbImg.hidden = false;
      lbPh.hidden = true;
    } else {
      lbImg.hidden = true;
      lbImg.removeAttribute('src');
      lbPh.textContent = T[lang].dashPh + (lbIndex + 1);
      lbPh.hidden = false;
    }
  }
  function openLightbox(i) {
    lbReturnFocus = document.activeElement;
    lbIndex = i;
    renderLightbox();
    lb.hidden = false;
    doc.style.overflow = 'hidden';
    $('#lb-close').focus();
  }
  function closeLightbox() {
    if (lbIndex === null) return;
    lbIndex = null;
    lb.hidden = true;
    doc.style.overflow = '';
    if (lbReturnFocus) lbReturnFocus.focus();
  }
  function stepLightbox(d) {
    lbIndex = (lbIndex + d + cases.length) % cases.length;
    renderLightbox();
  }
  $$('.case-btn').forEach(function (b) {
    b.addEventListener('click', function () { openLightbox(Number(b.getAttribute('data-case'))); });
  });
  if (cases.length < 2) { $('#lb-prev').hidden = true; $('#lb-next').hidden = true; }
  $('#lb-prev').addEventListener('click', function () { stepLightbox(-1); });
  $('#lb-next').addEventListener('click', function () { stepLightbox(1); });
  $('#lb-close').addEventListener('click', closeLightbox);
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLightbox(); });

  /* ---------------- Teclado global ---------------- */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeMenus();
      setNav(false);
      closeLightbox();
      return;
    }
    if (lbIndex === null) return;
    if (e.key === 'ArrowRight') stepLightbox(1);
    if (e.key === 'ArrowLeft') stepLightbox(-1);
    if (e.key === 'Tab') {
      // Mantiene el foco dentro del lightbox.
      var f = $$('button', lb);
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---------------- Videos de YouTube ---------------- */
  $$('.video').forEach(function (li) {
    var id = (li.getAttribute('data-yt') || '').trim();
    if (!id) return;
    var f = document.createElement('iframe');
    f.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id);
    f.title = li.getAttribute('data-title') || 'YouTube';
    f.loading = 'lazy';
    f.allow = 'accelerometer; encrypted-media; gyroscope; picture-in-picture';
    f.allowFullscreen = true;
    li.innerHTML = '';
    li.appendChild(f);
  });

  /* ---------------- Carrusel de charlas ---------------- */
  $$('[data-carousel]').forEach(function (track) {
    var section = track.closest('section');
    var prev = $('[data-car-prev]', section);
    var next = $('[data-car-next]', section);
    var ctrls = $('[data-car-ctrls]', section);
    function step() {
      var card = track.firstElementChild;
      var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      return card ? card.getBoundingClientRect().width + gap : track.clientWidth;
    }
    function update() {
      var max = track.scrollWidth - track.clientWidth;
      ctrls.hidden = max <= 1;
      prev.disabled = track.scrollLeft <= 1;
      next.disabled = track.scrollLeft >= max - 1;
    }
    prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: reduceMotion ? 'auto' : 'smooth' }); });
    next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: reduceMotion ? 'auto' : 'smooth' }); });
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  });

  /* ---------------- Formulario de contacto (mailto) ---------------- */
  var form = $('#contact-form');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var fd = new FormData(form);
    var name = fd.get('name');
    var body = fd.get('message') + '\n\n— ' + name + ' (' + fd.get('email') + ')';
    window.location.href = 'mailto:sortegap1@gmail.com?subject=' +
      encodeURIComponent(T[lang].mailSubject + name) + '&body=' + encodeURIComponent(body);
    $('.form-status', form).hidden = false;
  });

  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------------- Dashboard animado de la laptop ---------------- */
  var dash = {
    dq: 1,
    series: [52, 48, 55, 50, 58, 54, 63, 60, 68, 64, 72, 70, 78],
    drift: [0, 0, 0, 0, 0],
    el: {
      k1: $('#dK1'), k2: $('#dK2'), k3: $('#dK3'), line: $('#dLine'), area: $('#dArea'),
      barA: $('#dBarA'), barB: $('#dBarB'), barAv: $('#dBarAv'), barBv: $('#dBarBv')
    }
  };
  function renderDash() {
    var dq = dash.dq, dr = dash.drift, el = dash.el;
    var line = dash.series.map(function (v, i) { return (i ? 'L' : 'M') + (i * 25) + ' ' + (90 - v).toFixed(1); }).join(' ');
    var ba = Math.min(99, (91 + dr[3]) * dq), bb = Math.min(99, (86 + dr[4]) * dq);
    el.k1.textContent = ((82.4 + dr[0]) * dq).toFixed(1) + '%';
    el.k2.textContent = '$' + Math.round((142 + dr[1]) * dq);
    el.k3.textContent = '$' + ((0.38 + dr[2]) * dq).toFixed(2);
    el.line.setAttribute('d', line);
    el.line.style.strokeDashoffset = String(1 - dq);
    el.area.setAttribute('d', line + ' L 300 60 L 0 60 Z');
    el.area.style.fillOpacity = String(0.10 * dq);
    el.barA.style.width = ba + '%';
    el.barB.style.width = bb + '%';
    el.barAv.textContent = Math.round(ba) + '%';
    el.barBv.textContent = Math.round(bb) + '%';
  }
  var aboutVisible = false;
  function startLiveDash() {
    setInterval(function () {
      if (!aboutVisible || document.hidden) return;
      var last = dash.series[dash.series.length - 1];
      var nv = last + (Math.random() * 10 - 4);
      if (nv > 84) nv = 70 + Math.random() * 6;
      if (nv < 44) nv = 50;
      var r = function (a) { return (Math.random() * 2 - 1) * a; };
      dash.series = dash.series.slice(1).concat(nv);
      dash.drift = [r(1.2), r(4), r(0.02), r(2), r(2)];
      renderDash();
    }, 2800);
  }
  function runDash() {
    var t0 = performance.now(), dur = 1700;
    function tick(now) {
      var x = Math.max(0, Math.min(1, (now - t0) / dur));
      dash.dq = 1 - Math.pow(1 - x, 3);
      renderDash();
      if (x < 1) requestAnimationFrame(tick); else startLiveDash();
    }
    requestAnimationFrame(tick);
  }

  /* ---------------- Contador de métricas ---------------- */
  var counters = $$('[data-count]');
  function renderCount(p) {
    counters.forEach(function (el) {
      var n = Math.round(Number(el.getAttribute('data-count')) * p);
      var min = el.getAttribute('data-min');
      if (min !== null) n = Math.max(Number(min), n);
      el.textContent = (el.getAttribute('data-prefix') || '') + n + (el.getAttribute('data-suffix') || '');
    });
  }
  function runCount() {
    var t0 = performance.now(), dur = 1400;
    function tick(now) {
      var x = Math.max(0, Math.min(1, (now - t0) / dur));
      renderCount(1 - Math.pow(1 - x, 3));
      if (x < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ---------------- Scroll: apariciones, métricas, dashboard, nav activa ---------------- */
  var navIds = ['about', 'experience', 'skills', 'cases', 'book', 'talks', 'youtube', 'education', 'contact'];
  var navLinks = $$('.nav-links a, .mobile-nav a');
  var activeId = '';

  function setupScroll() {
    var vh = function () { return window.innerHeight || doc.clientHeight; };
    var reveals = reduceMotion ? [] : $$('[data-reveal]').filter(function (el) {
      return el.getBoundingClientRect().top > vh() * 0.9;
    });
    reveals.forEach(function (el) { el.classList.add('reveal-pending', 'reveal-anim'); });

    var metrics = $('#metrics');
    var about = $('#about');
    var dashPending = !!about && !reduceMotion;
    if (dashPending) { dash.dq = 0; renderDash(); }
    var countPending = !reduceMotion && metrics && metrics.getBoundingClientRect().top > vh() * 0.85;
    if (countPending) renderCount(0);

    var ticking = false;
    function check() {
      ticking = false;
      var H = vh();
      for (var i = reveals.length - 1; i >= 0; i--) {
        if (reveals[i].getBoundingClientRect().top < H * 0.92) {
          reveals[i].classList.remove('reveal-pending');
          reveals.splice(i, 1);
        }
      }
      if (countPending && metrics.getBoundingClientRect().top < H * 0.8) { countPending = false; runCount(); }
      if (about) {
        var ar = about.getBoundingClientRect();
        aboutVisible = ar.top < H && ar.bottom > 0;
        if (dashPending && ar.top < H * 0.75 && ar.bottom > 0) { dashPending = false; runDash(); }
      }
      var active = '';
      navIds.forEach(function (id) {
        var el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top < H * 0.45) active = id;
      });
      if (active !== activeId) {
        activeId = active;
        navLinks.forEach(function (a) {
          if (a.getAttribute('href') === '#' + active) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      }
    }
    function onScroll() {
      if (!ticking) { ticking = true; requestAnimationFrame(check); }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    check();
  }

  /* ---------------- Arranque ---------------- */
  var params = new URLSearchParams(window.location.search);
  var initialLang = params.get('lang') || store.get('so-lang') || 'es';
  applyLang(initialLang, false);

  var started = false;
  function start() {
    if (started) return;
    started = true;
    var fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    fonts.then(function () { requestAnimationFrame(function () { requestAnimationFrame(setupScroll); }); });
  }
  if (document.readyState === 'complete') start();
  else window.addEventListener('load', start, { once: true });
  setTimeout(start, 4000);
})();

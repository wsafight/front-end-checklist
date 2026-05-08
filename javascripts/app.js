(function () {
  var STORAGE_KEY = 'fec-lang';
  var THEME_KEY = 'fec-theme';
  var DEFAULT_LANG = 'zh';
  var supported = ['zh', 'en'];
  var themes = ['light', 'auto', 'dark'];

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  /* ---------- language ---------- */
  function detectLang() {
    var stored = null;
    try { stored = localStorage.getItem(STORAGE_KEY); } catch (e) {}
    if (stored && supported.indexOf(stored) !== -1) return stored;
    var nav = (navigator.language || navigator.userLanguage || '').toLowerCase();
    if (nav.indexOf('zh') === 0) return 'zh';
    if (nav.indexOf('en') === 0) return 'en';
    return DEFAULT_LANG;
  }

  function applyLang(lang) {
    if (supported.indexOf(lang) === -1) lang = DEFAULT_LANG;
    var root = document.documentElement;
    root.setAttribute('lang', lang === 'zh' ? 'zh-CN' : 'en');
    root.setAttribute('data-lang', lang);

    $$('[data-i18n]').forEach(function (el) {
      var text = el.getAttribute('data-' + lang);
      if (text != null) el.innerHTML = text;
    });

    $$('.lang-btn').forEach(function (btn) {
      var active = btn.getAttribute('data-lang') === lang;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
  }

  function bindLang() {
    $$('.lang-btn').forEach(function (btn) {
      btn.addEventListener('click', function () { applyLang(btn.getAttribute('data-lang')); });
    });
  }

  /* ---------- theme ---------- */
  function detectTheme() {
    var stored = null;
    try { stored = localStorage.getItem(THEME_KEY); } catch (e) {}
    if (stored && themes.indexOf(stored) !== -1) return stored;
    return 'auto';
  }
  function applyTheme(theme) {
    if (themes.indexOf(theme) === -1) theme = 'auto';
    var root = document.documentElement;
    if (theme === 'auto') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
    $$('.theme-btn').forEach(function (btn) {
      var active = btn.getAttribute('data-theme') === theme;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }
  function bindTheme() {
    $$('.theme-btn').forEach(function (btn) {
      btn.addEventListener('click', function () { applyTheme(btn.getAttribute('data-theme')); });
    });
  }

  /* ---------- stats ---------- */
  function updateStats() {
    var cards = $$('.card');
    var items = $$('.card ul > li');
    var sec = document.querySelector('[data-stat="sections"]');
    var it = document.querySelector('[data-stat="items"]');
    if (sec) sec.textContent = cards.length;
    if (it) it.textContent = items.length;
  }

  /* ---------- scroll-to-top ---------- */
  function initScrollToTop() {
    var btn = document.getElementById('toTop');
    if (!btn) return;
    var shown = false;
    function update() {
      var should = window.pageYOffset > 300;
      if (should === shown) return;
      shown = should;
      btn.style.display = should ? 'block' : 'none';
    }
    window.addEventListener('scroll', update, { passive: true });
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    update();
  }

  /* ---------- top progress bar ---------- */
  function initProgressBar() {
    var fill = $('.progress-bar__fill');
    if (!fill) return;
    function update() {
      var doc = document.documentElement;
      var scrolled = window.pageYOffset;
      var max = doc.scrollHeight - window.innerHeight;
      var pct = max > 0 ? Math.min(100, (scrolled / max) * 100) : 0;
      fill.style.width = pct + '%';
    }
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ---------- TOC active ---------- */
  function initTocActive() {
    var links = $$('.toc a[href^="#"]');
    if (!links.length || !('IntersectionObserver' in window)) return;
    var linkById = {};
    links.forEach(function (a) {
      var href = a.getAttribute('href');
      if (href && href.length > 1) linkById[href.slice(1)] = a;
    });
    var visible = {};
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) visible[e.target.id] = e.intersectionRatio;
        else delete visible[e.target.id];
      });
      var bestId = null, bestRatio = -1;
      for (var id in visible) {
        if (visible[id] > bestRatio) { bestRatio = visible[id]; bestId = id; }
      }
      links.forEach(function (a) { a.classList.remove('is-active'); });
      if (bestId && linkById[bestId]) linkById[bestId].classList.add('is-active');
    }, { rootMargin: '-20% 0px -60% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] });
    for (var k in linkById) {
      var target = document.getElementById(k);
      if (target) observer.observe(target);
    }
  }

  /* ---------- init ---------- */
  function init() {
    bindLang();
    bindTheme();
    applyTheme(detectTheme());
    applyLang(detectLang());
    updateStats();
    initScrollToTop();
    initProgressBar();
    initTocActive();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

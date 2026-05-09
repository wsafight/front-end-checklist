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

  /* ---------- skill tabs & clipboard ---------- */
  function initSkillTabs() {
    var root = $('.skill-banner');
    if (!root) return;

    function activate(group, value) {
      $$('[data-tab-group="' + group + '"]', root).forEach(function (btn) {
        var active = btn.getAttribute('data-tab-value') === value;
        btn.classList.toggle('is-active', active);
        btn.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      $$('[data-tab-panel="' + group + '"]', root).forEach(function (panel) {
        panel.hidden = panel.getAttribute('data-tab-value') !== value;
      });
    }

    $$('[data-tab-group]', root).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var group = btn.getAttribute('data-tab-group');
        activate(group, btn.getAttribute('data-tab-value'));
        if (group === 'tool') activate('scope', 'global');
      });
    });
    activate('tool', 'claude');
    activate('scope', 'global');
  }

  function initCopyButtons() {
    $$('.copy-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var sel = btn.getAttribute('data-copy-target');
        var target = sel && document.querySelector(sel);
        if (!target) return;
        var text = target.textContent.trim();
        var lang = document.documentElement.getAttribute('data-lang') || DEFAULT_LANG;
        var original = btn.getAttribute('data-' + lang)
          || btn.getAttribute('data-label-default')
          || btn.textContent;
        var copied = btn.getAttribute('data-copied-' + lang)
          || btn.getAttribute('data-label-copied')
          || '✓';
        var done = function () {
          btn.textContent = copied;
          btn.classList.add('is-copied');
          setTimeout(function () {
            var nowLang = document.documentElement.getAttribute('data-lang') || DEFAULT_LANG;
            btn.textContent = btn.getAttribute('data-' + nowLang) || original;
            btn.classList.remove('is-copied');
          }, 1500);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text, done); });
        } else {
          fallbackCopy(text, done);
        }
      });
    });
  }

  function fallbackCopy(text, cb) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'absolute';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
    cb && cb();
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
    initSkillTabs();
    initCopyButtons();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

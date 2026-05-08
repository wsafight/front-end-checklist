(function () {
  var STORAGE_KEY = 'fec-lang';
  var THEME_KEY = 'fec-theme';
  var CHECK_KEY = 'fec-checked';
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

    wrapTocLabels();

    $$('[data-i18n]').forEach(function (el) {
      var text = el.getAttribute('data-' + lang);
      if (text != null) el.innerHTML = text;
    });
    $$('[data-i18n-ph]').forEach(function (el) {
      var text = el.getAttribute('data-ph-' + lang);
      if (text != null) el.setAttribute('placeholder', text);
    });

    $$('.lang-btn').forEach(function (btn) {
      var active = btn.getAttribute('data-lang') === lang;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}

    updateTocCounts();
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

  /* ---------- TOC active + counts ---------- */
  function wrapTocLabels() {
    $$('.toc a[href^="#"]').forEach(function (a) {
      if (a.querySelector('.toc-label')) return;
      var label = document.createElement('span');
      label.className = 'toc-label';
      label.innerHTML = a.innerHTML;
      ['data-i18n', 'data-zh', 'data-en'].forEach(function (attr) {
        if (a.hasAttribute(attr)) {
          label.setAttribute(attr, a.getAttribute(attr));
          a.removeAttribute(attr);
        }
      });
      a.innerHTML = '';
      a.appendChild(label);
    });
  }

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

  /* ---------- checkable items + progress ---------- */
  var checked = {};
  function loadChecked() {
    try { checked = JSON.parse(localStorage.getItem(CHECK_KEY) || '{}') || {}; }
    catch (e) { checked = {}; }
  }
  function saveChecked() {
    try { localStorage.setItem(CHECK_KEY, JSON.stringify(checked)); } catch (e) {}
  }

  function enhanceItems() {
    var idx = 0;
    $$('.card').forEach(function (card) {
      var sid = card.id || ('s' + idx);

      // wrap h2 + progress
      var head = card.querySelector('.card-head');
      if (!head) {
        head = document.createElement('div');
        head.className = 'card-head';
        var h2 = card.querySelector('h2');
        card.insertBefore(head, h2);
        head.appendChild(h2);
        var prog = document.createElement('div');
        prog.className = 'card-progress';
        prog.innerHTML = '<span class="track"><span class="fill"></span></span><span class="count">0/0</span>';
        head.appendChild(prog);
      }

      // wrap li with checkbox + text span
      $$('ul > li', card).forEach(function (li, i) {
        if (li.querySelector('.li-check')) return;
        var key = sid + ':' + i;
        li.setAttribute('data-key', key);
        var text = document.createElement('span');
        text.className = 'li-text';
        // move i18n attrs to inner span so applyLang rewrites text only
        ['data-i18n', 'data-zh', 'data-en'].forEach(function (attr) {
          if (li.hasAttribute(attr)) {
            text.setAttribute(attr, li.getAttribute(attr));
            li.removeAttribute(attr);
          }
        });
        while (li.firstChild) text.appendChild(li.firstChild);
        var cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.className = 'li-check';
        cb.setAttribute('aria-label', 'mark done');
        if (checked[key]) { cb.checked = true; li.classList.add('is-checked'); }
        cb.addEventListener('change', function () {
          if (cb.checked) { checked[key] = 1; li.classList.add('is-checked'); }
          else { delete checked[key]; li.classList.remove('is-checked'); }
          saveChecked();
          updateCardProgress(card);
          updateGlobalProgress();
          updateTocCounts();
        });
        li.appendChild(cb);
        li.appendChild(text);
      });

      updateCardProgress(card);
      idx++;
    });
  }

  function updateCardProgress(card) {
    var items = $$('ul > li', card);
    var total = items.length;
    var done = items.filter(function (li) { return li.classList.contains('is-checked'); }).length;
    var fill = card.querySelector('.card-progress .fill');
    var cnt = card.querySelector('.card-progress .count');
    var pct = total ? (done / total) * 100 : 0;
    if (fill) fill.style.width = pct + '%';
    if (cnt) cnt.textContent = done + '/' + total;
    card.classList.toggle('is-complete', total > 0 && done === total);
  }

  function updateGlobalProgress() {
    var items = $$('.card ul > li');
    var total = items.length;
    var done = items.filter(function (li) { return li.classList.contains('is-checked'); }).length;
    var fill = $('#globalFill');
    var cnt = $('#globalCount');
    if (fill) fill.style.width = (total ? (done / total) * 100 : 0) + '%';
    if (cnt) cnt.textContent = done + ' / ' + total;

    var itemsStat = document.querySelector('[data-stat="items"]');
    if (itemsStat) itemsStat.textContent = total;
    var secStat = document.querySelector('[data-stat="sections"]');
    if (secStat) secStat.textContent = $$('.card').length;
  }

  function updateTocCounts() {
    $$('.card').forEach(function (card) {
      var link = document.querySelector('.toc a[href="#' + card.id + '"]');
      if (!link) return;
      var items = $$('ul > li', card);
      var total = items.length;
      var done = items.filter(function (li) { return li.classList.contains('is-checked'); }).length;
      link.classList.toggle('is-done', total > 0 && done === total);
    });
  }

  function bindReset() {
    var btn = $('#resetProgress');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var msg = document.documentElement.getAttribute('data-lang') === 'en'
        ? 'Reset all checked items?'
        : '确定要重置所有勾选吗？';
      if (!confirm(msg)) return;
      checked = {};
      saveChecked();
      $$('.card ul > li').forEach(function (li) {
        li.classList.remove('is-filtered-hidden', 'is-checked');
        var cb = li.querySelector('.li-check');
        if (cb) cb.checked = false;
      });
      $$('.card').forEach(updateCardProgress);
      updateGlobalProgress();
      updateTocCounts();
    });
  }

  /* ---------- search / filter ---------- */
  function initSearch() {
    var input = $('#searchInput');
    if (!input) return;
    var t = null;
    input.addEventListener('input', function () {
      clearTimeout(t);
      t = setTimeout(function () { filter(input.value.trim().toLowerCase()); }, 80);
    });
    // "/" focuses search
    document.addEventListener('keydown', function (e) {
      if (e.key === '/' && document.activeElement !== input) {
        var tag = (document.activeElement && document.activeElement.tagName) || '';
        if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
          e.preventDefault();
          input.focus();
          input.select();
        }
      }
      if (e.key === 'Escape' && document.activeElement === input) {
        input.value = '';
        filter('');
        input.blur();
      }
    });
  }

  function filter(q) {
    var noRes = $('#noResults');
    var anyVisible = false;
    $$('.card').forEach(function (card) {
      var items = $$('ul > li', card);
      var hasMatch = false;
      items.forEach(function (li) {
        var text = (li.querySelector('.li-text') || li).textContent.toLowerCase();
        var head = (card.querySelector('h2') || {}).textContent || '';
        var match = !q || text.indexOf(q) !== -1 || head.toLowerCase().indexOf(q) !== -1;
        li.classList.toggle('is-filtered-hidden', !match);
        if (match) hasMatch = true;
        highlight(li, q);
      });
      card.classList.toggle('is-filtered-hidden', !hasMatch);
      if (hasMatch) anyVisible = true;
    });
    if (noRes) noRes.classList.toggle('is-visible', !!q && !anyVisible);
  }

  function highlight(li, q) {
    var textEl = li.querySelector('.li-text');
    if (!textEl) return;
    // restore original text on clear
    if (!q) {
      if (textEl.dataset.original) { textEl.innerHTML = textEl.dataset.original; delete textEl.dataset.original; }
      return;
    }
    if (!textEl.dataset.original) textEl.dataset.original = textEl.innerHTML;
    var src = textEl.dataset.original;
    // avoid breaking <code> by splitting on tag boundaries
    var parts = src.split(/(<[^>]+>)/);
    var re = new RegExp(escapeReg(q), 'gi');
    for (var i = 0; i < parts.length; i++) {
      if (parts[i][0] !== '<') parts[i] = parts[i].replace(re, function (m) { return '<mark class="hl">' + m + '</mark>'; });
    }
    textEl.innerHTML = parts.join('');
  }
  function escapeReg(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  /* ---------- init ---------- */
  function init() {
    loadChecked();
    bindLang();
    bindTheme();
    applyTheme(detectTheme());
    enhanceItems();
    applyLang(detectLang());
    updateGlobalProgress();
    updateTocCounts();
    initScrollToTop();
    initProgressBar();
    initTocActive();
    initSearch();
    bindReset();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

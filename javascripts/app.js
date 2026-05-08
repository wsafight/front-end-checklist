(function () {
  var STORAGE_KEY = 'fec-lang';
  var CHECKED_KEY = 'fec-checked';
  var DEFAULT_LANG = 'zh';
  var supported = ['zh', 'en'];

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

    var nodes = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var text = el.getAttribute('data-' + lang);
      if (text !== null && text !== undefined) {
        el.innerHTML = text;
      }
    }

    var buttons = document.querySelectorAll('.lang-btn');
    for (var j = 0; j < buttons.length; j++) {
      var btn = buttons[j];
      var active = btn.getAttribute('data-lang') === lang;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    }

    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
  }

  function bindLang() {
    var buttons = document.querySelectorAll('.lang-btn');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', function () {
        applyLang(this.getAttribute('data-lang'));
      });
    }
  }

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

  function initProgressBar() {
    var fill = document.querySelector('.progress-bar__fill');
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

  function getCheckedSet() {
    try {
      var raw = localStorage.getItem(CHECKED_KEY);
      if (!raw) return {};
      var parsed = JSON.parse(raw);
      return (parsed && typeof parsed === 'object') ? parsed : {};
    } catch (e) { return {}; }
  }

  function saveChecked(set) {
    try { localStorage.setItem(CHECKED_KEY, JSON.stringify(set)); } catch (e) {}
  }

  function itemKey(li) {
    var card = li.closest('.card');
    if (!card) return null;
    var siblings = card.querySelectorAll('li');
    for (var i = 0; i < siblings.length; i++) {
      if (siblings[i] === li) return card.id + ':' + i;
    }
    return null;
  }

  function initChecklist() {
    var checked = getCheckedSet();
    var lis = document.querySelectorAll('.card li');
    for (var i = 0; i < lis.length; i++) {
      var key = itemKey(lis[i]);
      if (key && checked[key]) lis[i].classList.add('is-checked');
    }

    document.addEventListener('click', function (e) {
      var li = e.target.closest ? e.target.closest('.card li') : null;
      if (!li) return;
      if (e.target.tagName === 'A' || e.target.tagName === 'CODE') return;
      li.classList.toggle('is-checked');
      var key = itemKey(li);
      if (key) {
        var set = getCheckedSet();
        if (li.classList.contains('is-checked')) set[key] = 1;
        else delete set[key];
        saveChecked(set);
      }
      updateCardCounts();
    });
  }

  function updateCardCounts() {
    var cards = document.querySelectorAll('.card');
    for (var i = 0; i < cards.length; i++) {
      var card = cards[i];
      var countEl = card.querySelector('.card-count');
      if (!countEl) continue;
      var total = card.querySelectorAll('li').length;
      var done = card.querySelectorAll('li.is-checked').length;
      countEl.textContent = done + ' / ' + total;
    }
  }

  function injectCardCounts() {
    var cards = document.querySelectorAll('.card');
    for (var i = 0; i < cards.length; i++) {
      var h2 = cards[i].querySelector('h2');
      if (!h2 || h2.querySelector('.card-count')) continue;
      var span = document.createElement('span');
      span.className = 'card-count';
      h2.appendChild(span);
    }
    updateCardCounts();
  }

  function initTocActive() {
    var tocLinks = document.querySelectorAll('.toc a[href^="#"]');
    if (!tocLinks.length || !('IntersectionObserver' in window)) return;

    var linkById = {};
    for (var i = 0; i < tocLinks.length; i++) {
      var href = tocLinks[i].getAttribute('href');
      if (href && href.length > 1) linkById[href.slice(1)] = tocLinks[i];
    }

    var visible = {};
    var observer = new IntersectionObserver(function (entries) {
      for (var k = 0; k < entries.length; k++) {
        var entry = entries[k];
        var id = entry.target.id;
        if (entry.isIntersecting) visible[id] = entry.intersectionRatio;
        else delete visible[id];
      }
      var bestId = null;
      var bestRatio = -1;
      for (var id in visible) {
        if (visible[id] > bestRatio) { bestRatio = visible[id]; bestId = id; }
      }
      for (var j = 0; j < tocLinks.length; j++) tocLinks[j].classList.remove('is-active');
      if (bestId && linkById[bestId]) linkById[bestId].classList.add('is-active');
    }, {
      rootMargin: '-20% 0px -60% 0px',
      threshold: [0, 0.25, 0.5, 0.75, 1]
    });

    for (var id2 in linkById) {
      var target = document.getElementById(id2);
      if (target) observer.observe(target);
    }
  }

  function init() {
    bindLang();
    applyLang(detectLang());
    injectCardCounts();
    initChecklist();
    updateCardCounts();
    initScrollToTop();
    initProgressBar();
    initTocActive();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

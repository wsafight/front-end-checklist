(function () {
  'use strict';

  var LANG_KEY = 'data-lang';
  var DEFAULT_LANG = 'zh';

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function currentLang() { return document.documentElement.getAttribute(LANG_KEY) || DEFAULT_LANG; }

  /* ---------- tiny html escape ---------- */
  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* ---------- tsx highlighter (span-based, safe) ---------- */
  // Tokenize so strings/comments aren't inside highlighted keywords.
  var TSX_KEYWORDS = /\b(import|from|export|const|let|var|function|return|if|else|for|while|switch|case|break|continue|new|typeof|instanceof|in|of|async|await|try|catch|finally|throw|class|extends|interface|type|implements|public|private|protected|readonly|static|as|void|true|false|null|undefined|this|super|default)\b/g;

  function highlightTsx(src) {
    var out = '';
    var i = 0;
    var n = src.length;
    while (i < n) {
      var ch = src[i];
      var two = src.substr(i, 2);
      // line comment
      if (two === '//') {
        var j = src.indexOf('\n', i);
        if (j === -1) j = n;
        out += '<span class="tok-c">' + esc(src.slice(i, j)) + '</span>';
        i = j;
        continue;
      }
      // block comment
      if (two === '/*') {
        var k = src.indexOf('*/', i + 2);
        k = k === -1 ? n : k + 2;
        out += '<span class="tok-c">' + esc(src.slice(i, k)) + '</span>';
        i = k;
        continue;
      }
      // strings
      if (ch === '"' || ch === "'" || ch === '`') {
        var quote = ch;
        var p = i + 1;
        while (p < n) {
          if (src[p] === '\\') { p += 2; continue; }
          if (src[p] === quote) { p++; break; }
          p++;
        }
        out += '<span class="tok-s">' + esc(src.slice(i, p)) + '</span>';
        i = p;
        continue;
      }
      // numbers
      if (/[0-9]/.test(ch) && (i === 0 || /[^A-Za-z_$0-9]/.test(src[i - 1]))) {
        var q = i;
        while (q < n && /[0-9.]/.test(src[q])) q++;
        out += '<span class="tok-n">' + esc(src.slice(i, q)) + '</span>';
        i = q;
        continue;
      }
      // identifier / keyword
      if (/[A-Za-z_$]/.test(ch)) {
        var r = i;
        while (r < n && /[A-Za-z0-9_$]/.test(src[r])) r++;
        var word = src.slice(i, r);
        if (/^(import|from|export|const|let|var|function|return|if|else|for|while|switch|case|break|continue|new|typeof|instanceof|in|of|async|await|try|catch|finally|throw|class|extends|interface|type|implements|public|private|protected|readonly|static|as|void|true|false|null|undefined|this|super|default)$/.test(word)) {
          out += '<span class="tok-k">' + esc(word) + '</span>';
        } else {
          out += esc(word);
        }
        i = r;
        continue;
      }
      // fall-through
      out += esc(ch);
      i++;
    }
    // suppress linter warning for unused regex var
    void TSX_KEYWORDS;
    return out;
  }

  /* ---------- tiny markdown renderer (subset) ---------- */
  // Supports: ## h2 / ### h3 / - list / **bold** / `code` / ```fenced blocks``` / paragraphs.
  function renderInline(text) {
    // escape first, then re-inject span markup
    var s = esc(text);
    s = s.replace(/`([^`]+)`/g, function (_, c) { return '<code>' + c + '</code>'; });
    s = s.replace(/\*\*([^*]+)\*\*/g, function (_, c) { return '<strong>' + c + '</strong>'; });
    return s;
  }

  function renderMarkdown(md) {
    var lines = md.replace(/\r\n/g, '\n').split('\n');
    var html = [];
    var i = 0;
    var inList = false;
    var listBuf = [];

    function flushList() {
      if (!inList) return;
      html.push('<ul class="md-list">' + listBuf.join('') + '</ul>');
      listBuf = [];
      inList = false;
    }

    while (i < lines.length) {
      var line = lines[i];

      // fenced code block
      if (/^```/.test(line)) {
        flushList();
        var lang = line.replace(/^```/, '').trim();
        var buf = [];
        i++;
        while (i < lines.length && !/^```/.test(lines[i])) { buf.push(lines[i]); i++; }
        i++; // skip closing fence
        var body = buf.join('\n');
        var rendered = /^(tsx|ts|jsx|js|javascript|typescript)$/i.test(lang)
          ? highlightTsx(body)
          : esc(body);
        html.push('<pre class="md-pre"><code>' + rendered + '</code></pre>');
        continue;
      }

      // headings
      var h3 = line.match(/^###\s+(.*)$/);
      if (h3) { flushList(); html.push('<h3 class="md-h3">' + renderInline(h3[1]) + '</h3>'); i++; continue; }
      var h2 = line.match(/^##\s+(.*)$/);
      if (h2) { flushList(); html.push('<h2 class="md-h2">' + renderInline(h2[1]) + '</h2>'); i++; continue; }

      // list item — group consecutive
      var li = line.match(/^(\s*)-\s+(.*)$/);
      if (li) {
        var indent = li[1].length;
        inList = true;
        listBuf.push('<li data-indent="' + indent + '">' + renderInline(li[2]) + '</li>');
        i++;
        continue;
      }

      // blank line — terminate list, add spacing
      if (/^\s*$/.test(line)) { flushList(); i++; continue; }

      // paragraph
      flushList();
      html.push('<p class="md-p">' + renderInline(line) + '</p>');
      i++;
    }
    flushList();
    return html.join('\n');
  }

  /* ---------- severity label ---------- */
  var SEVERITY_I18N = {
    high:   { zh: '严重', en: 'High' },
    medium: { zh: '中等', en: 'Medium' },
    low:    { zh: '轻微', en: 'Low' }
  };

  function countHits(md) {
    var m = md.match(/##\s*命中问题[^0-9]*(\d+)/);
    return m ? parseInt(m[1], 10) : 0;
  }

  /* ---------- render ---------- */
  function cardHtml(c, lang) {
    var title = (lang === 'en' ? c.title_en : c.title_zh) || c.title_zh || c.id;
    var sev = SEVERITY_I18N[c.severity] || SEVERITY_I18N.medium;
    var hits = countHits(c.review);
    var hitsLabel = lang === 'en' ? (hits + ' hits') : ('命中 ' + hits + ' 项');
    var groups = (c.groups || []).map(function (g) { return '<span class="sc-tag">' + esc(g) + '</span>'; }).join('');
    return [
      '<article class="sc-card" data-severity="' + esc(c.severity) + '" data-id="' + esc(c.id) + '">',
      '  <header class="sc-card-head">',
      '    <div class="sc-card-title">',
      '      <h3>' + esc(title) + '</h3>',
      '      <p class="sc-card-meta">',
      '        <span class="sc-stack">' + esc(c.stack || '') + '</span>',
      '        <span class="sc-sep">·</span>',
      '        <span class="sc-sev sc-sev-' + esc(c.severity) + '">' + esc(sev[lang] || sev.zh) + '</span>',
      '        <span class="sc-sep">·</span>',
      '        <span class="sc-hits">' + esc(hitsLabel) + '</span>',
      '      </p>',
      '    </div>',
      '    <div class="sc-card-tags">' + groups + '</div>',
      '  </header>',
      '  <div class="sc-card-body">',
      '    <div class="sc-pane sc-pane-code">',
      '      <div class="sc-pane-label">' + (lang === 'en' ? 'Bad code' : '坏代码') + '</div>',
      '      <pre class="sc-code"><code>' + highlightTsx(c.code) + '</code></pre>',
      '    </div>',
      '    <div class="sc-pane sc-pane-review">',
      '      <div class="sc-pane-label">' + (lang === 'en' ? 'Skill review' : 'Skill 审查报告') + '</div>',
      '      <div class="sc-review">' + renderMarkdown(c.review) + '</div>',
      '    </div>',
      '  </div>',
      '</article>'
    ].join('\n');
  }

  function applyFilter(root, filter) {
    var cards = $$('.sc-card', root);
    var visible = 0;
    cards.forEach(function (card) {
      var match = filter === 'all' || card.getAttribute('data-severity') === filter;
      card.hidden = !match;
      if (match) visible++;
    });
    return visible;
  }

  function updateCount(page, n) {
    var el = $('.showcase-count', page);
    if (!el) return;
    var lang = currentLang();
    var tmpl = el.getAttribute('data-' + lang + '-tmpl') || '{n}';
    el.textContent = tmpl.replace('{n}', n);
  }

  function bindFilters(root, page) {
    var chips = $$('.showcase-chip', page);
    if (!chips.length) return;
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (c) {
          c.classList.remove('is-active');
          c.setAttribute('aria-pressed', 'false');
        });
        chip.classList.add('is-active');
        chip.setAttribute('aria-pressed', 'true');
        var filter = chip.getAttribute('data-filter');
        var n = applyFilter(root, filter);
        updateCount(page, n);
        var empty = $('.showcase-empty', page);
        if (empty) empty.hidden = n !== 0;
      });
    });
  }

  function init() {
    var containers = $$('.showcase-list[data-endpoint]');
    if (!containers.length) return;

    containers.forEach(function (container) {
      var endpoint = container.getAttribute('data-endpoint');
      var mode = container.getAttribute('data-mode') || 'full';
      var featured = (container.getAttribute('data-featured') || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);

      fetch(endpoint, { cache: 'no-cache' })
        .then(function (r) {
          if (!r.ok) throw new Error('fetch failed: ' + r.status);
          return r.json();
        })
        .then(function (data) {
          var cases = data.cases || [];
          if (mode === 'featured' && featured.length) {
            var byId = {};
            cases.forEach(function (c) { byId[c.id] = c; });
            cases = featured.map(function (id) { return byId[id]; }).filter(Boolean);
          }
          var lang = currentLang();
          container.innerHTML = cases.map(function (c) { return cardHtml(c, lang); }).join('\n');

          var page = container.closest('.showcase-page') || document;
          if (mode === 'full') {
            updateCount(page, cases.length);
            bindFilters(container, page);
          }

          // Re-apply lang to dynamically rendered [data-i18n] if any appear later.
          document.dispatchEvent(new CustomEvent('showcase:rendered', { detail: { container: container } }));
        })
        .catch(function (e) {
          container.innerHTML = '<p class="sc-error">showcase.json load failed: ' + esc(e.message) + '</p>';
        });
    });
  }

  // Re-render on language switch so card labels track lang toggle.
  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('.lang-btn');
    if (!btn) return;
    // Defer so app.js applies lang first.
    setTimeout(init, 0);
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

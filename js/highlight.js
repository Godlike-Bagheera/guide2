/* Подсветка синтаксиса кода (Highlight.js) — с подстройкой под тему сайта */
(function () {
  'use strict';

  // Локальные копии тем (atom-one) — подсветка синхронизируется с темой сайта
  var LIGHT = 'css/hljs-light.css';
  var DARK = 'css/hljs-dark.css';

  function isDarkTheme() {
    var t = document.documentElement.getAttribute('data-theme') || '';
    return t === 'dark' || t === 'rose-dark';
  }

  function setHljsTheme(href) {
    var link = document.getElementById('hljs-theme');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'stylesheet';
      link.id = 'hljs-theme';
      document.head.appendChild(link);
    }
    if (link.getAttribute('href') !== href) link.setAttribute('href', href);
  }

  function highlightAll() {
    if (!window.hljs) return;
    document.querySelectorAll('pre code:not(.hljs-done)').forEach(function (el) {
      try { window.hljs.highlightElement(el); } catch (e) { /* пропускаем нестандартный блок */ }
      el.classList.add('hljs-done');
    });
  }

  function applyTheme() {
    setHljsTheme(isDarkTheme() ? DARK : LIGHT);
  }

  function init() {
    applyTheme();
    // следим за сменой темы (theme.js меняет атрибут data-theme на <html>)
    new MutationObserver(applyTheme).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11/build/highlight.min.js';
    s.onload = function () {
      // догружаем часто используемые языки поверх базового набора
      ['bash', 'python', 'json', 'javascript', 'xml', 'plaintext', 'ini'].forEach(function (lang) {
        var ls = document.createElement('script');
        ls.src = 'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11/build/languages/' + lang + '.min.js';
        ls.onload = function () {
          try { window.hljs.registerLanguage(lang, window['hljsDefine' + lang]); } catch (e) { /* уже зарегистрирован */ }
          highlightAll();
        };
        document.head.appendChild(ls);
      });
      highlightAll();
    };
    document.head.appendChild(s);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

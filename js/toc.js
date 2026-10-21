/* TOC: scroll-spy (IntersectionObserver), smooth-scroll, назад/далее */

(() => {
  'use strict';

  // Согласовано с CSS: html { scroll-padding-top: 120px; }
  const SCROLL_OFFSET = 110;

  const tocLinks = document.querySelectorAll('nav.toc a[href^="#"]');
  const sections = [...tocLinks]
    .map(a => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  /* ─── Scroll-spy через IntersectionObserver ─── */
  let activeId = null;

  function setActive(id) {
    if (!id || activeId === id) return;
    activeId = id;
    tocLinks.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + id);
    });
  }

  const spy = new IntersectionObserver(entries => {
    const visible = entries
      .filter(e => e.isIntersecting)
      .sort((a, b) => a.target.offsetTop - b.target.offsetTop);
    if (visible.length) setActive(visible[0].target.id);
  }, { rootMargin: '-120px 0px -70% 0px', threshold: 0 });

  sections.forEach(s => { if (s.id) spy.observe(s); });

  /* ─── Инициализация ─── */
  function initActive() {
    if (window.scrollY > 100) return;
    const firstSec = sections.find(s => s.id);
    if (firstSec) setActive(firstSec.id);
  }
  initActive();
  window.addEventListener('load', initActive, { once: true });

  /* ─── Плавный скролл по клику в меню ─── */
  // Скроллим к НАЧАЛУ раздела (заголовок становится сразу под шапкой),
  // а не к его концу — иначе сверху висел «хвост» предыдущего раздела
  // с кнопкой «Отметить как изученное».
  function scrollToSection(id) {
    const target = document.getElementById(id + '-sec') || document.getElementById(id);
    if (!target) return false;
    window.scrollTo({
      top: Math.max(0, target.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET),
      behavior: 'smooth'
    });
    return true;
  }

  tocLinks.forEach(a => {
    a.addEventListener('click', e => {
      if (a.classList.contains('toc-part')) return; // групповой заголовок — обычная ссылка
      if (scrollToSection(a.getAttribute('href').slice(1))) {
        e.preventDefault();
        history.replaceState(null, '', a.getAttribute('href'));
      }
    });
  });

  /* ─── Точный переход при открытии страницы с якорем (part2-react.html#jwt,
         прямая ссылка, «Назад» браузера). Нативный :target скроллит id заголовка
         в самом конце раздела — под ним оставался хвост предыдущего раздела.
         Поэтому на время загрузки запрещаем нативный скролл (:target стилизуются
         через класс .anchor-sec у <section>) и скроллим сами к началу раздела. ─── */
  const anchorIdRaw = decodeURIComponent(location.hash.slice(1));
  const anchorSec = anchorIdRaw ? document.querySelector('section[id="' + anchorIdRaw + '"]') : null;
  if (anchorSec) {
    anchorSec.classList.add('anchor-sec');
    history.scrollRestoration = 'manual';
    requestAnimationFrame(() => scrollToSection(anchorSec.id));
  }
  function jumpToHash() {
    const id = decodeURIComponent(location.hash.slice(1));
    if (!id) return;
    const sec = document.getElementById(id + '-sec');
    if (sec && !sec.classList.contains('anchor-sec')) {
      // обычный клик по TOC — уже отскроллили в обработчике
    }
    requestAnimationFrame(() => scrollToSection(id));
  }
  window.addEventListener('hashchange', jumpToHash);

  /* ─── Полоска под h2/h3 ровно по ширине текста заголовка ─── */
  // Оборачиваем содержимое заголовка в inline-блок; ::after span'а рисует
  // полоску длиной ровно со слово (см. css/base.css).
  document.querySelectorAll('main h2[id]').forEach(h => {
    if (h.querySelector(':scope > .h2-line')) return;
    const span = document.createElement('span');
    span.className = 'h2-line';
    while (h.firstChild) span.appendChild(h.firstChild);
    h.appendChild(span);
  });
  document.querySelectorAll('main h3[id]').forEach(h => {
    if (h.querySelector(':scope > .h3-line')) return;
    const span = document.createElement('span');
    span.className = 'h3-line';
    while (h.firstChild) span.appendChild(h.firstChild);
    h.appendChild(span);
  });

  /* ─── Навигация «Назад / Далее» внизу каждого раздела (по оглавлению) ─── */
  function cleanTitle(h) {
    return h.textContent.replace(/Отметить как изученное|Изучено/g, '').replace(/\s+/g, ' ').trim();
  }

  function goTo(target) {
    window.scrollTo({
      top: target.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET,
      behavior: 'smooth'
    });
    history.replaceState(null, '', '#' + target.id);
  }

  // Порядок разделов = порядок ссылок в оглавлении; заголовки берём по href.
  const orderedSections = [...new Set(
    [...tocLinks]
      .map(a => document.querySelector(a.getAttribute('href')))
      .filter(Boolean)
  )];

  orderedSections.forEach((h, i) => {
    const prev = orderedSections[i - 1];
    const next = orderedSections[i + 1];
    if (!prev && !next) return;

    const wrap = document.createElement('nav');
    wrap.className = 'section-nav';
    wrap.setAttribute('aria-label', 'Навигация по разделам');

    if (prev) {
      const a = document.createElement('a');
      a.className = 'section-nav-link prev';
      a.href = '#' + prev.id;
      a.innerHTML = '<span class="dir">← Назад</span><span class="ttl"></span>';
      a.querySelector('.ttl').textContent = cleanTitle(prev);
      a.addEventListener('click', e => { e.preventDefault(); goTo(prev); });
      wrap.appendChild(a);
    } else {
      const span = document.createElement('span');
      span.className = 'section-nav-spacer';
      wrap.appendChild(span);
    }

    if (next) {
      const a = document.createElement('a');
      a.className = 'section-nav-link next';
      a.href = '#' + next.id;
      a.innerHTML = '<span class="dir">Далее →</span><span class="ttl"></span>';
      a.querySelector('.ttl').textContent = cleanTitle(next);
      a.addEventListener('click', e => { e.preventDefault(); goTo(next); });
      wrap.appendChild(a);
    }

    // Кнопки-закладки больше НЕ создаются в DOM страницы — они живут на
    // отдельной странице bookmarks.html (там toc.js вообще не подключается).

    // Единый контейнер низа раздела: «Назад/Далее» + кнопки действий.
    // Кнопки НЕ перемещаем (перемещение ломало reveal-анимации и in-page
    // ссылки) — wrap просто встаёт рядом с ними.
    const footer = document.createElement('div');
    footer.className = 'section-footer';
    footer.appendChild(wrap);

    const markBtn = document.querySelector(`.mark-read[data-section="${h.id}"]`);
    if (markBtn) markBtn.before(footer);
    else h.after(footer); // нет кнопки — просто после заголовка
  });

  /* ─── Публичный API для main.js (J/K навигация) ─── */
  window.GuideTOC = {
    next() {
      const idx = sections.findIndex(s => s.id === activeId);
      const next = sections[Math.min(idx + 1, sections.length - 1)];
      if (next) window.scrollTo({
        top: next.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET,
        behavior: 'smooth'
      });
    },
    prev() {
      const idx = sections.findIndex(s => s.id === activeId);
      const prev = sections[Math.max(idx - 1, 0)];
      if (prev) window.scrollTo({
        top: prev.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET,
        behavior: 'smooth'
      });
    },
  };
})();
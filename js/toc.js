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
  tocLinks.forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET,
        behavior: 'smooth'
      });
      history.replaceState(null, '', a.getAttribute('href'));
    });
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
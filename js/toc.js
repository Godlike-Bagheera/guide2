/* TOC: scroll-spy (IntersectionObserver), smooth-scroll, next-section */

(() => {
  'use strict';

  // Согласовано с CSS: html { scroll-padding-top: 120px; }
  const SCROLL_OFFSET = 110;

  const tocLinks = document.querySelectorAll('nav.toc a');
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

  /* ─── Кнопки «Далее» ─── */
  const mainSections = [...document.querySelectorAll('main > h2, main > h3')];
  mainSections.forEach((h, i) => {
    const next = mainSections[i + 1];
    if (!next || !next.id) return;

    const markBtn = document.querySelector(`.mark-read[data-section="${h.id}"]`);
    const container = markBtn ? markBtn.parentElement : h.parentElement;
    if (!container) return;

    const btn = document.createElement('a');
    btn.className = 'next-section';
    btn.href = '#' + next.id;
    btn.textContent = 'Далее: ' + next.textContent.split(' ').slice(0, 4).join(' ');

    btn.addEventListener('click', e => {
      e.preventDefault();
      window.scrollTo({
        top: next.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET,
        behavior: 'smooth'
      });
      history.replaceState(null, '', '#' + next.id);
    });

    if (markBtn) markBtn.after(btn);
    else h.after(btn);
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
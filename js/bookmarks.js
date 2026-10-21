/* Закладки: клавиша B закладывает активный раздел; в сайдбаре — звёздочки
   для каждого раздела и ссылка «⭐ Закладки» на отдельную страницу
   bookmarks.html. Список закладок НЕ вставляется в <main> гайда — это ломало
   сетку страницы; он живёт на своей странице (js/bookmarks-page.js). */

(() => {
  'use strict';

  const KEY = 'guide.bookmarks.v1';

  // Гайд разбит на страницы: в localStorage закладки хранятся под чистым id
  // раздела, а data-section кнопок может быть "id@страница" — нормализуем.
  function pureId(id) { return id.split('@')[0]; }

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}'); }
    catch { return {}; }
  }
  function save(s) {
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
  }

  /* ─── Звёздочки в оглавлении (по одной на ссылку toc) ─── */
  // Вставляются внутрь <a> как <span>, поэтому layout оглавления не меняется.
  const tocAnchors = [...document.querySelectorAll('nav.toc ul a[data-star]')];

  tocAnchors.forEach(a => {
    if (a.querySelector('.bm-star')) return;
    const id = (a.getAttribute('href') || '').slice(1);
    if (!id) return;
    const star = document.createElement('span');
    star.className = 'bm-star';
    star.dataset.section = id;
    star.title = 'В закладки / убрать (B)';
    star.setAttribute('role', 'button');
    star.setAttribute('tabindex', '0');
    star.setAttribute('aria-label', 'Добавить раздел в закладки');
    star.textContent = '☆';
    const toggleHere = e => {
      e.preventDefault();
      e.stopPropagation();
      toggle(id);
    };
    star.addEventListener('click', toggleHere);
    star.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') toggleHere(e);
    });
    a.appendChild(star);
  });

  /* ─── Счётчик в ссылке «⭐ Закладки» под оглавлением ─── */
  const badge = document.getElementById('tocBmCount');

  function syncUI() {
    const state = load();
    const count = Object.keys(state).filter(id => state[id]).length;
    document.querySelectorAll('.bm-star').forEach(s => {
      const on = !!state[pureId(s.dataset.section)];
      s.classList.toggle('active', on);
      s.textContent = on ? '★' : '☆';
      s.setAttribute('aria-label', on ? 'Убрать раздел из закладок' : 'Добавить раздел в закладки');
    });
    if (badge) badge.textContent = count ? String(count) : '';
    // Счётчик на звёздочке в шапке (ссылка на страницу закладок)
    document.querySelectorAll('.bm-counter').forEach(el => {
      el.textContent = count ? String(count) : '';
      el.style.display = count ? '' : 'none';
    });
  }

  function toggle(id) {
    const state = load();
    const willBeOn = !state[id];
    if (willBeOn) state[id] = true; else delete state[id];
    save(state);
    syncUI();
    if (typeof window.showToast === 'function') {
      window.showToast(willBeOn
        ? '⭐ Добавлено в закладки — смотрите «Закладки» в меню слева'
        : '✖ Убрано из закладок');
    }
  }

  /* ─── Горячая клавиша B — заложить текущий активный раздел ─── */
  document.addEventListener('keydown', e => {
    const tag = document.activeElement && document.activeElement.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'b' || e.key === 'B' || e.key === 'и' || e.key === 'И') {
      const active = document.querySelector('nav.toc a.active');
      if (!active) return;
      const id = (active.getAttribute('href') || '').slice(1);
      if (id) { e.preventDefault(); toggle(id); }
    }
  });

  // Обновляем при открытии вкладки и при изменениях в других вкладках
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) syncUI();
  });
  window.addEventListener('storage', e => {
    if (e.key === KEY) syncUI();
  });

  syncUI();
})();

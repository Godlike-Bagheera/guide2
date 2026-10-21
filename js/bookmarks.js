/* Закладки на разделы: сохраняются в localStorage, кнопка ☆ у кнопки «Отметить как изученное» */

(() => {
  'use strict';

  const KEY = 'guide.bookmarks.v1';

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}'); }
    catch { return {}; }
  }
  function save(s) {
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
  }

  function sectionTitle(id) {
    const h = document.getElementById(id);
    if (!h) return id;
    return h.textContent.replace(/Отметить как изученное|Изучено/g, '').replace(/\s+/g, ' ').trim();
  }

  /* ─── Панель закладок (вставляется после оглавления в сайдбаре) ─── */
  const tocNav = document.querySelector('nav.toc');
  let panel = null;
  if (tocNav) {
    panel = document.createElement('div');
    panel.className = 'bookmarks-panel';
    panel.hidden = true;
    panel.innerHTML =
      '<div class="bm-head">⭐ Закладки <span class="bm-count"></span></div>' +
      '<ul class="bm-list"></ul>' +
      '<button type="button" class="bm-clear">Очистить закладки</button>';
    tocNav.insertAdjacentElement('afterend', panel);
  }
  const bmList = panel ? panel.querySelector('.bm-list') : null;
  const bmCount = panel ? panel.querySelector('.bm-count') : null;
  const bmClear = panel ? panel.querySelector('.bm-clear') : null;

  function renderPanel() {
    if (!panel || !bmList) return;
    const state = load();
    const ids = Object.keys(state).filter(id => state[id]);
    panel.hidden = ids.length === 0;
    if (bmCount) bmCount.textContent = ids.length ? `(${ids.length})` : '';
    bmList.innerHTML = '';
    ids.forEach(id => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = '#' + id;
      a.textContent = sectionTitle(id);
      a.addEventListener('click', e => {
        const h = document.getElementById(id);
        if (!h) return;
        e.preventDefault();
        window.scrollTo({
          top: h.getBoundingClientRect().top + window.scrollY - 110,
          behavior: 'smooth'
        });
        history.replaceState(null, '', '#' + id);
      });
      const x = document.createElement('button');
      x.type = 'button';
      x.className = 'bm-del';
      x.setAttribute('aria-label', 'Удалить закладку');
      x.textContent = '×';
      x.addEventListener('click', () => toggle(id, true));
      li.appendChild(a);
      li.appendChild(x);
      bmList.appendChild(li);
    });
  }

  function syncButtons() {
    const state = load();
    document.querySelectorAll('.bookmark-btn').forEach(b => {
      const on = !!state[b.dataset.section];
      b.classList.toggle('active', on);
      b.firstChild && (b.textContent = '');
      b.append(on ? '★' : '☆');
      b.append(document.createTextNode(' Закладка'));
    });
  }

  function toggle(id, forceOff) {
    const state = load();
    const willBeOn = forceOff ? false : !state[id];
    if (willBeOn) state[id] = true; else delete state[id];
    save(state);
    syncButtons();
    renderPanel();
    if (typeof window.showToast === 'function') {
      window.showToast(willBeOn ? '⭐ Добавлено в закладки' : '✖ Убрано из закладок');
    }
  }

  /* ─── Привязка кликов к существующим кнопкам ☆ ─── */
  // Сами кнопки создаёт toc.js рядом с .mark-read (в исходном месте DOM,
  // без перемещения элементов — это ломало вёрстку). Здесь только навешиваем
  // обработчики; если вдруг кнопки нет (например toc.js упал) — создаём сами.
  function bindOrMake() {
    let buttons = document.querySelectorAll('.bookmark-btn[data-section]');
    if (!buttons.length) {
      document.querySelectorAll('.mark-read[data-section]').forEach(markBtn => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'bookmark-btn';
        btn.dataset.section = markBtn.dataset.section;
        btn.title = 'В закладки (B)';
        btn.setAttribute('aria-label', 'Добавить раздел в закладки');
        btn.append('☆', document.createTextNode(' Закладка'));
        markBtn.before(btn);
      });
      buttons = document.querySelectorAll('.bookmark-btn[data-section]');
    }
    buttons.forEach(btn => {
      btn.addEventListener('click', () => toggle(btn.dataset.section, false));
    });
  }
  bindOrMake();

  /* Горячая клавиша B — заложить текущий активный раздел */
  document.addEventListener('keydown', e => {
    const tag = document.activeElement && document.activeElement.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'b' || e.key === 'B' || e.key === 'и' || e.key === 'И') {
      const active = document.querySelector('nav.toc a.active');
      if (!active) return;
      const id = (active.getAttribute('href') || '').slice(1);
      if (id) { e.preventDefault(); toggle(id, false); }
    }
  });

  if (bmClear) {
    bmClear.addEventListener('click', () => {
      try { localStorage.removeItem(KEY); } catch {}
      syncButtons();
      renderPanel();
      if (typeof window.showToast === 'function') window.showToast('🗑 Закладки очищены');
    });
  }

  // синхронизируем состояние кнопок и панели при старте
  syncButtons();
  renderPanel();
})();

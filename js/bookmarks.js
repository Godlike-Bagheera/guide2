/* Закладки на разделы: сохраняются в localStorage, кнопка ★ у каждого заголовка */

(() => {
  'use strict';

  const KEY = 'bookmarks';

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}'); }
    catch { return {}; }
  }
  function save(s) {
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
  }

  function sectionTitle(h) {
    return h.textContent.replace(/Отметить как изученное|Изучено/g, '').replace(/\s+/g, ' ').trim();
  }

  /* ─── Панель закладок (вставляется после оглавления в сайдбаре) ─── */
  const tocNav = document.querySelector('nav.toc');
  let panel = null;
  if (tocNav) {
    panel = document.createElement('div');
    panel.className = 'bookmarks-panel';
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
      const h = document.getElementById(id);
      if (!h) return;
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = '#' + id;
      a.textContent = sectionTitle(h);
      a.addEventListener('click', e => {
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

  function toggle(id, forceOff) {
    const state = load();
    const willBeOn = forceOff ? false : !state[id];
    if (willBeOn) state[id] = true; else delete state[id];
    save(state);
    document.querySelectorAll(`.bookmark-btn[data-section="${id}"]`)
      .forEach(b => b.classList.toggle('active', willBeOn));
    renderPanel();
    if (typeof window.showToast === 'function') {
      window.showToast(willBeOn ? '⭐ Добавлено в закладки' : '✖ Убрано из закладок');
    }
  }

  /* ─── Кнопки ★ у каждого заголовка раздела (рядом с «Отметить как изученное») ─── */
  document.querySelectorAll('main > h2[id], main > h3[id]').forEach(h => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'bookmark-btn';
    btn.dataset.section = h.id;
    btn.title = 'В закладки (B)';
    btn.setAttribute('aria-label', 'Добавить раздел в закладки');
    btn.textContent = '☆';
    const markBtn = document.querySelector(`.mark-read[data-section="${h.id}"]`);
    if (markBtn) markBtn.before(btn);
    else h.after(btn);
  });

  document.querySelectorAll('.bookmark-btn').forEach(btn => {
    btn.addEventListener('click', () => toggle(btn.dataset.section, false));
  });

  /* Горячая клавиша B — заложить текущий активный раздел */
  document.addEventListener('keydown', e => {
    const tag = document.activeElement && document.activeElement.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || e.ctrlKey || e.metaKey) return;
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
      document.querySelectorAll('.bookmark-btn.active')
        .forEach(b => { b.classList.remove('active'); b.textContent = '☆'; });
      renderPanel();
      if (typeof window.showToast === 'function') window.showToast('🗑 Закладки очищены');
    });
  }

  // синхронизируем состояние кнопок и панели при старте
  const state = load();
  Object.keys(state).forEach(id => {
    const b = document.querySelector(`.bookmark-btn[data-section="${id}"]`);
    if (b) { b.classList.add('active'); b.textContent = '★'; }
  });
  renderPanel();
})();

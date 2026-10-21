/* Прогресс чтения + study-прогресс (без скрытия studyBar при 100%) */

(() => {
  'use strict';

  const readingBarFill = document.getElementById('readingBarFill');
  const markButtons = document.querySelectorAll('.mark-read');
  const trackLinks = document.querySelectorAll('nav.toc a[data-track]');
  // Ключ раздела: "id@страница" (после разбивки гайда) или чистый id.
  // Считаем и старые, и новые ключи, чтобы прогресс не потерялся.
  function sectionKeys(sec) {
    return sec.includes('@') ? [sec, sec.split('@')[0]] : [sec, sec + '@' + location.pathname.split('/').pop()];
  }
  function isDone(state, sec) { return sectionKeys(sec).some(k => !!state[k]); }
  const studyFill   = document.getElementById('studyFill');
  const studyDone   = document.getElementById('studyDone');
  const studyTotal  = document.getElementById('studyTotal');
  const studyIconPct = document.getElementById('studyIconPct');
  const studyReset  = document.getElementById('studyReset');
  const exportBtn   = document.getElementById('exportBtn');
  const studyBar    = document.getElementById('studyBar');

  const total = trackLinks.length;
  if (studyTotal) studyTotal.textContent = total;

  function loadState() {
    try { return JSON.parse(localStorage.getItem('studyProgress') || '{}'); }
    catch { return {}; }
  }
  function saveState(s) {
    try { localStorage.setItem('studyProgress', JSON.stringify(s)); } catch {}
  }

  function updateProgress() {
    const state = loadState();
    const doneKeys = new Set();
    markButtons.forEach(btn => { if (isDone(state, btn.dataset.section)) doneKeys.add(btn.dataset.section.split('@')[0]); });
    const done = doneKeys.size;
    const pct = total ? Math.round(done / total * 100) : 0;

    if (studyFill) studyFill.style.width = pct + '%';
    if (studyDone) studyDone.textContent = done;
    if (studyIconPct) studyIconPct.textContent = pct + '%';

    markButtons.forEach(btn => {
      const isBtnDone = isDone(state, btn.dataset.section);
      btn.classList.toggle('done', isBtnDone);
      btn.textContent = isBtnDone ? 'Изучено' : 'Отметить как изученное';
    });

    // НЕ скрываем — показываем поздравление
    if (studyBar) {
      studyBar.classList.toggle('complete', pct === 100 && done > 0);
    }
  }

  markButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const s = loadState();
      const key = btn.dataset.section;
      const on = !isDone(s, key);
      sectionKeys(key).forEach(k => { if (on) s[k] = true; else delete s[k]; });
      saveState(s);
      updateProgress();
      if (on && typeof window.showToast === 'function') {
        window.showToast('✅ Раздел отмечен');
      }
    });
  });

  if (studyReset) {
    studyReset.addEventListener('click', () => {
      if (confirm('Сбросить весь прогресс изучения?')) {
        try { localStorage.removeItem('studyProgress'); } catch {}
        updateProgress();
        if (typeof window.showToast === 'function') window.showToast('🔄 Прогресс сброшен');
      }
    });
  }

  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const state = loadState();
      const data = {
        exported_at: new Date().toISOString(),
        progress: state,
        done: Object.values(state).filter(Boolean).length,
        total,
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'study-progress.json';
      a.click();
      URL.revokeObjectURL(url);
      if (typeof window.showToast === 'function') window.showToast('📥 Прогресс скачан');
    });
  }

  updateProgress();

  /* ─── Экспорт для объединённого scroll-хендлера ─── */
  window.updateReadingBar = () => {
    if (!readingBarFill) return;
    const h = document.documentElement;
    const scrolled = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
    readingBarFill.style.width = scrolled + '%';
  };

  window.updateProgressUI = updateProgress;
})();
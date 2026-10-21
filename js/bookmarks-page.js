/* Страница «⭐ Закладки» (bookmarks.html): список сохранённых разделов.
   Данные читаются из localStorage, который пишет index.html (клавиша B). */

(() => {
  'use strict';

  const KEY = 'guide.bookmarks.v1';
  const GUIDE = 'index.html';

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}'); }
    catch { return {}; }
  }
  function save(s) {
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
  }

  // Название раздела берём из оглавления index.html — оно статично и не
  // зависит от загрузки самой страницы гайда.
  const TOC_TITLES = {
    'intro-all': 'Введение',
    'prerequisites': 'Prerequisites — что нужно знать до старта',
    'architecture': 'Архитектура приложения',
    'part1': 'Часть 1. Бэкенд на Django',
    'intro': '1. Введение в бэкенд',
    'no-sudo': '2. Почему без sudo и как это работает',
    'python': '3. Проверка Python и создание виртуального окружения',
    'django': '4. Создание Django-проекта',
    'django-admin': '5. Django Admin — готовая админка из коробки',
    'django-bootstrap5': '6. Django + Bootstrap 5 — django_bootstrap5',
    'api': '7. Модель, сериализатор, представления',
    'test-api': '8. Тестирование API через curl',
    'jsonplaceholder': '9. JSONPlaceholder',
    'deeper': '10. Углубляемся: что такое DRF под капотом',
    'part2': 'Часть 2. Фронтенд на React',
    'nvm': '11. Установка Node.js через nvm (без sudo)',
    'react': '12. Создание React-приложения',
    'proxy': '13. Настройка прокси Vite к Django API',
    'react-code': '14. Код React-приложения',
    'jwt': '15. Что такое JWT — разбор на примере jwt.io',
    'test': '16. Тестирование полного цикла',
    'run-all': '17. Запуск одним скриптом',
    'git-intro': '18. Git с самого начала',
    'extended-model': '19. Расширенная модель: теги и категории',
    'auth-register': '20. Регистрация пользователей',
    'tests': '21. Тесты Django',
    'env-config': '22. Переменные окружения (.env)',
    'db-schema': '23. Схема БД и жизненный цикл запроса',
    'auth-compare': '24. Аутентификация: сравнение подходов',
    'db-python': '25. База данных «на Python»: модели и миграции',
    'postgresql': '26. PostgreSQL — серьёзная база данных для продакшена',
    'deploy': '27. Деплой: выкладываем сайт в интернет',
    'cors-deep': '28. CORS глубоко',
    'troubleshooting': '29. Troubleshooting: типичные ошибки',
    'glossary': '30. Глоссарий',
    'faq': '31. FAQ — частые вопросы',
    'cheatsheet': '32. Cheat sheet — все команды в одном месте',
    'summary': '33. Итог',
    'export': '34. Экспорт гайда',
  };

  const listEl = document.getElementById('bmPageList');
  const emptyEl = document.getElementById('bmPageEmpty');
  const countEl = document.getElementById('bmPageCount');
  const clearBtn = document.getElementById('bmPageClear');

  // Порядок отображения = порядок разделов в гайде
  const ORDER = Object.keys(TOC_TITLES);

  function render() {
    if (!listEl) return;
    const state = load();
    const ids = ORDER.filter(id => state[id]);

    if (countEl) countEl.textContent = ids.length ? String(ids.length) : '';
    if (emptyEl) emptyEl.hidden = ids.length !== 0;
    if (clearBtn) clearBtn.style.display = ids.length ? '' : 'none';

    listEl.innerHTML = '';
    ids.forEach(id => {
      const li = document.createElement('li');
      li.className = 'bm-item';

      const a = document.createElement('a');
      a.className = 'bm-title';
      a.href = `${GUIDE}#${id}`;
      a.textContent = TOC_TITLES[id] || id;
      li.appendChild(a);

      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'bm-del';
      del.title = 'Удалить закладку';
      del.setAttribute('aria-label', 'Удалить закладку');
      del.textContent = '×';
      del.addEventListener('click', () => {
        const s = load();
        delete s[id];
        save(s);
        render();
        if (typeof window.showToast === 'function') {
          window.showToast('✖ Убрано из закладок');
        }
      });
      li.appendChild(del);

      listEl.appendChild(li);
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      try { localStorage.removeItem(KEY); } catch {}
      render();
      if (typeof window.showToast === 'function') {
        window.showToast('🗑 Закладки очищены');
      }
    });
  }

  render();
})();

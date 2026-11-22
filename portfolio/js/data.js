/*
 * ВСЁ СОДЕРЖИМОЕ ПОРТФОЛИО — ЗДЕСЬ.
 * Вёрстку и скрипты трогать не нужно: поменяйте данные, и страница обновится.
 *
 * Структура разделов навыков (порядок важен):
 *   HTML → JavaScript → CSS → SQL → Node.js → Git → ...
 * Новая технология = новый объект в массиве skills (см. шаблон в README.md).
 */
window.PORTFOLIO = {
  profile: {
    name: "Хайруллаев Анваржон",
    handle: "anvarjon", // ник в шапке: anvarjon@portfolio:~$
    role: "IT-администратор",
    about:
      "Слежу, чтобы серверы, сеть и рабочие места работали без сбоев. Параллельно развиваюсь в веб-разработке: HTML, JavaScript, CSS, SQL.",
  },

  contacts: [
    { label: "github", value: "github.com/Khayrullayev03", href: "https://github.com/Khayrullayev03" },
    { label: "telegram", value: "@username", href: "https://t.me/username" },
    { label: "email", value: "name@example.com", href: "mailto:name@example.com" },
  ],

  // level: Базовый · Средний · Уверенный · Продвинутый · Эксперт (влияет на шкалу [████░░])
  skills: [
    {
      id: "html",
      title: "HTML",
      file: "index.html",
      level: "Уверенный",
      summary: "Семантическая и доступная разметка, понятная браузерам и поисковикам.",
      points: [
        "Семантические теги: header, main, section, article, footer",
        "Формы и встроенная валидация браузера",
        "Доступность: label, alt, aria-атрибуты, навигация с клавиатуры",
        "Основы SEO: структура заголовков, meta-теги",
      ],
      snippet: [
        '<form class="signup">',
        '  <label for="email">Email</label>',
        '  <input id="email" type="email" required />',
        '  <button type="submit">Подписаться</button>',
        "</form>",
      ].join("\n"),
    },
    {
      id: "js",
      title: "JavaScript",
      file: "app.js",
      level: "Уверенный",
      summary: "Интерактивность на странице и работа с данными с сервера.",
      points: [
        "DOM: события, делегирование, динамическая отрисовка",
        "Асинхронность: fetch, Promise, async/await",
        "Современный синтаксис: модули, деструктуризация, методы массивов",
        "WebSocket — обмен данными в реальном времени",
      ],
      snippet: [
        "async function loadUsers() {",
        '  const res = await fetch("/api/users");',
        '  if (!res.ok) throw new Error("Ошибка загрузки");',
        "  const users = await res.json();",
        "  return users.filter((u) => u.active);",
        "}",
      ].join("\n"),
    },
    {
      id: "css",
      title: "CSS",
      file: "style.css",
      level: "Уверенный",
      summary: "Адаптивные интерфейсы, которые хорошо выглядят на любом экране.",
      points: [
        "Flexbox и Grid",
        "Адаптивная вёрстка: mobile-first, media queries",
        "CSS-переменные и темы оформления",
        "Переходы и анимации",
      ],
      snippet: [
        ".grid {",
        "  display: grid;",
        "  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));",
        "  gap: 16px;",
        "}",
      ].join("\n"),
    },
    {
      id: "sql",
      title: "SQL",
      file: "query.sql",
      level: "Средний",
      summary: "Проектирование таблиц и запросы к реляционным базам данных.",
      points: [
        "SELECT, WHERE, JOIN, GROUP BY, HAVING",
        "Проектирование таблиц и связей между ними",
        "Индексы и базовая оптимизация запросов",
        "Транзакции и целостность данных",
      ],
      snippet: [
        "SELECT u.name, COUNT(o.id) AS orders",
        "FROM users u",
        "LEFT JOIN orders o ON o.user_id = u.id",
        "GROUP BY u.name",
        "ORDER BY orders DESC;",
      ].join("\n"),
    },
    {
      id: "node",
      title: "Node.js",
      file: "server.js",
      level: "Средний",
      summary: "Серверная часть: REST API, работа с базой и переменными окружения.",
      points: [
        "Express: маршруты, middleware, обработка ошибок",
        "REST API: CRUD, статусы ответов, валидация",
        "MongoDB и Mongoose: схемы и запросы",
        "Конфигурация через .env",
      ],
      snippet: [
        'import express from "express";',
        "",
        "const app = express();",
        "app.use(express.json());",
        "",
        'app.get("/api/users/:id", async (req, res) => {',
        "  const user = await User.findById(req.params.id);",
        '  if (!user) return res.status(404).json({ error: "Не найден" });',
        "  res.json(user);",
        "});",
      ].join("\n"),
    },
    {
      id: "git",
      title: "Git",
      file: "terminal.sh",
      level: "Средний",
      summary: "Контроль версий и командная работа через GitHub.",
      points: [
        "Ветки, merge, разрешение конфликтов",
        "Pull request и code review на GitHub",
        "Понятные сообщения коммитов",
        ".gitignore и хранение секретов вне репозитория",
      ],
      snippet: [
        "git checkout -b feature/contact-form",
        "git add .",
        'git commit -m "Добавить форму обратной связи"',
        "git push -u origin feature/contact-form",
      ].join("\n"),
    },
  ],

  // ПРИМЕРЫ — замените своими проектами.
  // tech — id навыков из списка выше; demo и code — необязательные ссылки.
  projects: [
    {
      title: "Лендинг для кофейни",
      description: "Адаптивная одностраничная вёрстка с меню, галереей и картой.",
      tech: ["html", "css"],
      demo: "",
      code: "",
    },
    {
      title: "Список задач",
      description: "Добавление, фильтрация и сохранение задач в localStorage.",
      tech: ["html", "css", "js"],
      demo: "",
      code: "",
    },
    {
      title: "REST API для блога",
      description: "CRUD статей и комментариев, пагинация и поиск по заголовку.",
      tech: ["node", "sql"],
      demo: "",
      code: "",
    },
    {
      title: "Онлайн-чат",
      description: "Комнаты и сообщения в реальном времени на WebSocket.",
      tech: ["js", "node", "git"],
      demo: "",
      code: "",
    },
  ],
};

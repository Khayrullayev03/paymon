/*
 * ВСЁ СОДЕРЖИМОЕ ПОРТФОЛИО — ЗДЕСЬ.
 * Вёрстку и скрипты трогать не нужно: поменяйте данные, и страница обновится.
 *
 * Текст можно писать двумя способами:
 *   "одна строка"                      — одинаково на всех языках;
 *   { ru: "...", uz: "...", en: "..." } — свой текст для каждого языка.
 *
 * Структура разделов навыков (порядок важен):
 *   веб:            HTML → JavaScript → CSS → SQL → Node.js → Git
 *   администрирование: Linux → Windows Server → Сети → Серверы → Видеонаблюдение → Мониторинг
 * У каждого навыка своя ASCII-анимация (js/scenes.js) — по его id.
 * Новая технология = новый объект в массиве skills (см. шаблон в README.md).
 */
window.PORTFOLIO = {
  profile: {
    name: { ru: "Хайруллаев Анваржон", uz: "Xayrullayev Anvarjon", en: "Anvarjon Khayrullayev" },
    handle: "anvarjon", // ник в шапке и терминале: anvarjon@portfolio:~$
    role: { ru: "IT-администратор", uz: "IT-administrator", en: "IT administrator" },
    about: {
      ru: "Слежу, чтобы серверы, сеть и рабочие места работали без сбоев. Параллельно развиваюсь в веб-разработке: HTML, JavaScript, CSS, SQL.",
      uz: "Serverlar, tarmoq va ish joylari uzluksiz ishlashini ta’minlayman. Parallel ravishda veb-dasturlashni o‘rganyapman: HTML, JavaScript, CSS, SQL.",
      en: "I keep servers, networks and workstations running smoothly. In parallel I’m growing as a web developer: HTML, JavaScript, CSS, SQL.",
    },
  },

  contacts: [
    { label: "github", value: "github.com/Khayrullayev03", href: "https://github.com/Khayrullayev03" },
    { label: "telegram", value: "@username", href: "https://t.me/username" },
    { label: "email", value: "name@example.com", href: "mailto:name@example.com" },
  ],

  // level: basic · intermediate · confident · advanced · expert (влияет на шкалу [████░░])
  // group: web — веб-разработка, admin — администрирование
  skills: [
    {
      id: "html",
      group: "web",
      title: "HTML",
      file: "index.html",
      level: "confident",
      summary: {
        ru: "Семантическая и доступная разметка, понятная браузерам и поисковикам.",
        uz: "Brauzerlar va qidiruv tizimlari tushunadigan semantik va qulay belgilash.",
        en: "Semantic, accessible markup that browsers and search engines understand.",
      },
      points: {
        ru: [
          "Семантические теги: header, main, section, article, footer",
          "Формы и встроенная валидация браузера",
          "Доступность: label, alt, aria-атрибуты, навигация с клавиатуры",
          "Основы SEO: структура заголовков, meta-теги",
        ],
        uz: [
          "Semantik teglar: header, main, section, article, footer",
          "Formalar va brauzerning o‘rnatilgan validatsiyasi",
          "Qulaylik: label, alt, aria-atributlar, klaviatura bilan boshqarish",
          "SEO asoslari: sarlavhalar tuzilmasi, meta-teglar",
        ],
        en: [
          "Semantic tags: header, main, section, article, footer",
          "Forms and built-in browser validation",
          "Accessibility: label, alt, aria attributes, keyboard navigation",
          "SEO basics: heading structure, meta tags",
        ],
      },
      snippet: [
        '<form class="signup">',
        '  <label for="email">Email</label>',
        '  <input id="email" type="email" required />',
        '  <button type="submit">Subscribe</button>',
        "</form>",
      ].join("\n"),
    },
    {
      id: "js",
      group: "web",
      title: "JavaScript",
      file: "app.js",
      level: "confident",
      summary: {
        ru: "Интерактивность на странице и работа с данными с сервера.",
        uz: "Sahifadagi interaktivlik va serverdan kelgan ma’lumotlar bilan ishlash.",
        en: "Interactivity on the page and working with server data.",
      },
      points: {
        ru: [
          "DOM: события, делегирование, динамическая отрисовка",
          "Асинхронность: fetch, Promise, async/await",
          "Современный синтаксис: модули, деструктуризация, методы массивов",
          "WebSocket — обмен данными в реальном времени",
        ],
        uz: [
          "DOM: hodisalar, delegatsiya, dinamik chizish",
          "Asinxronlik: fetch, Promise, async/await",
          "Zamonaviy sintaksis: modullar, destrukturizatsiya, massiv metodlari",
          "WebSocket — real vaqtda ma’lumot almashish",
        ],
        en: [
          "DOM: events, delegation, dynamic rendering",
          "Async: fetch, Promise, async/await",
          "Modern syntax: modules, destructuring, array methods",
          "WebSocket for real-time data",
        ],
      },
      snippet: [
        "async function loadUsers() {",
        '  const res = await fetch("/api/users");',
        '  if (!res.ok) throw new Error("Load failed");',
        "  const users = await res.json();",
        "  return users.filter((u) => u.active);",
        "}",
      ].join("\n"),
    },
    {
      id: "css",
      group: "web",
      title: "CSS",
      file: "style.css",
      level: "confident",
      summary: {
        ru: "Адаптивные интерфейсы, которые хорошо выглядят на любом экране.",
        uz: "Har qanday ekranda chiroyli ko‘rinadigan moslashuvchan interfeyslar.",
        en: "Responsive interfaces that look good on any screen.",
      },
      points: {
        ru: ["Flexbox и Grid", "Адаптивная вёрстка: mobile-first, media queries", "CSS-переменные и темы оформления", "Переходы и анимации"],
        uz: ["Flexbox va Grid", "Moslashuvchan sahifalash: mobile-first, media queries", "CSS o‘zgaruvchilari va mavzular", "O‘tishlar va animatsiyalar"],
        en: ["Flexbox and Grid", "Responsive layout: mobile-first, media queries", "CSS variables and themes", "Transitions and animations"],
      },
      snippet: [".grid {", "  display: grid;", "  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));", "  gap: 16px;", "}"].join("\n"),
    },
    {
      id: "sql",
      group: "web",
      title: "SQL",
      file: "query.sql",
      level: "intermediate",
      summary: {
        ru: "Проектирование таблиц и запросы к реляционным базам данных.",
        uz: "Jadvallarni loyihalash va relyatsion bazalarga so‘rovlar.",
        en: "Table design and queries to relational databases.",
      },
      points: {
        ru: ["SELECT, WHERE, JOIN, GROUP BY, HAVING", "Проектирование таблиц и связей между ними", "Индексы и базовая оптимизация запросов", "Транзакции и целостность данных"],
        uz: ["SELECT, WHERE, JOIN, GROUP BY, HAVING", "Jadvallar va ular orasidagi bog‘lanishlarni loyihalash", "Indekslar va so‘rovlarni optimallashtirish asoslari", "Tranzaksiyalar va ma’lumotlar yaxlitligi"],
        en: ["SELECT, WHERE, JOIN, GROUP BY, HAVING", "Designing tables and relations", "Indexes and basic query optimization", "Transactions and data integrity"],
      },
      snippet: ["SELECT u.name, COUNT(o.id) AS orders", "FROM users u", "LEFT JOIN orders o ON o.user_id = u.id", "GROUP BY u.name", "ORDER BY orders DESC;"].join("\n"),
    },
    {
      id: "node",
      group: "web",
      title: "Node.js",
      file: "server.js",
      level: "intermediate",
      summary: {
        ru: "Серверная часть: REST API, работа с базой и переменными окружения.",
        uz: "Server qismi: REST API, ma’lumotlar bazasi va muhit o‘zgaruvchilari.",
        en: "Back end: REST APIs, databases and environment config.",
      },
      points: {
        ru: ["Express: маршруты, middleware, обработка ошибок", "REST API: CRUD, статусы ответов, валидация", "MongoDB и Mongoose: схемы и запросы", "Конфигурация через .env"],
        uz: ["Express: marshrutlar, middleware, xatolarni qayta ishlash", "REST API: CRUD, javob statuslari, validatsiya", "MongoDB va Mongoose: sxemalar va so‘rovlar", ".env orqali sozlash"],
        en: ["Express: routes, middleware, error handling", "REST API: CRUD, status codes, validation", "MongoDB and Mongoose: schemas and queries", "Configuration with .env"],
      },
      snippet: [
        'import express from "express";',
        "",
        "const app = express();",
        "app.use(express.json());",
        "",
        'app.get("/api/users/:id", async (req, res) => {',
        "  const user = await User.findById(req.params.id);",
        '  if (!user) return res.status(404).json({ error: "Not found" });',
        "  res.json(user);",
        "});",
      ].join("\n"),
    },
    {
      id: "git",
      group: "web",
      title: "Git",
      file: "terminal.sh",
      level: "intermediate",
      summary: {
        ru: "Контроль версий и командная работа через GitHub.",
        uz: "Versiyalarni boshqarish va GitHub orqali jamoaviy ish.",
        en: "Version control and teamwork on GitHub.",
      },
      points: {
        ru: ["Ветки, merge, разрешение конфликтов", "Pull request и code review на GitHub", "Понятные сообщения коммитов", ".gitignore и хранение секретов вне репозитория"],
        uz: ["Branchlar, merge, konfliktlarni hal qilish", "GitHub’da pull request va code review", "Tushunarli commit xabarlari", ".gitignore va maxfiy ma’lumotlarni repozitoriydan tashqarida saqlash"],
        en: ["Branches, merges, resolving conflicts", "Pull requests and code review on GitHub", "Clear commit messages", ".gitignore and keeping secrets out of the repo"],
      },
      snippet: ["git checkout -b feature/contact-form", "git add .", 'git commit -m "Add contact form"', "git push -u origin feature/contact-form"].join("\n"),
    },

    /* ---------- администрирование ---------- */
    {
      id: "linux",
      group: "admin",
      title: "Linux",
      file: "admin.sh",
      level: "confident",
      summary: {
        ru: "Серверы на Linux: установка, настройка и автоматизация.",
        uz: "Linux serverlar: o‘rnatish, sozlash va avtomatlashtirish.",
        en: "Linux servers: setup, configuration and automation.",
      },
      points: {
        ru: ["Установка и настройка серверов Ubuntu/Debian", "systemd, cron, журналы и логи", "Bash-скрипты для рутинных задач", "SSH-доступ по ключам, права и пользователи"],
        uz: ["Ubuntu/Debian serverlarini o‘rnatish va sozlash", "systemd, cron, jurnallar va loglar", "Muntazam vazifalar uchun Bash-skriptlar", "Kalit orqali SSH-kirish, huquqlar va foydalanuvchilar"],
        en: ["Installing and configuring Ubuntu/Debian servers", "systemd, cron, journals and logs", "Bash scripts for routine tasks", "Key-based SSH, permissions and users"],
      },
      snippet: [
        "# disk usage and the heaviest processes",
        "df -h /",
        "ps aux --sort=-%mem | head -5",
        "",
        "sudo systemctl restart nginx",
        'journalctl -u nginx --since "1 hour ago"',
      ].join("\n"),
    },
    {
      id: "windows",
      group: "admin",
      title: "Windows Server",
      file: "new-user.ps1",
      level: "confident",
      summary: {
        ru: "Домен и рабочие места в офисе на Windows Server.",
        uz: "Windows Server’da ofis domeni va ish joylari.",
        en: "Office domain and workstations on Windows Server.",
      },
      points: {
        ru: ["Active Directory: пользователи, группы, OU", "Групповые политики (GPO)", "DNS и DHCP", "Общие папки и права доступа"],
        uz: ["Active Directory: foydalanuvchilar, guruhlar, OU", "Guruh siyosatlari (GPO)", "DNS va DHCP", "Umumiy papkalar va kirish huquqlari"],
        en: ["Active Directory: users, groups, OUs", "Group Policy (GPO)", "DNS and DHCP", "File shares and access rights"],
      },
      snippet: [
        'New-ADUser -Name "Ivan Petrov" `',
        '  -SamAccountName "i.petrov" `',
        '  -Path "OU=Office,DC=corp,DC=local" `',
        "  -AccountPassword $pwd -Enabled $true",
        "",
        'Add-ADGroupMember "Accounting" -Members "i.petrov"',
      ].join("\n"),
    },
    {
      id: "network",
      group: "admin",
      title: { ru: "Сети", uz: "Tarmoqlar", en: "Networking" },
      file: "mikrotik.rsc",
      level: "confident",
      summary: {
        ru: "Офисная сеть — от кабеля до VPN.",
        uz: "Kabeldan VPN’gacha ofis tarmog‘i.",
        en: "Office network, from cabling to VPN.",
      },
      points: {
        ru: ["Настройка роутеров и коммутаторов (MikroTik, Cisco)", "VLAN и сегментация сети", "VPN для удалённого доступа", "Wi-Fi, кабельные линии, диагностика: ping, traceroute"],
        uz: ["Router va kommutatorlarni sozlash (MikroTik, Cisco)", "VLAN va tarmoqni segmentlash", "Masofaviy kirish uchun VPN", "Wi-Fi, kabel liniyalari, diagnostika: ping, traceroute"],
        en: ["Router and switch setup (MikroTik, Cisco)", "VLANs and network segmentation", "VPN for remote access", "Wi-Fi, cabling, diagnostics: ping, traceroute"],
      },
      snippet: [
        "# separate VLAN for cameras, no internet access",
        "/interface vlan add name=vlan20-cams vlan-id=20 interface=bridge",
        "/ip address add address=10.0.20.1/24 interface=vlan20-cams",
        "/ip firewall filter add chain=forward \\",
        "    src-address=10.0.20.0/24 out-interface=ether1 action=drop",
      ].join("\n"),
    },
    {
      id: "servers",
      group: "admin",
      title: { ru: "Серверы", uz: "Serverlar", en: "Servers" },
      file: "deploy.sh",
      level: "intermediate",
      summary: {
        ru: "Железо, виртуальные машины и контейнеры.",
        uz: "Uskunalar, virtual mashinalar va konteynerlar.",
        en: "Hardware, virtual machines and containers.",
      },
      points: {
        ru: ["Виртуализация: Proxmox, Hyper-V", "Docker и docker compose", "Сборка и обслуживание серверов, RAID", "Обновления и резервирование"],
        uz: ["Virtualizatsiya: Proxmox, Hyper-V", "Docker va docker compose", "Serverlarni yig‘ish va xizmat ko‘rsatish, RAID", "Yangilanishlar va zaxiralash"],
        en: ["Virtualization: Proxmox, Hyper-V", "Docker and docker compose", "Building and maintaining servers, RAID", "Updates and redundancy"],
      },
      snippet: ["qm start 101          # start the VM", "qm list", "", "docker compose up -d", 'docker ps --format "{{.Names}}: {{.Status}}"'].join("\n"),
    },
    {
      id: "cctv",
      group: "admin",
      title: { ru: "Видеонаблюдение", uz: "Videokuzatuv", en: "CCTV" },
      file: "camera.sh",
      level: "confident",
      summary: {
        ru: "IP-камеры, видеорегистраторы и архив записей.",
        uz: "IP-kameralar, videoregistratorlar va yozuvlar arxivi.",
        en: "IP cameras, video recorders and recording archives.",
      },
      points: {
        ru: ["Монтаж и настройка IP-камер", "Видеорегистраторы (NVR) и архив записей", "Детекция движения и уведомления", "Отдельный VLAN для камер, удалённый просмотр"],
        uz: ["IP-kameralarni o‘rnatish va sozlash", "Videoregistratorlar (NVR) va yozuvlar arxivi", "Harakatni aniqlash va bildirishnomalar", "Kameralar uchun alohida VLAN, masofadan ko‘rish"],
        en: ["Installing and configuring IP cameras", "Network video recorders (NVR) and archives", "Motion detection and alerts", "Separate VLAN for cameras, remote viewing"],
      },
      snippet: [
        "# check that the camera stream is alive (RTSP)",
        "ffprobe -v error -show_streams \\",
        '  "rtsp://viewer:***@10.0.20.11:554/stream1"',
        "",
        "# NVR: 30 days of recordings, motion detection on",
      ].join("\n"),
    },
    {
      id: "monitoring",
      group: "admin",
      title: { ru: "Мониторинг", uz: "Monitoring", en: "Monitoring" },
      file: "backup.cron",
      level: "intermediate",
      summary: {
        ru: "Слежу за системами и вовремя делаю резервные копии.",
        uz: "Tizimlarni kuzataman va o‘z vaqtida zaxira nusxa olaman.",
        en: "Watching systems and making backups on time.",
      },
      points: {
        ru: ["Мониторинг серверов и сети: Zabbix, Grafana", "Оповещения о сбоях в Telegram", "Резервное копирование по расписанию", "Проверка восстановления из бэкапа"],
        uz: ["Server va tarmoq monitoringi: Zabbix, Grafana", "Nosozliklar haqida Telegram’ga ogohlantirish", "Jadval bo‘yicha zaxira nusxalash", "Zaxira nusxadan tiklashni tekshirish"],
        en: ["Server and network monitoring: Zabbix, Grafana", "Failure alerts to Telegram", "Scheduled backups", "Testing restores from backup"],
      },
      snippet: [
        "# /etc/cron.d/backup — every night at 02:00",
        "0 2 * * * root /opt/backup.sh",
        "",
        "# /opt/backup.sh",
        "tar -czf /backup/srv-$(date +%F).tar.gz /srv",
        "find /backup -mtime +14 -delete",
      ].join("\n"),
    },
  ],

  // ПРИМЕРЫ — замените своими проектами.
  // tech — id навыков из списка выше; demo и code — необязательные ссылки.
  projects: [
    {
      title: { ru: "Видеонаблюдение для офиса", uz: "Ofis uchun videokuzatuv", en: "Office CCTV" },
      description: {
        ru: "IP-камеры в отдельном VLAN, видеорегистратор с архивом и уведомления о движении.",
        uz: "Alohida VLAN’dagi IP-kameralar, arxivli videoregistrator va harakat haqida bildirishnomalar.",
        en: "IP cameras on a separate VLAN, an NVR with archive and motion alerts.",
      },
      tech: ["cctv", "network"],
    },
    {
      title: { ru: "Мониторинг серверов", uz: "Serverlar monitoringi", en: "Server monitoring" },
      description: {
        ru: "Zabbix и Grafana для серверов и сети, оповещения в Telegram, ночные бэкапы.",
        uz: "Serverlar va tarmoq uchun Zabbix va Grafana, Telegram’ga ogohlantirishlar, tungi zaxira nusxalar.",
        en: "Zabbix and Grafana for servers and network, Telegram alerts, nightly backups.",
      },
      tech: ["monitoring", "linux", "servers"],
    },
    {
      title: { ru: "Лендинг для кофейни", uz: "Qahvaxona uchun lending", en: "Coffee shop landing page" },
      description: {
        ru: "Адаптивная одностраничная вёрстка с меню, галереей и картой.",
        uz: "Menyu, galereya va xaritali moslashuvchan bir sahifali sayt.",
        en: "A responsive one-page site with a menu, gallery and map.",
      },
      tech: ["html", "css"],
    },
    {
      title: { ru: "Список задач", uz: "Vazifalar ro‘yxati", en: "To-do list" },
      description: {
        ru: "Добавление, фильтрация и сохранение задач в localStorage.",
        uz: "Vazifalarni qo‘shish, saralash va localStorage’da saqlash.",
        en: "Add, filter and save tasks in localStorage.",
      },
      tech: ["html", "css", "js"],
    },
    {
      title: { ru: "REST API для блога", uz: "Blog uchun REST API", en: "Blog REST API" },
      description: {
        ru: "CRUD статей и комментариев, пагинация и поиск по заголовку.",
        uz: "Maqola va izohlar uchun CRUD, sahifalash va sarlavha bo‘yicha qidiruv.",
        en: "CRUD for posts and comments, pagination and title search.",
      },
      tech: ["node", "sql"],
    },
    {
      title: { ru: "Онлайн-чат", uz: "Onlayn chat", en: "Online chat" },
      description: {
        ru: "Комнаты и сообщения в реальном времени на WebSocket.",
        uz: "WebSocket’da xonalar va real vaqtdagi xabarlar.",
        en: "Rooms and real-time messages over WebSocket.",
      },
      tech: ["js", "node", "git"],
    },
  ],

  // ПРИМЕРЫ — замените своим опытом (сверху — самое свежее).
  experience: [
    {
      period: { ru: "2023 — сейчас", uz: "2023 — hozir", en: "2023 — now" },
      company: { ru: "Название компании", uz: "Kompaniya nomi", en: "Company name" },
      role: { ru: "IT-администратор", uz: "IT-administrator", en: "IT administrator" },
      points: {
        ru: ["Обслуживание рабочих мест, принтеров и офисной сети", "Домен Active Directory, почта и общие папки", "Видеонаблюдение и резервное копирование"],
        uz: ["Ish joylari, printerlar va ofis tarmog‘iga xizmat ko‘rsatish", "Active Directory domeni, pochta va umumiy papkalar", "Videokuzatuv va zaxira nusxalash"],
        en: ["Supporting workstations, printers and the office network", "Active Directory domain, mail and file shares", "CCTV and backups"],
      },
    },
    {
      period: "2021 — 2023",
      company: { ru: "Название компании", uz: "Kompaniya nomi", en: "Company name" },
      role: { ru: "Специалист техподдержки", uz: "Texnik yordam mutaxassisi", en: "IT support specialist" },
      points: {
        ru: ["Помощь пользователям и решение заявок", "Установка и настройка программ", "Учёт компьютерной техники"],
        uz: ["Foydalanuvchilarga yordam va murojaatlarni hal qilish", "Dasturlarni o‘rnatish va sozlash", "Kompyuter texnikasini hisobga olish"],
        en: ["Helping users and resolving tickets", "Installing and configuring software", "Keeping track of IT equipment"],
      },
    },
  ],

  // ПРИМЕРЫ — замените своими сертификатами.
  certs: [
    { year: "2024", name: { ru: "Название сертификата", uz: "Sertifikat nomi", en: "Certificate name" }, issuer: { ru: "Организация", uz: "Tashkilot", en: "Issuer" } },
    { year: "2023", name: { ru: "Название курса", uz: "Kurs nomi", en: "Course name" }, issuer: { ru: "Организация", uz: "Tashkilot", en: "Issuer" } },
  ],
};

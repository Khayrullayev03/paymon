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
    // Откуда «идёт сигнал» на карте мира в терминале (команда whereami). Поставьте свой город.
    location: { city: "Tashkent", lat: 41.3, lon: 69.3 },
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
    { label: "phone", value: "+998 00 000-00-00", href: "tel:+998000000000" },
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

  // Услуги — порядок в массиве = порядок на странице «Услуги».
  // scene — ASCII-анимация из js/scenes.js; feature: "office" — вместо картинки 3D-схема офиса с камерами.
  services: [
    {
      id: "servers",
      scene: "servers",
      title: { ru: "Установка и настройка серверов", uz: "Serverlarni o‘rnatish va sozlash", en: "Server installation and setup" },
      desc: {
        ru: "Подберу и соберу сервер, установлю Windows Server или Linux, настрою виртуализацию и резервное копирование.",
        uz: "Serverni tanlab yig‘aman, Windows Server yoki Linux o‘rnataman, virtualizatsiya va zaxira nusxalashni sozlayman.",
        en: "I pick and build the server, install Windows Server or Linux, and set up virtualization and backups.",
      },
      points: {
        ru: ["Сборка и монтаж в стойку, RAID", "Windows Server, Ubuntu, Debian", "Виртуализация: Proxmox, Hyper-V, Docker", "Удалённый доступ, обновления, бэкапы"],
        uz: ["Yig‘ish va stoykaga o‘rnatish, RAID", "Windows Server, Ubuntu, Debian", "Virtualizatsiya: Proxmox, Hyper-V, Docker", "Masofaviy kirish, yangilanishlar, zaxira nusxalar"],
        en: ["Assembly and rack mounting, RAID", "Windows Server, Ubuntu, Debian", "Virtualization: Proxmox, Hyper-V, Docker", "Remote access, updates, backups"],
      },
    },
    {
      id: "scs",
      feature: "office",
      title: { ru: "Монтаж СКС и видеонаблюдения", uz: "SKT va videokuzatuvni o‘rnatish", en: "Structured cabling and CCTV" },
      desc: {
        ru: "Кабельная сеть офиса под ключ: витая пара, розетки, патч-панели, шкаф, Wi-Fi и IP-камеры с записью.",
        uz: "Ofis kabel tarmog‘i to‘liq: o‘ralgan juftlik, rozetkalar, patch-panellar, shkaf, Wi-Fi va yozib oluvchi IP-kameralar.",
        en: "Turnkey office cabling: twisted pair, wall sockets, patch panels, a rack, Wi-Fi and recording IP cameras.",
      },
      points: {
        ru: ["Прокладка кабеля, розетки, патч-панели", "Коммутационный шкаф и маркировка", "IP-камеры, видеорегистратор, архив", "Просмотр камер с телефона"],
        uz: ["Kabel tortish, rozetkalar, patch-panellar", "Kommutatsiya shkafi va belgilash", "IP-kameralar, videoregistrator, arxiv", "Kameralarni telefondan ko‘rish"],
        en: ["Cable runs, sockets, patch panels", "Network rack and labeling", "IP cameras, NVR, recording archive", "Viewing cameras from a phone"],
      },
    },
    {
      id: "network",
      scene: "network",
      title: { ru: "Настройка сетей и Wi-Fi", uz: "Tarmoq va Wi-Fi sozlash", en: "Networks and Wi-Fi" },
      desc: {
        ru: "Настрою роутеры и коммутаторы, разделю сеть на сегменты, подключу Wi-Fi и VPN для удалённой работы.",
        uz: "Router va kommutatorlarni sozlayman, tarmoqni segmentlarga ajrataman, Wi-Fi va masofaviy ish uchun VPN ulayman.",
        en: "I configure routers and switches, segment the network, and set up Wi-Fi and VPN for remote work.",
      },
      points: {
        ru: ["MikroTik, Cisco, Ubiquiti", "VLAN, гостевой Wi-Fi", "VPN для удалённого доступа", "Диагностика и устранение сбоев"],
        uz: ["MikroTik, Cisco, Ubiquiti", "VLAN, mehmon Wi-Fi", "Masofaviy kirish uchun VPN", "Diagnostika va nosozliklarni bartaraf etish"],
        en: ["MikroTik, Cisco, Ubiquiti", "VLANs, guest Wi-Fi", "VPN for remote access", "Diagnostics and troubleshooting"],
      },
    },
    {
      id: "windows",
      scene: "windows",
      title: { ru: "Windows Server и Active Directory", uz: "Windows Server va Active Directory", en: "Windows Server and Active Directory" },
      desc: {
        ru: "Домен для офиса: учётные записи, группы, политики, общие папки и принтеры — всё управляется из одного места.",
        uz: "Ofis uchun domen: hisoblar, guruhlar, siyosatlar, umumiy papkalar va printerlar — hammasi bir joydan boshqariladi.",
        en: "An office domain: accounts, groups, policies, shared folders and printers, all managed from one place.",
      },
      points: {
        ru: ["Домен, пользователи, группы", "Групповые политики (GPO)", "Общие папки и права доступа", "DNS, DHCP, печать"],
        uz: ["Domen, foydalanuvchilar, guruhlar", "Guruh siyosatlari (GPO)", "Umumiy papkalar va huquqlar", "DNS, DHCP, chop etish"],
        en: ["Domain, users, groups", "Group Policy (GPO)", "File shares and permissions", "DNS, DHCP, printing"],
      },
    },
    {
      id: "linux",
      scene: "linux",
      title: { ru: "Linux-серверы и автоматизация", uz: "Linux serverlar va avtomatlashtirish", en: "Linux servers and automation" },
      desc: {
        ru: "Подниму веб-сервер, базу данных или файловое хранилище на Linux и автоматизирую рутину скриптами.",
        uz: "Linux’da veb-server, ma’lumotlar bazasi yoki fayl ombori ko‘taraman va muntazam ishlarni skriptlar bilan avtomatlashtiraman.",
        en: "I set up a web server, database or file storage on Linux and automate routine work with scripts.",
      },
      points: {
        ru: ["nginx, базы данных, файловые серверы", "Bash-скрипты и cron", "SSH по ключам, права, защита", "Логи и диагностика"],
        uz: ["nginx, ma’lumotlar bazalari, fayl serverlari", "Bash-skriptlar va cron", "Kalit bilan SSH, huquqlar, himoya", "Loglar va diagnostika"],
        en: ["nginx, databases, file servers", "Bash scripts and cron", "Key-based SSH, permissions, hardening", "Logs and diagnostics"],
      },
    },
    {
      id: "monitoring",
      scene: "monitoring",
      title: { ru: "Мониторинг и резервное копирование", uz: "Monitoring va zaxira nusxalash", en: "Monitoring and backups" },
      desc: {
        ru: "Слежу за серверами и сетью круглосуточно, присылаю тревоги в Telegram и каждую ночь делаю бэкапы.",
        uz: "Serverlar va tarmoqni kecha-kunduz kuzataman, ogohlantirishlarni Telegram’ga yuboraman va har kecha zaxira nusxa olaman.",
        en: "I watch servers and the network around the clock, send alerts to Telegram and make backups every night.",
      },
      points: {
        ru: ["Zabbix, Grafana", "Оповещения о сбоях в Telegram", "Бэкапы по расписанию", "Проверка восстановления"],
        uz: ["Zabbix, Grafana", "Nosozliklar haqida Telegram’ga xabar", "Jadval bo‘yicha zaxira nusxalar", "Tiklashni tekshirish"],
        en: ["Zabbix, Grafana", "Failure alerts to Telegram", "Scheduled backups", "Restore testing"],
      },
    },
    {
      id: "pc",
      scene: "pc",
      title: { ru: "Обслуживание компьютеров и оргтехники", uz: "Kompyuter va orgtexnikaga xizmat ko‘rsatish", en: "PC and office equipment maintenance" },
      desc: {
        ru: "Почищу и настрою рабочие места, установлю систему и программы, подключу принтеры и МФУ.",
        uz: "Ish joylarini tozalab sozlayman, tizim va dasturlarni o‘rnataman, printer va MFU ulayman.",
        en: "I clean and tune workstations, install the OS and software, and connect printers and MFPs.",
      },
      points: {
        ru: ["Чистка, замена термопасты", "Установка Windows и программ", "Принтеры, сканеры, МФУ", "Учёт техники"],
        uz: ["Tozalash, termopastani almashtirish", "Windows va dasturlarni o‘rnatish", "Printer, skaner, MFU", "Texnikani hisobga olish"],
        en: ["Cleaning, new thermal paste", "Installing Windows and software", "Printers, scanners, MFPs", "Equipment inventory"],
      },
    },
    {
      id: "web",
      scene: "html",
      title: { ru: "Создание сайтов", uz: "Sayt yaratish", en: "Websites" },
      desc: {
        ru: "Сделаю лендинг или сайт-визитку: адаптивная вёрстка, формы, размещение на хостинге и домен.",
        uz: "Lending yoki sayt-vizitka qilaman: moslashuvchan sahifalash, formalar, xostingga joylash va domen.",
        en: "I build a landing page or business-card site: responsive layout, forms, hosting and a domain.",
      },
      points: {
        ru: ["HTML, CSS, JavaScript", "Адаптивно под телефоны", "Формы и простая серверная часть", "Хостинг и домен"],
        uz: ["HTML, CSS, JavaScript", "Telefonlarga moslashgan", "Formalar va oddiy server qismi", "Xosting va domen"],
        en: ["HTML, CSS, JavaScript", "Mobile-friendly", "Forms and a simple back end", "Hosting and domain"],
      },
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

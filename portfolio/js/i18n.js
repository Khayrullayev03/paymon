/* Переводы интерфейса: русский, узбекский (латиница), английский.
 * Тексты содержимого (навыки, проекты, опыт) лежат в js/data.js. */
(function () {
  "use strict";

  const DICT = {
    ru: {
      "skip": "К содержимому",
      "nav.home": "Главная",
      "nav.back": "← меню",
      "home.logo": "Логотип",
      "office.full": "во весь экран",
      "nav.main": "главная",
      "nav.office": "офис",
      "nav.skills": "навыки",
      "nav.experience": "опыт",
      "nav.projects": "проекты",
      "nav.terminal": "терминал",
      "nav.contact": "контакты",
      "ctrl.lang": "Язык",
      "ctrl.theme": "Сменить тему",
      "ctrl.soundOn": "Включить звук",
      "ctrl.soundOff": "Выключить звук",

      "hero.viewProjects": "смотреть проекты",
      "hero.contact": "связаться",
      "hero.terminal": "открыть терминал",
      "hero.artHint": "наведите — повернётся",

      "office.title": "Инфраструктура",
      "office.lead": "Демо-схема офиса в 3D: роутер, коммутатор, сервер, рабочие места и камеры с живыми зонами обзора. Нажмите на камеру на схеме или на кнопку ниже, чтобы открыть её изображение.",
      "office.legend": ":·: зона обзора камеры   ■ видео на сервер   ● данные   o сотрудник (! — замечен камерой)",
      "office.feed": "Камеры",
      "office.models": "модели камер",
      "anim.pause": "пауза",
      "anim.play": "▶ смотреть",
      "term.cmd.cam": "камеры офиса: cam 2 — открыть CAM-02",
      "skills.title": "Навыки",
      "skills.lead": "Каждая технология — отдельный раздел: что умею, живая демонстрация и пример кода.",
      "skills.web": "// веб-разработка",
      "skills.admin": "// администрирование",
      "skills.canDo": "что умею:",
      "skills.projectsWith": "→ проекты с {skill}: {n}",
      "skills.level": "Уровень",
      "skills.live": "демо",
      "level.basic": "Базовый",
      "level.intermediate": "Средний",
      "level.confident": "Уверенный",
      "level.advanced": "Продвинутый",
      "level.expert": "Эксперт",

      "exp.title": "Опыт",
      "exp.lead": "Места работы и обязанности — в виде системного журнала.",
      "exp.certs": "сертификаты",

      "projects.title": "Проекты",
      "projects.all": "все",
      "projects.empty": "// пока нет проектов с этой технологией",
      "projects.demo": "демо",
      "projects.code": "код",

      "terminal.title": "Терминал",
      "terminal.lead": "Введите команду или нажмите кнопку ниже. Начните с help.",
      "terminal.input": "Команда",
      "terminal.hint": "быстрые команды:",

      "contact.title": "Контакты",
      "contact.lead": "Открыт к предложениям — пишите в любой удобный канал.",

      "toast.matrixOn": "режим матрицы: вкл",
      "toast.matrixOff": "режим матрицы: выкл",
      "toast.light": "тема: светлая",
      "toast.dark": "тема: тёмная",
      "toast.soundOn": "звук: вкл",
      "toast.soundOff": "звук: выкл",


      "term.welcome": "anvar-os 1.0 · введите help, чтобы увидеть команды",
      "term.helpTitle": "доступные команды:",
      "term.cmd.help": "список команд",
      "term.cmd.whereami": "ваш внешний IP и точка на карте мира",
      "geo.locating": "определяю местоположение…",
      "geo.you": "вы здесь",
      "geo.ip": "внешний IP",
      "geo.place": "место",
      "geo.isp": "провайдер",
      "geo.local": "локальный IP",
      "geo.localHidden": "браузер не раскрывает сайтам",
      "geo.noIp": "недоступен здесь — место примерно по часовому поясу",
      "term.cmd.whoami": "кто я",
      "term.cmd.neofetch": "сведения о «системе»",
      "term.cmd.skills": "навыки; skills linux откроет вкладку",
      "term.cmd.projects": "проекты",
      "term.cmd.experience": "опыт работы",
      "term.cmd.certs": "сертификаты",
      "term.cmd.contact": "контакты",
      "term.cmd.ls": "файлы; cat <файл> — показать файл",
      "term.cmd.cd": "перейти к разделу",
      "term.cmd.theme": "тема оформления",
      "term.cmd.lang": "язык",
      "term.cmd.sound": "звук",
      "term.cmd.matrix": "режим матрицы",
      "term.cmd.reboot": "перезапуск: вернуться на главную",
      "term.cmd.clear": "очистить экран",
      "term.cmd.misc": "история, дата, вывод текста",
      "term.notFound": "команда не найдена: {cmd}. Введите help",
      "term.noFile": "cat: {file}: нет такого файла",
      "term.noSection": "cd: {dir}: нет такого раздела",
      "term.opening": "→ открываю {name}",
      "term.unknownSkill": "skills: нет навыка «{id}». Есть: {list}",
      "term.usage": "использование: {usage}",
      "term.themeSet": "тема: {value}",
      "term.langSet": "язык: {value}",
      "term.soundSet": "звук: {value}",
      "term.matrixSet": "режим матрицы: {value}",
      "term.on": "вкл",
      "term.off": "выкл",
      "term.reboot": "перезагрузка системы…",
      "term.sudoDenied": "{user} не входит в sudoers. Об этом инциденте будет доложено.",
      "term.rmStart": "удаляю всё…",
      "term.rmJoke": "Шутка. Всё на месте.",
      "term.exit": "Выхода нет — есть только портфолио.",
      "term.hello": "Привет! Введите help, чтобы начать.",
      "nf.name": "Имя",
      "nf.role": "Роль",
      "nf.skills": "Навыки",
      "nf.projects": "Проекты",
      "nf.langs": "Языки сайта",
      "nf.theme": "Тема",
      "nf.uptime": "Аптайм",
      "nf.since": "с открытия страницы",
    },

    uz: {
      "skip": "Asosiy qismga o‘tish",
      "nav.home": "Bosh sahifa",
      "nav.back": "← menyu",
      "home.logo": "Logotip",
      "office.full": "to‘liq ekran",
      "nav.main": "bosh sahifa",
      "nav.office": "ofis",
      "nav.skills": "ko‘nikmalar",
      "nav.experience": "tajriba",
      "nav.projects": "loyihalar",
      "nav.terminal": "terminal",
      "nav.contact": "aloqa",
      "ctrl.lang": "Til",
      "ctrl.theme": "Mavzuni almashtirish",
      "ctrl.soundOn": "Ovozni yoqish",
      "ctrl.soundOff": "Ovozni o‘chirish",

      "hero.viewProjects": "loyihalarni ko‘rish",
      "hero.contact": "bog‘lanish",
      "hero.terminal": "terminalni ochish",
      "hero.artHint": "kursorni olib keling — aylanadi",

      "office.title": "Infratuzilma",
      "office.lead": "Ofisning 3D demo-sxemasi: router, kommutator, server, ish joylari va jonli ko‘rish zonalari bilan kameralar. Kamera tasvirini ochish uchun sxemadagi kamerani yoki quyidagi tugmani bosing.",
      "office.legend": ":·: kamera ko‘rish zonasi   ■ serverga video   ● ma’lumotlar   o xodim (! — kamera payqadi)",
      "office.feed": "Kameralar",
      "office.models": "kamera modellari",
      "anim.pause": "pauza",
      "anim.play": "▶ ko‘rish",
      "term.cmd.cam": "ofis kameralari: cam 2 — CAM-02 ni ochish",
      "skills.title": "Ko‘nikmalar",
      "skills.lead": "Har bir texnologiya — alohida bo‘lim: nimalarni bilaman, jonli namoyish va kod namunasi.",
      "skills.web": "// veb-dasturlash",
      "skills.admin": "// tizim ma’muriyati",
      "skills.canDo": "nimalarni bilaman:",
      "skills.projectsWith": "→ {skill} bo‘yicha loyihalar: {n}",
      "skills.level": "Daraja",
      "skills.live": "demo",
      "level.basic": "Boshlang‘ich",
      "level.intermediate": "O‘rta",
      "level.confident": "Ishonchli",
      "level.advanced": "Yuqori",
      "level.expert": "Ekspert",

      "exp.title": "Tajriba",
      "exp.lead": "Ish joylari va vazifalar — tizim jurnali ko‘rinishida.",
      "exp.certs": "sertifikatlar",

      "projects.title": "Loyihalar",
      "projects.all": "hammasi",
      "projects.empty": "// bu texnologiya bo‘yicha hozircha loyiha yo‘q",
      "projects.demo": "demo",
      "projects.code": "kod",

      "terminal.title": "Terminal",
      "terminal.lead": "Buyruq kiriting yoki quyidagi tugmalardan birini bosing. help dan boshlang.",
      "terminal.input": "Buyruq",
      "terminal.hint": "tezkor buyruqlar:",

      "contact.title": "Aloqa",
      "contact.lead": "Takliflarga ochiqman — istalgan qulay kanal orqali yozing.",

      "toast.matrixOn": "matritsa rejimi: yoqildi",
      "toast.matrixOff": "matritsa rejimi: o‘chirildi",
      "toast.light": "mavzu: yorug‘",
      "toast.dark": "mavzu: qorong‘i",
      "toast.soundOn": "ovoz: yoqildi",
      "toast.soundOff": "ovoz: o‘chirildi",


      "term.welcome": "anvar-os 1.0 · buyruqlarni ko‘rish uchun help ni kiriting",
      "term.helpTitle": "mavjud buyruqlar:",
      "term.cmd.help": "buyruqlar ro‘yxati",
      "term.cmd.whereami": "tashqi IP manzilingiz va dunyo xaritasidagi nuqta",
      "geo.locating": "joylashuv aniqlanmoqda…",
      "geo.you": "siz shu yerdasiz",
      "geo.ip": "tashqi IP",
      "geo.place": "joy",
      "geo.isp": "provayder",
      "geo.local": "lokal IP",
      "geo.localHidden": "brauzer saytlarga ko‘rsatmaydi",
      "geo.noIp": "bu yerda mavjud emas — joy vaqt mintaqasi bo‘yicha taxminiy",
      "term.cmd.whoami": "men kimman",
      "term.cmd.neofetch": "«tizim» haqida ma’lumot",
      "term.cmd.skills": "ko‘nikmalar; skills linux bo‘limni ochadi",
      "term.cmd.projects": "loyihalar",
      "term.cmd.experience": "ish tajribasi",
      "term.cmd.certs": "sertifikatlar",
      "term.cmd.contact": "aloqa",
      "term.cmd.ls": "fayllar; cat <fayl> — faylni ko‘rsatish",
      "term.cmd.cd": "bo‘limga o‘tish",
      "term.cmd.theme": "mavzu",
      "term.cmd.lang": "til",
      "term.cmd.sound": "ovoz",
      "term.cmd.matrix": "matritsa rejimi",
      "term.cmd.reboot": "qayta ishga tushirish: bosh sahifaga qaytish",
      "term.cmd.clear": "ekranni tozalash",
      "term.cmd.misc": "tarix, sana, matn chiqarish",
      "term.notFound": "buyruq topilmadi: {cmd}. help ni kiriting",
      "term.noFile": "cat: {file}: bunday fayl yo‘q",
      "term.noSection": "cd: {dir}: bunday bo‘lim yo‘q",
      "term.opening": "→ {name} ochilmoqda",
      "term.unknownSkill": "skills: «{id}» ko‘nikmasi yo‘q. Mavjudlari: {list}",
      "term.usage": "foydalanish: {usage}",
      "term.themeSet": "mavzu: {value}",
      "term.langSet": "til: {value}",
      "term.soundSet": "ovoz: {value}",
      "term.matrixSet": "matritsa rejimi: {value}",
      "term.on": "yoqilgan",
      "term.off": "o‘chirilgan",
      "term.reboot": "tizim qayta yuklanmoqda…",
      "term.sudoDenied": "{user} sudoers ro‘yxatida yo‘q. Bu holat haqida xabar beriladi.",
      "term.rmStart": "hammasini o‘chiryapman…",
      "term.rmJoke": "Hazil. Hammasi joyida.",
      "term.exit": "Chiqish yo‘q — faqat portfolio bor.",
      "term.hello": "Salom! Boshlash uchun help ni kiriting.",
      "nf.name": "Ism",
      "nf.role": "Lavozim",
      "nf.skills": "Ko‘nikmalar",
      "nf.projects": "Loyihalar",
      "nf.langs": "Sayt tillari",
      "nf.theme": "Mavzu",
      "nf.uptime": "Ish vaqti",
      "nf.since": "sahifa ochilgandan beri",
    },

    en: {
      "skip": "Skip to content",
      "nav.home": "Home",
      "nav.back": "← menu",
      "home.logo": "Logo",
      "office.full": "fullscreen",
      "nav.main": "home",
      "nav.office": "office",
      "nav.skills": "skills",
      "nav.experience": "experience",
      "nav.projects": "projects",
      "nav.terminal": "terminal",
      "nav.contact": "contact",
      "ctrl.lang": "Language",
      "ctrl.theme": "Switch theme",
      "ctrl.soundOn": "Turn sound on",
      "ctrl.soundOff": "Turn sound off",

      "hero.viewProjects": "view projects",
      "hero.contact": "get in touch",
      "hero.terminal": "open terminal",
      "hero.artHint": "hover — it spins",

      "office.title": "Infrastructure",
      "office.lead": "A 3D demo map of an office: router, switch, server, workstations and cameras with live fields of view. Click a camera on the map or a button below to open its feed.",
      "office.legend": ":·: camera field of view   ■ video to server   ● data   o person (! — seen by a camera)",
      "office.feed": "Cameras",
      "office.models": "camera models",
      "anim.pause": "pause",
      "anim.play": "▶ play",
      "term.cmd.cam": "office cameras: cam 2 opens CAM-02",
      "skills.title": "Skills",
      "skills.lead": "Each technology has its own section: what I can do, a live demo and a code sample.",
      "skills.web": "// web development",
      "skills.admin": "// system administration",
      "skills.canDo": "what I can do:",
      "skills.projectsWith": "→ projects with {skill}: {n}",
      "skills.level": "Level",
      "skills.live": "demo",
      "level.basic": "Basic",
      "level.intermediate": "Intermediate",
      "level.confident": "Confident",
      "level.advanced": "Advanced",
      "level.expert": "Expert",

      "exp.title": "Experience",
      "exp.lead": "Jobs and responsibilities, written as a system log.",
      "exp.certs": "certificates",

      "projects.title": "Projects",
      "projects.all": "all",
      "projects.empty": "// no projects with this technology yet",
      "projects.demo": "demo",
      "projects.code": "code",

      "terminal.title": "Terminal",
      "terminal.lead": "Type a command or tap a button below. Start with help.",
      "terminal.input": "Command",
      "terminal.hint": "quick commands:",

      "contact.title": "Contact",
      "contact.lead": "Open to offers — reach out on any channel.",

      "toast.matrixOn": "matrix mode: on",
      "toast.matrixOff": "matrix mode: off",
      "toast.light": "theme: light",
      "toast.dark": "theme: dark",
      "toast.soundOn": "sound: on",
      "toast.soundOff": "sound: off",


      "term.welcome": "anvar-os 1.0 · type help to see the commands",
      "term.helpTitle": "available commands:",
      "term.cmd.help": "list commands",
      "term.cmd.whereami": "your external IP and a dot on the world map",
      "geo.locating": "locating…",
      "geo.you": "you are here",
      "geo.ip": "external IP",
      "geo.place": "location",
      "geo.isp": "provider",
      "geo.local": "local IP",
      "geo.localHidden": "browsers don’t reveal it to websites",
      "geo.noIp": "not available here — location estimated from your time zone",
      "term.cmd.whoami": "who I am",
      "term.cmd.neofetch": "“system” info",
      "term.cmd.skills": "skills; skills linux opens that tab",
      "term.cmd.projects": "projects",
      "term.cmd.experience": "work experience",
      "term.cmd.certs": "certificates",
      "term.cmd.contact": "contacts",
      "term.cmd.ls": "files; cat <file> prints a file",
      "term.cmd.cd": "jump to a section",
      "term.cmd.theme": "color theme",
      "term.cmd.lang": "language",
      "term.cmd.sound": "sound",
      "term.cmd.matrix": "matrix mode",
      "term.cmd.reboot": "restart: back to the home page",
      "term.cmd.clear": "clear the screen",
      "term.cmd.misc": "history, date, print text",
      "term.notFound": "command not found: {cmd}. Type help",
      "term.noFile": "cat: {file}: no such file",
      "term.noSection": "cd: {dir}: no such section",
      "term.opening": "→ opening {name}",
      "term.unknownSkill": "skills: no skill “{id}”. Available: {list}",
      "term.usage": "usage: {usage}",
      "term.themeSet": "theme: {value}",
      "term.langSet": "language: {value}",
      "term.soundSet": "sound: {value}",
      "term.matrixSet": "matrix mode: {value}",
      "term.on": "on",
      "term.off": "off",
      "term.reboot": "rebooting…",
      "term.sudoDenied": "{user} is not in the sudoers file. This incident will be reported.",
      "term.rmStart": "deleting everything…",
      "term.rmJoke": "Just kidding. Everything is still here.",
      "term.exit": "There is no exit — only the portfolio.",
      "term.hello": "Hi! Type help to get started.",
      "nf.name": "Name",
      "nf.role": "Role",
      "nf.skills": "Skills",
      "nf.projects": "Projects",
      "nf.langs": "Site languages",
      "nf.theme": "Theme",
      "nf.uptime": "Uptime",
      "nf.since": "since page opened",
    },
  };

  const LANGS = ["ru", "uz", "en"];
  const LOCALES = { ru: "ru-RU", uz: "uz-Latn-UZ", en: "en-US" };
  let lang = "ru";
  try {
    const saved = localStorage.getItem("lang");
    if (LANGS.includes(saved)) lang = saved;
  } catch (e) {}

  function t(key, params) {
    let text = (DICT[lang] && DICT[lang][key]) || DICT.ru[key] || key;
    if (params) text = text.replace(/\{(\w+)\}/g, (_, name) => (params[name] != null ? params[name] : ""));
    return text;
  }

  // Поле из data.js: строка (одна на все языки) или объект { ru, uz, en }.
  function pick(value) {
    if (value == null) return "";
    if (typeof value === "string" || typeof value === "number" || Array.isArray(value)) return value;
    return value[lang] != null ? value[lang] : value.ru;
  }

  function apply(scope = document) {
    scope.querySelectorAll("[data-i18n]").forEach((node) => {
      node.textContent = t(node.dataset.i18n);
    });
    scope.querySelectorAll("[data-i18n-aria]").forEach((node) => {
      node.setAttribute("aria-label", t(node.dataset.i18nAria));
    });
  }

  function set(next) {
    if (!LANGS.includes(next) || next === lang) return;
    lang = next;
    try {
      localStorage.setItem("lang", next);
    } catch (e) {}
    document.documentElement.lang = next;
    apply();
    document.dispatchEvent(new CustomEvent("langchange", { detail: next }));
  }

  document.documentElement.lang = lang;
  apply();

  window.I18N = {
    LANGS,
    get lang() {
      return lang;
    },
    get locale() {
      return LOCALES[lang];
    },
    t,
    pick,
    apply,
    set,
  };
})();

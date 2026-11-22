/* Отрисовка портфолио из window.PORTFOLIO (js/data.js): разделы, вкладки навыков с ASCII-сценами,
 * фильтр проектов, опыт, контакты. Плюс язык, тема, звук, всплывающие подсказки и пасхалка. */
(function () {
  "use strict";

  const data = window.PORTFOLIO;
  if (!data || !window.FX || !window.I18N) return;

  const { profile, contacts = [], skills = [], projects = [], experience = [], certs = [] } = data;
  const { scramble, createAsciiArt } = window.FX;
  const I18N = window.I18N;
  const { t, pick: L } = I18N;
  const SOUND = window.SOUND || { enabled: false, set() {}, key() {}, tick() {}, beep() {} };
  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const skillById = new Map(skills.map((s) => [s.id, s]));
  const LEVELS = { basic: 3, intermediate: 6, confident: 8, advanced: 9, expert: 10 };
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  const state = { skill: skills.length ? skills[0].id : null, filter: "all", started: false };

  function el(tag, props, ...children) {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(props || {})) {
      if (value == null || value === false) continue;
      if (key === "class") node.className = value;
      else if (key === "text") node.textContent = value;
      else if (key === "vars")
        for (const [name, v] of Object.entries(value)) node.style.setProperty(name, v);
      else if (key.startsWith("on")) node.addEventListener(key.slice(2), value);
      else node.setAttribute(key, value === true ? "" : value);
    }
    for (const child of children.flat()) {
      if (child != null && child !== false) node.append(child);
    }
    return node;
  }

  /* =====================================================================
     ВСПЛЫВАЮЩИЕ ПОДСКАЗКИ, ТЕМА, ГЛИТЧ
     ===================================================================== */
  const toastEl = $("[data-toast]");
  let toastTimer = 0;
  function toast(message) {
    if (!toastEl) return;
    toastEl.textContent = `[ ${message} ]`;
    toastEl.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("is-visible"), 2200);
  }

  const THEME = {
    get: () => (root.dataset.scheme === "light" ? "light" : "dark"),
    set(next) {
      if (next === "light") root.dataset.scheme = "light";
      else delete root.dataset.scheme;
      try {
        localStorage.setItem("scheme", next);
      } catch (e) {}
      if (window.BG) window.BG.refreshColors();
      syncControls();
    },
  };

  function glitch() {
    if (reduceMotion) return;
    root.classList.remove("is-glitching");
    void root.offsetWidth;
    root.classList.add("is-glitching");
    setTimeout(() => root.classList.remove("is-glitching"), 650);
  }

  function toggleMatrix() {
    if (!window.BG) return "contour";
    const mode = window.BG.toggleMatrix();
    toast(t(mode === "matrix" ? "toast.matrixOn" : "toast.matrixOff"));
    SOUND.beep();
    return mode;
  }

  /* =====================================================================
     ШАПКА: язык, тема, звук
     ===================================================================== */
  const langButtons = $$("[data-lang]");
  const themeBtn = $("[data-theme-btn]");
  const soundBtn = $("[data-sound-btn]");

  function syncControls() {
    langButtons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === I18N.lang)));
    themeBtn.dataset.mode = THEME.get();
    soundBtn.setAttribute("aria-pressed", String(SOUND.enabled));
    soundBtn.setAttribute("aria-label", t(SOUND.enabled ? "ctrl.soundOff" : "ctrl.soundOn"));
  }

  langButtons.forEach((b) =>
    b.addEventListener("click", () => {
      SOUND.tick();
      I18N.set(b.dataset.lang);
    })
  );
  themeBtn.addEventListener("click", () => {
    const next = THEME.get() === "dark" ? "light" : "dark";
    THEME.set(next);
    SOUND.tick();
    toast(t(next === "light" ? "toast.light" : "toast.dark"));
  });
  soundBtn.addEventListener("click", () => {
    SOUND.set(!SOUND.enabled);
    syncControls();
    toast(t(SOUND.enabled ? "toast.soundOn" : "toast.soundOff"));
  });
  document.addEventListener("soundchange", syncControls);

  /* =====================================================================
     ОБО МНЕ
     ===================================================================== */
  const nameEl = $("[data-name]");
  const heroArt = window.ASCII_LOGO ? createAsciiArt($("[data-hero-ascii]"), window.ASCII_LOGO) : null;
  if (heroArt) heroArt.show();

  function renderProfile() {
    const name = L(profile.name);
    nameEl.textContent = name;
    nameEl.setAttribute("aria-label", name);
    $(".brand").setAttribute("aria-label", name);
    $("[data-role]").textContent = L(profile.role);
    $("[data-about]").textContent = L(profile.about);
    $$("[data-handle]").forEach((n) => (n.textContent = profile.handle || "user"));
    $("[data-footer]").textContent = `© ${new Date().getFullYear()} ${name}`;
    const stack = $("[data-stack]");
    stack.textContent = "";
    stack.append(
      ...skills.map((skill) =>
        el("li", null, el("a", { href: "#skills", text: `${skill.id}/`, onclick: () => selectSkill(skill.id, { animate: true }) }))
      )
    );
  }

  /* =====================================================================
     НАВЫКИ: вкладки по группам, у каждой — ASCII-сцена
     ===================================================================== */
  const tabsRoot = $("[data-tabs]");
  const panelsRoot = $("[data-panels]");
  let tabs = [];
  let panels = [];
  const players = new Map();
  let panelsVisible = false;

  function buildPanel(skill) {
    const title = L(skill.title);
    const count = projects.filter((p) => p.tech.includes(skill.id)).length;
    const score = LEVELS[skill.level] || 5;
    const lines = skill.snippet ? skill.snippet.split("\n").length : 1;
    const scenePre = el("pre", { class: "scene-pre" });

    const panel = el(
      "div",
      {
        class: "panel term",
        role: "tabpanel",
        id: `panel-${skill.id}`,
        "aria-labelledby": `tab-${skill.id}`,
        tabindex: "0",
        hidden: true,
        "data-score": score,
        vars: { "--lines": lines },
      },
      el("div", { class: "term-bar", "aria-hidden": "true" }, el("span", { text: `~/skills/${skill.id}` }), el("span", { text: "─ □ ×" })),
      el(
        "div",
        { class: "panel-inner" },
        el(
          "div",
          { class: "panel-head" },
          el("h3", { text: title, "aria-label": title }),
          skill.level &&
            el(
              "span",
              { class: "meter", "aria-label": `${t("skills.level")}: ${t("level." + skill.level)}` },
              el(
                "span",
                { class: "meter-bar", "aria-hidden": "true" },
                "[",
                el("span", { class: "meter-fill", text: "█".repeat(score) }),
                el("span", { class: "meter-empty", text: "░".repeat(10 - score) }),
                "]"
              ),
              el("span", { class: "meter-label", text: t("level." + skill.level) })
            )
        ),
        skill.summary && el("p", { class: "panel-summary", text: L(skill.summary) }),
        el(
          "div",
          { class: "panel-body" },
          el(
            "div",
            { class: "panel-points" },
            el("h4", { text: t("skills.canDo") }),
            el("ul", { class: "points" }, (L(skill.points) || []).map((p) => el("li", { text: p })))
          ),
          el(
            "div",
            { class: "scene term", "aria-hidden": "true" },
            el("div", { class: "term-bar" }, el("span", { text: `$ ./demo --${skill.id}` }), el("span", { class: "live", text: "● " + t("skills.live") })),
            el("div", { class: "scene-screen" }, scenePre)
          ),
          skill.snippet &&
            el(
              "div",
              { class: "snippet" },
              el("h4", { text: `$ cat ${skill.file || "example.txt"}` }),
              el("pre", null, el("code", { text: skill.snippet }))
            )
        ),
        count > 0 &&
          el("a", {
            class: "panel-link",
            href: "#projects",
            text: t("skills.projectsWith", { skill: title, n: count }),
            onclick: () => setFilter(skill.id),
          })
      )
    );
    if (window.SCENES) players.set(skill.id, window.SCENES.createPlayer(scenePre, skill.id));
    return panel;
  }

  function renderSkills() {
    players.forEach((p) => p.stop());
    players.clear();
    tabsRoot.textContent = "";
    panelsRoot.textContent = "";
    tabsRoot.setAttribute("aria-label", t("skills.title"));
    tabs = [];
    [["web", "skills.web"], ["admin", "skills.admin"]].forEach(([group, key]) => {
      const items = skills.filter((s) => (s.group || "web") === group);
      if (!items.length) return;
      const row = el("div", { class: "tab-group", role: "presentation" }, el("span", { class: "tab-group-label", text: t(key), "aria-hidden": "true" }));
      items.forEach((skill) => {
        const tab = el("button", {
          class: "tab",
          type: "button",
          role: "tab",
          id: `tab-${skill.id}`,
          "aria-controls": `panel-${skill.id}`,
          "aria-selected": "false",
          tabindex: "-1",
          "data-skill": skill.id,
          text: L(skill.title),
          onclick: () => {
            SOUND.tick();
            selectSkill(skill.id, { animate: true });
          },
        });
        tabs.push(tab);
        row.append(tab);
      });
      tabsRoot.append(row);
    });
    panels = tabs.map((tab) => buildPanel(skillById.get(tab.dataset.skill)));
    panelsRoot.append(...panels);
    if (state.skill) selectSkill(state.skill);
  }

  function animateMeter(panel) {
    const fill = $(".meter-fill", panel);
    const empty = $(".meter-empty", panel);
    if (!fill || reduceMotion) return;
    const score = Number(panel.dataset.score);
    let n = 0;
    (function step() {
      fill.textContent = "█".repeat(n);
      empty.textContent = "░".repeat(10 - n);
      if (n++ < score) setTimeout(step, 45);
    })();
  }

  function animatePanel(panel) {
    if (reduceMotion) return;
    panel.classList.remove("is-drawing");
    void panel.offsetWidth; // перезапуск CSS-анимации
    panel.classList.add("is-drawing");
    const title = $("h3", panel);
    scramble(title, title.getAttribute("aria-label"), 450);
    animateMeter(panel);
  }

  // Играет только сцена открытой вкладки и только когда её видно.
  function syncScenes() {
    players.forEach((player, id) => {
      if (id === state.skill && panelsVisible && !document.hidden) player.start();
      else player.stop();
    });
  }

  function selectSkill(id, { focus = false, animate = false, scroll = false } = {}) {
    if (!skillById.has(id)) return;
    state.skill = id;
    tabs.forEach((tab, i) => {
      const active = tab.dataset.skill === id;
      const wasActive = !panels[i].hidden;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
      panels[i].hidden = !active;
      if (active && focus) tab.focus();
      if (active && animate && !wasActive) animatePanel(panels[i]);
    });
    syncScenes();
    if (scroll) $("#skills").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }

  // Стрелки, Home и End переключают вкладки.
  tabsRoot.addEventListener("keydown", (event) => {
    const current = tabs.findIndex((tab) => tab.getAttribute("aria-selected") === "true");
    const last = tabs.length - 1;
    const next = {
      ArrowRight: current === last ? 0 : current + 1,
      ArrowLeft: current === 0 ? last : current - 1,
      Home: 0,
      End: last,
    }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    SOUND.tick();
    selectSkill(tabs[next].dataset.skill, { focus: true, animate: true });
  });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      panelsVisible = entries[entries.length - 1].isIntersecting;
      syncScenes();
    }).observe(panelsRoot);
  }
  document.addEventListener("visibilitychange", syncScenes);

  /* =====================================================================
     ОПЫТ И СЕРТИФИКАТЫ
     ===================================================================== */
  function renderExperience() {
    const list = $("[data-experience]");
    list.textContent = "";
    experience.forEach((job) =>
      list.append(
        el(
          "li",
          { class: "log-entry" },
          el("span", { class: "log-time", text: `[${L(job.period)}]` }),
          el(
            "div",
            { class: "log-body" },
            el(
              "p",
              { class: "log-head" },
              el("span", { class: "log-company", text: L(job.company) }),
              el("span", { class: "dim", text: " · " }),
              el("span", { class: "log-role", text: L(job.role) })
            ),
            el("ul", { class: "log-points" }, (L(job.points) || []).map((p) => el("li", { text: p })))
          )
        )
      )
    );
    const certList = $("[data-certs]");
    certList.textContent = "";
    certs.forEach((c) =>
      certList.append(
        el(
          "li",
          null,
          el("span", { class: "cert-year", text: `[${c.year}]` }),
          " ",
          el("span", { class: "cert-name", text: L(c.name) }),
          el("span", { class: "cert-issuer", text: " — " + L(c.issuer) })
        )
      )
    );
  }

  /* =====================================================================
     ПРОЕКТЫ с фильтром
     ===================================================================== */
  const grid = $("[data-projects]");
  const emptyEl = $("[data-empty]");
  const filtersRoot = $("[data-filters]");
  let filterButtons = [];
  let cards = [];

  const corners = () => ["tl", "tr", "bl", "br"].map((pos) => el("span", { class: `corner ${pos}`, "aria-hidden": "true", text: "+" }));

  function renderProjects() {
    filtersRoot.textContent = "";
    grid.textContent = "";
    filtersRoot.setAttribute("aria-label", t("projects.title"));
    const usedSkills = skills.filter((s) => projects.some((p) => p.tech.includes(s.id)));
    filterButtons = [{ id: "all", label: t("projects.all") }, ...usedSkills.map((s) => ({ id: s.id, label: s.id }))].map((f) =>
      el(
        "button",
        {
          class: "chip",
          type: "button",
          "aria-pressed": "false",
          "data-filter": f.id,
          onclick: () => {
            SOUND.tick();
            setFilter(f.id);
          },
        },
        el("span", { class: "box", "aria-hidden": "true" }),
        f.label
      )
    );
    filtersRoot.append(...filterButtons);

    cards = projects.map((project, i) => {
      const links = [
        project.demo && el("a", { href: project.demo, target: "_blank", rel: "noopener", text: `[${t("projects.demo")} ↗]` }),
        project.code && el("a", { href: project.code, target: "_blank", rel: "noopener", text: `[${t("projects.code")} ↗]` }),
      ].filter(Boolean);
      const card = el(
        "article",
        { class: "card", "data-tech": project.tech.join(" "), vars: { "--delay": `${(i % 3) * 90}ms` } },
        corners(),
        el("span", { class: "card-index", "aria-hidden": "true", text: String(i + 1).padStart(3, "0") }),
        el("h3", null, el("span", { class: "caret", "aria-hidden": "true", text: ">" }), L(project.title)),
        el("p", { text: L(project.description) }),
        el("ul", { class: "tags", "aria-label": "tags" }, project.tech.map((id) => el("li", { text: `#${id}` }))),
        links.length > 0 && el("div", { class: "card-links" }, links)
      );
      if (state.started) card.classList.add("in");
      else reveal(card);
      return card;
    });
    grid.append(...cards);
    if (state.filter !== "all" && !usedSkills.some((s) => s.id === state.filter)) state.filter = "all";
    setFilter(state.filter, { quiet: true });
  }

  function setFilter(id, { quiet = false } = {}) {
    state.filter = id;
    filterButtons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.filter === id)));
    let visible = 0;
    cards.forEach((card) => {
      const show = id === "all" || card.dataset.tech.split(" ").includes(id);
      card.hidden = !show;
      if (!show) return;
      if (!quiet && !reduceMotion && card.classList.contains("in")) {
        card.classList.remove("is-popping");
        void card.offsetWidth;
        card.style.animationDelay = `${visible * 70}ms`;
        card.classList.add("is-popping");
      }
      visible++;
    });
    emptyEl.hidden = visible > 0;
  }

  /* =====================================================================
     КОНТАКТЫ
     ===================================================================== */
  function renderContacts() {
    const list = $("[data-contacts]");
    list.textContent = "";
    contacts.forEach((c) => {
      const external = c.href.startsWith("http");
      list.append(
        el(
          "li",
          null,
          el(
            "a",
            { class: "contact", href: c.href, target: external ? "_blank" : null, rel: external ? "noopener" : null },
            el("span", { class: "contact-key", text: c.label }),
            el("span", { class: "contact-fill", "aria-hidden": "true" }),
            el("span", { class: "contact-value", text: c.value })
          )
        )
      );
    });
  }

  /* =====================================================================
     ПОЯВЛЕНИЕ ПРИ ПРОКРУТКЕ (блоки видны всегда, анимация — только «подъём»)
     ===================================================================== */
  const revealHooks = new Map();
  const revealTargets = [];
  let revealObserver = null;

  function reveal(node, hook) {
    node.setAttribute("data-reveal", "");
    if (hook) revealHooks.set(node, hook);
    if (revealObserver) revealObserver.observe(node);
    else revealTargets.push(node);
  }

  /* =====================================================================
     ОТРИСОВКА ВСЕГО И СМЕНА ЯЗЫКА
     ===================================================================== */
  function renderAll() {
    renderProfile();
    renderSkills();
    renderExperience();
    renderProjects();
    renderContacts();
    syncControls();
  }
  renderAll();
  document.addEventListener("langchange", () => {
    renderAll();
    toast(I18N.lang.toUpperCase());
  });

  $$("[data-reveal]").forEach((node) => {
    if (!revealTargets.includes(node)) reveal(node);
  });
  $$("[data-title]").forEach((h2) => {
    const text = $(".title-text", h2);
    reveal(h2, () => scramble(text, text.textContent, 650));
  });
  revealHooks.set(panelsRoot, () => {
    const active = panels.find((p) => !p.hidden);
    if (active) animatePanel(active);
  });

  function startReveal() {
    if (!("IntersectionObserver" in window) || reduceMotion) {
      revealTargets.forEach((node) => node.classList.add("in"));
      return;
    }
    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("in");
          revealObserver.unobserve(entry.target);
          const hook = revealHooks.get(entry.target);
          if (hook) hook();
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    revealTargets.forEach((node) => revealObserver.observe(node));
  }

  /* =====================================================================
     НАВИГАЦИЯ: подсветка текущего раздела
     ===================================================================== */
  const navLinks = $$(".nav a");
  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          navLinks.forEach((a) => a.classList.toggle("is-current", a.getAttribute("href") === `#${entry.target.id}`));
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    $$("main section[id]").forEach((s) => sectionObserver.observe(s));
  }

  /* =====================================================================
     ПАСХАЛКА: ↑↑↓↓←→←→ B A — режим матрицы
     ===================================================================== */
  const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
  let konami = 0;
  document.addEventListener("keydown", (event) => {
    if (event.target.closest && event.target.closest("input, textarea")) return;
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    konami = key === KONAMI[konami] ? konami + 1 : key === KONAMI[0] ? 1 : 0;
    if (konami === KONAMI.length) {
      konami = 0;
      glitch();
      toggleMatrix();
    }
  });

  // Для терминала и других модулей
  window.APP = {
    selectSkill: (id, opts) => selectSkill(id, { animate: true, ...opts }),
    goTo(id) {
      const target = id === "top" ? $("#top") : document.getElementById(id);
      if (target) target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    },
    theme: THEME,
    toast,
    glitch,
    toggleMatrix,
  };

  /* =====================================================================
     ВХОД НА СТРАНИЦУ (после интро)
     ===================================================================== */
  $$("[data-hero]").forEach((node, i) => node.style.setProperty("--i", i));

  function startGlitchLoop() {
    if (!heroArt || reduceMotion) return;
    (function schedule() {
      setTimeout(() => {
        if (!document.hidden) heroArt.glitch();
        schedule();
      }, 3000 + Math.random() * 3500);
    })();
    // Наведение или касание — логотип делает оборот
    $(".hero-art").addEventListener("pointerenter", () => {
      if (!heroArt.busy) heroArt.spin(1, 1800);
    });
  }

  function startPage() {
    if (state.started) return;
    state.started = true;
    root.classList.add("page-ready");
    scramble(nameEl, L(profile.name), 900);
    if (heroArt) {
      heroArt.clear();
      setTimeout(() => heroArt.decode(1400).then(startGlitchLoop), 250);
    }
    startReveal();
  }

  if (root.classList.contains("intro-active")) {
    document.addEventListener("intro:done", startPage, { once: true });
    setTimeout(startPage, 16000); // страховка, если интро не запустилось
  } else {
    startPage();
  }
})();

/* Портфолио: главная — только логотип на фоне луны; разделы открываются отдельными страницами
 * (#office, #skills, #experience, #projects, #terminal, #contact) с переходом «печати».
 * Здесь же: вкладки навыков с ASCII-сценами, фильтр проектов, опыт, контакты, язык, тема, звук, пасхалка. */
(function () {
  "use strict";

  const data = window.PORTFOLIO;
  if (!data || !window.FX || !window.I18N) return;

  const { profile, contacts = [], skills = [], projects = [], experience = [], certs = [] } = data;
  const { scramble, createAsciiArt, animate, easeInOut, randomFrom, GLYPHS } = window.FX;
  const I18N = window.I18N;
  const { t, pick: L } = I18N;
  const SOUND = window.SOUND || { enabled: false, set() {}, key() {}, tick() {}, beep() {} };
  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const skillById = new Map(skills.map((s) => [s.id, s]));
  const LEVELS = { basic: 3, intermediate: 6, confident: 8, advanced: 9, expert: 10 };
  const PAGES = ["home", "office", "skills", "experience", "projects", "terminal", "contact"];
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  const state = { skill: skills.length ? skills[0].id : null, filter: "all", page: null };

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
     ПОДСКАЗКИ, ТЕМА, ГЛИТЧ, МАТРИЦА
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
     ГЛАВНАЯ: только логотип
     ===================================================================== */
  const logoBox = $("[data-home-logo]");
  const logo = window.ASCII_LOGO ? createAsciiArt(logoBox, window.ASCII_LOGO) : null;
  if (logo) logo.show();

  // Логотип медленно вращается; наведение, касание или клик — быстрый оборот
  const spinLogo = () => logo && !logo.busy && logo.spin(1, 1800);
  logoBox.addEventListener("pointerenter", spinLogo);
  logoBox.addEventListener("click", spinLogo);

  if (logo && !reduceMotion) {
    let lastFrame = 0;
    (function rotate(now) {
      requestAnimationFrame(rotate);
      if (now - lastFrame < 50) return;
      const dt = lastFrame ? (now - lastFrame) / 1000 : 0;
      lastFrame = now;
      if (document.hidden || state.page !== "home" || logo.busy) return;
      logo.setAngle((logo.angle + dt * 0.35) % (Math.PI * 2)); // оборот примерно за 18 секунд
    })(0);
  }

  if (logo && !reduceMotion) {
    (function schedule() {
      setTimeout(() => {
        if (!document.hidden && state.page === "home") logo.glitch();
        schedule();
      }, 2800 + Math.random() * 3000);
    })();
  }

  function renderProfile() {
    $$("[data-handle]").forEach((n) => (n.textContent = profile.handle || "user"));
    $("[data-footer]").textContent = `© ${new Date().getFullYear()} · ${profile.handle || ""}`;
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
    const scenePre = el("pre", { class: "scene-pre asc" });
    // Анимированная картинка навыка рядом с заголовком
    const iconPre = window.ICONS && window.ICONS.has("skill", skill.id) ? el("pre", { class: "asc skill-icon", "aria-hidden": "true" }) : null;
    if (iconPre) window.ICONS.skill(iconPre, skill.id);
    const player = window.SCENES ? window.SCENES.createPlayer(scenePre, skill.id) : null;
    const toggle = el("button", { class: "anim-toggle", type: "button" });
    const syncToggle = () => {
      if (!player) return;
      toggle.textContent = `[ ${t(player.paused ? "anim.play" : "anim.pause")} ]`;
      toggle.setAttribute("aria-pressed", String(!player.paused));
    };
    toggle.addEventListener("click", () => {
      if (!player) return;
      player.setPaused(!player.paused);
      syncToggle();
      syncScenes();
    });
    syncToggle();

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
          iconPre,
          el(
            "div",
            { class: "panel-title" },
            el("h3", { text: title, "aria-label": title }),
            skill.summary && el("p", { class: "panel-summary", text: L(skill.summary) })
          ),
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
            { class: "scene term" },
            el("div", { class: "term-bar" }, el("span", { text: `$ ./demo --${skill.id}` }), player && toggle),
            el("div", { class: "scene-screen", "aria-hidden": "true" }, scenePre)
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
    if (player) players.set(skill.id, player);
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
    if (reduceMotion || !panel) return;
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

  function selectSkill(id, { focus = false, animate = false } = {}) {
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
      return el(
        "article",
        { class: "card", "data-tech": project.tech.join(" "), "data-reveal": true },
        corners(),
        el("span", { class: "card-index", "aria-hidden": "true", text: String(i + 1).padStart(3, "0") }),
        el("h3", null, el("span", { class: "caret", "aria-hidden": "true", text: ">" }), L(project.title)),
        el("p", { text: L(project.description) }),
        el("ul", { class: "tags", "aria-label": "tags" }, project.tech.map((id) => el("li", { text: `#${id}` }))),
        links.length > 0 && el("div", { class: "card-links" }, links)
      );
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
      if (!quiet && !reduceMotion) {
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
      // Анимированная картинка: github — кот и вклады, telegram — самолётик, phone — звонок, email — конверт
      const art = window.ICONS && window.ICONS.has("contact", c.label) ? el("pre", { class: "asc contact-icon", "aria-hidden": "true" }) : null;
      list.append(
        el(
          "li",
          { class: "contact-card term", "data-reveal": true },
          el("div", { class: "term-bar", "aria-hidden": "true" }, el("span", { text: `~/contacts/${c.label}` }), el("span", { class: "live", text: "●" })),
          el(
            "a",
            { class: "contact", href: c.href, target: external ? "_blank" : null, rel: external ? "noopener" : null },
            art && el("div", { class: "contact-art" }, art),
            el("span", { class: "contact-key", text: c.label }),
            el("span", { class: "contact-value", text: c.value })
          )
        )
      );
      if (art) window.ICONS.contact(art, c.label);
    });
  }

  /* =====================================================================
     СТРАНИЦЫ: показ по адресу #раздел, переход «печати»
     ===================================================================== */
  const navLinks = $$(".nav a");
  const brandPath = $("[data-brand-path]");

  // Полоса из символов проходит сверху вниз и «печатает» страницу.
  function scanReveal(page) {
    const band = el("div", { class: "scan-band", "aria-hidden": "true" });
    const bandRows = [0, 1, 2].map(() => band.appendChild(document.createElement("div")));
    document.body.append(band);
    const top = page.getBoundingClientRect().top;
    const viewport = window.innerHeight;
    const width = Math.ceil(window.innerWidth / 6) + 4;
    const row = (set) => Array.from({ length: width }, () => randomFrom(set)).join("");
    page.style.clipPath = "inset(0 0 100% 0)";
    return animate(620, (time, p) => {
      const y = easeInOut(p) * (viewport + 40 - top) + top;
      page.style.clipPath = `inset(0 0 ${Math.max(0, page.offsetHeight - (y - top))}px 0)`;
      band.style.transform = `translateY(${y - band.offsetHeight / 2}px)`;
      bandRows[0].textContent = row(" ░░▒");
      bandRows[1].textContent = row(GLYPHS);
      bandRows[2].textContent = row("▒▓▓█");
    }).then(() => {
      page.style.clipPath = "";
      band.remove();
    });
  }

  function enterAnimations(page) {
    $$("[data-reveal]", page).forEach((node, i) => {
      node.classList.remove("in");
      void node.offsetWidth;
      node.style.setProperty("--delay", `${Math.min(i, 10) * 60}ms`);
      node.classList.add("in");
    });
    const title = $(".title-text", page);
    if (title) scramble(title, title.textContent, 600);
    if (page.dataset.page === "skills") animatePanel(panels.find((p) => !p.hidden));
  }

  function showPage(id, { animate: withAnimation = true } = {}) {
    if (!PAGES.includes(id)) id = "home";
    if (id === state.page) return;
    const next = $(`[data-page="${id}"]`);
    $$("main [data-page]").forEach((page) => (page.hidden = page !== next));
    state.page = id;
    root.dataset.view = id;
    window.scrollTo({ top: 0, behavior: "instant" });
    navLinks.forEach((a) => {
      if (a.getAttribute("href") === `#${id}`) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
    if (brandPath) brandPath.textContent = id === "home" ? "~" : `~/${id}`;
    if (window.BG) window.BG.setScene(id === "home" ? "home" : "page");

    if (id === "home") {
      if (logo && withAnimation) logo.decode(1000);
    } else if (withAnimation && !reduceMotion) {
      SOUND.tick();
      enterAnimations(next);
      scanReveal(next);
    }
    if (id === "terminal" && window.matchMedia("(pointer: fine)").matches) {
      const input = $("#console-input");
      if (input) setTimeout(() => input.focus({ preventScroll: true }), 50);
    }
    document.dispatchEvent(new CustomEvent("pagechange", { detail: id }));
  }

  function goTo(id) {
    const target = id === "top" ? "home" : id;
    if (`#${target}` === location.hash) showPage(target);
    else location.hash = target;
  }

  window.addEventListener("hashchange", () => {
    const id = location.hash.slice(1);
    if (PAGES.includes(id) || id === "") showPage(id || "home");
  });

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
    if (window.ICONS) window.ICONS.prune();
    toast(I18N.lang.toUpperCase());
  });

  // Для терминала и других модулей
  window.APP = {
    selectSkill(id) {
      goTo("skills");
      selectSkill(id, { animate: true });
    },
    goTo,
    theme: THEME,
    toast,
    glitch,
    toggleMatrix,
    home() {
      goTo("home");
      if (logo && state.page === "home") logo.decode(1200);
    },
  };

  const startId = location.hash.slice(1);
  showPage(PAGES.includes(startId) ? startId : "home", { animate: false });
  if (state.page === "home" && logo && !reduceMotion) {
    logo.clear();
    setTimeout(() => logo.decode(1600), 200);
  }
})();

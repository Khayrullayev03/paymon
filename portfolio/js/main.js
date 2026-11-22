/* Отрисовка портфолио из window.PORTFOLIO (js/data.js) и моушен-эффекты. */
(function () {
  "use strict";

  const data = window.PORTFOLIO;
  if (!data) return;

  const { profile, contacts = [], skills = [], projects = [] } = data;
  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const skillById = new Map(skills.map((s) => [s.id, s]));
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  // Небольшой помощник для создания элементов.
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
     ЭФФЕКТЫ (используются и здесь, и в intro.js через window.FX)
     ===================================================================== */
  const GLYPHS = "!<>-_\\/[]{}=+*^?#%@$&01";
  const randomGlyph = () => GLYPHS[(Math.random() * GLYPHS.length) | 0];

  // «Расшифровка» текста: случайные символы постепенно превращаются в нужные.
  function scramble(node, text, duration = 700) {
    if (reduceMotion) {
      node.textContent = text;
      return Promise.resolve();
    }
    const chars = [...text];
    const last = Math.max(1, chars.length - 1);
    const ends = chars.map((_, i) => duration * (0.3 + 0.7 * (i / last)) * (0.85 + Math.random() * 0.3));

    return new Promise((resolve) => {
      const start = performance.now();
      let glyphs = chars.map(randomGlyph);
      let lastSwap = start;
      (function frame(now) {
        const t = now - start;
        if (now - lastSwap > 55) {
          glyphs = chars.map(randomGlyph);
          lastSwap = now;
        }
        let out = "";
        let pending = false;
        chars.forEach((ch, i) => {
          if (ch === " " || t >= ends[i]) out += ch;
          else {
            out += glyphs[i];
            pending = true;
          }
        });
        node.textContent = out;
        if (pending) requestAnimationFrame(frame);
        else resolve();
      })(start);
    });
  }

  // ASCII-логотип: два слоя <pre> (серебро и красные камни) поверх друг друга.
  function createAsciiArt(container, art) {
    const silverPre = $(".ascii-silver", container);
    const redPre = $(".ascii-red", container);
    const { cols, rows } = art;
    container.style.setProperty("--cols", cols);
    container.style.setProperty("--rows", rows);

    const cx = (cols - 1) / 2;
    const cy = (rows - 1) / 2;
    const maxDist = Math.hypot(cx * 0.6, cy);
    const cells = [];
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const s = (art.silver[y] || "")[x] || " ";
        const r = (art.red[y] || "")[x] || " ";
        const ch = r !== " " ? r : s;
        cells.push(
          ch === " "
            ? null
            : { ch, red: r !== " ", y, dist: Math.hypot((x - cx) * 0.6, y - cy) / maxDist }
        );
      }
    }

    function render(pickChar) {
      let silver = "";
      let red = "";
      for (let i = 0; i < cells.length; i++) {
        const cell = cells[i];
        if (!cell) {
          silver += " ";
          red += " ";
        } else {
          const ch = pickChar(cell);
          silver += cell.red ? " " : ch;
          red += cell.red ? ch : " ";
        }
        if ((i + 1) % cols === 0) {
          silver += "\n";
          red += "\n";
        }
      }
      silverPre.textContent = silver;
      redPre.textContent = red;
    }

    let busy = false;
    const api = {
      show: () => render((c) => c.ch),
      clear: () => render(() => " "),
      // Логотип «собирается» из центра наружу.
      decode(duration = 1200) {
        if (reduceMotion) {
          api.show();
          return Promise.resolve();
        }
        busy = true;
        cells.forEach((c) => c && (c.at = c.dist * duration * 0.75 + Math.random() * duration * 0.25));
        return new Promise((resolve) => {
          const start = performance.now();
          (function frame(now) {
            const t = now - start;
            render((c) => (t >= c.at ? c.ch : t >= c.at - 280 ? randomGlyph() : " "));
            if (t < duration) requestAnimationFrame(frame);
            else {
              api.show();
              busy = false;
              resolve();
            }
          })(start);
        });
      },
      // Короткий сбой «сигнала» в нескольких строках.
      glitch() {
        if (reduceMotion || busy) return;
        busy = true;
        const from = (Math.random() * (rows - 6)) | 0;
        const to = from + 2 + ((Math.random() * 4) | 0);
        let frames = 0;
        container.classList.add("is-glitching");
        (function step() {
          render((c) => (c.y >= from && c.y < to && Math.random() < 0.55 ? randomGlyph() : c.ch));
          if (++frames < 4) setTimeout(step, 45);
          else {
            api.show();
            container.classList.remove("is-glitching");
            busy = false;
          }
        })();
      },
      get busy() {
        return busy;
      },
    };
    return api;
  }

  window.FX = { scramble, createAsciiArt, reduceMotion };

  /* =====================================================================
     ОБО МНЕ
     ===================================================================== */
  const nameEl = $("[data-name]");
  nameEl.textContent = profile.name;
  nameEl.setAttribute("aria-label", profile.name);
  $("[data-role]").textContent = profile.role;
  $("[data-about]").textContent = profile.about;
  $("[data-handle]").textContent = profile.handle || "user";
  $("[data-footer]").textContent = `© ${new Date().getFullYear()} ${profile.name}`;

  $("[data-stack]").append(
    ...skills.map((skill) =>
      el(
        "li",
        null,
        el("a", {
          href: "#skills",
          text: `${skill.title.toLowerCase()}/`,
          onclick: () => selectSkill(skill.id, { animate: true }),
        })
      )
    )
  );

  const heroArt = window.ASCII_LOGO ? createAsciiArt($("[data-hero-ascii]"), window.ASCII_LOGO) : null;
  if (heroArt) heroArt.show();

  /* =====================================================================
     НАВЫКИ: вкладка на каждую технологию
     ===================================================================== */
  const LEVELS = { Базовый: 3, Средний: 6, Уверенный: 8, Продвинутый: 9, Эксперт: 10 };
  const tabsRoot = $("[data-tabs]");
  const panelsRoot = $("[data-panels]");

  const tabs = skills.map((skill) =>
    el("button", {
      class: "tab",
      type: "button",
      role: "tab",
      id: `tab-${skill.id}`,
      "aria-controls": `panel-${skill.id}`,
      "aria-selected": "false",
      tabindex: "-1",
      "data-skill": skill.id,
      text: skill.title,
      onclick: () => selectSkill(skill.id, { animate: true }),
    })
  );

  const panels = skills.map((skill) => {
    const count = projects.filter((p) => p.tech.includes(skill.id)).length;
    const score = LEVELS[skill.level] || 5;
    const lines = skill.snippet ? skill.snippet.split("\n").length : 1;

    return el(
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
      el(
        "div",
        { class: "term-bar", "aria-hidden": "true" },
        el("span", { text: `~/skills/${skill.id}` }),
        el("span", { text: "─ □ ×" })
      ),
      el(
        "div",
        { class: "panel-inner" },
        el(
          "div",
          { class: "panel-head" },
          el("h3", { text: skill.title, "aria-label": skill.title }),
          skill.level &&
            el(
              "span",
              { class: "meter", "aria-label": `Уровень: ${skill.level}` },
              el(
                "span",
                { class: "meter-bar", "aria-hidden": "true" },
                "[",
                el("span", { class: "meter-fill", text: "█".repeat(score) }),
                el("span", { class: "meter-empty", text: "░".repeat(10 - score) }),
                "]"
              ),
              el("span", { class: "meter-label", text: skill.level })
            )
        ),
        skill.summary && el("p", { class: "panel-summary", text: skill.summary }),
        el(
          "div",
          { class: "panel-body" },
          el(
            "div",
            null,
            el("h4", { text: "что умею:" }),
            el("ul", { class: "points" }, (skill.points || []).map((p) => el("li", { text: p })))
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
            text: `→ проекты с ${skill.title}: ${count}`,
            onclick: () => setFilter(skill.id),
          })
      )
    );
  });

  tabsRoot.append(...tabs);
  panelsRoot.append(...panels);

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

  function selectSkill(id, { focus = false, animate = false } = {}) {
    tabs.forEach((tab, i) => {
      const active = tab.dataset.skill === id;
      const wasActive = !panels[i].hidden;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
      panels[i].hidden = !active;
      if (active && focus) tab.focus();
      if (active && animate && !wasActive) animatePanel(panels[i]);
    });
  }

  // Стрелки, Home и End переключают вкладки.
  tabsRoot.addEventListener("keydown", (event) => {
    const current = tabs.findIndex((t) => t.getAttribute("aria-selected") === "true");
    const last = tabs.length - 1;
    const next = {
      ArrowRight: current === last ? 0 : current + 1,
      ArrowLeft: current === 0 ? last : current - 1,
      Home: 0,
      End: last,
    }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    selectSkill(tabs[next].dataset.skill, { focus: true, animate: true });
  });

  if (skills.length) selectSkill(skills[0].id);

  /* =====================================================================
     ПРОЕКТЫ с фильтром
     ===================================================================== */
  const grid = $("[data-projects]");
  const empty = $("[data-empty]");
  const usedSkills = skills.filter((s) => projects.some((p) => p.tech.includes(s.id)));

  const filterButtons = [{ id: "all", title: "все" }, ...usedSkills].map((f) =>
    el(
      "button",
      {
        class: "chip",
        type: "button",
        "aria-pressed": "false",
        "data-filter": f.id,
        onclick: () => setFilter(f.id),
      },
      el("span", { class: "box", "aria-hidden": "true" }),
      f.id === "all" ? f.title : f.title.toLowerCase()
    )
  );
  $("[data-filters]").append(...filterButtons);

  const corners = () =>
    ["tl", "tr", "bl", "br"].map((pos) => el("span", { class: `corner ${pos}`, "aria-hidden": "true", text: "+" }));

  const cards = projects.map((project, i) => {
    const links = [
      project.demo && el("a", { href: project.demo, target: "_blank", rel: "noopener", text: "[демо ↗]" }),
      project.code && el("a", { href: project.code, target: "_blank", rel: "noopener", text: "[код ↗]" }),
    ].filter(Boolean);

    const card = el(
      "article",
      { class: "card", "data-tech": project.tech.join(" ") },
      corners(),
      el("span", { class: "card-index", "aria-hidden": "true", text: String(i + 1).padStart(3, "0") }),
      el("h3", null, el("span", { class: "caret", "aria-hidden": "true", text: ">" }), project.title),
      el("p", { text: project.description }),
      el(
        "ul",
        { class: "tags", "aria-label": "Технологии" },
        project.tech.map((id) => el("li", { text: `#${(skillById.get(id) || { title: id }).title.toLowerCase()}` }))
      ),
      links.length > 0 && el("div", { class: "card-links" }, links)
    );
    return card;
  });
  grid.append(...cards);

  function setFilter(id) {
    filterButtons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.filter === id)));
    let visible = 0;
    cards.forEach((card) => {
      const show = id === "all" || card.dataset.tech.split(" ").includes(id);
      card.hidden = !show;
      if (!show) return;
      // Видимые карточки «перерисовываются» по очереди.
      if (!reduceMotion && card.classList.contains("in")) {
        card.classList.remove("is-popping");
        void card.offsetWidth;
        card.style.animationDelay = `${visible * 70}ms`;
        card.classList.add("is-popping");
      }
      visible++;
    });
    empty.hidden = visible > 0;
  }

  setFilter("all");

  /* =====================================================================
     КОНТАКТЫ
     ===================================================================== */
  $("[data-contacts]").append(
    ...contacts.map((c) => {
      const external = c.href.startsWith("http");
      return el(
        "li",
        null,
        el(
          "a",
          {
            class: "contact",
            href: c.href,
            target: external ? "_blank" : null,
            rel: external ? "noopener" : null,
          },
          el("span", { class: "contact-key", text: c.label }),
          el("span", { class: "contact-fill", "aria-hidden": "true" }),
          el("span", { class: "contact-value", text: c.value })
        )
      );
    })
  );

  /* =====================================================================
     НАВИГАЦИЯ: подсветка текущего раздела
     ===================================================================== */
  const navLinks = $$(".nav a");
  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          navLinks.forEach((a) =>
            a.classList.toggle("is-current", a.getAttribute("href") === `#${entry.target.id}`)
          );
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    $$("main section[id]").forEach((s) => sectionObserver.observe(s));
  }

  /* =====================================================================
     ПОЯВЛЕНИЕ ПРИ ПРОКРУТКЕ
     ===================================================================== */
  const revealHooks = new Map();
  const revealTargets = [];

  function reveal(node, hook) {
    node.setAttribute("data-reveal", "");
    if (hook) revealHooks.set(node, hook);
    revealTargets.push(node);
  }

  $$("[data-reveal]").forEach((node) => reveal(node));
  $$("[data-title]").forEach((h2) => {
    const text = $(".title-text", h2);
    reveal(h2, () => scramble(text, text.textContent, 650));
  });
  cards.forEach((card, i) => {
    card.style.transitionDelay = `${(i % 3) * 90}ms`;
    reveal(card);
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
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("in");
          observer.unobserve(entry.target);
          const hook = revealHooks.get(entry.target);
          if (hook) hook();
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    revealTargets.forEach((node) => observer.observe(node));
  }

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
    $(".hero-art").addEventListener("pointerenter", () => {
      if (!heroArt.busy) heroArt.decode(700);
    });
  }

  let pageStarted = false;
  function startPage() {
    if (pageStarted) return;
    pageStarted = true;
    root.classList.add("page-ready");
    scramble(nameEl, profile.name, 900);
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

/* Отрисовка портфолио из window.PORTFOLIO (js/data.js). */
(function () {
  "use strict";

  const data = window.PORTFOLIO;
  if (!data) return;

  const { profile, contacts = [], skills = [], projects = [] } = data;
  const skillById = new Map(skills.map((s) => [s.id, s]));
  const $ = (selector) => document.querySelector(selector);

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

  const dot = () => el("span", { class: "dot", "aria-hidden": "true" });
  const skillVars = (skill) => (skill && skill.color ? { "--skill": skill.color } : null);

  // ---------- Обо мне ----------
  const initials = profile.name
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  document.title = `${profile.name} — портфолио`;
  $("[data-initials]").textContent = initials;
  $("[data-name]").textContent = profile.name;
  $("[data-role]").textContent = profile.role;
  $("[data-about]").textContent = profile.about;
  $("[data-footer]").textContent = `© ${new Date().getFullYear()} ${profile.name}`;

  $("[data-stack]").append(
    ...skills.map((skill) =>
      el(
        "li",
        null,
        el(
          "a",
          {
            class: "chip",
            href: "#skills",
            vars: skillVars(skill),
            onclick: () => selectSkill(skill.id),
          },
          dot(),
          skill.title
        )
      )
    )
  );

  // ---------- Навыки: вкладка на каждую технологию ----------
  const tabsRoot = $("[data-tabs]");
  const panelsRoot = $("[data-panels]");

  const tabs = skills.map((skill) =>
    el(
      "button",
      {
        class: "tab",
        type: "button",
        role: "tab",
        id: `tab-${skill.id}`,
        "aria-controls": `panel-${skill.id}`,
        "aria-selected": "false",
        tabindex: "-1",
        "data-skill": skill.id,
        vars: skillVars(skill),
        onclick: () => selectSkill(skill.id),
      },
      dot(),
      skill.title
    )
  );

  const panels = skills.map((skill) => {
    const count = projects.filter((p) => p.tech.includes(skill.id)).length;

    return el(
      "div",
      {
        class: "panel",
        role: "tabpanel",
        id: `panel-${skill.id}`,
        "aria-labelledby": `tab-${skill.id}`,
        tabindex: "0",
        hidden: true,
        vars: skillVars(skill),
      },
      el(
        "div",
        { class: "panel-head" },
        el("h3", { text: skill.title }),
        skill.level && el("span", { class: "badge", text: skill.level })
      ),
      skill.summary && el("p", { class: "panel-summary", text: skill.summary }),
      el(
        "div",
        { class: "panel-body" },
        el(
          "div",
          null,
          el("h4", { text: "Что умею" }),
          el("ul", { class: "points" }, (skill.points || []).map((p) => el("li", { text: p })))
        ),
        skill.snippet &&
          el(
            "div",
            { class: "snippet" },
            el("h4", { text: "Пример кода" }),
            el("pre", null, el("code", { text: skill.snippet }))
          )
      ),
      count > 0 &&
        el("a", {
          class: "panel-link",
          href: "#projects",
          text: `Проекты с ${skill.title}: ${count} →`,
          onclick: () => setFilter(skill.id),
        })
    );
  });

  tabsRoot.append(...tabs);
  panelsRoot.append(...panels);

  function selectSkill(id, focus) {
    tabs.forEach((tab, i) => {
      const active = tab.dataset.skill === id;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
      panels[i].hidden = !active;
      if (active && focus) tab.focus();
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
    selectSkill(tabs[next].dataset.skill, true);
  });

  if (skills.length) selectSkill(skills[0].id);

  // ---------- Проекты с фильтром ----------
  const grid = $("[data-projects]");
  const empty = $("[data-empty]");
  const usedSkills = skills.filter((s) => projects.some((p) => p.tech.includes(s.id)));

  const filterButtons = [{ id: "all", title: "Все" }, ...usedSkills].map((f) =>
    el(
      "button",
      {
        class: "chip",
        type: "button",
        "aria-pressed": "false",
        "data-filter": f.id,
        vars: skillVars(f),
        onclick: () => setFilter(f.id),
      },
      f.color && dot(),
      f.title
    )
  );
  $("[data-filters]").append(...filterButtons);

  const cards = projects.map((project) => {
    const links = [
      project.demo && el("a", { href: project.demo, target: "_blank", rel: "noopener", text: "Демо ↗" }),
      project.code && el("a", { href: project.code, target: "_blank", rel: "noopener", text: "Код ↗" }),
    ].filter(Boolean);

    const card = el(
      "article",
      { class: "card" },
      el("h3", { text: project.title }),
      el("p", { text: project.description }),
      el(
        "ul",
        { class: "tags", "aria-label": "Технологии" },
        project.tech.map((id) => {
          const skill = skillById.get(id);
          return el("li", { class: "tag", vars: skillVars(skill) }, dot(), skill ? skill.title : id);
        })
      ),
      links.length > 0 && el("div", { class: "card-links" }, links)
    );
    card.dataset.tech = project.tech.join(" ");
    return card;
  });
  grid.append(...cards);

  function setFilter(id) {
    filterButtons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.filter === id)));
    let visible = 0;
    cards.forEach((card) => {
      const show = id === "all" || card.dataset.tech.split(" ").includes(id);
      card.hidden = !show;
      if (show) visible++;
    });
    empty.hidden = visible > 0;
  }

  setFilter("all");

  // ---------- Контакты ----------
  $("[data-contacts]").append(
    ...contacts.map((c) =>
      el(
        "li",
        null,
        el(
          "a",
          {
            class: "contact",
            href: c.href,
            target: c.href.startsWith("http") ? "_blank" : null,
            rel: c.href.startsWith("http") ? "noopener" : null,
          },
          el("span", { class: "contact-label", text: c.label }),
          el("span", { class: "contact-value", text: c.value })
        )
      )
    )
  );

  // ---------- Светлая / тёмная тема ----------
  const root = document.documentElement;
  const toggle = $(".theme-toggle");
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)");
  const currentTheme = () => root.dataset.theme || (systemDark.matches ? "dark" : "light");

  function syncToggle() {
    const theme = currentTheme();
    toggle.dataset.mode = theme;
    toggle.setAttribute("aria-label", theme === "dark" ? "Включить светлую тему" : "Включить тёмную тему");
  }

  toggle.addEventListener("click", () => {
    const next = currentTheme() === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch (e) {}
    syncToggle();
  });
  systemDark.addEventListener("change", syncToggle);
  syncToggle();
})();

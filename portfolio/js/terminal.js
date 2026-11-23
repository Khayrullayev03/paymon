/* Интерактивный терминал: help, whoami, neofetch, skills, projects, experience, certs, contact,
 * ls/cat/cd, theme, lang, sound, matrix, reboot, clear, history, date, echo, sudo, exit. */
(function () {
  "use strict";

  const rootEl = document.querySelector("[data-console]");
  const data = window.PORTFOLIO;
  const I18N = window.I18N;
  const APP = window.APP;
  if (!rootEl || !data || !I18N || !APP) return;

  const { t, pick: L } = I18N;
  const SOUND = window.SOUND || { key() {}, tick() {}, beep() {}, set() {}, enabled: false };
  const out = rootEl.querySelector("[data-console-out]");
  const body = rootEl.querySelector("[data-console-body]");
  const form = rootEl.querySelector("[data-console-form]");
  const input = rootEl.querySelector("#console-input");
  const user = data.profile.handle || "user";
  const openedAt = Date.now();
  const history = [];
  let historyIndex = 0;

  const LEVELS = { basic: 3, intermediate: 6, confident: 8, advanced: 9, expert: 10 };
  const SECTIONS = { office: "office", cams: "office", skills: "skills", experience: "experience", exp: "experience", projects: "projects", terminal: "terminal", contact: "contact", contacts: "contact", "~": "top", home: "top", "/": "top" };

  /* ---------- вывод ---------- */
  function parts(list) {
    const frag = document.createDocumentFragment();
    list.forEach((item) => {
      if (item instanceof Node) return frag.append(item);
      const [text, cls] = Array.isArray(item) ? item : [item];
      if (!cls) frag.append(text);
      else {
        const span = document.createElement("span");
        span.className = cls;
        span.textContent = text;
        frag.append(span);
      }
    });
    return frag;
  }

  function print(content, cls) {
    const row = document.createElement("div");
    row.className = "out-line" + (cls ? " " + cls : "");
    if (Array.isArray(content)) row.append(parts(content));
    else if (content instanceof Node) row.append(content);
    else row.textContent = content;
    out.append(row);
    body.scrollTop = body.scrollHeight;
    return row;
  }

  const blank = () => print(" ");
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  function uptime() {
    const s = Math.floor((Date.now() - openedAt) / 1000);
    return `${Math.floor(s / 60)}m ${s % 60}s`;
  }

  function levelBar(level) {
    const n = LEVELS[level] || 5;
    return [["[", "dim"], ["█".repeat(n), "ps1"], ["░".repeat(10 - n), "dim"], ["] ", "dim"], [t("level." + level)]];
  }

  /* ---------- команды ---------- */
  const HELP = [
    ["help", "term.cmd.help"],
    ["whereami · myip", "term.cmd.whereami"],
    ["whoami", "term.cmd.whoami"],
    ["neofetch", "term.cmd.neofetch"],
    ["cam [1-4]", "term.cmd.cam"],
    ["skills [id]", "term.cmd.skills"],
    ["projects", "term.cmd.projects"],
    ["experience", "term.cmd.experience"],
    ["certs", "term.cmd.certs"],
    ["contact", "term.cmd.contact"],
    ["ls · cat <file>", "term.cmd.ls"],
    ["cd <section>", "term.cmd.cd"],
    ["theme [dark|light]", "term.cmd.theme"],
    ["lang [ru|uz|en]", "term.cmd.lang"],
    ["sound [on|off]", "term.cmd.sound"],
    ["matrix", "term.cmd.matrix"],
    ["reboot", "term.cmd.reboot"],
    ["clear", "term.cmd.clear"],
    ["history · date · echo", "term.cmd.misc"],
  ];

  const FILES = {
    "about.txt": () => COMMANDS.whoami(),
    "contacts.txt": () => COMMANDS.contact(),
    "experience.log": () => COMMANDS.experience(),
  };

  /* ---------- карта мира с точкой посетителя ---------- */
  let mapTimer = 0;

  function drawWorldMap(block, loc, frame) {
    const map = window.WORLD_MAP;
    const W = map.cols;
    const H = map.rows;
    const toCell = (lat, lon) => [
      Math.round(((lon + 180) / 360) * (W - 1)),
      Math.round(((map.latTop - Math.max(map.latBottom, Math.min(map.latTop, lat))) / (map.latTop - map.latBottom)) * (H - 1)),
    ];
    const chars = map.lines.map((line) => [...line.padEnd(W)]);
    const cls = chars.map((row) => row.map((ch) => (ch === "#" ? "wm-land" : ch === " " ? "" : "wm-coast")));
    const put = (x, y, ch, c) => {
      if (y < 0 || y >= H || x < 0 || x >= W) return;
      chars[y][x] = ch;
      cls[y][x] = c;
    };

    const [vx, vy] = toCell(loc.lat, loc.lon);
    // «сервер» портфолио и бегущий к посетителю пакет
    const home = data.profile.location;
    if (home && Number.isFinite(home.lat)) {
      const [sx, sy] = toCell(home.lat, home.lon);
      const steps = Math.max(Math.abs(vx - sx), Math.abs(vy - sy));
      for (let i = 1; i < steps; i++) {
        const x = Math.round(sx + ((vx - sx) * i) / steps);
        const y = Math.round(sy + ((vy - sy) * i) / steps);
        if (i % 2 === 0) put(x, y, "·", "wm-path");
      }
      if (steps > 2) {
        const k = (frame % 12) / 12;
        put(Math.round(sx + (vx - sx) * k), Math.round(sy + (vy - sy) * k), "■", "wm-dot");
      }
      put(sx, sy, "+", "wm-srv");
    }
    // точка посетителя с расходящимся «пингом»
    const r = frame % 4;
    if (r > 0) {
      put(vx - r * 2, vy, "(", "wm-ring");
      put(vx + r * 2, vy, ")", "wm-ring");
    }
    put(vx, vy, frame % 2 ? "●" : "•", "wm-dot");
    const label = `← ${t("geo.you")}`;
    if (vx + 3 + label.length < W) [...label].forEach((ch, i) => put(vx + 3 + i, vy - 1, ch, "wm-label"));
    else [...(t("geo.you") + " →")].forEach((ch, i, arr) => put(vx - 3 - arr.length + i, vy - 1, ch, "wm-label"));

    block.textContent = "";
    chars.forEach((row, y) => {
      const line = document.createElement("div");
      let run = "";
      let runCls = null;
      const flush = () => {
        if (!run) return;
        if (runCls) {
          const span = document.createElement("span");
          span.className = runCls;
          span.textContent = run;
          line.append(span);
        } else line.append(run);
        run = "";
      };
      row.forEach((ch, x) => {
        if (cls[y][x] !== runCls) {
          flush();
          runCls = cls[y][x];
        }
        run += ch;
      });
      flush();
      block.append(line);
    });
  }

  async function whereami() {
    if (!window.WORLD_MAP || !window.GEO) return;
    const status = print(t("geo.locating"), "dim");
    const loc = await window.GEO.locate();
    status.remove();
    clearInterval(mapTimer);
    const block = document.createElement("div");
    block.className = "out-block world-map";
    block.setAttribute("aria-hidden", "true");
    print(block);
    let frame = 0;
    drawWorldMap(block, loc, frame);
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      mapTimer = setInterval(() => {
        if (!block.isConnected) return clearInterval(mapTimer);
        if (document.hidden || block.closest("[hidden]")) return;
        drawWorldMap(block, loc, ++frame);
      }, 260);
    }
    const row = (key, value, cls) => print([[(t(key) + ":").padEnd(16), "ps1"], [value, cls || ""]]);
    const place = [loc.city, loc.region, loc.country].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(", ");
    if (loc.source === "ip") {
      row("geo.ip", loc.ip, "bright");
      if (place) row("geo.place", place);
      if (loc.isp) row("geo.isp", loc.isp);
    } else {
      row("geo.ip", t("geo.noIp"), "dim");
      row("geo.place", `≈ ${place} (${loc.tz})`);
    }
    row("geo.local", t("geo.localHidden"), "dim");
    body.scrollTop = body.scrollHeight;
  }

  const COMMANDS = {
    help() {
      print(t("term.helpTitle"), "dim");
      HELP.forEach(([usage, key]) => print([[usage.padEnd(22), "ps1"], t(key)]));
    },

    whereami() {
      return whereami();
    },
    myip() {
      return whereami();
    },

    whoami() {
      print(L(data.profile.name), "bright");
      print(L(data.profile.role), "ps1");
      print(L(data.profile.about));
    },

    neofetch() {
      const skills = data.skills || [];
      const web = skills.filter((s) => (s.group || "web") === "web").length;
      const info = [
        [[`${user}@portfolio`, "bright"]],
        [["─".repeat(user.length + 10), "dim"]],
        [["OS: ", "ps1"], "anvar-os 1.0 (ASCII)"],
        [[t("nf.name") + ": ", "ps1"], L(data.profile.name)],
        [[t("nf.role") + ": ", "ps1"], L(data.profile.role)],
        [[t("nf.skills") + ": ", "ps1"], `${skills.length} (web ${web}, admin ${skills.length - web})`],
        [[t("nf.projects") + ": ", "ps1"], String((data.projects || []).length)],
        [[t("nf.langs") + ": ", "ps1"], "ru · uz · en"],
        [[t("nf.theme") + ": ", "ps1"], APP.theme.get()],
        [[t("nf.uptime") + ": ", "ps1"], `${uptime()} (${t("nf.since")})`],
        [],
        [["███", "sw sw1"], ["███", "sw sw2"], ["███", "sw sw3"], ["███", "sw sw4"]],
      ];
      const block = document.createElement("div");
      block.className = "out-block";
      const logo = window.FX && window.ASCII_LOGO ? window.FX.logoLines(window.ASCII_LOGO, 28, 15) : { silver: [], red: [] };
      const logoRow = (i) => {
        const s = logo.silver[i] || " ".repeat(28);
        const r = logo.red[i] || " ".repeat(28);
        const list = [];
        let run = "";
        let runRed = false;
        for (let k = 0; k < s.length; k++) {
          const isRed = r[k] !== " ";
          const ch = isRed ? r[k] : s[k];
          if (isRed !== runRed && run) {
            list.push(runRed ? [run, "ps1"] : [run, "logo"]);
            run = "";
          }
          runRed = isRed;
          run += ch;
        }
        if (run) list.push(runRed ? [run, "ps1"] : [run, "logo"]);
        return list;
      };
      const narrow = body.clientWidth < 600;
      const rows = narrow ? logo.silver.length + info.length + 1 : Math.max(logo.silver.length, info.length);
      for (let i = 0; i < rows; i++) {
        const row = document.createElement("div");
        if (narrow) {
          if (i < logo.silver.length) row.append(parts(logoRow(i)));
          else if (i > logo.silver.length) row.append(parts(info[i - logo.silver.length - 1] || []));
        } else {
          row.append(parts(logoRow(i)), "   ", parts(info[i] || []));
        }
        if (!row.textContent) row.textContent = " ";
        block.append(row);
      }
      print(block);
    },

    skills(args) {
      const list = data.skills || [];
      if (args[0]) {
        const q = args.join(" ").toLowerCase();
        const skill = list.find((s) => s.id === q || L(s.title).toLowerCase() === q);
        if (!skill) return print(t("term.unknownSkill", { id: q, list: list.map((s) => s.id).join(", ") }), "err");
        print(t("term.opening", { name: L(skill.title) }), "ps1");
        APP.selectSkill(skill.id);
        return;
      }
      [["web", "skills.web"], ["admin", "skills.admin"]].forEach(([group, key]) => {
        const items = list.filter((s) => (s.group || "web") === group);
        if (!items.length) return;
        print(t(key), "dim");
        items.forEach((s) => print([[s.id.padEnd(12), "bright"], ...levelBar(s.level)]));
      });
      print([["skills <id>", "ps1"], ["  →  " + t("term.cmd.skills").split(";")[0], "dim"]]);
    },

    cam(args) {
      const office = window.OFFICE;
      if (!office) return;
      const n = parseInt(args[0], 10);
      if (!(n >= 1 && n <= office.cameras.length)) {
        print(t("term.usage", { usage: "cam [1-" + office.cameras.length + "]" }), "err");
        office.cameras.forEach((id, i) => print([["  " + (i + 1) + "  ", "ps1"], id]));
        return;
      }
      office.select(n - 1);
      print(t("term.opening", { name: office.cameras[n - 1] }), "ps1");
      APP.goTo("office");
    },
    cams() {
      COMMANDS.cam([]);
    },
    office() {
      print(t("term.opening", { name: "office" }), "ps1");
      APP.goTo("office");
    },

    projects() {
      (data.projects || []).forEach((p) => {
        print([["> ", "ps1"], [L(p.title), "bright"], ["  " + p.tech.map((id) => "#" + id).join(" "), "dim"]]);
        print("  " + L(p.description));
      });
    },

    experience() {
      (data.experience || []).forEach((job) => {
        print([[`[${L(job.period)}] `, "dim"], [L(job.company), "bright"], [" · "], [L(job.role), "ps1"]]);
        (L(job.points) || []).forEach((p) => print([["  + ", "ps1"], p]));
      });
    },
    exp(args) {
      COMMANDS.experience(args);
    },

    certs() {
      (data.certs || []).forEach((c) => print([[`[${c.year}] `, "dim"], [L(c.name), "bright"], [" — " + L(c.issuer), "dim"]]));
    },

    contact() {
      (data.contacts || []).forEach((c) => {
        const link = document.createElement("a");
        link.href = c.href;
        link.textContent = c.value;
        if (c.href.startsWith("http")) {
          link.target = "_blank";
          link.rel = "noopener";
        }
        print([[c.label.padEnd(10), "ps1"], link]);
      });
    },
    contacts() {
      COMMANDS.contact();
    },

    ls() {
      print([["about.txt  contacts.txt  experience.log  "], ["certs/  projects/  skills/", "ps1"]]);
    },

    cat(args) {
      if (!args[0]) return print(t("term.usage", { usage: "cat <file>" }), "err");
      const file = FILES[args[0]];
      if (file) file();
      else print(t("term.noFile", { file: args[0] }), "err");
    },

    cd(args) {
      const target = SECTIONS[(args[0] || "~").replace(/\/$/, "").toLowerCase()];
      if (!target) return print(t("term.noSection", { dir: args[0] }), "err");
      print(t("term.opening", { name: target === "top" ? "~" : target }), "ps1");
      APP.goTo(target);
    },

    theme(args) {
      const next = args[0] === "light" || args[0] === "dark" ? args[0] : APP.theme.get() === "dark" ? "light" : "dark";
      APP.theme.set(next);
      print(t("term.themeSet", { value: next }), "ps1");
    },

    lang(args) {
      if (!I18N.LANGS.includes(args[0])) {
        return print(t("term.usage", { usage: "lang [ru|uz|en]" }) + " · " + I18N.lang, "err");
      }
      I18N.set(args[0]);
      print(t("term.langSet", { value: args[0] }), "ps1");
    },

    sound(args) {
      const on = args[0] === "on" ? true : args[0] === "off" ? false : !SOUND.enabled;
      SOUND.set(on);
      print(t("term.soundSet", { value: t(on ? "term.on" : "term.off") }), "ps1");
    },

    matrix() {
      const mode = APP.toggleMatrix();
      print(t("term.matrixSet", { value: t(mode === "matrix" ? "term.on" : "term.off") }), "ps1");
    },

    reboot() {
      print(t("term.reboot"), "ps1");
      setTimeout(() => APP.home(), 500);
    },

    clear() {
      out.textContent = "";
    },

    history() {
      history.forEach((cmd, i) => print([[String(i + 1).padStart(4) + "  ", "dim"], cmd]));
    },

    date() {
      print(new Date().toLocaleString(I18N.locale));
    },

    echo(args) {
      print(args.join(" "));
    },

    async sudo(args, raw) {
      if (/rm\s+-rf/.test(raw)) {
        print(t("term.rmStart"), "err");
        APP.glitch();
        for (const dir of ["/bin", "/etc", "/var/www", `/home/${user}/portfolio`]) {
          await wait(350);
          print([["rm: ", "dim"], ["removing " + dir + " … ", ""], ["ok", "ps1"]]);
          SOUND.tick();
        }
        await wait(600);
        APP.glitch();
        print(t("term.rmJoke"), "bright");
        return;
      }
      print(t("term.sudoDenied", { user }), "err");
    },

    exit() {
      print(t("term.exit"), "dim");
    },
    logout() {
      COMMANDS.exit();
    },

    hello() {
      print(t("term.hello"), "ps1");
    },
  };
  ["hi", "привет", "salom"].forEach((alias) => (COMMANDS[alias] = COMMANDS.hello));

  function run(raw) {
    const text = raw.trim();
    print([[`${user}@portfolio:~$ `, "ps1"], [text, "bright"]], "echo");
    if (!text) return;
    history.push(text);
    historyIndex = history.length;
    const [name, ...args] = text.split(/\s+/);
    const command = COMMANDS[name.toLowerCase()];
    if (command) Promise.resolve(command(args, text)).catch(() => {});
    else print(t("term.notFound", { cmd: name }), "err");
  }

  /* ---------- ввод ---------- */
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    run(input.value);
    input.value = "";
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      if (!history.length) return;
      historyIndex = Math.max(0, Math.min(history.length, historyIndex + (event.key === "ArrowUp" ? -1 : 1)));
      input.value = history[historyIndex] || "";
      return;
    }
    if (event.key === "Tab") {
      event.preventDefault();
      const value = input.value.trim().toLowerCase();
      if (!value || value.includes(" ")) return;
      const names = Object.keys(COMMANDS).filter((n) => n.startsWith(value) && /^[a-z]+$/.test(n));
      if (names.length === 1) input.value = names[0] + " ";
      else if (names.length > 1) print(names.join("  "), "dim");
      return;
    }
    if (event.key === "l" && event.ctrlKey) {
      event.preventDefault();
      COMMANDS.clear();
      return;
    }
    if (event.key.length === 1 || event.key === "Backspace") SOUND.key();
  });

  // Клик по окну — фокус на строку ввода (если пользователь не выделяет текст)
  body.addEventListener("click", (event) => {
    if (event.target.closest("a")) return;
    if (String(window.getSelection())) return;
    input.focus({ preventScroll: true });
  });

  // Быстрые команды — удобно на телефоне
  const quick = document.querySelector("[data-console-quick]");
  if (quick) {
    ["help", "whereami", "neofetch", "cam 1", "skills", "matrix", "reboot"].forEach((cmd) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "quick-btn";
      button.textContent = cmd;
      button.addEventListener("click", () => {
        SOUND.tick();
        run(cmd);
      });
      quick.append(button);
    });
  }

  /* ---------- приветствие ---------- */
  print([["Last login: ", "dim"], [new Date().toLocaleString(I18N.locale), "dim"], [" from 127.0.0.1", "dim"]]);
  print(t("term.welcome"), "ps1");
  blank();

  // Карта мира с точкой посетителя — при первом открытии терминала (тогда же уходит запрос IP)
  let greeted = false;
  function greet(page) {
    if (greeted || page !== "terminal") return;
    greeted = true;
    run("whereami");
  }
  document.addEventListener("pagechange", (event) => greet(event.detail));
  if (location.hash === "#terminal") setTimeout(() => greet("terminal"), 0);
})();

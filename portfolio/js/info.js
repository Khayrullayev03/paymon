/* Страница «Инфо»: анимированная ASCII-карта мира (радар, перекрестие, «пинг») с точкой посетителя
 * и панель сведений: внешний и локальный IP, место, координаты, провайдер, часовой пояс, время,
 * браузер, система, экран, язык. Всё показывается только самому посетителю.
 * Запрос внешнего IP (js/geo.js) уходит, только когда посетитель открыл эту страницу. */
(function () {
  "use strict";

  const page = document.querySelector('[data-page="info"]');
  const pre = page && page.querySelector("[data-geo-map]");
  const factsRoot = page && page.querySelector("[data-geo-facts]");
  const statusEl = page && page.querySelector("[data-geo-status]");
  const MAP = window.WORLD_MAP_LARGE;
  if (!page || !pre || !factsRoot || !MAP || !window.GEO || !window.SCENES || !window.I18N) return;

  const I18N = window.I18N;
  const { t } = I18N;
  const { makeGrid, blink, clamp } = window.SCENES;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const data = window.PORTFOLIO || {};
  const W = MAP.cols;
  const H = MAP.rows;
  const g = makeGrid(W, H);
  pre.style.setProperty("--cols", W);

  let loc = null;
  let local = null;
  let started = false;
  let visible = false;

  const cell = (lat, lon) => [
    Math.round(((lon + 180) / 360) * (W - 1)),
    Math.round(((MAP.latTop - clamp(lat, MAP.latBottom, MAP.latTop)) / (MAP.latTop - MAP.latBottom)) * (H - 1)),
  ];
  const fmt = (v, pos, neg) => `${Math.abs(v).toFixed(2)}° ${v >= 0 ? pos : neg}`;
  const coords = (l) => `${fmt(l.lat, "N", "S")}, ${fmt(l.lon, "E", "W")}`;

  /* ---------- карта ---------- */
  function draw(time) {
    g.clear();
    // сетка параллелей и меридианов (каждые 30°)
    for (let lon = -150; lon <= 150; lon += 30) {
      const [x] = cell(0, lon);
      for (let y = 0; y < H; y += 2) g.put(x, y, "·", 2);
    }
    for (let lat = 60; lat >= -30; lat -= 30) {
      const [, y] = cell(lat, 0);
      for (let x = 0; x < W; x += 3) g.put(x, y, "·", 2);
    }
    // суша; полоса радара подсвечивает её на ходу
    const sweep = reduceMotion ? -99 : ((time * 14) % (W + 24)) - 12;
    MAP.lines.forEach((line, y) =>
      [...line].forEach((ch, x) => {
        if (ch === " ") return;
        const d = sweep - x;
        const color = d >= 0 && d < 1.5 ? 3 : d >= 0 && d < 7 ? 5 : ch === "#" ? 0 : 2;
        g.put(x, y, ch, color);
      })
    );
    if (sweep >= 0 && sweep < W) for (let y = 0; y < H; y++) if (g.get(Math.round(sweep), y) === " " || g.get(Math.round(sweep), y) === "·") g.put(Math.round(sweep), y, "│", 5);

    if (!loc) {
      const msg = `[ ${t("info.locating")} ]`;
      if (blink(time, 0.8)) g.put(Math.round((W - msg.length) / 2), Math.round(H / 2), msg, 1);
      pre.innerHTML = g.html();
      return;
    }

    const [vx, vy] = cell(loc.lat, loc.lon);
    // перекрестие через точку посетителя
    for (let x = 0; x < W; x++) if (Math.abs(x - vx) > 2 && (g.get(x, vy) === " " || g.get(x, vy) === "·")) g.put(x, vy, "─", 5);
    for (let y = 0; y < H; y++) if (Math.abs(y - vy) > 1 && (g.get(vx, y) === " " || g.get(vx, y) === "·")) g.put(vx, y, "│", 5);
    // сигнал от «сервера» (город владельца) к посетителю
    const home = data.profile && data.profile.location;
    if (home && Number.isFinite(home.lat)) {
      const [sx, sy] = cell(home.lat, home.lon);
      const steps = Math.max(Math.abs(vx - sx), Math.abs(vy - sy));
      for (let i = 1; i < steps; i += 2) g.put(Math.round(sx + ((vx - sx) * i) / steps), Math.round(sy + ((vy - sy) * i) / steps), "·", 1);
      if (steps > 3) {
        const k = (time * 0.6) % 1;
        g.put(Math.round(sx + (vx - sx) * k), Math.round(sy + (vy - sy) * k), "■", 1);
      }
      g.put(sx, sy, "+", 3);
      g.put(sx + 1, sy, "srv", 2);
    }
    // точка и расходящиеся кольца «пинга»
    const r = reduceMotion ? 2 : Math.floor(time * 3) % 4;
    if (r > 0) {
      g.put(vx - r * 2, vy, "(", 1);
      g.put(vx + r * 2, vy, ")", 1);
      if (r > 1) {
        g.put(vx - r * 2 + 1, vy - 1, "(", 5);
        g.put(vx + r * 2 - 1, vy - 1, ")", 5);
        g.put(vx - r * 2 + 1, vy + 1, "(", 5);
        g.put(vx + r * 2 - 1, vy + 1, ")", 5);
      }
    }
    g.put(vx, vy, blink(time, 0.6) ? "●" : "•", 1);
    // табличка с координатами
    const lines = [`${t("geo.you")}`, coords(loc)];
    if (loc.ip) lines.push(loc.ip);
    const width = Math.max(...lines.map((l) => l.length)) + 2;
    const left = vx + 4 + width + 2 < W ? vx + 4 : vx - 4 - width - 2;
    const top = clamp(vy - 4, 0, H - lines.length - 2);
    for (let r = 1; r <= lines.length; r++) g.put(left + 1, top + r, " ".repeat(width), 0); // чистый фон таблички
    g.box(left, top, width + 2, lines.length + 2, 1);
    lines.forEach((l, i) => g.put(left + 2, top + 1 + i, l, i === 0 ? 1 : 3));
    pre.innerHTML = g.html();
  }

  /* ---------- сведения ---------- */
  function browserName() {
    const ua = navigator.userAgent;
    const rules = [
      [/YaBrowser\/(\d+)/, "Yandex Browser"],
      [/Edg\/(\d+)/, "Edge"],
      [/OPR\/(\d+)/, "Opera"],
      [/Firefox\/(\d+)/, "Firefox"],
      [/Chrome\/(\d+)/, "Chrome"],
      [/Version\/(\d+).*Safari/, "Safari"],
    ];
    for (const [re, name] of rules) {
      const m = re.exec(ua);
      if (m) return `${name} ${m[1]}`;
    }
    return "—";
  }

  function osName() {
    const ua = navigator.userAgent;
    let m;
    if ((m = /Android ([\d.]+)/.exec(ua))) return `Android ${m[1]}`;
    if ((m = /(?:iPhone|iPad|iPod).*? OS (\d+)_/.exec(ua))) return `iOS ${m[1]}`;
    if (/Windows NT 10/.test(ua)) return "Windows 10/11";
    if (/Windows/.test(ua)) return "Windows";
    if (/Mac OS X/.test(ua)) return "macOS";
    if (/CrOS/.test(ua)) return "ChromeOS";
    if (/Linux/.test(ua)) return "Linux";
    return "—";
  }

  function timeZone() {
    let tz = "UTC";
    try {
      tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    } catch (e) {}
    const offset = -new Date().getTimezoneOffset();
    const sign = offset >= 0 ? "+" : "−";
    const hh = String(Math.floor(Math.abs(offset) / 60)).padStart(2, "0");
    const mm = String(Math.abs(offset) % 60).padStart(2, "0");
    return `${tz} (UTC${sign}${hh}:${mm})`;
  }

  function localText() {
    if (!local) return "…";
    if (local.status === "ok") return local.values.join(", ");
    if (local.status === "hidden") return t("info.localHidden") + (local.masked ? ` (${local.masked.slice(0, 13)}…)` : "");
    return t("info.localUnsupported");
  }

  function facts() {
    const place = loc ? [loc.city, loc.region, loc.country].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(", ") : "…";
    return [
      ["info.externalIp", loc ? loc.ip || t("info.noIp") : "…", loc && loc.ip ? "hot" : ""],
      ["info.localIp", localText(), local && local.status === "ok" ? "hot" : "dim"],
      ["info.place", loc ? (loc.source === "tz" ? `≈ ${place}` : place) : "…"],
      ["info.coords", loc ? coords(loc) + (loc.source === "tz" ? ` · ${t("info.approx")}` : "") : "…", "hot"],
      ["info.isp", loc ? loc.isp || "—" : "…"],
      ["info.tz", timeZone()],
      ["info.time", new Date().toLocaleTimeString(I18N.locale), "clock"],
      ["info.browser", browserName()],
      ["info.os", osName()],
      ["info.screen", `${screen.width}×${screen.height} · ×${(window.devicePixelRatio || 1).toFixed(1)}`],
      ["info.lang", navigator.language || "—"],
    ];
  }

  function renderFacts(animate) {
    factsRoot.textContent = "";
    facts().forEach(([key, value, kind]) => {
      const dt = document.createElement("dt");
      dt.textContent = t(key);
      const dd = document.createElement("dd");
      if (kind) dd.className = kind;
      dd.textContent = value;
      factsRoot.append(dt, dd);
      if (animate && window.FX && value !== "…") window.FX.scramble(dd, value, 700);
    });
    if (statusEl) {
      statusEl.textContent = !loc ? t("info.locating") : loc.source === "ip" ? t("info.sourceIp") : t("info.sourceTz");
    }
  }

  /* ---------- запуск ---------- */
  async function start() {
    if (started) return;
    started = true;
    renderFacts(false);
    const [l, lo] = await Promise.all([window.GEO.locate(), window.GEO.localIP()]);
    loc = l;
    local = lo;
    renderFacts(true);
    draw((performance.now() - t0) / 1000);
  }

  let raf = 0;
  let last = 0;
  const t0 = performance.now();
  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (now - last < 120) return;
    last = now;
    draw((now - t0) / 1000);
  }
  function sync() {
    const run = visible && !document.hidden && !reduceMotion;
    if (run && !raf) raf = requestAnimationFrame(frame);
    if (!run && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  }

  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      visible = entries[entries.length - 1].isIntersecting;
      if (visible) start();
      sync();
    }).observe(pre);
  }
  document.addEventListener("visibilitychange", sync);
  document.addEventListener("langchange", () => renderFacts(false));
  // часы на панели
  setInterval(() => {
    if (!visible) return;
    const clockEl = factsRoot.querySelector(".clock");
    if (clockEl) clockEl.textContent = new Date().toLocaleTimeString(I18N.locale);
  }, 1000);

  draw(0);
})();

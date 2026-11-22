/* Раздел «Инфраструктура»: 3D-схема офиса в ASCII, изображение с выбранной камеры и рисунки камер.
 *  - На схеме: стены, окно, дверь, рабочие места, роутер с Wi-Fi, коммутатор, серверная стойка,
 *    кабели с бегущими пакетами, сотрудники и 4 камеры с живыми конусами обзора на полу.
 *  - Камера «видит» сотрудника, когда он попадает в её конус: конус мигает, на изображении — рамка.
 *  - Изображение камеры панорамирует вместе с ней; клик по камере на схеме открывает её изображение.
 * Это демо-схема, не реальный офис. */
(function () {
  "use strict";

  const section = document.querySelector("[data-office]");
  const S = window.SCENES;
  if (!section || !S || !S.makeGrid) return;

  const { makeGrid, hash, blink, clamp } = S;
  const I18N = window.I18N;
  const SOUND = window.SOUND || { tick() {} };
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const mapPre = section.querySelector("[data-office-map]");
  const feedPre = section.querySelector("[data-cam-feed]");
  const modelsPre = section.querySelector("[data-cam-models]");
  const buttonsRoot = section.querySelector("[data-cam-buttons]");
  const feedTitle = section.querySelector("[data-feed-title]");
  const toggleBtn = section.querySelector("[data-office-toggle]");

  const MAP = { w: 96, h: 26 };
  const FEED = { w: 58, h: 18 };
  const MODELS = { w: 50, h: 17 };
  const mapG = makeGrid(MAP.w, MAP.h);
  const feedG = makeGrid(FEED.w, FEED.h);
  const modelsG = makeGrid(MODELS.w, MODELS.h);
  mapPre.style.setProperty("--cols", MAP.w);
  feedPre.style.setProperty("--cols", FEED.w);
  modelsPre.style.setProperty("--cols", MODELS.w);

  /* =====================================================================
     ГЕОМЕТРИЯ: пол — параллелограмм (косоугольная проекция)
     точка пола (fx — вдоль комнаты, fz — вглубь) → экран: (X0 + fx + fz, Y0 − fz)
     ===================================================================== */
  const X0 = 4;
  const Y0 = 24;
  const FW = 70;
  const FD = 14;
  const K = 2; // глубина «длиннее» ширины — для честных углов обзора
  const scr = (fx, fz) => [Math.round(X0 + fx + fz), Math.round(Y0 - fz)];

  const CAMS = [
    { id: "CAM-01", name: "OPEN SPACE", type: "bullet", icon: [20, 3], glyph: "[■>", label: [17, 1], floor: [3, 14], base: -0.76, amp: 0.5, speed: 0.42, phase: 0,
      features: [{ az: -34, s: "plant" }, { az: -16, s: "desk" }, { az: 2, s: "desk" }, { az: 20, s: "desk" }, { az: 40, s: "window" }] },
    { id: "CAM-02", name: "SERVER", type: "bullet", icon: [83, 3], glyph: "<■]", label: [80, 1], floor: [66, 14], base: -2.3, amp: 0.45, speed: 0.5, phase: 1.3,
      features: [{ az: -36, s: "door" }, { az: -14, s: "switch" }, { az: 6, s: "rack" }, { az: 28, s: "router" }] },
    { id: "CAM-03", name: "ENTRANCE", type: "dome", icon: [6, 15], glyph: "(●)", label: [0, 13], floor: [0, 2], base: 0.2, amp: 0.45, speed: 0.36, phase: 2.2,
      features: [{ az: -30, s: "window" }, { az: -10, s: "desk" }, { az: 10, s: "door" }, { az: 32, s: "rack" }] },
    { id: "CAM-04", name: "HALL", type: "dome", icon: [73, 16], glyph: "(●)", label: [77, 16], floor: [69, 1], base: 2.69, amp: 0.4, speed: 0.4, phase: 3.1,
      features: [{ az: -34, s: "desk" }, { az: -14, s: "desk" }, { az: 6, s: "plant" }, { az: 26, s: "door" }] },
  ];
  const HALF = 0.32; // половина угла конуса на схеме
  const RANGE = 36;

  const panOf = (cam, t) => cam.base + cam.amp * Math.sin(t * cam.speed + cam.phase);
  function view(cam, fx, fz, theta) {
    let rel = Math.atan2((fz - cam.floor[1]) * K, fx - cam.floor[0]) - theta;
    while (rel > Math.PI) rel -= 2 * Math.PI;
    while (rel < -Math.PI) rel += 2 * Math.PI;
    return { rel, dist: Math.hypot(fx - cam.floor[0], (fz - cam.floor[1]) * K) };
  }

  const OBJECTS = [
    { kind: "router", fx: 34, fz: 12, w: 6, d: 1, h: 2, label: "router" },
    { kind: "switch", fx: 50, fz: 11, w: 5, d: 2, h: 2, label: "switch" },
    { kind: "rack", fx: 58, fz: 11, w: 7, d: 2, h: 8, label: "server" },
    { kind: "desk", fx: 8, fz: 6, w: 11, d: 3, h: 1 },
    { kind: "desk", fx: 26, fz: 6, w: 11, d: 3, h: 1 },
    { kind: "desk", fx: 8, fz: 1, w: 11, d: 3, h: 1 },
    { kind: "desk", fx: 26, fz: 1, w: 11, d: 3, h: 1 },
    { kind: "plant", fx: 44, fz: 2 },
  ];

  const PEOPLE = [
    { path: [[4, 10.5], [48, 10.5], [48, 5], [22, 5], [22, 10.5]], speed: 4.2, offset: 0 },
    { path: [[66, 6], [42, 6], [42, 0.4], [62, 0.4]], speed: 3.2, offset: 20 },
  ];

  function walk(person, t) {
    const pts = person.path;
    const segs = pts.map((p, i) => {
      const q = pts[(i + 1) % pts.length];
      return { p, q, len: Math.hypot(q[0] - p[0], q[1] - p[1]) };
    });
    const total = segs.reduce((sum, s) => sum + s.len, 0);
    let d = (t * person.speed + person.offset) % total;
    for (const seg of segs) {
      if (d <= seg.len) {
        const k = d / seg.len;
        return [seg.p[0] + (seg.q[0] - seg.p[0]) * k, seg.p[1] + (seg.q[1] - seg.p[1]) * k];
      }
      d -= seg.len;
    }
    return pts[0];
  }

  // Кабели в координатах экрана: [точки], тип: video (от камеры к коммутатору) или data
  const CABLES = [
    { pts: [[57, 12], [64, 12]], kind: "data", speed: 0.9 },
    { pts: [[64, 13], [33, 13], [29, 17]], kind: "data", speed: 0.35 },
    { pts: [[21, 4], [21, 9], [64, 9]], kind: "video", speed: 0.28 },
    { pts: [[84, 4], [84, 9], [82, 9]], kind: "video", speed: 0.6 },
    { pts: [[7, 16], [7, 21], [60, 21], [66, 15]], kind: "video", speed: 0.22 },
    { pts: [[74, 17], [74, 22], [68, 16]], kind: "video", speed: 0.45 },
  ];
  CABLES.forEach((cable) => {
    cable.cells = S.path(...cable.pts);
    cable.chars = cable.cells.map((cell, i) => {
      const next = cable.cells[Math.min(i + 1, cable.cells.length - 1)];
      const prev = cable.cells[Math.max(i - 1, 0)];
      const dx = next[0] - prev[0];
      const dy = next[1] - prev[1];
      return dy === 0 ? "─" : dx === 0 ? "│" : "/";
    });
  });

  /* =====================================================================
     РИСОВАНИЕ СХЕМЫ
     ===================================================================== */
  // 3D-коробка: передняя грань, верх (уходит вглубь «/») и правый бок.
  function box3d(g, fx, fz, w, d, h, c = 0) {
    const [c0, r0] = scr(fx, fz);
    for (let i = 1; i <= d; i++) {
      const row = r0 - h - i;
      g.put(c0 + i, row, "/" + (i === d ? "─" : " ").repeat(w - 1) + "/", c);
      for (let r = row + 1; r <= r0 - i; r++) g.put(c0 + w + i, r, i === d && r < r0 - i ? "│" : " ", c);
      g.put(c0 + w + i, r0 - i, "/", c);
    }
    g.put(c0, r0 - h, "┌" + "─".repeat(w - 1) + "┐", c);
    for (let r = r0 - h + 1; r < r0; r++) g.put(c0, r, "│" + " ".repeat(w - 1) + "│", c);
    g.put(c0, r0, "└" + "─".repeat(w - 1) + "┘", c);
    return [c0, r0];
  }

  function drawRoom(g) {
    g.put(18, 2, "┌" + "─".repeat(69) + "┐", 2);
    for (let r = 3; r <= 9; r++) {
      g.put(18, r, "│", 2);
      g.put(88, r, "│", 2);
    }
    for (let i = 0; i <= 13; i++) g.put(4 + i, 16 - i, "/", 2);
    for (let r = 17; r <= 23; r++) g.put(4, r, "│", 2);
    for (let i = 1; i <= 13; i++) g.put(4 + i, 24 - i, "/", 2);
    g.put(18, 10, "└" + "─".repeat(69) + "┘", 2);
    g.put(4, 24, "└" + "─".repeat(69), 2);
    for (let i = 0; i <= 13; i++) g.put(74 + i, 24 - i, "/", 2);
    // плитка пола
    for (let fz = 2; fz <= 12; fz += 2) {
      for (let fx = 3; fx <= 66; fx += 6) {
        const [c, r] = scr(fx, fz);
        g.put(c, r, "·", 2);
      }
    }
    // окно на задней стене
    g.put(26, 4, "┌───────┬───────┐", 2);
    g.put(26, 5, "│░░░░░░░│░░░░░░░│", 2);
    g.put(26, 6, "│░░░░░░░│░░░░░░░│", 2);
    g.put(26, 7, "└───────┴───────┘", 2);
    g.put(44, 4, "OFFICE · 2F", 2);
    // дверь на задней стене
    g.put(59, 4, "┌─────┐", 2);
    for (let r = 5; r <= 9; r++) g.put(59, r, "│     │", 2);
    g.put(64, 7, "o", 2);
  }

  function drawObject(g, o, t) {
    if (o.kind === "plant") {
      const [c, r] = scr(o.fx, o.fz);
      g.put(c - 1, r - 2, "\\|/", 0);
      g.put(c - 1, r - 1, "(_)", 2);
      return;
    }
    const [c0, r0] = box3d(g, o.fx, o.fz, o.w, o.d, o.h, o.kind === "desk" ? 2 : 0);
    const tick = Math.floor(t * 6);
    if (o.kind === "rack") {
      for (let r = r0 - o.h + 1; r < r0; r++) {
        const unit = r - (r0 - o.h + 1);
        if (unit % 2 === 0) {
          g.put(c0 + 1, r, "══", 2);
          for (let k = 0; k < 3; k++) g.put(c0 + 4 + k, r, hash(tick + unit * 7 + k * 3) > 0.45 ? "●" : "○", k === 0 ? 3 : 1);
        } else {
          g.put(c0 + 1, r, "─────", 2);
        }
      }
    } else if (o.kind === "switch") {
      for (let k = 0; k < 4; k++) g.put(c0 + 1 + k, r0 - 1, "■", hash(tick + k * 11) > 0.4 ? 1 : 2);
    } else if (o.kind === "router") {
      for (let k = 0; k < 4; k++) g.put(c0 + 1 + k, r0 - 1, k === 3 ? "○" : "●", hash(tick + k * 5) > 0.3 ? 1 : 2);
      // антенны и волны Wi-Fi
      const ax1 = c0 + 2;
      const ax2 = c0 + 5;
      for (let r = r0 - 4; r <= r0 - 3; r++) {
        g.put(ax1, r, "│", 0);
        g.put(ax2, r, "│", 0);
      }
      g.put(ax1, r0 - 5, "·", 3);
      g.put(ax2, r0 - 5, "·", 3);
      const wave = Math.floor(t * 3) % 4;
      for (let k = 1; k <= wave; k++) {
        const c = k === wave ? 1 : 5;
        g.put(ax1 - 1 - k * 2, r0 - 5, "(", c);
        g.put(ax2 + 1 + k * 2, r0 - 5, ")", c);
        if (k > 1) {
          g.put(ax1 - k * 2, r0 - 6, "(", c);
          g.put(ax2 + k * 2, r0 - 6, ")", c);
        }
      }
    } else if (o.kind === "desk") {
      // монитор с мерцающим экраном
      const mx = c0 + 4;
      const my = r0 - o.h - 3;
      g.put(mx, my, "┌──┐", 0);
      g.put(mx, my + 1, "│", 0);
      g.put(mx + 1, my + 1, ["▒▓", "▓▒", "▒▒", "▓▓"][Math.floor(hash(Math.floor(t * 3) + c0) * 4)], 5);
      g.put(mx + 3, my + 1, "│", 0);
      g.put(mx, my + 2, "└┬─┘", 0);
      g.put(mx + 6, my + 2, "▄", 2); // клавиатура/кружка
    }
  }

  function drawLabels(g) {
    OBJECTS.forEach((o) => {
      if (!o.label) return;
      const [c0, r0] = scr(o.fx, o.fz);
      g.put(c0, r0 + 1, " " + o.label + " ", 3);
    });
  }

  function drawPerson(g, fx, fz, t, seen) {
    const [c, r] = scr(fx, fz);
    const step = Math.floor(t * 4) % 2;
    const color = seen ? 1 : 3;
    g.put(c, r - 2, "o", color);
    g.put(c - 1, r - 1, "/|\\", color);
    g.put(c - 1, r, step ? "/ \\" : " | ", color);
    if (seen && blink(t, 0.5)) g.put(c, r - 3, "!", 1);
  }

  function drawMap(g, t, st) {
    g.clear();
    drawRoom(g);

    // конусы обзора на полу
    CAMS.forEach((cam, i) => {
      const theta = st.thetas[i];
      const isSel = i === st.selected;
      const alert = st.camSees[i];
      for (let fz = 0; fz <= FD; fz++) {
        for (let fx = 0; fx <= FW; fx++) {
          const { rel, dist } = view(cam, fx, fz, theta);
          if (dist < 1.5 || dist > RANGE || Math.abs(rel) > HALF) continue;
          const [c, r] = scr(fx, fz);
          const edge = HALF - Math.abs(rel) < 0.05 || RANGE - dist < 1.2;
          let ch = edge ? ":" : isSel ? "░" : "·";
          let color = edge ? (isSel ? 1 : 5) : 5;
          if (edge && alert && blink(t, 0.4)) color = 3;
          if (!edge && !isSel && (fx + fz) % 2) ch = " ";
          if (ch !== " ") g.put(c, r, ch, color);
        }
      }
    });

    // кабели и пакеты
    CABLES.forEach((cable, i) => {
      cable.cells.forEach(([c, r], k) => g.put(c, r, cable.chars[k], 2));
      const n = cable.cells.length;
      const count = cable.kind === "video" ? 2 : 1;
      for (let j = 0; j < count; j++) {
        const phase = (t * cable.speed + j / count + i * 0.13) % 1;
        const idx = Math.floor(phase * n);
        const [c, r] = cable.cells[cable.kind === "data" && j % 2 ? n - 1 - idx : idx];
        g.put(c, r, cable.kind === "video" ? "■" : "●", cable.kind === "video" ? 1 : 3);
      }
    });

    // предметы и люди — от дальних к ближним
    const drawables = OBJECTS.map((o) => ({ fz: o.fz, fx: o.fx, draw: () => drawObject(g, o, t) }));
    st.people.forEach((p, i) =>
      drawables.push({ fz: p[1], fx: p[0], draw: () => drawPerson(g, p[0], p[1], t + i, st.personSeen[i]) })
    );
    drawables.sort((a, b) => b.fz - a.fz || a.fx - b.fx).forEach((d) => d.draw());

    // стойка с камерой у входа
    for (let r = 17; r <= 23; r++) g.put(74, r, "│", 2);
    g.put(74, 23, "┴", 2);
    drawLabels(g);

    // камеры
    CAMS.forEach((cam, i) => {
      const isSel = i === st.selected;
      const alert = st.camSees[i];
      g.put(cam.icon[0], cam.icon[1], cam.glyph, isSel ? 4 : alert && blink(t, 0.4) ? 1 : 3);
      g.put(cam.label[0], cam.label[1], cam.id.toLowerCase(), isSel ? 1 : 2);
      if (blink(t + i * 0.25, 1)) g.put(cam.icon[0] + cam.glyph.length, cam.icon[1], "•", 1);
    });
  }

  /* =====================================================================
     ИЗОБРАЖЕНИЕ С КАМЕРЫ
     ===================================================================== */
  const SPRITES = {
    desk: { rows: [" ┌──┐ ", " │**│ ", " └┬─┘ ", "▄▄▄▄▄▄", "█    █"], bottom: 12, screen: true },
    window: { rows: ["┌──┬──┐", "│░░│░░│", "│░░│░░│", "└──┴──┘"], bottom: 7 },
    door: { rows: ["┌─────┐", "│     │", "│    o│", "│     │", "│     │", "│     │"], bottom: 10 },
    rack: { rows: ["┌─────┐", "│*  * │", "│═════│", "│ * * │", "│═════│", "│*  * │", "│═════│", "└─────┘"], bottom: 11 },
    switch: { rows: ["┌──────┐", "│******│", "└┬────┬┘", " │    │ "], bottom: 11 },
    router: { rows: [" │  │ ", "┌────┐", "│****│", "└────┘"], bottom: 9 },
    plant: { rows: ["\\|/", " Y ", "[_]"], bottom: 12 },
  };

  function drawSprite(g, sprite, x, t, seed) {
    const width = Math.max(...sprite.rows.map((row) => row.length));
    const left = Math.round(x - width / 2);
    const top = sprite.bottom - sprite.rows.length + 1;
    sprite.rows.forEach((row, i) => {
      [...row].forEach((ch, k) => {
        if (ch === " ") return;
        let out = ch;
        let color = ch === "░" ? 2 : 0;
        if (ch === "*") {
          const on = hash(Math.floor(t * 5) + seed + i * 7 + k) > 0.4;
          if (sprite.screen) {
            out = on ? "▒" : "▓";
            color = 5;
          } else {
            out = on ? "●" : "○";
            color = on ? 1 : 2;
          }
        }
        g.put(left + k, top + i, out, color);
      });
    });
  }

  function stamp() {
    const d = new Date();
    const p = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
  }

  function drawFeed(g, t, st) {
    g.clear();
    const W = FEED.w;
    const cam = CAMS[st.selected];
    const theta = st.thetas[st.selected];
    const HFOV = 0.5;
    const cx = W / 2;
    const half = W / 2;
    const shift = theta - cam.base;
    const xOf = (azRad) => cx + ((azRad + shift) / HFOV) * half;

    // потолок со светильниками, линия стены, перспектива пола
    g.hline(0, 1, W, 2, "─");
    for (let k = -8; k <= 8; k++) {
      const x = Math.round(xOf(k * 0.16));
      if (x > 1 && x < W - 4) g.put(x, 2, "▀▀▀", 2);
    }
    g.hline(0, 11, W, 2, "─");
    const vp = Math.round(cx + (shift / HFOV) * half * 0.35);
    for (let k = -5; k <= 5; k++) {
      for (let r = 12; r <= 16; r++) {
        const x = Math.round(vp + k * (r - 10) * 2.6);
        if (x >= 0 && x < W) g.put(x, r, k === 0 ? "│" : k < 0 ? "/" : "\\", 2);
      }
    }

    cam.features.forEach((f, i) => drawSprite(g, SPRITES[f.s], xOf((f.az * Math.PI) / 180), t, i * 13 + st.selected * 31));

    // сотрудники в кадре
    let motion = false;
    st.people.forEach(([fx, fz], i) => {
      const { rel, dist } = view(cam, fx, fz, theta);
      if (Math.abs(rel) > HFOV || dist > RANGE) return;
      const x = Math.round(cx - (rel / HFOV) * half);
      const near = dist < 18;
      const bottom = Math.round(12 + clamp((RANGE - dist) / RANGE) * 4);
      const step = Math.floor(t * 4 + i) % 2;
      const rows = near ? [" o ", "/|\\", step ? "/ \\" : " | "] : [" o ", " | "];
      const top = bottom - rows.length + 1;
      rows.forEach((row, k) => [...row].forEach((ch, j) => ch !== " " && g.put(x - 1 + j, top + k, ch, 3)));
      if (Math.abs(rel) < HALF) {
        motion = true;
        g.put(x - 3, top - 1, "┌", 1);
        g.put(x + 3, top - 1, "┐", 1);
        g.put(x - 3, Math.min(bottom + 1, 16), "└", 1);
        g.put(x + 3, Math.min(bottom + 1, 16), "┘", 1);
        g.put(x - 3, top - 2, `person ${90 + Math.floor(hash(i + Math.floor(t)) * 9)}%`, 1);
      }
    });

    // помехи
    for (let n = 0; n < 2; n++) {
      const r = 2 + Math.floor(hash(Math.floor(t * 8) + n * 17) * 14);
      for (let k = 0; k < 6; k++) {
        const x = Math.floor(hash(Math.floor(t * 8) * 3 + k * 7 + n) * W);
        if (g.get(x, r) === " ") g.put(x, r, "░", 2);
      }
    }

    // служебная строка сверху и снизу
    g.put(0, 0, ` ${cam.id} · ${cam.name}`, 3);
    g.put(W - 7, 0, blink(t, 1) ? "●" : " ", 1);
    g.put(W - 5, 0, "REC", 3);
    g.put(0, 17, " " + stamp(), 2);
    const deg = Math.round((shift * 180) / Math.PI);
    g.put(W - 10, 17, `PAN ${deg >= 0 ? "+" : ""}${deg}°`, 2);
    if (motion && blink(t, 0.5)) g.put(24, 17, "[ MOTION ]", 1);
  }

  /* =====================================================================
     РИСУНКИ КАМЕР
     ===================================================================== */
  function drawModels(g, t, st) {
    g.clear();
    const type = CAMS[st.selected].type;

    // уличная «цилиндрическая» камера на кронштейне
    const hb = type === "bullet";
    const border = hb ? 1 : 2;
    const body = hb ? 3 : 0;
    g.vline(1, 0, 7, 2, "║");
    g.put(1, 3, "╟", 2);
    g.put(2, 3, "──", 2);
    g.put(4, 2, "┌───", border);
    g.put(4, 3, "┤", border);
    g.put(4, 4, "└───", border);
    const bx = 8;
    const bw = 20;
    g.put(bx, 1, "╭" + "─".repeat(bw - 2) + "╮", border);
    for (let r = 2; r <= 4; r++) {
      g.put(bx, r, r === 3 ? "│" : "┤", border);
      g.put(bx + bw - 1, r, r === 3 ? "│" : "├", border);
    }
    g.put(bx, 5, "╰" + "─".repeat(bw - 2) + "╯", border);
    g.put(bx + 2, 2, "▄▄▄", 2);
    g.put(bx + 2, 3, "IP-CAM · 4MP", body);
    g.put(bx + bw - 3, 2, blink(t, 1) ? "●" : "○", 1);
    g.put(bx + bw, 2, "──╮", border);
    g.put(bx + bw + 2, 3, "│", border);
    g.put(bx + bw, 4, "──╯", border);
    g.put(bx + bw + 1, 3, ["O", "0", "o", "0"][Math.floor(t * 2) % 4], 1);
    const night = t % 10 > 6;
    if (night) {
      g.put(bx + bw + 3, 2, "·", 1);
      g.put(bx + bw + 3, 4, "·", 1);
    }
    // луч обзора с наклоном
    const lensX = bx + bw + 3;
    const tilt = Math.sin(t * 0.8) * 1.2;
    for (let x = lensX + 1; x < MODELS.w; x++) {
      const d = x - lensX;
      const center = 3 + (tilt * d) / 16;
      const spread = d / 5;
      const top = Math.round(center - spread);
      const bot = Math.round(center + spread);
      if (top >= 0) g.put(x, top, "·", 5);
      if (bot <= 6) g.put(x, bot, "·", 5);
      if ((x - Math.floor(t * 18)) % 5 === 0) g.put(x, Math.round(center), "─", 1);
    }
    g.put(0, 7, "cam-01, cam-02 · bullet · 4MP · IR 30 m", hb ? 3 : 2);

    // купольная камера на потолке
    const hd = type === "dome";
    const db = hd ? 1 : 2;
    const cx = 22;
    g.hline(7, 9, 31, 2, "═");
    g.put(cx - 2, 10, "╔═══╗", db);
    g.put(cx - 8, 11, "╭─────╨───╨─────╮", db);
    g.put(cx - 9, 12, "╱", db);
    g.put(cx + 9, 12, "╲", db);
    g.put(cx - 10, 13, "│", db);
    g.put(cx + 10, 13, "│", db);
    g.put(cx - 9, 14, "╲", db);
    g.put(cx + 9, 14, "╱", db);
    g.put(cx - 8, 15, "╰" + "─".repeat(15) + "╯", db);
    const lit = Math.floor(t * 5) % 5;
    for (let k = 0; k < 5; k++) g.put(cx - 6 + k * 3, 12, k === lit ? "●" : "·", k === lit ? 1 : 2);
    const lx = Math.round(cx + Math.sin(t * 0.7) * 6);
    g.put(lx - 1, 13, "(" + ["O", "0", "o", "0"][Math.floor(t * 2) % 4] + ")", hd ? 3 : 0);
    g.put(cx + 12, 13, `pan ${Math.round(Math.sin(t * 0.7) * 170)}°`, 2);
    g.put(0, 16, "cam-03, cam-04 · dome · 360° · IR", hd ? 3 : 2);
  }

  /* =====================================================================
     СОСТОЯНИЕ, ЦИКЛ, УПРАВЛЕНИЕ
     ===================================================================== */
  let selected = 1;
  let autoCycle = true;
  let paused = reduceMotion; // при «уменьшении движения» — только по кнопке
  let visible = false;
  let clock = 4; // секунды «внутреннего времени» сцены
  let resumedAt = 0;
  let raf = 0;
  let last = 0;
  let lastSwitch = 0;

  function stateAt(t) {
    const thetas = CAMS.map((cam) => panOf(cam, t));
    const people = PEOPLE.map((p) => walk(p, t));
    const camSees = CAMS.map((cam, i) => people.some(([fx, fz]) => {
      const v = view(cam, fx, fz, thetas[i]);
      return Math.abs(v.rel) < HALF && v.dist < RANGE;
    }));
    const personSeen = people.map(([fx, fz]) => CAMS.some((cam, i) => {
      const v = view(cam, fx, fz, thetas[i]);
      return Math.abs(v.rel) < HALF && v.dist < RANGE;
    }));
    return { thetas, people, camSees, personSeen, selected };
  }

  function render(t) {
    const st = stateAt(t);
    drawMap(mapG, t, st);
    drawFeed(feedG, t, st);
    drawModels(modelsG, t, st);
    mapPre.innerHTML = mapG.html();
    feedPre.innerHTML = feedG.html();
    modelsPre.innerHTML = modelsG.html();
  }

  const now = () => clock + (raf ? (performance.now() - resumedAt) / 1000 : 0);

  function frame(ts) {
    raf = requestAnimationFrame(frame);
    if (ts - last < 100) return;
    last = ts;
    const t = now();
    if (autoCycle && t - lastSwitch > 9) {
      lastSwitch = t;
      select((selected + 1) % CAMS.length, false);
    }
    render(t);
  }

  function sync() {
    const run = visible && !paused && !document.hidden;
    if (run && !raf) {
      resumedAt = performance.now();
      raf = requestAnimationFrame(frame);
    } else if (!run && raf) {
      clock = now();
      cancelAnimationFrame(raf);
      raf = 0;
    }
  }

  const buttons = CAMS.map((cam, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "cam-btn";
    b.textContent = cam.id.toLowerCase();
    b.addEventListener("click", () => select(i, true));
    buttonsRoot.append(b);
    return b;
  });

  function select(i, byUser) {
    selected = i;
    if (byUser) {
      autoCycle = false;
      SOUND.tick();
    }
    buttons.forEach((b, k) => b.setAttribute("aria-pressed", String(k === i)));
    feedTitle.textContent = `${CAMS[i].id.toLowerCase()} · live`;
    render(now());
  }

  function syncToggle() {
    const key = paused ? "anim.play" : "anim.pause";
    toggleBtn.textContent = `[ ${I18N ? I18N.t(key) : key} ]`;
    toggleBtn.setAttribute("aria-pressed", String(!paused));
  }

  toggleBtn.addEventListener("click", () => {
    paused = !paused;
    syncToggle();
    sync();
  });

  // Клик по камере на схеме открывает её изображение
  mapPre.addEventListener("click", (event) => {
    const rect = mapPre.getBoundingClientRect();
    const col = (event.clientX - rect.left) / (rect.width / MAP.w);
    const row = (event.clientY - rect.top) / (rect.height / MAP.h);
    let best = -1;
    let bestDist = 4;
    CAMS.forEach((cam, i) => {
      const d = Math.hypot((col - cam.icon[0] - 1) * 0.6, row - cam.icon[1]);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    if (best >= 0) select(best, true);
  });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      visible = entries[entries.length - 1].isIntersecting;
      sync();
    }).observe(section);
  } else {
    visible = true;
  }
  document.addEventListener("visibilitychange", sync);
  document.addEventListener("langchange", syncToggle);

  syncToggle();
  select(selected, false);
  sync();
  const mapScreen = mapPre.parentElement;
  mapScreen.scrollLeft = (mapScreen.scrollWidth - mapScreen.clientWidth) / 2;

  window.OFFICE = {
    cameras: CAMS.map((c) => c.id),
    select: (i) => select(clamp(i, 0, CAMS.length - 1), true),
  };
})();

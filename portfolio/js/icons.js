/* Анимированные ASCII-картинки: значок для каждого навыка (рядом с заголовком вкладки)
 * и для каждого контакта (github, telegram, phone, email).
 * Рисуются в сетке символов (SCENES.makeGrid); играют только видимые картинки, ~8 кадров в секунду.
 * Цвета: 0 — обычный, 1 — алый, 2 — тусклый, 3 — яркий, 5 — бледно-алый. */
(function () {
  "use strict";

  const S = window.SCENES;
  if (!S || !S.makeGrid) return;
  const { makeGrid, hash, blink, clamp } = S;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const lines = (g, x, y, rows, c = 0) => rows.forEach((row, i) => g.put(x, y + i, row, c));

  /* ---------- значки навыков: 20×7 ---------- */
  const SKILL = { w: 20, h: 7 };
  const SKILL_ICONS = {
    // окно кода, теги печатаются
    html(g, t) {
      g.box(0, 0, 20, 7, 2);
      const code = ["<html>", "  <body>", "    <h1>hi</h1>", "  </body>", "</html>"];
      const shown = Math.floor((t * 14) % 90);
      let left = shown;
      code.forEach((row, i) => {
        const part = row.slice(0, Math.max(0, Math.min(row.length, left)));
        left -= row.length;
        [...part].forEach((ch, k) => g.put(2 + k, 1 + i, ch, "<>/".includes(ch) ? 1 : 3));
        if (left < 0 && left > -row.length && blink(t, 0.5)) g.put(2 + part.length, 1 + i, "▋", 1);
      });
    },
    // фигурные скобки, вокруг «JS» летает частица
    js(g, t) {
      lines(g, 1, 0, ["╭──", "│", "┤", "│", "╰──"], 2);
      lines(g, 16, 0, ["──╮", "  │", "  ├", "  │", "──╯"], 2);
      g.put(8, 2, "JS", 3);
      const a = t * 2.4;
      for (let k = 4; k >= 0; k--) {
        const x = Math.round(9.5 + Math.cos(a - k * 0.25) * 6);
        const y = Math.round(2 + Math.sin(a - k * 0.25) * 1.6);
        g.put(x, y, k === 0 ? "●" : "·", k === 0 ? 1 : 5);
      }
      g.put(6, 5, "() => {}", 2);
    },
    // кисть закрашивает три полосы
    css(g, t) {
      const p = (t * 0.45) % 1;
      const fills = ["▓", "▒", "█"];
      const colors = [1, 5, 3];
      for (let i = 0; i < 3; i++) {
        const local = clamp(p * 3 - i);
        const n = Math.round(local * 16);
        g.put(1, 1 + i * 2, fills[i].repeat(n), colors[i]);
        g.put(1 + n, 1 + i * 2, "░".repeat(16 - n), 2);
        if (local > 0 && local < 1) {
          g.put(1 + n, i * 2, "│", 2);
          g.put(1 + n, 1 + i * 2, "▐", 3);
        }
      }
    },
    // цилиндр базы данных, строки по очереди подсвечиваются запросом
    sql(g, t) {
      g.put(3, 0, "╭──────────╮", 2);
      g.put(2, 1, "(            )", 2);
      for (let r = 0; r < 4; r++) {
        g.put(2, 2 + r, "│", 2);
        g.put(15, 2 + r, "│", 2);
      }
      g.put(3, 2, "╰──────────╯", 2);
      const scan = Math.floor(t * 3) % 6;
      for (let r = 0; r < 3; r++) g.put(5, 3 + r, "■■■■■■■■", r === scan ? 1 : r < scan ? 3 : 2);
      g.put(3, 6, "╰──────────╯", 2);
      if (scan >= 3 && blink(t, 0.4)) g.put(17, 3, "OK", 1);
    },
    // шестиугольник: точки по вершинам загораются по кругу, центр «бьётся»
    node(g, t) {
      lines(g, 4, 0, ["   ______", "  ╱      ╲", " ╱        ╲", " ╲        ╱", "  ╲______╱"], 2);
      const pulse = Math.floor(t * 3) % 3;
      g.put(10, 2, ["·", "•", "●"][pulse], 1);
      g.put(10, 3, ["·", "•", "●"][(pulse + 1) % 3], 5);
      const v = [[7, 0], [13, 0], [15, 2], [13, 4], [7, 4], [5, 2]];
      const lit = Math.floor(t * 4) % 6;
      v.forEach(([x, y], i) => g.put(x, y, i === lit ? "●" : "·", i === lit ? 1 : 2));
      g.put(2, 6, "node.js · :3000", 2);
    },
    // граф коммитов: точки загораются по ходу ветки
    git(g, t) {
      g.put(0, 1, "●──●──●───────●──●", 2);
      g.put(5, 2, "╲", 2);
      g.put(6, 3, "●──●──●", 2);
      g.put(13, 2, "╱", 2);
      const path = [[0, 1], [3, 1], [6, 1], [6, 3], [9, 3], [12, 3], [14, 1], [17, 1]];
      const k = Math.floor(t * 3) % (path.length + 3);
      path.forEach(([x, y], i) => i <= k && g.put(x, y, "●", i === k ? 1 : 3));
      g.put(0, 5, k >= path.length ? "merged · ok" : "commit…", k >= path.length ? 1 : 2);
    },
    // пингвин: моргает и машет крылом
    linux(g, t) {
      const blinkEyes = t % 3.2 < 0.18;
      const wave = Math.floor(t * 2) % 2;
      lines(g, 4, 0, [
        "    .--.",
        blinkEyes ? "   |-_- |" : "   |o_o |",
        "   |:_/ |",
        wave ? "  //   \\ \\" : " \\\\   / /",
        " (|     | )",
        "/'\\_   _/`\\",
        "\\___)=(___/",
      ], 3);
      g.put(7, 2, ":_/", 1);
    },
    // окно из четырёх створок, створки подсвечиваются по кругу
    windows(g, t) {
      g.put(0, 0, "┌────────┬────────┐", 2);
      g.put(0, 3, "├────────┼────────┤", 2);
      g.put(0, 6, "└────────┴────────┘", 2);
      const lit = Math.floor(t * 2) % 4;
      [[1, 1], [10, 1], [10, 4], [1, 4]].forEach(([x, y], i) => {
        for (let r = 0; r < 2; r++) g.put(x, y + r, (i === lit ? "▓" : "░").repeat(8), i === lit ? 1 : 2);
      });
      for (let r of [1, 2, 4, 5]) {
        g.put(0, r, "│", 2);
        g.put(9, r, "│", 2);
        g.put(18, r, "│", 2);
      }
    },
    // вращающийся глобус и спутник
    network(g, t) {
      const cx = 9;
      const cy = 3;
      const rx = 7;
      const ry = 3;
      for (let y = 0; y <= 6; y++) {
        const dy = (y - cy) / ry;
        if (Math.abs(dy) > 1) continue;
        const half = rx * Math.sqrt(1 - dy * dy);
        g.put(Math.round(cx - half), y, "(", 2);
        g.put(Math.round(cx + half), y, ")", 2);
        for (let k = 0; k < 6; k++) {
          const lon = (k / 6) * Math.PI * 2 + t * 0.9;
          if (Math.cos(lon) < 0) continue;
          g.put(Math.round(cx + Math.sin(lon) * half * 0.9), y, ":", 5);
        }
      }
      const a = t * 1.6;
      g.put(Math.round(cx + Math.cos(a) * 9), Math.round(cy + Math.sin(a) * 3.4), "■", 1);
    },
    // мини-стойка с индикаторами и вентиляторами
    servers(g, t) {
      g.put(1, 0, "╔══════════════╗", 2);
      for (let u = 0; u < 4; u++) {
        g.put(1, 1 + u, "║", 2);
        g.put(16, 1 + u, "║", 2);
        g.put(3, 1 + u, "═══", 2);
        for (let k = 0; k < 3; k++) g.put(8 + k, 1 + u, hash(Math.floor(t * 6) + u * 7 + k) > 0.45 ? "●" : "○", k === 0 ? 3 : 1);
        g.put(13, 1 + u, "|/-\\"[(Math.floor(t * 8) + u) % 4], 2);
      }
      g.put(1, 5, "╚══════════════╝", 2);
      g.put(3, 6, "pve01 · 5 VM", 2);
    },
    // камера поворачивается, мигает REC, конус обзора гуляет
    cctv(g, t) {
      g.put(0, 0, "══╦══", 2);
      g.put(2, 1, "║", 2);
      g.put(0, 2, "╭─┴─────╮", 3);
      g.put(0, 3, "│", 3);
      g.put(1, 3, blink(t, 1) ? "●" : "○", 1);
      g.put(3, 3, "CAM ├─╮", 3);
      g.put(0, 4, "╰───────┤", 3);
      g.put(9, 4, ["O", "0", "o"][Math.floor(t * 2) % 3], 1);
      g.put(10, 4, "│", 3);
      g.put(8, 5, "╰─╯", 3);
      const tilt = Math.sin(t * 1.2) * 1.4;
      for (let x = 11; x < 20; x++) {
        const d = x - 10;
        const c = 4 + (tilt * d) / 9;
        g.put(x, Math.round(c - d / 4), "·", 5);
        g.put(x, Math.round(c + d / 4), "·", 5);
      }
    },
    // пульс нагрузки бежит по экрану, всплеск — алым
    monitoring(g, t) {
      const blocks = " ▁▂▃▄▅▆▇█";
      const shift = Math.floor(t * 6);
      for (let x = 0; x < 20; x++) {
        const k = x + shift;
        let v = 0.35 + 0.18 * Math.sin(k * 0.5) + 0.1 * (hash(k) - 0.5);
        if (k % 23 < 2) v = 0.95;
        const h = v * 5;
        for (let r = 0; r < 5; r++) {
          const frac = clamp(h - (4 - r));
          const ch = blocks[Math.round(frac * 8)];
          if (ch !== " ") g.put(x, r, ch, v > 0.8 ? 1 : 0);
        }
      }
      g.hline(0, 5, 20, 2, "─");
      g.put(0, 6, "cpu · srv01 · live", 2);
    },
  };

  /* ---------- картинки контактов: 26×9 ---------- */
  const CONTACT = { w: 26, h: 9 };
  const CONTACT_ICONS = {
    // кот (как талисман гитхаба) и заполняющийся график вкладов
    github(g, t) {
      const eyes = t % 3 < 0.2 ? "-.-" : "o.o";
      lines(g, 0, 2, [" /\\_/\\", `( ${eyes} )`, " > ^ <"], 3);
      g.put(0, 6, "@commits", 2);
      const week = Math.floor(t * 4) % 16;
      for (let x = 0; x < 13; x++) {
        for (let y = 0; y < 7; y++) {
          const level = hash(x * 7 + y);
          const done = x < week || (x === week && y <= Math.floor((t * 28) % 7));
          const c = !done ? 2 : level > 0.75 ? 1 : level > 0.45 ? 5 : level > 0.2 ? 0 : 2;
          g.put(12 + x, 1 + y, done && level > 0.2 ? "■" : "·", c);
        }
      }
    },
    // бумажный самолётик летит и оставляет пунктир
    telegram(g, t) {
      const p = (t * 0.28) % 1;
      const x = Math.round(-12 + p * 30);
      const y = Math.round(2 + Math.sin(p * Math.PI * 2) * 1.6);
      for (let k = 1; k < 9; k++) {
        const tx = Math.round(-12 + (p - k * 0.03) * 30);
        const ty = Math.round(2 + Math.sin((p - k * 0.03) * Math.PI * 2) * 1.6);
        g.put(tx + 1, ty + 2, "·", 5);
      }
      // бумажный самолётик носом вправо
      lines(g, x, y, [" _____", " \\    `-.__", "  >-------_>", " /____.-'"], 3);
      g.put(x + 3, y + 2, "-------", 1);
      if (p > 0.82) g.put(13, 8, "[ delivered ]", 1);
    },
    // телефон вибрирует, расходятся волны звонка
    phone(g, t) {
      const cycle = t % 2.4;
      const ringing = cycle < 1.4;
      const dx = ringing && Math.floor(t * 18) % 2 ? 1 : 0;
      const x = 8 + dx;
      g.put(x, 0, "╭───────╮", 3);
      for (let r = 1; r <= 6; r++) {
        g.put(x, r, "│", 3);
        g.put(x + 8, r, "│", 3);
      }
      g.put(x + 2, 1, "═══", 2);
      g.put(x + 2, 3, ringing && blink(t, 0.4) ? "RING" : "    ", 1);
      g.put(x + 2, 4, "(_)", 0);
      g.put(x + 4, 6, "●", 2);
      g.put(x, 7, "╰───────╯", 3);
      if (ringing) {
        const w = Math.floor(t * 6) % 3;
        for (let k = 0; k <= w; k++) {
          g.put(x - 2 - k * 2, 3, "(", k === w ? 1 : 5);
          g.put(x + 10 + k * 2, 3, ")", k === w ? 1 : 5);
          if (k > 0) {
            g.put(x - 1 - k * 2, 2, "(", 5);
            g.put(x + 9 + k * 2, 2, ")", 5);
            g.put(x - 1 - k * 2, 4, "(", 5);
            g.put(x + 9 + k * 2, 4, ")", 5);
          }
        }
      }
    },
    // конверт открывается, вылетает «@»
    email(g, t) {
      const open = t % 3 > 1.5;
      g.put(4, 2, "┌────────────────┐", 3);
      for (let r = 3; r <= 6; r++) {
        g.put(4, r, "│", 3);
        g.put(21, r, "│", 3);
      }
      g.put(4, 7, "└────────────────┘", 3);
      if (open) {
        g.put(5, 1, "╱", 3);
        g.put(20, 1, "╲", 3);
        g.put(6, 0, "╱", 3);
        g.put(19, 0, "╲", 3);
        const fly = Math.min(3, Math.floor((t % 3) * 3 - 4.5));
        g.put(12, 2 - fly, "@", 1);
      } else {
        g.put(5, 3, "╲", 3);
        g.put(6, 4, "╲", 3);
        g.put(7, 5, "╲", 3);
        g.put(20, 3, "╱", 3);
        g.put(19, 4, "╱", 3);
        g.put(18, 5, "╱", 3);
        g.put(8, 6, "──────────", 2);
      }
    },
  };

  /* ---------- проигрыватель: рисуются только видимые картинки ---------- */
  const players = new Set();
  let raf = 0;
  let last = 0;
  const start = performance.now();

  function tick(now) {
    raf = requestAnimationFrame(tick);
    if (now - last < 120) return;
    last = now;
    const t = (now - start) / 1000;
    players.forEach((p) => p.visible && p.draw(t));
  }

  const observer =
    "IntersectionObserver" in window
      ? new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            const p = entry.target._icon;
            if (p) p.visible = entry.isIntersecting;
          });
        })
      : null;

  function create(pre, kind, id) {
    const set = kind === "contact" ? CONTACT_ICONS : SKILL_ICONS;
    const size = kind === "contact" ? CONTACT : SKILL;
    const scene = set[id];
    if (!scene) return null;
    const g = makeGrid(size.w, size.h);
    pre.style.setProperty("--cols", size.w);
    const player = {
      visible: !observer,
      draw(t) {
        g.clear();
        scene(g, t);
        pre.innerHTML = g.html();
      },
    };
    player.draw(1.3);
    pre._icon = player;
    if (!reduceMotion) {
      players.add(player);
      if (observer) observer.observe(pre);
      if (!raf) raf = requestAnimationFrame(tick);
    }
    return player;
  }

  // Убирает картинки, которых больше нет на странице (после смены языка)
  function prune() {
    players.forEach((p) => {
      if (!document.contains(p._pre)) players.delete(p);
    });
  }

  window.ICONS = {
    skill: (pre, id) => {
      const p = create(pre, "skill", id);
      if (p) p._pre = pre;
      return p;
    },
    contact: (pre, id) => {
      const p = create(pre, "contact", id);
      if (p) p._pre = pre;
      return p;
    },
    prune,
    has: (kind, id) => Boolean((kind === "contact" ? CONTACT_ICONS : SKILL_ICONS)[id]),
  };
})();

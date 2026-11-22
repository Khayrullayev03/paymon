/* Живые ASCII-анимации для разделов навыков: камера, серверная стойка, сеть, htop и т.д.
 * Каждая сцена — функция (g, t): рисует кадр в сетке 46×14 символов, t — секунды с начала.
 * Цвета: 0 — обычный, 1 — красный акцент, 2 — тусклый, 3 — яркий, 4 — инверсия. */
(function () {
  "use strict";

  const W = 46;
  const H = 14;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, k) => a + (b - a) * k;
  const ease = (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);
  const blink = (t, period = 1) => t % period < period / 2;
  const hash = (n) => {
    const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
    return s - Math.floor(s);
  };
  const clock = (seconds) => {
    const s = Math.floor(seconds) % 86400;
    return [s / 3600, (s / 60) % 60, s % 60].map((v) => String(Math.floor(v)).padStart(2, "0")).join(":");
  };

  function makeGrid() {
    const chars = new Array(W * H).fill(" ");
    const colors = new Uint8Array(W * H);
    const esc = (ch) => (ch === "&" ? "&amp;" : ch === "<" ? "&lt;" : ch === ">" ? "&gt;" : ch);

    const g = {
      clear() {
        chars.fill(" ");
        colors.fill(0);
      },
      put(x, y, text, c = 0) {
        x = Math.round(x);
        y = Math.round(y);
        if (y < 0 || y >= H) return;
        const list = [...String(text)];
        for (let i = 0; i < list.length; i++) {
          const xx = x + i;
          if (xx < 0 || xx >= W) continue;
          chars[y * W + xx] = list[i];
          colors[y * W + xx] = c;
        }
      },
      get(x, y) {
        return chars[y * W + x];
      },
      hline(x, y, len, c = 2, ch = "─") {
        if (len > 0) g.put(x, y, ch.repeat(len), c);
      },
      vline(x, y, len, c = 2, ch = "│") {
        for (let i = 0; i < len; i++) g.put(x, y + i, ch, c);
      },
      box(x, y, w, h, c = 2, title, titleColor = 0) {
        w = Math.round(w);
        if (w < 2 || h < 2) return;
        g.put(x, y, "┌" + "─".repeat(w - 2) + "┐", c);
        for (let i = 1; i < h - 1; i++) {
          g.put(x, y + i, "│", c);
          g.put(x + w - 1, y + i, "│", c);
        }
        g.put(x, y + h - 1, "└" + "─".repeat(w - 2) + "┘", c);
        if (title && w > title.length + 3) g.put(x + 2, y, ` ${title} `, titleColor);
      },
      bar(x, y, len, frac, c = 1, cEmpty = 2, full = "█", empty = "░") {
        const n = Math.round(clamp(frac) * len);
        g.put(x, y, full.repeat(n), c);
        g.put(x + n, y, empty.repeat(len - n), cEmpty);
      },
      html() {
        let out = "";
        for (let y = 0; y < H; y++) {
          let run = "";
          let runColor = -1;
          const flush = () => {
            if (run) out += runColor === 0 ? run : `<span class="c${runColor}">${run}</span>`;
            run = "";
          };
          for (let x = 0; x < W; x++) {
            const i = y * W + x;
            if (colors[i] !== runColor) {
              flush();
              runColor = colors[i];
            }
            run += esc(chars[i]);
          }
          flush();
          if (y < H - 1) out += "\n";
        }
        return out;
      },
    };
    return g;
  }

  // Клетки прямой (горизонтальной или вертикальной) линии от (x0,y0) до (x1,y1).
  function path(...points) {
    const cells = [];
    for (let i = 0; i < points.length - 1; i++) {
      const [x0, y0] = points[i];
      const [x1, y1] = points[i + 1];
      const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
      for (let s = i === 0 ? 0 : 1; s <= steps; s++) {
        cells.push([Math.round(lerp(x0, x1, s / steps)), Math.round(lerp(y0, y1, s / steps))]);
      }
    }
    return cells;
  }

  const SCENES = {
    /* HTML: страница собирается из блоков-тегов */
    html(g, t) {
      const p = t % 8;
      g.box(0, 0, W, H, 2, "index.html", 3);
      g.put(2, 1, "< >  http://localhost/", 2);
      const items = [
        { x: 2, y: 2, w: 42, h: 3, tag: "<header>" },
        { x: 2, y: 5, w: 28, h: 6, tag: "<main>" },
        { x: 4, y: 6, w: 24, h: 4, tag: "<section>" },
        { x: 31, y: 5, w: 13, h: 6, tag: "<aside>" },
        { x: 2, y: 11, w: 42, h: 2, tag: "<footer>" },
      ];
      let latest = -1;
      items.forEach((it, i) => {
        const k = (p - 0.3 - i * 0.9) / 0.5;
        if (k < 0) return;
        latest = i;
        const w = 2 + (it.w - 2) * ease(clamp(k));
        const active = k < 2.2 && p < 5.2;
        g.box(it.x, it.y, w, it.h, active ? 1 : 2, it.tag, active ? 1 : 0);
      });
      if (p > 5) {
        g.put(4, 3, "[logo]", 3);
        g.put(24, 3, "home  about  contact", 0);
        g.put(6, 7, "▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒", 2);
        g.put(6, 8, "▒▒▒▒▒▒▒▒▒▒▒▒", 2);
        g.put(33, 7, "▒▒▒▒▒▒▒", 2);
        g.put(33, 8, "▒▒▒▒▒", 2);
        g.put(28, 12, "© 2026", 2);
      }
      if (latest >= 0 && p < 5 && blink(t, 0.6)) g.put(44, 1, "▋", 1);
    },

    /* JavaScript: курсор нажимает кнопку, срабатывает обработчик */
    js(g, t) {
      const T = 5;
      const p = t % T;
      const n = Math.floor(t / T) + 1;
      g.box(0, 0, 22, H, 2, "app.js", 3);
      g.box(23, 0, 23, H, 2, "console", 3);
      const pressed = p > 1.45 && p < 1.85;
      g.put(5, 4, pressed ? "[ CLICK ]" : "[ click ]", pressed ? 4 : 3);
      g.put(4, 8, "clicks: ", 2);
      g.put(12, 8, String(p > 1.6 ? n : n - 1), p > 1.6 && p < 2.6 ? 1 : 3);
      let cx = 11;
      let cy = 5;
      if (p < 1.4) {
        const e = ease(p / 1.4);
        cx = lerp(18, 11, e);
        cy = lerp(11, 5, e);
      } else if (p > 2.6) {
        const e = ease(clamp((p - 2.6) / 1.2));
        cx = lerp(11, 18, e);
        cy = lerp(5, 11, e);
      }
      g.put(cx, cy, "↖", 1);
      const lines = [
        [1.6, "> click #" + n, 0],
        [1.9, "  onClick(event)", 2],
        [2.2, "  setCount(" + n + ")", 2],
        [2.5, "  render() -> ok", 1],
      ];
      lines.forEach(([at, text, c], i) => p >= at && g.put(25, 2 + i, text, c));
      g.put(25, 11, "> _", blink(t, 0.8) ? 2 : 0);
    },

    /* CSS: три блока перестраиваются под разные правила раскладки */
    css(g, t) {
      const layouts = [
        { rule: "display: flex;", pos: [[3, 3], [13, 3], [23, 3]] },
        { rule: "justify-content: space-between;", pos: [[3, 3], [19, 3], [35, 3]] },
        { rule: "flex-direction: column;", pos: [[3, 1], [3, 4], [3, 7]] },
        { rule: "justify-content: center;", pos: [[10, 4], [19, 4], [28, 4]] },
        { rule: "display: grid; gap: 1ch;", pos: [[3, 1], [14, 1], [3, 5]] },
      ];
      const step = 2.4;
      const k = Math.floor(t / step) % layouts.length;
      const prev = layouts[(k - 1 + layouts.length) % layouts.length];
      const cur = layouts[k];
      const e = ease(clamp((t % step) / 0.6));
      g.box(0, 0, W, 11, 2, ".container", 2);
      ["A", "B", "C"].forEach((label, i) => {
        const x = lerp(prev.pos[i][0], cur.pos[i][0], e);
        const y = lerp(prev.pos[i][1], cur.pos[i][1], e);
        const c = [1, 3, 0][i];
        g.box(x, y, 8, 3, c);
        g.put(x + 3, y + 1, label, c);
      });
      g.put(0, 12, ".container {", 2);
      g.put(2, 13, cur.rule, e < 1 ? 1 : 3);
      g.put(2 + cur.rule.length + 1, 13, "}", 2);
    },

    /* SQL: запрос проходит по строкам таблицы и отбирает подходящие */
    sql(g, t) {
      const p = t % 7.5;
      const query = "SELECT name FROM users WHERE active=1;";
      g.put(0, 0, "sql> ", 1);
      g.put(5, 0, query.slice(0, Math.floor(p * 28)), 0);
      const rows = [[1, "anvar", 1], [2, "dilnoza", 0], [3, "sardor", 1], [4, "malika", 1], [5, "jasur", 0], [6, "kamola", 1]];
      g.put(0, 2, "┌────┬──────────┬────────┐", 2);
      g.put(0, 3, "│ id │ name     │ active │", 2);
      g.put(0, 4, "├────┼──────────┼────────┤", 2);
      g.put(0, 11, "└────┴──────────┴────────┘", 2);
      g.box(29, 2, 17, 10, 2, "result", 0);
      const scan = Math.floor((p - 1.8) / 0.45);
      let found = 0;
      rows.forEach(([id, name, active], i) => {
        const y = 5 + i;
        const scanned = i < scan;
        const match = scanned && active === 1;
        const c = i === scan ? 3 : match ? 1 : scanned ? 2 : 0;
        g.put(0, y, "│", 2);
        g.put(2, y, String(id), c);
        g.put(5, y, "│", 2);
        g.put(7, y, name.padEnd(8), c);
        g.put(16, y, "│", 2);
        g.put(18, y, String(active), c);
        g.put(25, y, "│", 2);
        if (i === scan) g.put(27, y, "<", 1);
        if (match) {
          g.put(31, 3 + found, "> " + name, 1);
          found++;
        }
      });
      if (scan >= rows.length) g.put(0, 13, `-> ${found} rows in set (0.01 sec)`, 3);
    },

    /* Node.js: запрос идёт от клиента к серверу и базе и возвращается */
    node(g, t) {
      const T = 2.6;
      const cycle = Math.floor(t / T);
      const p = t % T;
      const busy = p > 0.5 && p < 1.3;
      g.box(0, 1, 10, 3, 2);
      g.put(2, 2, "client", 0);
      g.box(18, 1, 10, 3, busy ? 1 : 2);
      g.put(20, 2, "server", busy ? 1 : 0);
      g.box(36, 1, 10, 3, 2);
      g.put(40, 2, "db", 0);
      g.hline(10, 2, 8, 2);
      g.hline(28, 2, 8, 2);
      const seg = (a, b, x0, x1, c) => {
        if (p >= a && p < b) g.put(Math.round(lerp(x0, x1, (p - a) / (b - a))), 2, "●", c);
      };
      seg(0, 0.5, 10, 17, 3);
      seg(0.5, 0.9, 28, 35, 3);
      seg(0.9, 1.3, 35, 28, 1);
      seg(1.3, 1.8, 17, 10, 1);
      if (p < 0.5) g.put(10, 0, "GET /api", 2);
      if (p >= 0.5 && p < 0.9) g.put(28, 0, "SELECT", 2);
      if (p >= 0.9 && p < 1.3) g.put(29, 4, "rows", 2);
      if (p >= 1.3 && p < 2.3) g.put(10, 4, "200 OK", 1);

      g.put(0, 5, "── access.log " + "─".repeat(32), 2);
      const routes = ["GET  /api/users", "POST /api/login", "GET  /api/posts?page=2", "PUT  /api/users/7", "GET  /health", "DELETE /api/posts/3"];
      const codes = [200, 201, 200, 200, 200, 204];
      const done = cycle + (p > 1.8 ? 1 : 0);
      for (let row = 0; row < 8; row++) {
        const k = done - 8 + row;
        if (k < 0) continue;
        const r = k % routes.length;
        const ms = 4 + Math.floor(hash(k) * 40);
        const line = `[${String(k).padStart(3, "0")}] ${routes[r].padEnd(23)} ${codes[r]} ${ms}ms`;
        g.put(0, 6 + row, line, k === done - 1 ? 1 : 2);
      }
    },

    /* Git: растёт граф коммитов, ветка сливается в main */
    git(g, t) {
      const p = t % 9;
      const commits = [
        { at: 0.2, x: 6, y: 2, msg: "init project" },
        { at: 0.9, x: 12, y: 2, msg: "add layout" },
        { at: 1.7, x: 17, y: 6, msg: "contact form" },
        { at: 2.5, x: 23, y: 6, msg: "form validation" },
        { at: 3.2, x: 26, y: 2, msg: "hotfix: typo" },
        { at: 4.0, x: 29, y: 6, msg: "add tests" },
        { at: 4.9, x: 34, y: 2, msg: "merge feature", merge: true },
        { at: 5.7, x: 40, y: 2, msg: "release v1.0", tag: true },
      ];
      const shown = commits.filter((c) => p >= c.at);
      g.put(0, 2, "main", 3);
      if (p >= 1.7) g.put(0, 6, "feature", 2);
      const mains = shown.filter((c) => c.y === 2);
      if (mains.length > 1) g.hline(mains[0].x, 2, mains[mains.length - 1].x - mains[0].x, 2);
      if (p >= 1.5) ["\\", "\\", "\\"].forEach((ch, i) => g.put(13 + i, 3 + i, ch, 2));
      const feats = shown.filter((c) => c.y === 6);
      if (feats.length) g.hline(16, 6, feats[feats.length - 1].x - 16, 2);
      if (p >= 4.7) ["/", "/", "/"].forEach((ch, i) => g.put(30 + i, 5 - i, ch, 2));
      shown.forEach((c, i) => g.put(c.x, c.y, "●", i === shown.length - 1 ? 1 : c.y === 2 ? 3 : 0));
      if (p >= 5.7) g.put(38, 1, "v1.0", 1);
      g.put(0, 8, "$ git log --oneline", 2);
      shown
        .slice(-5)
        .reverse()
        .forEach((c, i) => {
          const sha = Math.floor(hash(c.at) * 0xffffff).toString(16).padStart(6, "0");
          g.put(0, 9 + i, sha, i === 0 ? 1 : 2);
          g.put(8, 9 + i, c.msg, i === 0 ? 3 : 0);
        });
    },

    /* Linux: htop с живыми нагрузками и процессами */
    linux(g, t) {
      const cpu = (k) => clamp(0.4 + 0.25 * Math.sin(t * 1.7 + k * 2) + 0.15 * Math.sin(t * 4.3 + k) + 0.1 * (hash(Math.floor(t * 4) + k) - 0.5), 0.03, 0.98);
      const meter = (y, label, frac, text) => {
        g.put(0, y, label, 3);
        g.put(5, y, "[", 2);
        const n = Math.round(frac * 24);
        g.put(6, y, "|".repeat(n), frac > 0.75 ? 1 : 0);
        g.put(30, y, "]", 2);
        g.put(32, y, text, 3);
      };
      const c1 = cpu(0);
      const c2 = cpu(1);
      const mem = 0.52 + 0.04 * Math.sin(t * 0.5);
      meter(0, "CPU1", c1, `${Math.round(c1 * 100)}%`.padStart(4));
      meter(1, "CPU2", c2, `${Math.round(c2 * 100)}%`.padStart(4));
      meter(2, "Mem", mem, `${(mem * 4).toFixed(1)}G/4.0G`);
      const load = (k) => (0.5 + 0.2 * Math.sin(t * 0.3 + k)).toFixed(2);
      g.put(0, 3, `Load: ${load(0)} ${load(1)} ${load(2)}`, 0);
      g.put(26, 3, `Up: 12d ${clock(15202 + t)}`, 2);
      g.put(0, 5, "  PID USER      CPU%  MEM%  COMMAND        ", 4);
      const procs = [
        [812, "www-data", "nginx", 3.1],
        [1043, "mysql", "mysqld", 11.8],
        [221, "root", "sshd", 0.4],
        [1520, "anvarjon", "node app.js", 6.2],
        [17, "root", "systemd-journal", 0.9],
        [1888, "zabbix", "zabbix_agentd", 1.3],
        [2410, "root", "cron", 0.2],
      ].map(([pid, user, cmd, mem2], i) => ({ pid, user, cmd, mem: mem2, cpu: Math.max(0, 22 * cpu(i + 2) - (i > 3 ? 10 : 0)) }));
      procs.sort((a, b) => b.cpu - a.cpu);
      procs.forEach((pr, i) => {
        const line = `${String(pr.pid).padStart(5)} ${pr.user.padEnd(9)} ${pr.cpu.toFixed(1).padStart(5)} ${pr.mem.toFixed(1).padStart(5)}  ${pr.cmd}`;
        g.put(0, 6 + i, line, i === 0 ? 1 : 0);
      });
      let x = 0;
      [["F1", "Help"], ["F2", "Setup"], ["F6", "Sort"], ["F9", "Kill"], ["F10", "Quit"]].forEach(([k, label]) => {
        g.put(x, 13, k, 4);
        g.put(x + k.length, 13, label + " ", 2);
        x += k.length + label.length + 2;
      });
    },

    /* Windows Server: в Active Directory появляется новый пользователь */
    windows(g, t) {
      const p = t % 9;
      const cmd = 'New-ADUser i.petrov -Path "OU=Office"';
      const typed = cmd.slice(0, Math.floor(clamp((p - 0.3) / 2) * cmd.length));
      g.put(0, 0, "PS>", 1);
      g.put(4, 0, typed, 0);
      if (p < 2.5 && blink(t, 0.6)) g.put(4 + typed.length, 0, "▋", 1);
      const created = p > 2.6;
      g.put(0, 2, "corp.local", 3);
      g.put(0, 3, "├─ OU=Office", 0);
      g.put(0, 4, "│  ├─ a.karimov", 2);
      g.put(0, 5, created ? "│  ├─ d.yusupova" : "│  └─ d.yusupova", 2);
      if (created) {
        g.put(0, 6, "│  └─ ", 2);
        g.put(6, 6, "i.petrov", 1);
        if (p < 4.6 && blink(t, 0.5)) g.put(15, 6, "+ new", 1);
      }
      g.put(0, 7, "├─ OU=Accounting", 0);
      g.put(0, 8, "│  └─ s.rakhimov", 2);
      g.put(0, 9, "└─ GPO: Office-Policy", 0);
      if (p > 3.2 && p < 5.6) {
        g.put(0, 11, "gpupdate /force ", 2);
        g.bar(16, 11, 12, (p - 3.2) / 2.2);
      } else if (p >= 5.6) {
        g.put(0, 11, "policy applied: i.petrov ", 0);
        g.put(25, 11, "OK", 1);
      }
      g.box(30, 2, 16, 8, 2, "DC01", 3);
      [["DNS", 0], ["DHCP", 1], ["AD DS", 2]].forEach(([name, i]) => {
        g.put(32, 3 + i, name, 0);
        g.put(39, 3 + i, "●", blink(t + i * 0.3, 2) ? 1 : 3);
        g.put(41, 3 + i, "up", 2);
      });
      g.put(32, 7, "users " + (created ? 4 : 3), created && p < 4.6 ? 1 : 0);
      g.put(32, 8, "groups 5", 0);
    },

    /* Сети: пакеты бегут по топологии интернет → роутер → коммутатор → устройства */
    network(g, t) {
      g.put(16, 0, "( internet )", 2);
      g.vline(22, 1, 1);
      g.put(17, 2, "[ router ]", 0);
      g.put(27, 2, "═══ vpn ═══", 2);
      g.put(38, 2, "[ home ]", 0);
      g.vline(22, 3, 1);
      g.put(17, 4, "[ switch ]", 0);
      g.put(6, 5, "┌" + "─".repeat(31) + "┐", 2);
      [14, 30].forEach((x) => g.put(x, 5, "┬", 2));
      g.put(22, 5, "┴", 2);
      [6, 14, 30, 38].forEach((x) => g.put(x, 6, "│", 2));
      g.put(4, 7, "[pc1]", 0);
      g.put(12, 7, "[pc2]", 0);
      g.put(28, 7, "[srv]", 3);
      g.put(36, 7, "[cam]", 0);
      g.put(7, 8, "vlan10", 2);
      g.put(28, 8, "vlan30", 2);
      g.put(36, 8, "vlan20", 2);
      const packets = [
        { cells: path([22, 1], [22, 5], [6, 5], [6, 6]), speed: 0.35, offset: 0, c: 1 },
        { cells: path([38, 6], [38, 5], [30, 5], [30, 6]), speed: 0.5, offset: 0.3, c: 3 },
        { cells: path([30, 6], [30, 5], [14, 5], [14, 6]), speed: 0.4, offset: 0.6, c: 3 },
        { cells: path([27, 2], [37, 2]), speed: 0.45, offset: 0.1, c: 1, ch: "■" },
      ];
      packets.forEach((pk) => {
        const phase = (t * pk.speed + pk.offset) % 1;
        const [x, y] = pk.cells[Math.floor(phase * pk.cells.length)];
        g.put(x, y, pk.ch || "●", pk.c);
      });
      g.put(0, 10, "$", 1);
      g.put(2, 10, "ping 10.0.20.11", 0);
      const n = Math.floor(t);
      for (let i = 0; i < 3; i++) {
        const k = n - 2 + i;
        if (k < 0) continue;
        const ms = (0.6 + hash(k) * 1.8).toFixed(1);
        g.put(0, 11 + i, `64 bytes from 10.0.20.11: seq=${k} time=${ms} ms`, i === 2 ? 3 : 2);
      }
    },

    /* Серверы: стойка с мигающими индикаторами и загрузка виртуальных машин */
    servers(g, t) {
      g.box(0, 0, 19, H, 2, "rack-01", 3);
      const fans = "|/-\\";
      ["srv01", "srv02", "srv03", "nas01"].forEach((name, i) => {
        const y = 2 + i * 2;
        g.put(2, y, name, 0);
        g.put(8, y, "●", 3);
        g.put(10, y, hash(Math.floor(t * 6) + i * 7) > 0.45 ? "●" : "○", 1);
        for (let d = 0; d < 4; d++) g.put(12 + d, y, "■", hash(Math.floor(t * 5) + i * 13 + d) > 0.5 ? 0 : 2);
        g.put(17, y, fans[Math.floor(t * 8 + i) % 4], 2);
        if (i < 3) g.put(2, y + 1, "- - - - - - - -", 2);
      });
      g.put(2, 10, "sw01", 0);
      for (let port = 0; port < 8; port++) g.put(8 + port, 10, "■", hash(Math.floor(t * 7) + port * 3) > 0.4 ? 1 : 2);
      g.put(2, 12, "ups", 0);
      g.bar(6, 12, 8, 0.87, 0, 2);
      g.put(15, 12, "87%", 2);

      g.box(20, 0, 26, H, 2, "proxmox · pve01", 3);
      const p = t % 10;
      const vms = [[101, "web"], [102, "db"], [103, "files"], [104, "cams"], [105, "zabbix"]];
      vms.forEach(([id, name], i) => {
        const y = 2 + i;
        const startAt = 0.8 + i * 0.9;
        let state = "stopped";
        let c = 2;
        if (p >= startAt + 0.8) {
          state = "running";
          c = 0;
        } else if (p >= startAt) {
          state = "boot..";
          c = blink(t, 0.4) ? 1 : 2;
        }
        g.put(22, y, String(id), 2);
        g.put(26, y, name.padEnd(7), c === 2 ? 2 : 0);
        g.put(34, y, state, c);
        if (state === "running") g.bar(41, y, 3, 0.3 + 0.5 * Math.abs(Math.sin(t * 1.3 + i)), 1, 2, "█", "░");
      });
      g.put(22, 8, "docker:", 2);
      ["nginx", "grafana", "postgres"].forEach((name, i) => {
        const up = p > 2 + i * 0.6;
        g.put(22, 9 + i, up ? "●" : "○", up ? 1 : 2);
        g.put(24, 9 + i, name.padEnd(9), up ? 0 : 2);
        g.put(34, 9 + i, up ? "up " + (3 + i) + "d" : "starting", 2);
      });
    },

    /* Видеонаблюдение: камера поворачивается, замечает человека и пишет тревогу */
    cctv(g, t) {
      const lx = 6;
      const ly = 2;
      const theta = 0.75 + 0.42 * Math.sin(t * 0.7);
      const half = 0.3;
      const walk = (t / 12) % 1;
      const px = Math.round(12 + 30 * (walk < 0.5 ? walk * 2 : 2 - walk * 2));
      const personAngle = Math.atan2((10 - ly) * 1.25, (px - lx) * 0.6);
      const detected = Math.abs(personAngle - theta) < half;

      for (let y = 3; y <= 11; y++) {
        for (let x = 1; x < W; x++) {
          const vx = (x - lx) * 0.6;
          const vy = (y - ly) * 1.25;
          const diff = Math.abs(Math.atan2(vy, vx) - theta);
          if (diff < half) g.put(x, y, half - diff < 0.05 ? "'" : ".", half - diff < 0.05 ? 1 : 2);
        }
      }
      g.hline(0, 0, W, 2, "═");
      g.put(3, 1, "║", 2);
      g.put(1, 2, "[■■]", 3);
      g.put(5, 2, theta < 0.6 ? "=" : theta < 0.95 ? "\\" : "|", 1);
      g.hline(0, 12, W, 2, "─");

      const step = Math.floor(t * 4) % 2;
      g.put(px, 9, "o", 3);
      g.put(px - 1, 10, "/|\\", 3);
      g.put(px - 1, 11, step ? "/ \\" : " | ", 3);
      if (detected) {
        g.put(px - 2, 8, "┌", 1);
        g.put(px + 2, 8, "┐", 1);
        g.put(px - 2, 12, "└", 1);
        g.put(px + 2, 12, "┘", 1);
        g.put(px - 2, 7, "person 97%", 1);
      }
      g.put(29, 1, blink(t, 1) ? "●" : " ", 1);
      g.put(31, 1, "REC  CAM-01", 3);
      g.put(34, 2, clock(43473 + t), 2);
      if (detected) {
        if (blink(t, 0.5)) g.put(0, 13, "[!] MOTION DETECTED -> telegram", 1);
      } else {
        g.put(0, 13, "motion: none · archive: 30 days", 2);
      }
    },

    /* Мониторинг: живой график нагрузки, тревога и ночной бэкап */
    monitoring(g, t) {
      const shift = Math.floor(t * 5);
      const value = (i) => {
        const k = i + shift;
        let v = 0.45 + 0.16 * Math.sin(k * 0.31) + 0.1 * Math.sin(k * 0.07 + 1) + 0.08 * (hash(k) - 0.5);
        if (k % 47 < 3) v += 0.38;
        return clamp(v, 0.03, 0.99);
      };
      g.put(0, 0, "cpu % · srv01", 3);
      g.put(40, 0, "zabbix", 2);
      const blocks = " ▁▂▃▄▅▆▇█";
      const cols = 41;
      for (let i = 0; i < cols; i++) {
        const v = value(i);
        const h = v * 6;
        for (let r = 0; r < 6; r++) {
          const fromBottom = 5 - r;
          const frac = clamp(h - fromBottom);
          const ch = blocks[Math.round(frac * 8)];
          if (ch !== " ") g.put(5 + i, 1 + r, ch, v > 0.8 ? 1 : 0);
          else if (r === 1) g.put(5 + i, 1 + r, "-", 2);
        }
      }
      g.put(0, 1, "100", 2);
      g.put(0, 4, " 50", 2);
      g.vline(4, 1, 6, 2, "│");
      g.put(0, 7, "  0 └" + "─".repeat(cols), 2);
      const latest = value(cols - 1);
      if (latest > 0.8) {
        if (blink(t, 0.5)) g.put(0, 8, "[!] cpu > 80% -> alert sent to telegram", 1);
      } else {
        g.put(0, 8, "[ok] all systems normal", 2);
      }
      const p = t % 9;
      g.put(0, 10, "$", 1);
      g.put(2, 10, "/opt/backup.sh", 0);
      if (p < 6) {
        g.put(0, 11, "srv -> nas [", 2);
        g.bar(12, 11, 20, p / 6);
        g.put(32, 11, "] " + String(Math.floor((p / 6) * 100)).padStart(3) + "%", 2);
      } else {
        g.put(0, 11, "done · 1.24 GB · 02:00", 3);
      }
      if (p >= 6.5) {
        g.put(0, 12, "restore test: ", 2);
        g.put(14, 12, "OK", 1);
      }
      g.put(0, 13, "next run 02:00 · keep 14 days", 2);
    },
  };

  // Для навыков без своей сцены — универсальная «загрузка».
  function fallback(id) {
    return (g, t) => {
      const spin = "|/-\\";
      g.box(0, 0, W, H, 2, "demo: " + id, 3);
      g.put(4, 5, spin[Math.floor(t * 8) % 4] + " loading " + id + "…", 1);
      g.bar(4, 7, 30, (t % 3) / 3);
    };
  }

  // Кадр для режима без анимации — момент, где видно суть.
  const STILL = { html: 6.5, js: 2.6, css: 1.4, sql: 5.6, node: 1.0, git: 6.2, linux: 1, windows: 6, network: 2.2, servers: 7, cctv: 4.4, monitoring: 3.2 };

  function createPlayer(pre, id) {
    const scene = SCENES[id] || fallback(id);
    const g = makeGrid();
    let raf = 0;
    let started = 0;
    let last = 0;
    pre.style.setProperty("--cols", W);

    function draw(t) {
      g.clear();
      scene(g, t);
      pre.innerHTML = g.html();
    }
    function loop(now) {
      raf = requestAnimationFrame(loop);
      if (now - last < 90) return;
      last = now;
      draw(Math.max(0, now - started) / 1000);
    }
    draw(STILL[id] != null ? STILL[id] : 1);

    return {
      start() {
        if (raf || reduceMotion) return;
        started = performance.now();
        last = 0;
        raf = requestAnimationFrame(loop);
      },
      stop() {
        cancelAnimationFrame(raf);
        raf = 0;
      },
    };
  }

  window.SCENES = { W, H, createPlayer };
})();

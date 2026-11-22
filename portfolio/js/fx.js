/* Общие ASCII-эффекты: расшифровка текста, вращающийся ASCII-логотип, ASCII-баннер из любого текста. */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const GLYPHS = "!<>-_\\/[]{}=+*^?#%@$&01";
  const RAMP = " .:-=+*#%@"; // от тёмного к светлому
  const BLOCKS = " ░▒▓█";
  const randomGlyph = () => GLYPHS[(Math.random() * GLYPHS.length) | 0];
  const randomFrom = (set) => set[(Math.random() * set.length) | 0];
  const easeOutCubic = (p) => 1 - Math.pow(1 - p, 3);
  const easeInOut = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);

  // Цикл анимации: frame(t, p) вызывается каждый кадр; вернуть false — остановить.
  function animate(duration, frame) {
    return new Promise((resolve) => {
      const start = performance.now();
      (function tick(now) {
        const t = Math.min(Math.max(now - start, 0), duration);
        if (frame(t, t / duration) === false) return resolve(false);
        if (t < duration) requestAnimationFrame(tick);
        else resolve(true);
      })(start);
    });
  }

  // «Расшифровка»: случайные символы слева направо превращаются в нужный текст.
  function scramble(node, text, duration = 700) {
    if (reduceMotion) {
      node.textContent = text;
      return Promise.resolve();
    }
    const chars = [...text];
    const last = Math.max(1, chars.length - 1);
    const ends = chars.map((_, i) => duration * (0.3 + 0.7 * (i / last)) * (0.85 + Math.random() * 0.15));
    let glyphs = chars.map(randomGlyph);
    let lastSwap = 0;
    return animate(duration, (t) => {
      if (t - lastSwap > 55) {
        glyphs = chars.map(randomGlyph);
        lastSwap = t;
      }
      node.textContent = chars.map((ch, i) => (ch === " " || t >= ends[i] ? ch : glyphs[i])).join("");
    }).then(() => {
      node.textContent = text;
    });
  }

  // Текст рассыпается в символы и исчезает.
  function scrambleOut(node, duration = 400) {
    const chars = [...node.textContent];
    if (reduceMotion || !chars.length) {
      node.textContent = "";
      return Promise.resolve();
    }
    const ats = chars.map(() => duration * (0.25 + 0.75 * Math.random()));
    return animate(duration, (t) => {
      node.textContent = chars
        .map((ch, i) => (ch === " " || t >= ats[i] ? " " : t >= ats[i] - 160 ? randomGlyph() : ch))
        .join("");
    }).then(() => {
      node.textContent = "";
    });
  }

  /* ---------------------------------------------------------------------
     ASCII-логотип: из сетки яркости рисуется под любым углом.
     Два слоя <pre>: серебро (.ascii-silver) и красные камни (.ascii-red).
     --------------------------------------------------------------------- */
  function createAsciiArt(container, art) {
    const silverPre = container.querySelector(".ascii-silver");
    const redPre = container.querySelector(".ascii-red");
    const { cols, rows, size: N } = art;
    const total = cols * rows;
    container.style.setProperty("--cols", cols);

    const ALPHA = "0123456789abcdefghijklmnopqrstuv";
    const lum = new Float32Array(N * N);
    const red = new Uint8Array(N * N);
    art.data.forEach((line, y) => {
      for (let x = 0; x < N; x++) {
        const k = Math.max(0, ALPHA.indexOf(line[x]));
        lum[y * N + x] = (k & 15) / 15;
        red[y * N + x] = k >> 4;
      }
    });

    const chars = new Array(total).fill(" ");
    const reds = new Uint8Array(total);
    const dist = new Float32Array(total);
    const rowOf = new Uint16Array(total);
    const maxDist = Math.hypot((cols / 2) * 0.6, rows / 2);
    for (let i = 0; i < total; i++) {
      const x = i % cols;
      const y = (i / cols) | 0;
      rowOf[i] = y;
      dist[i] = Math.hypot((x - cols / 2) * 0.6, y - rows / 2) / maxDist;
    }

    const SX = [0.3, 0.7];
    const SY = [0.2, 0.5, 0.8];
    // Заполняет chars/reds для угла поворота angle (радианы).
    function sample(angle) {
      const c = Math.cos(angle);
      const s = Math.sin(angle);
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          let sum = 0;
          let redCount = 0;
          for (const oy of SY) {
            for (const ox of SX) {
              const dx = (x + ox) / cols - 0.5;
              const dy = (y + oy) / rows - 0.5;
              const u = c * dx + s * dy + 0.5;
              const v = -s * dx + c * dy + 0.5;
              if (u <= 0 || v <= 0 || u >= 1 || v >= 1) continue;
              const k = ((v * N) | 0) * N + ((u * N) | 0);
              sum += lum[k];
              redCount += red[k];
            }
          }
          const value = sum / 6;
          const isRed = redCount >= 2;
          let ch = value > 0.06 ? RAMP[Math.min(9, (Math.pow(value, 0.8) * 10) | 0)] : " ";
          if (isRed && ch === " ") ch = RAMP[2];
          chars[y * cols + x] = ch;
          reds[y * cols + x] = isRed ? 1 : 0;
        }
      }
    }

    function render(pick) {
      let silver = "";
      let redText = "";
      for (let i = 0; i < total; i++) {
        const base = chars[i];
        const ch = base === " " || !pick ? base : pick(i);
        if (reds[i]) {
          silver += " ";
          redText += ch;
        } else {
          silver += ch;
          redText += " ";
        }
        if ((i + 1) % cols === 0) {
          silver += "\n";
          redText += "\n";
        }
      }
      silverPre.textContent = silver;
      redPre.textContent = redText;
    }

    // Каждая новая анимация отменяет предыдущую.
    let job = 0;
    let busy = false;
    let visible = false;
    function run(duration, frame) {
      const id = ++job;
      busy = true;
      return animate(duration, (t, p) => (id !== job ? false : frame(t, p))).then((done) => {
        if (id === job) busy = false;
        return done;
      });
    }

    sample(0);

    const api = {
      get busy() {
        return busy;
      },
      show() {
        job++;
        busy = false;
        visible = true;
        sample(0);
        render();
      },
      clear() {
        job++;
        busy = false;
        visible = false;
        render(() => " ");
      },
      // Логотип собирается из символов от центра наружу.
      decode(duration = 1200) {
        if (reduceMotion) {
          api.show();
          return Promise.resolve();
        }
        sample(0);
        visible = true;
        const at = Array.from(dist, (d) => d * duration * 0.75 + Math.random() * duration * 0.25);
        return run(duration, (t) => render((i) => (t >= at[i] ? chars[i] : t >= at[i] - 280 ? randomGlyph() : " "))).then(
          (done) => done && render()
        );
      },
      // Рассыпается от краёв к центру.
      vanish(duration = 450) {
        if (!visible || reduceMotion) {
          api.clear();
          return Promise.resolve();
        }
        const at = Array.from(dist, (d) => (1 - d) * duration * 0.7 + Math.random() * duration * 0.3);
        return run(duration, (t) => render((i) => (t >= at[i] ? " " : t >= at[i] - 200 ? randomGlyph() : chars[i]))).then(
          () => api.clear()
        );
      },
      // Поворот на turns оборотов с замедлением в конце.
      spin(turns = 1, duration = 1600) {
        if (reduceMotion) return Promise.resolve();
        visible = true;
        return run(duration, (t, p) => {
          sample(easeOutCubic(p) * turns * Math.PI * 2);
          render();
        }).then((done) => {
          if (done) {
            sample(0);
            render();
          }
        });
      },
      // Короткий сбой «сигнала» в нескольких строках.
      glitch() {
        if (reduceMotion || busy || !visible) return;
        const from = (Math.random() * (rows - 6)) | 0;
        const to = from + 2 + ((Math.random() * 4) | 0);
        container.classList.add("is-glitching");
        run(180, () => render((i) => (rowOf[i] >= from && rowOf[i] < to && Math.random() < 0.55 ? randomGlyph() : chars[i]))).then(
          () => {
            container.classList.remove("is-glitching");
            render();
          }
        );
      },
    };
    return api;
  }

  /* ---------------------------------------------------------------------
     ASCII-баннер: текст рисуется на холсте и переводится в блоки █▓▒░.
     Работает с любым алфавитом, включая кириллицу.
     --------------------------------------------------------------------- */
  function textToAscii(textLines, rowsPerLine = 7) {
    const SIZE = 120;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const font = `800 ${SIZE}px "JetBrains Mono", ui-monospace, Menlo, Consolas, monospace`;

    const rendered = textLines.map((text) => {
      ctx.font = font;
      const m = ctx.measureText(text);
      const ascent = Math.ceil(m.actualBoundingBoxAscent || SIZE * 0.8);
      const descent = Math.ceil(m.actualBoundingBoxDescent || 0);
      const width = Math.ceil(m.width) + 4;
      const height = ascent + descent + 4;
      canvas.width = width;
      canvas.height = height;
      ctx.font = font;
      ctx.fillStyle = "#fff";
      ctx.fillText(text, 2, ascent + 2);
      const pixels = ctx.getImageData(0, 0, width, height).data;

      const cellH = height / rowsPerLine;
      const cellW = cellH * 0.6;
      const cols = Math.ceil(width / cellW);
      const out = [];
      for (let r = 0; r < rowsPerLine; r++) {
        let line = "";
        for (let c = 0; c < cols; c++) {
          let sum = 0;
          let n = 0;
          for (let sy = 0.2; sy < 1; sy += 0.3) {
            for (let sx = 0.2; sx < 1; sx += 0.3) {
              const px = Math.min(width - 1, ((c + sx) * cellW) | 0);
              const py = Math.min(height - 1, ((r + sy) * cellH) | 0);
              sum += pixels[(py * width + px) * 4 + 3] / 255;
              n++;
            }
          }
          const cover = sum / n;
          line += cover < 0.12 ? " " : BLOCKS[Math.min(4, 1 + ((cover * 4) | 0))];
        }
        out.push(line);
      }
      return out;
    });

    const cols = Math.max(...rendered.map((lines) => lines[0].length));
    const result = [];
    rendered.forEach((lines, i) => {
      if (i > 0) result.push("");
      lines.forEach((line) => {
        const pad = Math.floor((cols - line.length) / 2);
        result.push(" ".repeat(pad) + line);
      });
    });
    return result.map((line) => line.padEnd(cols));
  }

  function createBanner(container, lines) {
    const pre = container.querySelector("pre");
    const cols = lines[0].length;
    const text = lines.join("\n");
    const chars = [...text];
    const colOf = chars.map((_, i) => i % (cols + 1));
    container.style.setProperty("--cols", cols);

    let job = 0;
    let visible = false;
    function run(duration, frame) {
      const id = ++job;
      return animate(duration, (t, p) => (id !== job ? false : frame(t, p)));
    }

    const api = {
      show() {
        job++;
        visible = true;
        pre.textContent = text;
      },
      clear() {
        job++;
        visible = false;
        pre.textContent = "";
      },
      // Проявляется слева направо, как при сканировании.
      decode(duration = 1000) {
        if (reduceMotion) {
          api.show();
          return Promise.resolve();
        }
        visible = true;
        const at = colOf.map((c) => (c / cols) * duration * 0.7 + Math.random() * duration * 0.3);
        return run(duration, (t) => {
          pre.textContent = chars
            .map((ch, i) => {
              if (ch === "\n" || t >= at[i]) return ch;
              if (t < at[i] - 180) return " ";
              return ch === " " ? (Math.random() < 0.12 ? "░" : " ") : randomGlyph();
            })
            .join("");
        }).then((done) => done && api.show());
      },
      vanish(duration = 450) {
        if (!visible || reduceMotion) {
          api.clear();
          return Promise.resolve();
        }
        const at = colOf.map(() => Math.random() * duration * 0.85);
        return run(duration, (t) => {
          pre.textContent = chars
            .map((ch, i) => (ch === "\n" || ch === " " ? ch : t >= at[i] ? " " : t >= at[i] - 150 ? randomFrom(BLOCKS) : ch))
            .join("");
        }).then(() => api.clear());
      },
    };
    return api;
  }

  // Логотип строками заданного размера (для neofetch в терминале): { silver: [...], red: [...] }.
  function logoLines(art, cols, rows) {
    const ALPHA = "0123456789abcdefghijklmnopqrstuv";
    const N = art.size;
    const silver = [];
    const red = [];
    for (let y = 0; y < rows; y++) {
      let s = "";
      let r = "";
      for (let x = 0; x < cols; x++) {
        let sum = 0;
        let redCount = 0;
        for (const oy of [0.25, 0.75]) {
          for (const ox of [0.25, 0.75]) {
            const u = (x + ox) / cols;
            const v = (y + oy) / rows;
            const k = Math.max(0, ALPHA.indexOf(art.data[(v * N) | 0][(u * N) | 0]));
            sum += (k & 15) / 15;
            redCount += k >> 4;
          }
        }
        const value = sum / 4;
        let ch = value > 0.06 ? RAMP[Math.min(9, (Math.pow(value, 0.8) * 10) | 0)] : " ";
        if (redCount >= 2) {
          if (ch === " ") ch = RAMP[2];
          s += " ";
          r += ch;
        } else {
          s += ch;
          r += " ";
        }
      }
      silver.push(s);
      red.push(r);
    }
    return { silver, red };
  }

  window.FX = {
    logoLines,
    reduceMotion,
    GLYPHS,
    randomFrom,
    animate,
    easeInOut,
    scramble,
    scrambleOut,
    createAsciiArt,
    textToAscii,
    createBanner,
  };
})();

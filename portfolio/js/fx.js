/* Общие ASCII-эффекты: расшифровка текста и вращающийся ASCII-логотип. */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const GLYPHS = "!<>-_\\/[]{}=+*^?#%@$&01";
  const RAMP = " .:-=+*#%@"; // от тёмного к светлому
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
    createAsciiArt,
  };
})();

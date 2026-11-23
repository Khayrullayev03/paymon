/* Анимированный ASCII-фон:
 *  - алая луна из символов: кратеры, объём, медленное вращение, багровое свечение, плывущие облака;
 *  - мерцающие звёзды;
 *  - движущиеся «линии уровня» внизу экрана (вокруг курсора — гуще и ярче);
 *  - режим матрицы (пасхалка, команда matrix) — падающие столбцы символов.
 * Цвета — из CSS-переменных (--moon-*, --field-*), поэтому фон подстраивается под тему. */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canvas = document.createElement("canvas");
  canvas.className = "ascii-bg";
  canvas.setAttribute("aria-hidden", "true");
  document.body.prepend(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const RAMP = " .:-=+*#%@";
  const MOON_RAMP = " .:;+x*%#@"; // без «горизонтальных» символов — луна не выглядит полосатой
  const RAIN = "01<>/\\[]{}=+*#$%&ABCDEFXYZ";
  const FONT_PX = 13;
  const LINE_PX = 18;
  const GLOW_RADIUS = 140;

  let colors = {};
  let width = 0;
  let height = 0;
  let cellW = 8;
  let cols = 0;
  let rows = 0;
  let pointerX = -9999;
  let pointerY = -9999;
  let mode = "contour";
  let scene = "home";
  let drops = [];

  /* ---------- текстура луны: моря и кратеры (своя, сгенерированная) ---------- */
  const TEX_W = 180;
  const TEX_H = 90;
  const tex = new Float32Array(TEX_W * TEX_H);
  (function buildMoon() {
    let seed = 20261123;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    for (let y = 0; y < TEX_H; y++) {
      for (let x = 0; x < TEX_W; x++) {
        const u = (x / TEX_W) * Math.PI * 2;
        const v = (y / TEX_H) * Math.PI;
        tex[y * TEX_W + x] = 0.72 + 0.08 * Math.sin(u * 3 + v * 2) + 0.06 * Math.sin(u * 7 - v * 5) + 0.05 * Math.sin(u * 13 + v * 11);
      }
    }
    const stamp = (cu, cv, r, depth, rim) => {
      for (let y = 0; y < TEX_H; y++) {
        for (let x = 0; x < TEX_W; x++) {
          let du = Math.abs(x / TEX_W - cu);
          du = Math.min(du, 1 - du) * 2;
          const d = Math.hypot(du, y / TEX_H - cv) / r;
          if (d < 1) tex[y * TEX_W + x] -= depth * (1 - d * d);
          else if (d < 1.25 && rim) tex[y * TEX_W + x] += rim * (1 - (d - 1) / 0.25);
        }
      }
    };
    // тёмные «моря»
    [[0.18, 0.38, 0.2], [0.32, 0.55, 0.16], [0.62, 0.42, 0.22], [0.78, 0.6, 0.14], [0.47, 0.3, 0.12]].forEach(([u, v, r]) => stamp(u, v, r, 0.38, 0));
    // кратеры со светлым валом
    for (let i = 0; i < 40; i++) stamp(rand(), 0.15 + rand() * 0.7, 0.03 + rand() * 0.07, 0.34, 0.2);
    for (let i = 0; i < tex.length; i++) tex[i] = Math.min(1, Math.max(0.05, tex[i]));
  })();

  function readColors() {
    const css = getComputedStyle(document.documentElement);
    const v = (name, fallback) => css.getPropertyValue(name).trim() || fallback;
    colors = {
      dim: v("--field-dim", "rgba(214,215,219,0.075)"),
      red: v("--field-red", "rgba(242,51,74,0.2)"),
      hot: v("--field-hot", "rgba(245,246,248,0.32)"),
      moon1: v("--moon-1", "rgba(120,8,26,0.55)"),
      moon2: v("--moon-2", "rgba(205,24,48,0.8)"),
      moon3: v("--moon-3", "rgba(255,110,120,0.95)"),
      glow: v("--moon-glow", "rgba(200,16,40,0.28)"),
      star: v("--star", "rgba(245,220,225,0.6)"),
      cloud: v("--cloud", "rgba(90,24,34,0.5)"),
    };
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.font = `500 ${FONT_PX}px "JetBrains Mono", ui-monospace, Menlo, Consolas, monospace`;
    ctx.textBaseline = "top";
    cellW = ctx.measureText("0").width || 8;
    cols = Math.ceil(width / cellW) + 1;
    rows = Math.ceil(height / LINE_PX) + 1;
    drops = Array.from({ length: cols }, () => ({
      y: Math.random() * -rows,
      speed: 0.25 + Math.random() * 0.6,
      len: 6 + Math.random() * 14,
    }));
  }

  // Положение и размер луны: на главной — крупная справа сверху, на страницах — меньше и тусклее
  function moonGeometry() {
    const mobile = width < 720;
    const home = scene === "home";
    let R = mobile ? width * (home ? 0.4 : 0.3) : Math.min(width, height) * (home ? 0.27 : 0.22);
    let cx = mobile ? width * 0.72 : home ? width * 0.82 : width - R * 0.45;
    let cy = mobile ? height * (home ? 0.24 : 0.16) : home ? height * 0.42 : R * 0.95 + 40;
    if (pointerX > -9000) {
      cx -= (pointerX - width / 2) * 0.02;
      cy -= (pointerY - height / 2) * 0.02;
    }
    return { cx, cy, R };
  }

  const hash2 = (x, y) => {
    const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return s - Math.floor(s);
  };

  function draw(now) {
    const t = now * 0.00045;
    const scroll = window.scrollY * 0.004;
    const moon = moonGeometry();
    const rot = now * 0.000012; // медленное вращение луны
    const moonAlpha = scene === "home" ? 1 : 0.45;
    const tick = Math.floor(now / 120);
    const matrix = mode === "matrix";

    if (matrix) {
      drops.forEach((d) => {
        d.y += d.speed;
        if (d.y - d.len > rows) {
          d.y = Math.random() * -10;
          d.speed = 0.25 + Math.random() * 0.6;
          d.len = 6 + Math.random() * 14;
        }
      });
    }

    ctx.clearRect(0, 0, width, height);

    // багровое свечение вокруг луны
    ctx.globalAlpha = moonAlpha;
    const glow = ctx.createRadialGradient(moon.cx, moon.cy, moon.R * 0.7, moon.cx, moon.cy, moon.R * 2.6);
    glow.addColorStop(0, colors.glow);
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);

    for (let y = 0; y < rows; y++) {
      const py = y * LINE_PX;
      const fy = y * 0.2 + scroll;
      const rowFrac = y / rows;
      let dim = "";
      let red = "";
      let hot = "";
      let m1 = "";
      let m2 = "";
      let m3 = "";
      let star = "";
      let cloud = "";

      for (let x = 0; x < cols; x++) {
        const px = x * cellW + cellW / 2;
        const dx = (px - moon.cx) / moon.R;
        const dy = (py + LINE_PX / 2 - moon.cy) / moon.R;
        const d2 = dx * dx + dy * dy;
        let mc = " ";
        let ml = 0;
        let sc = " ";
        let cc = " ";
        let fd = " ";
        let fl = 0;

        // облака (полосы, плывут влево)
        const band = Math.sin(y * 0.55 + 1.3) * Math.sin(x * 0.045 + now * 0.00006 + y * 0.9);
        const isCloud = band > 0.82 && rowFrac < 0.75;

        if (d2 < 1) {
          // луна: объём (освещение сверху слева), текстура, затемнение к краю
          // свет падает сверху слева: освещённая сторона плотная, теневая — редкие точки
          const z = Math.sqrt(1 - d2);
          const light = Math.max(0, -dx * 0.55 - dy * 0.45 + z * 0.7);
          let lon = Math.atan2(dx, z) / (Math.PI * 2) + rot;
          lon -= Math.floor(lon);
          const lat = Math.asin(Math.max(-1, Math.min(1, dy))) / Math.PI + 0.5;
          const texel = tex[Math.min(TEX_H - 1, (lat * TEX_H) | 0) * TEX_W + ((lon * TEX_W) | 0)];
          const b = Math.min(1, (0.05 + 0.95 * Math.pow(light, 1.15)) * texel * (0.55 + 0.45 * z) * 1.25);
          if (isCloud) {
            cc = band > 0.9 ? "≈" : "~";
          } else if (d2 > 0.9 && light > 0.12) {
            // светлый край диска
            mc = light > 0.45 ? "@" : "%";
            ml = light > 0.45 ? 3 : 2;
          } else if (b > 0.04 || (x + y) % 3 === 0) {
            mc = MOON_RAMP[Math.max(1, Math.min(9, (b * 10) | 0))];
            ml = b > 0.6 ? 3 : b > 0.3 ? 2 : 1;
          }
        } else if (isCloud && d2 < 4) {
          cc = "~";
        } else {
          // звёзды — в верхней части, не у луны
          const h = hash2(x, y);
          if (rowFrac < 0.6 && h > 0.993 && d2 > 1.4) {
            const tw = Math.sin(now * 0.002 + h * 60);
            if (tw > -0.2) sc = tw > 0.85 && h > 0.997 ? "+" : "·";
          }
          if (matrix) {
            const drop = drops[x];
            const dist = drop.y - y;
            if (dist >= 0 && dist <= drop.len) {
              const seed = Math.sin((x * 31 + y * 17 + Math.floor(tick / (2 + (x % 3)))) * 12.9898) * 43758.5453;
              fd = RAIN[Math.floor((seed - Math.floor(seed)) * RAIN.length)];
              fl = dist < 1 ? 3 : dist < drop.len * 0.45 ? 2 : 1;
              sc = " ";
            }
          } else if (d2 > 1.15 && rowFrac > 0.35) {
            // линии уровня рельефа — внизу экрана
            const fx = x * 0.1;
            const v =
              (Math.sin(fx + t * 1.2) +
                Math.sin(fy * 0.9 - t * 0.8) +
                Math.sin(fx * 0.7 + fy * 0.6 + t * 0.5) +
                Math.sin(Math.hypot(fx - 10, fy - 6) * 0.8 - t * 1.6) +
                4) /
              8;
            let glowP = 0;
            const gx = px - pointerX;
            const gy = py - pointerY;
            if (gx < GLOW_RADIUS && gx > -GLOW_RADIUS && gy < GLOW_RADIUS && gy > -GLOW_RADIUS) {
              glowP = Math.max(0, 1 - Math.sqrt(gx * gx + gy * gy) / GLOW_RADIUS);
            }
            const bandV = (v * 7) % 1;
            const hotLine = glowP > 0.25 && bandV < 0.55;
            if (bandV < 0.2 || hotLine) {
              fd = RAMP[Math.min(9, 1 + ((v * 9) | 0))];
              fl = hotLine ? 3 : v > 0.74 ? 2 : 1;
            }
          }
        }

        m1 += ml === 1 ? mc : " ";
        m2 += ml === 2 ? mc : " ";
        m3 += ml === 3 ? mc : " ";
        star += sc;
        cloud += cc;
        dim += fl === 1 ? fd : " ";
        red += fl === 2 ? fd : " ";
        hot += fl === 3 ? fd : " ";
      }

      // нижние линии ярче, к верху исчезают
      ctx.globalAlpha = matrix ? 1 : Math.min(1, Math.max(0, (rowFrac - 0.35) / 0.4));
      ctx.fillStyle = colors.dim;
      ctx.fillText(dim, 0, py);
      ctx.fillStyle = colors.red;
      ctx.fillText(red, 0, py);
      ctx.fillStyle = colors.hot;
      ctx.fillText(hot, 0, py);

      ctx.globalAlpha = moonAlpha;
      ctx.fillStyle = colors.moon1;
      ctx.fillText(m1, 0, py);
      ctx.fillStyle = colors.moon2;
      ctx.fillText(m2, 0, py);
      ctx.fillStyle = colors.moon3;
      ctx.fillText(m3, 0, py);
      ctx.fillStyle = colors.cloud;
      ctx.fillText(cloud, 0, py);
      ctx.globalAlpha = 1;
      ctx.fillStyle = colors.star;
      ctx.fillText(star, 0, py);
    }
  }

  // ~25 кадров в секунду: плавно и бережно к батарее
  let raf = 0;
  let last = 0;
  function loop(now) {
    raf = requestAnimationFrame(loop);
    if (now - last < 40) return;
    last = now;
    draw(now);
  }
  function start() {
    if (!raf && !reduceMotion) raf = requestAnimationFrame(loop);
  }
  function stop() {
    cancelAnimationFrame(raf);
    raf = 0;
  }

  window.addEventListener("resize", () => {
    resize();
    draw(performance.now());
  });
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));

  if (!reduceMotion) {
    window.addEventListener(
      "pointermove",
      (e) => {
        if (e.pointerType !== "mouse") return;
        pointerX = e.clientX;
        pointerY = e.clientY;
      },
      { passive: true }
    );
    document.addEventListener("mouseleave", () => {
      pointerX = pointerY = -9999;
    });
  }

  readColors();
  resize();
  draw(performance.now());
  start();
  // Когда загрузится шрифт, ширина символа может измениться
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      resize();
      draw(performance.now());
    });
  }

  window.BG = {
    get mode() {
      return mode;
    },
    setMode(next) {
      mode = next === "matrix" ? "matrix" : "contour";
      draw(performance.now());
      return mode;
    },
    toggleMatrix() {
      return this.setMode(mode === "matrix" ? "contour" : "matrix");
    },
    setScene(next) {
      scene = next === "home" ? "home" : "page";
      draw(performance.now());
    },
    refreshColors() {
      readColors();
      draw(performance.now());
    },
  };
})();

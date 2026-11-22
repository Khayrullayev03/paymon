/* Анимированный ASCII-фон: движущиеся «линии уровня», как на топографической карте, из символов.
 * Вокруг курсора поле проявляется целиком, при прокрутке линии смещаются. */
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
  const FONT_PX = 13;
  const LINE_PX = 20;
  const GLOW_RADIUS = 140;
  const COLOR_DIM = "rgba(214, 215, 219, 0.09)";
  const COLOR_RED = "rgba(242, 51, 74, 0.26)";
  const COLOR_HOT = "rgba(245, 246, 248, 0.32)";

  let width = 0;
  let height = 0;
  let cellW = 8;
  let cols = 0;
  let rows = 0;
  let pointerX = -9999;
  let pointerY = -9999;

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
  }

  function draw(now) {
    const t = now * 0.00045;
    const scroll = window.scrollY * 0.004;
    ctx.clearRect(0, 0, width, height);

    for (let y = 0; y < rows; y++) {
      const py = y * LINE_PX;
      const fy = y * 0.2 + scroll;
      let dim = "";
      let red = "";
      let hot = "";
      let hasHot = false;

      for (let x = 0; x < cols; x++) {
        const fx = x * 0.1;
        // Сумма волн даёт «жидкий» рельеф высотой от 0 до 1
        const v =
          (Math.sin(fx + t * 1.2) +
            Math.sin(fy * 0.9 - t * 0.8) +
            Math.sin(fx * 0.7 + fy * 0.6 + t * 0.5) +
            Math.sin(Math.hypot(fx - 10, fy - 6) * 0.8 - t * 1.6) +
            4) /
          8;

        let glow = 0;
        const dx = x * cellW - pointerX;
        const dy = py - pointerY;
        if (dx < GLOW_RADIUS && dx > -GLOW_RADIUS && dy < GLOW_RADIUS && dy > -GLOW_RADIUS) {
          glow = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / GLOW_RADIUS);
        }

        // Символ ставится только на «линиях уровня» рельефа; у курсора линии гуще и ярче
        const band = (v * 7) % 1;
        const hotLine = glow > 0.25 && band < 0.55;
        if (band >= 0.2 && !hotLine) {
          dim += " ";
          red += " ";
          hot += " ";
          continue;
        }
        const ch = RAMP[Math.min(9, 1 + ((v * 9) | 0))];
        if (hotLine) {
          hot += ch;
          dim += " ";
          red += " ";
          hasHot = true;
        } else if (v > 0.74) {
          red += ch;
          dim += " ";
          hot += " ";
        } else {
          dim += ch;
          red += " ";
          hot += " ";
        }
      }

      ctx.fillStyle = COLOR_DIM;
      ctx.fillText(dim, 0, py);
      ctx.fillStyle = COLOR_RED;
      ctx.fillText(red, 0, py);
      if (hasHot) {
        ctx.fillStyle = COLOR_HOT;
        ctx.fillText(hot, 0, py);
      }
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
})();

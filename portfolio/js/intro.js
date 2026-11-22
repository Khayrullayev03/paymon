/* ASCII-интро: загрузка «системы» → логотип собирается и вращается → приветствие и имя-баннер
 * → всё рассыпается в символы → сканирующая полоса «печатает» сайт сверху вниз.
 * Повторить можно командой reboot в терминале (window.INTRO.play()). */
(function () {
  "use strict";

  const root = document.documentElement;
  const site = document.querySelector("[data-site]");
  const firstNode = document.querySelector("[data-intro]");
  const FX = window.FX;
  const I18N = window.I18N;
  const SOUND = window.SOUND || { key() {}, tick() {}, beep() {} };

  function release() {
    root.classList.remove("intro-active");
    root.style.overflow = "";
    if (site) site.style.clipPath = "";
    document.dispatchEvent(new Event("intro:done"));
  }

  if (!firstNode || !site || !FX || !I18N || !window.ASCII_LOGO) {
    if (firstNode) firstNode.remove();
    release();
    return;
  }

  const template = firstNode.cloneNode(true);
  const { scrambleOut, createAsciiArt, textToAscii, createBanner, animate, easeInOut, randomFrom, GLYPHS, reduceMotion } = FX;
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  let running = false;

  function play(intro) {
    running = true;
    root.classList.add("intro-active");
    root.style.overflow = "hidden";
    I18N.apply(intro);

    const profile = window.PORTFOLIO.profile;
    const NAME = I18N.pick(profile.name);
    const ROLE = I18N.pick(profile.role);
    const boot = intro.querySelector("[data-boot]");
    const bootLines = intro.querySelector("[data-boot-lines]");
    const progress = intro.querySelector("[data-progress]");
    const stage = intro.querySelector("[data-stage]");
    const lines = [...intro.querySelectorAll("[data-line]")];
    const enter = intro.querySelector("[data-enter]");
    const bannerBox = intro.querySelector("[data-banner]");
    const logo = createAsciiArt(intro.querySelector("[data-intro-ascii]"), window.ASCII_LOGO);
    bannerBox.setAttribute("aria-label", NAME);

    let banner = null;
    let finished = false;
    let introDoneSent = false;

    const BOOT_LINES = ["intro.boot1", "intro.boot2", "intro.boot3", "intro.boot4"].map((k) => I18N.t(k));
    const LINE_PARTS = [
      [{ text: "> ", cls: "ps1" }, { text: I18N.t("intro.welcome") }],
      [{ text: "> ", cls: "ps1" }, { text: I18N.t("intro.nameIs") }],
      [{ text: "> ", cls: "ps1" }, { text: I18N.t("intro.iam", { role: ROLE }) }],
    ];

    const caret = document.createElement("span");
    caret.className = "caret";
    caret.setAttribute("aria-hidden", "true");
    caret.textContent = "▋";

    function sendIntroDone() {
      if (introDoneSent) return;
      introDoneSent = true;
      release();
      site.style.clipPath = site.dataset.clip || "";
    }

    function cleanup() {
      site.style.clipPath = "";
      delete site.dataset.clip;
      intro.remove();
      sendIntroDone();
      running = false;
    }

    // Имя крупными блочными буквами. Ждём шрифт, но не дольше 0,9 с.
    async function buildBanner() {
      try {
        if (document.fonts && document.fonts.load) {
          await Promise.race([document.fonts.load('800 120px "JetBrains Mono"'), wait(900)]);
        }
      } catch (e) {}
      const words = NAME.toUpperCase().split(/\s+/).filter(Boolean);
      const twoLines = words.length > 1 && bannerBox.clientWidth < 640;
      banner = createBanner(bannerBox, textToAscii(twoLines ? words : [words.join(" ")], 10));
    }

    function setProgress(p) {
      const n = Math.round(p * 24);
      progress.textContent = `[${"█".repeat(n)}${"░".repeat(24 - n)}] ${String(Math.round(p * 100)).padStart(3)}%`;
    }

    // Печатает строку посимвольно с мигающим курсором (и щелчками, если включён звук).
    async function typeLine(line, parts, speed) {
      line.append(caret);
      for (const part of parts) {
        const text = document.createTextNode("");
        if (part.cls) {
          const span = document.createElement("span");
          span.className = part.cls;
          span.append(text);
          line.insertBefore(span, caret);
        } else {
          line.insertBefore(text, caret);
        }
        for (const ch of part.text) {
          if (finished) return;
          text.data += ch;
          if (ch !== " ") SOUND.key();
          await wait(speed);
        }
      }
    }

    function fillLinesInstantly() {
      LINE_PARTS.forEach((parts, i) => {
        lines[i].textContent = "";
        parts.forEach((part) => {
          const span = document.createElement("span");
          if (part.cls) span.className = part.cls;
          span.textContent = part.text;
          lines[i].append(span);
        });
      });
    }

    async function run() {
      const bannerReady = buildBanner();

      if (reduceMotion) {
        boot.hidden = true;
        await bannerReady;
        logo.show();
        banner.show();
        fillLinesInstantly();
        stage.classList.add("is-visible");
        enter.classList.add("is-visible");
        await wait(3000);
        finish();
        return;
      }

      // 1. Загрузка «системы» с полосой прогресса
      setProgress(0);
      for (let i = 0; i < BOOT_LINES.length; i++) {
        if (finished) return;
        const row = document.createElement("p");
        const ok = document.createElement("span");
        ok.className = "ok";
        ok.textContent = "[ OK ]";
        row.append(ok, " " + BOOT_LINES[i]);
        bootLines.append(row);
        SOUND.tick();
        const from = i / BOOT_LINES.length;
        const to = (i + 1) / BOOT_LINES.length;
        await animate(230, (t, p) => setProgress(from + (to - from) * p));
      }
      await wait(250);
      if (finished) return;
      boot.classList.add("is-hidden");
      await wait(250);

      // 2. Логотип собирается из символов и делает оборот
      stage.classList.add("is-visible");
      await logo.decode(1200);
      if (finished) return;
      logo.spin(1, 1700);
      await wait(250);

      // 3. Приветствие и имя
      await typeLine(lines[0], LINE_PARTS[0], 24);
      await wait(150);
      await typeLine(lines[1], LINE_PARTS[1], 30);
      await bannerReady;
      if (finished) return;
      SOUND.beep();
      await banner.decode(1000);
      if (finished) return;
      await wait(120);
      await typeLine(lines[2], LINE_PARTS[2], 30);
      if (finished) return;
      enter.classList.add("is-visible");
      await wait(1800);
      finish();
    }

    // Полоса из символов проходит сверху вниз и открывает сайт.
    function scanReveal(duration) {
      const band = document.createElement("div");
      band.className = "scan-band";
      band.setAttribute("aria-hidden", "true");
      const bandRows = [0, 1, 2].map(() => band.appendChild(document.createElement("div")));
      document.body.append(band);

      const viewport = window.innerHeight;
      const siteHeight = site.offsetHeight;
      const width = Math.ceil(window.innerWidth / 6) + 4;
      const row = (set) => Array.from({ length: width }, () => randomFrom(set)).join("");

      site.dataset.clip = `inset(0 0 ${siteHeight}px 0)`;
      intro.classList.add("is-gone");
      sendIntroDone(); // сайт видим (пока под маской), запускаются анимации первого экрана

      return animate(duration, (t, p) => {
        const y = easeInOut(p) * (viewport + 60) - 30;
        site.style.clipPath = `inset(0 0 ${Math.max(0, siteHeight - y)}px 0)`;
        band.style.transform = `translateY(${y - band.offsetHeight / 2}px)`;
        bandRows[0].textContent = row(" ░░▒");
        bandRows[1].textContent = row(GLYPHS);
        bandRows[2].textContent = row("▒▓▓█");
      }).then(() => band.remove());
    }

    async function finish() {
      if (finished) return;
      finished = true;
      document.removeEventListener("keydown", onKey);
      intro.classList.add("is-leaving");

      if (reduceMotion) {
        intro.classList.add("is-gone");
        sendIntroDone();
        setTimeout(cleanup, 350);
        return;
      }

      caret.remove();
      boot.classList.add("is-hidden");
      // 1. Всё на экране рассыпается в символы
      await Promise.all([
        logo.vanish(450),
        banner ? banner.vanish(450) : null,
        ...lines.map((line) => scrambleOut(line, 380)),
      ]);
      // 2. Сканирующая полоса «печатает» сайт
      await scanReveal(900);
      cleanup();
    }

    function onKey(event) {
      if (["Escape", "Enter", " "].includes(event.key)) {
        event.preventDefault();
        finish();
      }
    }

    document.addEventListener("keydown", onKey);
    intro.addEventListener("click", finish);
    run().catch(finish);
  }

  play(firstNode);

  window.INTRO = {
    play() {
      if (running) return;
      window.scrollTo({ top: 0, behavior: "instant" });
      const node = template.cloneNode(true);
      site.before(node);
      play(node);
    },
  };
})();

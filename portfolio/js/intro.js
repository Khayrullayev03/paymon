/* Интро: загрузка «системы» → ASCII-логотип → настоящий логотип → приветствие → выключение «экрана». */
(function () {
  "use strict";

  const root = document.documentElement;
  const intro = document.querySelector("[data-intro]");
  const FX = window.FX;
  const profile = (window.PORTFOLIO && window.PORTFOLIO.profile) || {};

  let finished = false;
  let introDoneSent = false;

  function sendIntroDone() {
    if (introDoneSent) return;
    introDoneSent = true;
    document.dispatchEvent(new Event("intro:done"));
  }

  function cleanup() {
    root.classList.remove("intro-active");
    root.style.overflow = "";
    if (intro) intro.remove();
    sendIntroDone();
  }

  if (!intro || !FX || !window.ASCII_LOGO) {
    cleanup();
    return;
  }

  const { scramble, createAsciiArt, reduceMotion } = FX;
  const boot = intro.querySelector("[data-boot]");
  const stage = intro.querySelector("[data-stage]");
  const lines = [...intro.querySelectorAll("[data-line]")];
  const enter = intro.querySelector("[data-enter]");
  const art = createAsciiArt(intro.querySelector("[data-intro-ascii]"), window.ASCII_LOGO);

  const NAME = profile.name || "";
  const ROLE = profile.role || "";
  const BOOT_LINES = [
    "Загрузка ядра anvar-os",
    "Поднятие сетевых интерфейсов",
    "Монтирование /home/portfolio",
    "Запуск служб",
  ];

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const caret = document.createElement("span");
  caret.className = "caret";
  caret.setAttribute("aria-hidden", "true");
  caret.textContent = "▋";

  root.style.overflow = "hidden";

  // Печатает строку посимвольно; parts — куски текста, cls — класс для выделения.
  async function typeLine(line, parts, speed) {
    line.append(caret);
    for (const part of parts) {
      const text = document.createTextNode("");
      if (part.cls) {
        const span = document.createElement("span");
        span.className = part.cls;
        span.append(text);
        line.insertBefore(span, caret);
        if (part.scramble) {
          await scramble(span, part.text, 650);
          continue;
        }
      } else {
        line.insertBefore(text, caret);
      }
      for (const ch of part.text) {
        if (finished) return;
        text.data += ch;
        await wait(speed);
      }
    }
  }

  const LINE_PARTS = [
    [{ text: "Добро пожаловать в моё портфолио" }],
    [{ text: "Меня зовут " }, { text: NAME, cls: "accent", scramble: true }],
    [{ text: `Я ${ROLE}` }],
  ];

  function fillLinesInstantly() {
    LINE_PARTS.forEach((parts, i) => {
      lines[i].textContent = "";
      parts.forEach((part) => {
        if (part.cls) {
          const span = document.createElement("span");
          span.className = part.cls;
          span.textContent = part.text;
          lines[i].append(span);
        } else lines[i].append(part.text);
      });
    });
  }

  async function run() {
    if (reduceMotion) {
      art.clear();
      fillLinesInstantly();
      intro.classList.add("is-logo");
      stage.classList.add("is-visible");
      enter.classList.add("is-visible");
      await wait(3000);
      finish();
      return;
    }

    // 1. Загрузка «системы»
    for (const text of BOOT_LINES) {
      if (finished) return;
      const row = document.createElement("p");
      const ok = document.createElement("span");
      ok.className = "ok";
      ok.textContent = "[ OK ]";
      row.append(ok, " " + text);
      boot.append(row);
      await wait(150);
    }
    await wait(300);
    if (finished) return;
    boot.classList.add("is-hidden");
    await wait(250);

    // 2. ASCII-логотип собирается из символов
    art.clear();
    stage.classList.add("is-visible");
    await art.decode(1300);
    if (finished) return;
    await wait(200);

    // 3. ASCII превращается в настоящий логотип с бликом
    intro.classList.add("is-logo");
    await wait(800);

    // 4. Приветствие
    for (let i = 0; i < LINE_PARTS.length; i++) {
      if (finished) return;
      await typeLine(lines[i], LINE_PARTS[i], i === 0 ? 26 : 34);
      await wait(200);
    }
    if (finished) return;
    enter.classList.add("is-visible");
    await wait(2200);
    finish();
  }

  function finish() {
    if (finished) return;
    finished = true;
    document.removeEventListener("keydown", onKey);
    if (reduceMotion) {
      intro.classList.add("is-fading");
      sendIntroDone();
      setTimeout(cleanup, 350);
      return;
    }
    // «Выключение» экрана как у старого монитора
    intro.classList.add("is-off");
    setTimeout(sendIntroDone, 420);
    setTimeout(cleanup, 950);
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
})();

/* Звуки интерфейса (щелчки клавиш, сигналы) синтезируются Web Audio — без файлов.
 * По умолчанию выключены. Браузер даёт играть звук только после первого клика или клавиши. */
(function () {
  "use strict";

  let enabled = false;
  try {
    enabled = localStorage.getItem("sound") === "on";
  } catch (e) {}

  let ctx = null;
  function context() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    if (!ctx) ctx = new AudioCtx();
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    return ctx;
  }

  function tone(freq, duration, type, volume) {
    if (!enabled) return;
    const c = context();
    if (!c || c.state !== "running") return;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + duration);
    osc.connect(gain).connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + duration);
  }

  // Первое действие пользователя «будит» звук, если он был включён раньше.
  const unlock = () => {
    if (enabled) context();
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("keydown", unlock);
  };
  window.addEventListener("pointerdown", unlock);
  window.addEventListener("keydown", unlock);

  window.SOUND = {
    get enabled() {
      return enabled;
    },
    set(on) {
      enabled = Boolean(on);
      try {
        localStorage.setItem("sound", enabled ? "on" : "off");
      } catch (e) {}
      if (enabled) {
        context();
        setTimeout(() => tone(880, 0.08, "triangle", 0.05), 30);
      }
      document.dispatchEvent(new CustomEvent("soundchange", { detail: enabled }));
    },
    key: () => tone(1700 + Math.random() * 700, 0.022, "square", 0.018),
    tick: () => tone(950, 0.04, "triangle", 0.04),
    beep: () => tone(520, 0.12, "square", 0.025),
  };
})();

/* Где находится посетитель — для карты мира в терминале (команда whereami).
 * 1) Внешний IP, город и провайдер — из публичного сервиса (ipwho.is, запасной — ipapi.co).
 *    Запрос уходит только когда посетитель открыл терминал.
 * 2) Если сервис недоступен (например, сайт открыт внутри песочницы claude.ai, где внешние запросы
 *    запрещены) — место определяется примерно по часовому поясу браузера, без IP.
 * Локальный IP (внутри домашней сети) браузеры сайтам не раскрывают. */
(function () {
  "use strict";

  // Часовой пояс → [широта, долгота, город]
  const TZ = {
    "Asia/Tashkent": [41.3, 69.3, "Tashkent"],
    "Asia/Samarkand": [39.7, 67.0, "Samarkand"],
    "Asia/Almaty": [43.2, 76.9, "Almaty"],
    "Asia/Bishkek": [42.9, 74.6, "Bishkek"],
    "Asia/Dushanbe": [38.6, 68.8, "Dushanbe"],
    "Asia/Ashgabat": [37.9, 58.4, "Ashgabat"],
    "Asia/Baku": [40.4, 49.9, "Baku"],
    "Asia/Tbilisi": [41.7, 44.8, "Tbilisi"],
    "Asia/Yerevan": [40.2, 44.5, "Yerevan"],
    "Europe/Moscow": [55.8, 37.6, "Moscow"],
    "Europe/Kiev": [50.5, 30.5, "Kyiv"],
    "Europe/Kyiv": [50.5, 30.5, "Kyiv"],
    "Europe/Minsk": [53.9, 27.6, "Minsk"],
    "Europe/Istanbul": [41.0, 29.0, "Istanbul"],
    "Europe/London": [51.5, -0.1, "London"],
    "Europe/Berlin": [52.5, 13.4, "Berlin"],
    "Europe/Paris": [48.9, 2.4, "Paris"],
    "Europe/Madrid": [40.4, -3.7, "Madrid"],
    "Europe/Rome": [41.9, 12.5, "Rome"],
    "Europe/Warsaw": [52.2, 21.0, "Warsaw"],
    "Europe/Amsterdam": [52.4, 4.9, "Amsterdam"],
    "Asia/Dubai": [25.2, 55.3, "Dubai"],
    "Asia/Riyadh": [24.7, 46.7, "Riyadh"],
    "Asia/Tehran": [35.7, 51.4, "Tehran"],
    "Asia/Karachi": [24.9, 67.0, "Karachi"],
    "Asia/Kolkata": [28.6, 77.2, "Delhi"],
    "Asia/Calcutta": [28.6, 77.2, "Delhi"],
    "Asia/Bangkok": [13.8, 100.5, "Bangkok"],
    "Asia/Jakarta": [-6.2, 106.8, "Jakarta"],
    "Asia/Singapore": [1.35, 103.8, "Singapore"],
    "Asia/Shanghai": [31.2, 121.5, "Shanghai"],
    "Asia/Hong_Kong": [22.3, 114.2, "Hong Kong"],
    "Asia/Seoul": [37.6, 127.0, "Seoul"],
    "Asia/Tokyo": [35.7, 139.7, "Tokyo"],
    "Australia/Sydney": [-33.9, 151.2, "Sydney"],
    "Pacific/Auckland": [-36.8, 174.8, "Auckland"],
    "Africa/Cairo": [30.0, 31.2, "Cairo"],
    "Africa/Lagos": [6.5, 3.4, "Lagos"],
    "Africa/Johannesburg": [-26.2, 28.0, "Johannesburg"],
    "America/New_York": [40.7, -74.0, "New York"],
    "America/Toronto": [43.7, -79.4, "Toronto"],
    "America/Chicago": [41.9, -87.6, "Chicago"],
    "America/Denver": [39.7, -105.0, "Denver"],
    "America/Los_Angeles": [34.1, -118.2, "Los Angeles"],
    "America/Mexico_City": [19.4, -99.1, "Mexico City"],
    "America/Sao_Paulo": [-23.5, -46.6, "Sao Paulo"],
    "America/Argentina/Buenos_Aires": [-34.6, -58.4, "Buenos Aires"],
  };

  async function fetchJSON(url, ms) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), ms);
    try {
      const res = await fetch(url, { signal: ctrl.signal, cache: "no-store" });
      if (!res.ok) throw new Error(String(res.status));
      return await res.json();
    } finally {
      clearTimeout(timer);
    }
  }

  const PROVIDERS = [
    async () => {
      const d = await fetchJSON("https://ipwho.is/", 4500);
      if (!d || d.success === false) throw new Error("ipwho.is");
      return {
        ip: d.ip,
        city: d.city,
        region: d.region,
        country: d.country,
        lat: Number(d.latitude),
        lon: Number(d.longitude),
        isp: d.connection && (d.connection.isp || d.connection.org),
      };
    },
    async () => {
      const d = await fetchJSON("https://ipapi.co/json/", 4500);
      if (!d || d.error) throw new Error("ipapi.co");
      return { ip: d.ip, city: d.city, region: d.region, country: d.country_name, lat: Number(d.latitude), lon: Number(d.longitude), isp: d.org };
    },
  ];

  let pending = null;

  function byTimezone() {
    let tz = "UTC";
    try {
      tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    } catch (e) {}
    const known = TZ[tz];
    if (known) return { ip: null, city: known[2], tz, lat: known[0], lon: known[1], source: "tz" };
    const offsetHours = -new Date().getTimezoneOffset() / 60;
    return { ip: null, city: tz, tz, lat: 30, lon: Math.max(-170, Math.min(170, offsetHours * 15)), source: "tz" };
  }

  function locate() {
    if (!pending) {
      pending = (async () => {
        for (const provider of PROVIDERS) {
          try {
            const r = await provider();
            if (r && r.ip && Number.isFinite(r.lat) && Number.isFinite(r.lon)) return { ...r, source: "ip" };
          } catch (e) {}
        }
        return byTimezone();
      })();
    }
    return pending;
  }

  // Локальный IP через WebRTC. Современные браузеры вместо него отдают «маску» вида xxxx.local (mDNS),
  // поэтому чаще всего результат — { status: "hidden" }. Никаких внешних запросов здесь нет.
  let localPending = null;
  function localIP() {
    if (localPending) return localPending;
    localPending = new Promise((resolve) => {
      const RTC = window.RTCPeerConnection || window.webkitRTCPeerConnection;
      if (!RTC) return resolve({ status: "unsupported" });
      const found = new Set();
      let pc = null;
      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        try {
          pc.close();
        } catch (e) {}
        const values = [...found];
        const real = values.filter((v) => !v.endsWith(".local"));
        if (real.length) resolve({ status: "ok", values: real });
        else if (values.length) resolve({ status: "hidden", masked: values[0] });
        else resolve({ status: "hidden" });
      };
      try {
        pc = new RTC({ iceServers: [] });
        pc.createDataChannel("probe");
        pc.onicecandidate = (event) => {
          if (!event.candidate) return finish();
          const m = /\s((?:\d{1,3}\.){3}\d{1,3}|[0-9a-f]{0,4}(?::[0-9a-f]{0,4}){2,7}|[\w-]+\.local)\s/i.exec(event.candidate.candidate + " ");
          if (m) found.add(m[1]);
        };
        pc.createOffer()
          .then((offer) => pc.setLocalDescription(offer))
          .catch(finish);
        setTimeout(finish, 1500);
      } catch (e) {
        resolve({ status: "unsupported" });
      }
    });
    return localPending;
  }

  window.GEO = { locate, localIP };
})();

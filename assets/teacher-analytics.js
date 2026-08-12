(() => {
  "use strict";

  const $ = (selector) => document.querySelector(selector);

  const els = {
    today: $("#todayVisitorCount"),
    total: $("#totalVisitorCount"),
    status: $("#analyticsStatus"),
    refresh: $("#refreshAnalytics"),
    hint: $("#analyticsSetupHint"),
    updated: $("#analyticsUpdatedAt")
  };

  if (!els.today || !els.total || !els.status) return;

  function configuredCode() {
    const raw = window.SITE_ANALYTICS?.goatcounterCode;
    const code = typeof raw === "string" ? raw.trim() : "";
    if (!code || code === "YOUR_GOATCOUNTER_CODE") return "";
    if (!/^[a-zA-Z0-9-]+$/.test(code)) return "";
    return code;
  }

  function tokyoDateString() {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).formatToParts(new Date());

    const map = {};
    parts.forEach((part) => {
      if (part.type !== "literal") map[part.type] = part.value;
    });
    return `${map.year}-${map.month}-${map.day}`;
  }

  function timeString() {
    return new Intl.DateTimeFormat("ja-JP", {
      timeZone: "Asia/Tokyo",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date());
  }

  function setLoading(loading) {
    if (els.refresh) {
      els.refresh.disabled = loading;
      els.refresh.textContent = loading ? "更新中…" : "↻ 更新";
    }
  }

  async function fetchCounter(url) {
    const response = await fetch(url, {
      method: "GET",
      mode: "cors",
      cache: "no-store",
      headers: { "Accept": "application/json" }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const json = await response.json();
    if (!json || typeof json.count === "undefined") {
      throw new Error("count が取得できません");
    }
    return String(json.count);
  }

  async function loadAnalytics() {
    const code = configuredCode();

    if (!code) {
      els.today.textContent = "—";
      els.total.textContent = "—";
      els.status.textContent =
        "アクセス解析はまだ未設定です。assets/analytics-config.js にGoatCounterのCodeを入力してください。";
      els.status.classList.add("warning");
      if (els.hint) els.hint.hidden = false;
      if (els.updated) els.updated.textContent = "";
      return;
    }

    setLoading(true);
    els.status.classList.remove("warning", "error");
    els.status.textContent = "利用状況を取得しています…";
    if (els.hint) els.hint.hidden = true;

    try {
      const today = tokyoDateString();
      const base = `https://${code}.goatcounter.com/counter/TOTAL.json`;

      const [todayCount, totalCount] = await Promise.all([
        fetchCounter(`${base}?start=${encodeURIComponent(today)}&end=${encodeURIComponent(today)}`),
        fetchCounter(base)
      ]);

      els.today.textContent = todayCount;
      els.total.textContent = totalCount;
      els.status.textContent =
        "生徒用サイトの訪問カウントです。GoatCounter側の集計は最大4時間程度遅れることがあります。";
      if (els.updated) els.updated.textContent = `最終確認 ${timeString()}`;
    } catch (error) {
      console.error("Analytics load error:", error);
      els.today.textContent = "取得失敗";
      els.total.textContent = "取得失敗";
      els.status.classList.add("error");
      els.status.textContent =
        "利用状況を取得できませんでした。GoatCounterのCodeと「Allow adding visitor counts on your website」の設定を確認してください。";
      if (els.hint) els.hint.hidden = false;
      if (els.updated) els.updated.textContent = "";
    } finally {
      setLoading(false);
    }
  }

  if (els.refresh) {
    els.refresh.addEventListener("click", loadAnalytics);
  }

  loadAnalytics();
})();

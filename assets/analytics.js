(() => {
  "use strict";

  const rawCode = window.SITE_ANALYTICS?.goatcounterCode;
  const code = typeof rawCode === "string" ? rawCode.trim() : "";

  const isConfigured =
    code &&
    code !== "YOUR_GOATCOUNTER_CODE" &&
    /^[a-zA-Z0-9-]+$/.test(code);

  if (!isConfigured) {
    console.info("Site analytics: GoatCounter code is not configured.");
    return;
  }

  // 生徒用 index.html にだけこのファイルを読み込ませる。
  // 先生用 teacher.html ではトラッキングしない。
  const script = document.createElement("script");
  script.async = true;
  script.src = "https://gc.zgo.at/count.js";
  script.dataset.goatcounter = `https://${code}.goatcounter.com/count`;
  script.onerror = () => {
    console.warn("Site analytics: GoatCounter tracking script could not be loaded.");
  };
  document.head.appendChild(script);
})();

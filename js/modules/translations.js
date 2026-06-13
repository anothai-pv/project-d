let translations = {};

export async function initTranslations() {
  const urlParams = new URLSearchParams(window.location.search);
  const urlLang = urlParams.get("lang");

  const browserLang = (navigator.language || navigator.userLanguage)
    .substring(0, 2)
    .toLowerCase();
  const supportedLangs = ["en", "fr", "nl"];
  const fallbackLang = supportedLangs.includes(browserLang)
    ? browserLang
    : "en";

  const savedLang =
    urlLang || localStorage.getItem("selectedLanguage") || fallbackLang;

  try {
    const response = await fetch("./data/text-translate.json");
    if (!response.ok) throw new Error("Translation file not found");
    translations = await response.json();
    changeLanguage(savedLang);
  } catch (error) {
    console.error("Translation load error:", error);
  }
}

export function changeLanguage(lang, skipPushState = false) {
  if (!translations || Object.keys(translations).length === 0) return;

  $("[data-key]").each(function () {
    const key = $(this).data("key");
    if (translations[lang] && translations[lang][key]) {
      $(this).html(translations[lang][key]);
    }
  });

  $("html").attr("lang", lang);
  localStorage.setItem("selectedLanguage", lang);

  $(".lang-btn").removeClass("active");
  $(`.lang-btn[href="?lang=${lang}"]`).addClass("active");

  if (!skipPushState) {
    const newurl =
      window.location.protocol +
      "//" +
      window.location.host +
      window.location.pathname +
      "?lang=" +
      lang;
    window.history.pushState({ path: newurl }, "", newurl);
  }
}

export function getTranslations() {
  return translations;
}

window.addEventListener("popstate", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const browserLang = (navigator.language || navigator.userLanguage)
    .substring(0, 2)
    .toLowerCase();
  const supportedLangs = ["en", "fr", "nl"];
  const fallbackLang = supportedLangs.includes(browserLang)
    ? browserLang
    : "en";

  const urlLang =
    urlParams.get("lang") ||
    localStorage.getItem("selectedLanguage") ||
    fallbackLang;
  changeLanguage(urlLang, true);
});

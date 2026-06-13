import { getTranslations, changeLanguage } from "./i18n.js";

export function initUI() {
  // Mobile menu toggle
  $(document).on("click", ".collapsible", function () {
    $(".phone-header").toggleClass("opened");
  });

  // Language Switcher
  $(document).on("click", ".lang-btn", function (event) {
    event.preventDefault();
    const lang = $(this).data("lang");
    if (lang) {
      changeLanguage(lang);
    }
  });

  // Smooth Scroll Logic
  $('a[href^="#"]').on("click", function (event) {
    if ($(this).hasClass("car-link")) return;
    const target = $(this).attr("href");
    if (!target || target === "#") return;
    const $targetEl = $(target);
    if ($targetEl.length > 0) {
      event.preventDefault();
      $.scrollTo($targetEl, 800);
    }
  });

  // Price Category Toggle
  $(document).on("click", ".price-category-toggle", function () {
    const $category = $(this).closest(".price-category");
    const $services = $category.find(".price-services");
    const $toggleText = $(this).find(".price-category-text");
    const isOpen = $category.hasClass("open");

    const currentLang = localStorage.getItem("selectedLanguage") || "en";
    const translations = getTranslations();

    if (isOpen) {
      $services.css("max-height", 0);
      $category.removeClass("open");
      $(this).attr("aria-expanded", "false");

      const seeText =
        translations[currentLang] && translations[currentLang]["see_prices"]
          ? translations[currentLang]["see_prices"]
          : "See prices";
      $toggleText.text(seeText);
    } else {
      const targetHeight = $services.prop("scrollHeight");
      $services.css("max-height", `${targetHeight}px`);
      $category.addClass("open");
      $(this).attr("aria-expanded", "true");

      const hideText = {
        en: "Hide prices",
        fr: "Masquer les prix",
        nl: "Verberg prijzen",
      };
      $toggleText.text(hideText[currentLang] || hideText.en);
    }
  });

  // Resize logic for open price categories
  $(window).on("resize", function () {
    $(".price-category.open .price-services").each(function () {
      $(this).css("max-height", `${this.scrollHeight}px`);
    });
  });
}

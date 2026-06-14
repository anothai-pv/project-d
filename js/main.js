import { initTranslations, changeLanguage } from "./modules/translations.js";
import { loadGalleryMedia, nextMedia, prevMedia } from "./modules/gallery.js";
import { initUI } from "./modules/ui.js";
import { initAnimations } from "./modules/animations.js";

$(async function () {
  // Initialize Modules
  await initTranslations();
  loadGalleryMedia(); // Load gallery in background
  initUI();
  initAnimations();

  // Expose changeLanguage to global window for inline onclick handlers if needed
  // although we should ideally move them to event listeners.
  window.changeLanguage = changeLanguage;

  // Gallery Navigation
  $("#left-arrow").on("click", prevMedia);
  $("#right-arrow").on("click", nextMedia);
});

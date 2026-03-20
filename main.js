/* --- Global Variables --- */
let translations = {};
window.galleryImages = [];
let currentIndex = 0;

/* --- Translation Logic --- */
async function initTranslations() {
  try {
    const response = await fetch("./text-translate.json");
    if (!response.ok) throw new Error("Translation file not found");
    translations = await response.json();
    const savedLang = localStorage.getItem("selectedLanguage") || "en";
    window.changeLanguage(savedLang);
  } catch (error) {
    console.error("Translation load error:", error);
  }
}

window.changeLanguage = function (lang) {
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
  $(`.lang-btn[onclick*="${lang}"]`).addClass("active");
};

/* --- Gallery Logic --- */
const BEHOLD_API_URL = "https://feeds.behold.so/N956tEmRytyql1GXjgrM"; // REPLACE THIS
const CACHE_KEY = "behold_gallery_cache";
const CACHE_TIME = 24 * 60 * 60 * 1000;

async function loadGalleryImages() {
  const cachedData = localStorage.getItem(CACHE_KEY);
  const now = new Date().getTime();

  if (cachedData) {
    const parsedCache = JSON.parse(cachedData);
    if (now - parsedCache.timestamp < CACHE_TIME) {
      console.log("Loading gallery from cache...");
      initializeGallery(parsedCache.urls);
      return;
    }
  }

  try {
    const response = await fetch(BEHOLD_API_URL);
    if (!response.ok) throw new Error("Behold API failed");
    const data = await response.json();

    const posts = Array.isArray(data) ? data : data.posts || [];
    if (posts.length === 0) throw new Error("No posts found");

    const urls = posts.map((post) => post.mediaUrl || post.thumbnailUrl);
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ timestamp: now, urls: urls }),
    );
    initializeGallery(urls);
  } catch (error) {
    console.error("Behold failed, using local fallback:", error);

    // Fallback to local images
    const localImages = [];
    let i = 1;
    let foundAll = false;
    while (!foundAll && i <= 100) {
      const path = `./assets/img/gallery/car${i}.jpg`;
      try {
        const response = await fetch(path, { method: "HEAD" });
        if (response.ok) {
          localImages.push(path);
          i++;
        } else {
          foundAll = true;
        }
      } catch (e) {
        foundAll = true;
      }
    }

    // If local fetch fails due to CORS, inject default images manually
    if (localImages.length === 0) {
      localImages.push(
        "assets/img/gallery/car1.jpg",
        "assets/img/gallery/car2.jpg",
        "assets/img/gallery/car3.jpg",
      );
    }

    initializeGallery(localImages);
  }
}

function initializeGallery(urls) {
  window.galleryImages = urls;
  currentIndex = 0;
  updateImages();
}

function updateImages() {
  const imgs = window.galleryImages;
  if (!imgs || imgs.length === 0) return;

  $(".image-container").addClass("blink");

  setTimeout(() => {
    const len = imgs.length;
    $("#img1").attr("src", imgs[(currentIndex - 1 + len) % len]);
    $("#img2").attr("src", imgs[currentIndex]);
    $("#img3").attr("src", imgs[(currentIndex + 1) % len]);
  }, 250);

  setTimeout(() => {
    $(".image-container").removeClass("blink");
  }, 500);
}

/* --- Document Ready --- */
$(function () {
  initTranslations();
  loadGalleryImages();

  // Mobile menu toggle
  $(document).on("click", ".collapsible", function () {
    $(".phone-header").toggleClass("opened");
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

  // Gallery Navigation
  $("#left-arrow").on("click", function () {
    if (window.galleryImages.length === 0) return;
    currentIndex =
      (currentIndex - 1 + window.galleryImages.length) %
      window.galleryImages.length;
    updateImages();
  });

  $("#right-arrow").on("click", function () {
    if (window.galleryImages.length === 0) return;
    currentIndex = (currentIndex + 1) % window.galleryImages.length;
    updateImages();
  });

  // Price Category Toggle
  $(document).on("click", ".price-category-toggle", function () {
    const $category = $(this).closest(".price-category");
    const $services = $category.find(".price-services");
    const $toggleText = $(this).find(".price-category-text");
    const isOpen = $category.hasClass("open");

    const currentLang = localStorage.getItem("selectedLanguage") || "en";

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

  // --- CAR ANIMATION & GSAP LOGIC ---
  const $car = $(".car");
  const $carArea = $(".cardiv");
  const maxRadius = 100;
  const target = { x: 0, y: 0 };
  const current = { x: 0, y: 0 };
  const easing = 0.12;
  let isCarAnimating = false;

  function updateTarget(clientX, clientY) {
    const rect = $carArea[0].getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    let dx = clientX - centerX;
    let dy = 0;
    const distance = Math.hypot(dx, dy);

    if (distance > maxRadius) {
      const scale = maxRadius / distance;
      dx *= scale;
      dy *= scale;
    }

    target.x = dx;
    target.y = dy;
  }

  function animateCar() {
    if (isCarAnimating) {
      requestAnimationFrame(animateCar);
      return;
    }
    current.x += (target.x - current.x) * easing;
    current.y += (target.y - current.y) * easing;
    $car.css("--car-x", `${current.x}px`);
    requestAnimationFrame(animateCar);
  }

  $carArea.on("mousemove", function (event) {
    updateTarget(event.clientX, event.clientY);
  });

  $carArea.on("mouseleave", function () {
    target.x = 0;
    target.y = 0;
  });

  $carArea.on("touchmove", function (event) {
    if (event.originalEvent.touches.length === 0) {
      return;
    }
    const touch = event.originalEvent.touches[0];
    updateTarget(touch.clientX, touch.clientY);
  });

  $carArea.on("touchend touchcancel", function () {
    target.x = 0;
    target.y = 0;
  });

  if ($car.length && $carArea.length) {
    $car.css("--car-x", "0px");
    animateCar();
  }

  $car.on("click", function (event) {
    event.preventDefault();
    isCarAnimating = true;
    const rect = $carArea[0].getBoundingClientRect();
    const offscreenX = rect.width / 2 + window.innerWidth;
    gsap.to($car, {
      duration: 0.6,
      ease: "power2.in",
      "--car-x": `${offscreenX}px`,
      onComplete: function () {
        setTimeout(() => {
          $.scrollTo($("#sec2"), 800);
          setTimeout(() => {
            gsap.to($car, {
              duration: 0.6,
              ease: "power2.out",
              "--car-x": "0px",
              onComplete: function () {
                isCarAnimating = false;
                target.x = 0;
                current.x = 0;
              },
            });
          }, 800);
        }, 300);
      },
    });
  });

  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    if ($(".sec4 .about").length) {
      gsap.to(".sec4 .about", {
        opacity: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".sec4",
          start: "top top",
          end: "+=60%",
          scrub: true,
          pin: true,
          anticipatePin: 1,
        },
      });
    }

    gsap.utils.toArray(".sec5 .grid").forEach((grid) => {
      const imgItems = grid.querySelectorAll(".leftimg, .rightimg");
      const txtItems = grid.querySelectorAll(".lefttxt, .righttxt");
      if (!imgItems.length && !txtItems.length) {
        return;
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: grid,
          start: "center center",
          end: "+=60%",
          scrub: true,
          pin: true,
          anticipatePin: 1,
        },
      });

      if (imgItems.length) {
        tl.to(imgItems, {
          opacity: 1,
          top: 0,
          ease: "power2.out",
          stagger: 0.08,
        });
      }

      if (txtItems.length) {
        tl.to(
          txtItems,
          {
            opacity: 1,
            top: 0,
            ease: "power2.out",
            stagger: 0.08,
          },
          ">-0.15",
        );
      }
    });

    if ($(".sec5 .contact").length) {
      gsap.fromTo(
        ".sec5 .contact",
        { yPercent: 100 },
        {
          yPercent: 0,
          ease: "none",
          scrollTrigger: {
            trigger: ".sec5",
            start: "bottom bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    }
  }
});

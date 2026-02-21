$(function () {
  $('a[href^="#"]').on("click", function (event) {
    if ($(this).hasClass("car-link")) {
      return;
    }
    const target = $(this).attr("href");
    if (!target || target === "#") {
      return;
    }
    const $targetEl = $(target);
    if ($targetEl.length === 0) {
      return;
    }
    event.preventDefault();
    $.scrollTo($targetEl, 800);
  });

const images = [];
let currentIndex = 0;

async function loadImages() {
  let i = 1;
  let foundAll = false;

  while (!foundAll) {
    const path = `./assets/img/gallery/car${i}.jpg`;

    try {
      // Check if the file exists before adding it
      const response = await fetch(path, { method: "HEAD" });

      if (response.ok) {
        images.push(path);
        i++;
      } else {
        foundAll = true; // Stop when we hit a 404
      }
    } catch (error) {
      foundAll = true;
    }

    // Safety break so it doesn't run forever if something goes wrong
    if (i > 100) break;
  }

  // Once loaded, initialize the first set of images
  updateImages();
}

// Start the auto-fetching process
loadImages();

/* --- Your Existing Logic --- */

$("#left-arrow").on("click", function () {
  if (images.length === 0) return;
  currentIndex = (currentIndex - 1 + images.length) % images.length;
  updateImages();
});

$("#right-arrow").on("click", function () {
  if (images.length === 0) return;
  currentIndex = (currentIndex + 1) % images.length;
  updateImages();
});

function updateImages() {
  if (images.length === 0) return; // Don't run if no images found yet

  $(".image-container").addClass("blink");

  setTimeout(() => {
    $("#img1").attr(
      "src",
      images[(currentIndex - 1 + images.length) % images.length],
    );
    $("#img2").attr("src", images[currentIndex]);
    $("#img3").attr("src", images[(currentIndex + 1) % images.length]);
  }, 250);

  setTimeout(() => {
    $(".image-container").removeClass("blink");
  }, 500);
}

  $(".price-category-toggle").on("click", function () {
    const $category = $(this).closest(".price-category");
    const $services = $category.find(".price-services");
    const $toggleText = $(this).find(".price-category-text");
    const isOpen = $category.hasClass("open");

    if (isOpen) {
      $services.css("max-height", 0);
      $category.removeClass("open");
      $(this).attr("aria-expanded", "false");
      $toggleText.text("See prices");
      return;
    }

    const targetHeight = $services.prop("scrollHeight");
    $services.css("max-height", `${targetHeight}px`);
    $category.addClass("open");
    $(this).attr("aria-expanded", "true");
    $toggleText.text("Hide prices");
  });

  $(window).on("resize", function () {
    $(".price-category.open .price-services").each(function () {
      $(this).css("max-height", `${this.scrollHeight}px`);
    });
  });

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
});

export function initAnimations() {
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
    if (event.originalEvent.touches.length === 0) return;
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
      if (!imgItems.length && !txtItems.length) return;

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
        tl.to(txtItems, {
          opacity: 1,
          top: 0,
          ease: "power2.out",
          stagger: 0.08,
        }, ">-0.15");
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
}

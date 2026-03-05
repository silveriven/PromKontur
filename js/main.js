/* =========================================
 *  MAIN.JS: Minimal behaviour (no frameworks)
 * ========================================= */

/* =========================================
 *  HEADER: Sticky readability on scroll
 * ========================================= */
const header = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const desktopBreakpoint = 1024;

const syncHeaderState = () => {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 6);
};

window.addEventListener("scroll", syncHeaderState, { passive: true });
syncHeaderState();

/* =========================================
 *  NAV: Toggle mobile menu
 * ========================================= */
const syncMenuState = (isOpen) => {
  if (!header || !navToggle) return;
  header.classList.toggle("menu-open", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
  navToggle.setAttribute("aria-label", isOpen ? "Закрыть меню навигации" : "Открыть меню навигации");
};

if (header && navToggle) {
  navToggle.addEventListener("click", () => {
    const isOpen = !header.classList.contains("menu-open");
    syncMenuState(isOpen);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > desktopBreakpoint) syncMenuState(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") syncMenuState(false);
  });

  syncMenuState(false);
}


/* =========================================
 *  LINKS: Prevent jump for placeholder anchors
 * ========================================= */
document.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) return;
  const placeholderLink = event.target.closest('a[href="#"]');
  if (!placeholderLink) return;
  event.preventDefault();

  if (header && header.classList.contains("menu-open")) {
    syncMenuState(false);
  }
});

/* =========================================
 *  TRUST: Reveal cards on scroll
 * ========================================= */
const trustSection = document.querySelector(".trust");

if (trustSection) {
  if ("IntersectionObserver" in window) {
    const trustObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          trustSection.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.2 }
    );

    trustObserver.observe(trustSection);
  } else {
    trustSection.classList.add("is-visible");
  }
}

/* =========================================
 *  MODELS: Horizontal carousel controls
 * ========================================= */
const modelsCarousel = document.querySelector("[data-models-carousel]");
const modelsNavButtons = document.querySelectorAll("[data-models-nav]");

if (modelsCarousel && modelsNavButtons.length) {
  const scrollByViewport = (direction) => {
    const step = modelsCarousel.clientWidth * 0.86;
    modelsCarousel.scrollBy({
      left: direction * step,
      behavior: "smooth",
    });
  };

  modelsNavButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const direction = button.getAttribute("data-models-nav") === "prev" ? -1 : 1;
      scrollByViewport(direction);
    });
  });
}

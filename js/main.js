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

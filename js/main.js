/* =========================================
 *  MAIN.JS: Minimal behaviour (no frameworks)
 * ========================================= */

/* =========================================
 * SMART HEADER: Hide Top-Bar on Scroll Down
 * ========================================= */
const header = document.querySelector(".site-header");
const headerElement = document.querySelector(".site-header");
const headerBurger = document.querySelector(".header__burger");
const headerNav = document.querySelector(".header__nav");
const mobileNavBreakpoint = 900;
let lastScrollTop = 0;

if (headerElement) {
  window.addEventListener("scroll", () => {
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

    if (window.innerWidth > 900) {
      if (currentScroll > lastScrollTop && currentScroll > 50) {
        headerElement.classList.add("hide-top-bar");
      } else {
        headerElement.classList.remove("hide-top-bar");
      }
    } else {
      headerElement.classList.remove("hide-top-bar");
    }

    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
  }, { passive: true });
}

/* =========================================
 *  NAV: Toggle mobile menu
 * ========================================= */
const syncMenuState = (isOpen) => {
  if (!header || !headerBurger || !headerNav) return;
  header.classList.toggle("menu-open", isOpen);
  headerNav.classList.toggle("nav-active", isOpen);
  headerBurger.classList.toggle("burger-active", isOpen);
  document.body.classList.toggle("no-scroll", isOpen);
  headerBurger.setAttribute("aria-expanded", String(isOpen));
  headerBurger.setAttribute("aria-label", isOpen ? "Закрыть меню" : "Открыть меню");
};

if (header && headerBurger && headerNav) {
  headerBurger.addEventListener("click", (event) => {
    event.preventDefault();
    const isOpen = !headerNav.classList.contains("nav-active");
    syncMenuState(isOpen);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > mobileNavBreakpoint) syncMenuState(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") syncMenuState(false);
  });

  document.addEventListener("click", (event) => {
    if (window.innerWidth > mobileNavBreakpoint) return;
    if (!(event.target instanceof Node)) return;
    if (!headerNav.classList.contains("nav-active")) return;
    if (headerNav.contains(event.target) || headerBurger.contains(event.target)) return;
    syncMenuState(false);
  });

  headerNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      if (window.innerWidth <= mobileNavBreakpoint) syncMenuState(false);
    });
  });

  syncMenuState(false);
}


/* =========================================
 *  NAV: Catalog dropdown on hover
 * ========================================= */
const catalogMenu = document.querySelector("[data-catalog-menu]");
const catalogMenuTrigger = document.querySelector("[data-catalog-menu-trigger]");
const catalogMenuDropdown = document.querySelector("[data-catalog-menu-dropdown]");

const syncCatalogHeaderCurrentState = () => {
  if (!catalogMenuTrigger) return;

  const pathname = window.location.pathname.toLowerCase();
  const isCatalogPath =
    pathname === "/catalog" ||
    pathname.endsWith("/catalog/") ||
    pathname.endsWith("/catalog/index.html") ||
    pathname.includes("/catalog/");

  if (isCatalogPath) {
    if (catalogMenuTrigger.tagName === "A") {
      catalogMenuTrigger.setAttribute("aria-current", "page");
    } else {
      catalogMenuTrigger.classList.add("is-current");
    }
  } else {
    catalogMenuTrigger.removeAttribute("aria-current");
    catalogMenuTrigger.classList.remove("is-current");
  }
};

syncCatalogHeaderCurrentState();

const syncCatalogMenuState = (isOpen) => {
  if (!catalogMenu || !catalogMenuTrigger) return;
  catalogMenu.classList.toggle("catalog-menu--open", isOpen);
  catalogMenuTrigger.setAttribute("aria-expanded", String(isOpen));
};

if (catalogMenu && catalogMenuTrigger && catalogMenuDropdown) {
  const closeCatalogMenu = () => {
    syncCatalogMenuState(false);
  };

  catalogMenuTrigger.addEventListener("click", (event) => {
    event.preventDefault();
    syncCatalogMenuState(!catalogMenu.classList.contains("catalog-menu--open"));
  });

  window.addEventListener("resize", () => {
    syncCatalogMenuState(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeCatalogMenu();
  });

  document.addEventListener("click", (event) => {
    if (!(event.target instanceof Node)) return;
    if (catalogMenu.contains(event.target)) return;
    closeCatalogMenu();
  });
}

/* =========================================
 *  NAV: Mega menu preview swap
 * ========================================= */
const megaMenuImage = document.getElementById("mega-menu-img");
const megaMenuPreviewLinks = document.querySelectorAll(".mega-menu__link[data-preview]");

if (megaMenuImage && megaMenuPreviewLinks.length) {
  let activePreviewSrc = megaMenuImage.getAttribute("src") || "";

  const swapMegaMenuPreview = (nextSrc) => {
    if (!nextSrc || nextSrc === activePreviewSrc) return;

    const nextImage = new Image();
    nextImage.src = nextSrc;

    const applyNextPreview = () => {
      activePreviewSrc = nextSrc;
      megaMenuImage.style.opacity = "0";

      window.setTimeout(() => {
        megaMenuImage.src = nextSrc;
        megaMenuImage.style.opacity = "1";
      }, 150);
    };

    if (nextImage.complete) {
      applyNextPreview();
      return;
    }

    nextImage.addEventListener("load", applyNextPreview, { once: true });
  };

  megaMenuPreviewLinks.forEach((link) => {
    const previewSrc = link.getAttribute("data-preview");
    if (!previewSrc) return;

    link.addEventListener("mouseenter", () => {
      swapMegaMenuPreview(previewSrc);
    });

    link.addEventListener("focus", () => {
      swapMegaMenuPreview(previewSrc);
    });
  });
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

  const trustLeadButton = trustSection.querySelector(".trust__button");
}

/* =========================================
 *  MODALS: Quiz and consultation
 * ========================================= */
const quizModal = document.querySelector(".quiz-modal");
const quizForm = document.querySelector("[data-quiz-form]");
const consultModal = document.querySelector(".consult-modal");
const modalOpenButtons = document.querySelectorAll("[data-modal]");
const modalCloseButtons = document.querySelectorAll("[data-modal-close]");
const quizSteps = quizModal ? Array.from(quizModal.querySelectorAll("[data-quiz-step]")) : [];
const quizProgressBar = quizModal ? quizModal.querySelector("[data-quiz-progress]") : null;
const quizPrevButton = quizModal ? quizModal.querySelector("[data-quiz-prev]") : null;
const quizNextButton = quizModal ? quizModal.querySelector("[data-quiz-next]") : null;
const quizSubmitButton = quizModal ? quizModal.querySelector("[data-quiz-submit]") : null;
const consultForm = document.querySelector("[data-consult-form]");
const phoneMaskInputs = document.querySelectorAll("[data-consult-phone]");
let quizCurrentStep = 0;
let updateQuizUi = () => {};
let isQuizStepComplete = () => false;

const modalRegistry = {
  "quiz-modal": quizModal,
  "consult-modal": consultModal,
};

const closeModal = (modalId) => {
  const modal = modalRegistry[modalId];
  if (!modal) return;

  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");

  if (!document.querySelector(".quiz-modal.is-open, .consult-modal.is-open")) {
    document.body.classList.remove("modal-open");
  }
};

const openModal = (modalId) => {
  const modal = modalRegistry[modalId];
  if (!modal) return;

  Object.entries(modalRegistry).forEach(([key, entry]) => {
    if (!entry || key === modalId) return;
    entry.classList.remove("is-open");
    entry.setAttribute("aria-hidden", "true");
  });

  if (modalId === "quiz-modal" && quizForm && quizSteps.length) {
    quizCurrentStep = 0;
    updateQuizUi();
  }

  if (modalId === "consult-modal" && consultForm) {
    consultForm.reset();
  }

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
};

if (quizModal && quizForm && quizSteps.length) {
  updateQuizUi = () => {
    quizSteps.forEach((step, index) => {
      step.classList.toggle("is-active", index === quizCurrentStep);
    });

    if (quizProgressBar) {
      const progress = ((quizCurrentStep + 1) / quizSteps.length) * 100;
      quizProgressBar.style.width = `${progress}%`;
    }

    if (quizPrevButton) {
      quizPrevButton.disabled = quizCurrentStep === 0;
      quizPrevButton.hidden = quizCurrentStep === 0;
    }

    const isFinalStep = quizCurrentStep === quizSteps.length - 1;
    quizForm.classList.toggle("is-final-step", isFinalStep);

    if (quizNextButton) {
      quizNextButton.disabled = !isQuizStepComplete(quizCurrentStep) || isFinalStep;
    }

    if (quizSubmitButton) {
      quizSubmitButton.disabled = !isQuizStepComplete(quizCurrentStep);
    }
  };

  isQuizStepComplete = (stepIndex) => {
    const currentStep = quizSteps[stepIndex];
    if (!currentStep) return false;

    const radioName = currentStep.getAttribute("data-quiz-name");
    if (radioName) {
      return Boolean(quizForm.querySelector(`input[name="${radioName}"]:checked`));
    }

    const requiredFields = currentStep.querySelectorAll("input[required]");
    return Array.from(requiredFields).every((field) => {
      if (field.hasAttribute("data-consult-phone")) {
        return field.value.replace(/\D/g, "").length >= 11;
      }

      return field.value.trim().length > 1;
    });
  };

  quizForm.addEventListener("change", () => {
    updateQuizUi();
  });

  quizForm.addEventListener("input", () => {
    updateQuizUi();
  });

  if (quizPrevButton) {
    quizPrevButton.addEventListener("click", () => {
      quizCurrentStep = Math.max(quizCurrentStep - 1, 0);
      updateQuizUi();
    });
  }

  if (quizNextButton) {
    quizNextButton.addEventListener("click", () => {
      if (!isQuizStepComplete(quizCurrentStep)) return;
      quizCurrentStep = Math.min(quizCurrentStep + 1, quizSteps.length - 1);
      updateQuizUi();
    });
  }

  quizForm.addEventListener("submit", (event) => {
    if (!isQuizStepComplete(quizCurrentStep)) {
      event.preventDefault();
      return;
    }
    const quizPhone = quizForm.querySelector("[data-consult-phone]");
    if (quizPhone && quizPhone.value.replace(/\D/g, "").length < 11) {
      event.preventDefault();
      quizPhone.focus();
    }
  });
}

if (modalOpenButtons.length) {
  modalOpenButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const modalId = button.getAttribute("data-modal");
      if (!modalId) return;
      event.preventDefault();
      openModal(modalId);
    });
  });
}

if (modalCloseButtons.length) {
  modalCloseButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const modal = button.closest(".quiz-modal, .consult-modal");
      if (!modal || !modal.id) return;
      closeModal(modal.id);
    });
  });
}

const applyPhoneMask = (value) => {
  const digits = value.replace(/\D/g, "").replace(/^8/, "7").slice(0, 11);
  const normalized = digits.startsWith("7") ? digits : `7${digits}`;
  const parts = normalized.split("");
  let result = "+7";

  if (parts.length > 1) result += ` (${parts.slice(1, 4).join("")}`;
  if (parts.length >= 4) result += ")";
  if (parts.length > 4) result += ` ${parts.slice(4, 7).join("")}`;
  if (parts.length > 7) result += `-${parts.slice(7, 9).join("")}`;
  if (parts.length > 9) result += `-${parts.slice(9, 11).join("")}`;

  return result;
};

if (phoneMaskInputs.length) {
  phoneMaskInputs.forEach((input) => {
    input.addEventListener("input", () => {
      input.value = applyPhoneMask(input.value);
    });
  });
}

if (consultForm) {
  consultForm.addEventListener("submit", (event) => {
    const consultPhone = consultForm.querySelector("[data-consult-phone]");
    if (!consultPhone || consultPhone.value.replace(/\D/g, "").length < 11) {
      event.preventDefault();
      consultPhone?.focus();
      return;
    }
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (quizModal?.classList.contains("is-open")) closeModal("quiz-modal");
  if (consultModal?.classList.contains("is-open")) closeModal("consult-modal");
});

/* =========================================
 *  MODELS: Horizontal carousel controls
 * ========================================= */
const modelsCarousel = document.querySelector("[data-models-carousel]");
const modelsNavButtons = document.querySelectorAll("[data-models-nav]");

if (modelsCarousel && modelsNavButtons.length) {
  let isPointerDown = false;
  let isDragging = false;
  let startX = 0;
  let startScrollLeft = 0;
  let velocity = 0;
  let lastX = 0;
  let lastTime = 0;
  let momentumFrame = 0;
  const dragThreshold = 8;

  const stopMomentum = () => {
    if (momentumFrame) {
      cancelAnimationFrame(momentumFrame);
      momentumFrame = 0;
    }
  };

  const scrollByViewport = (direction) => {
    const firstCard = modelsCarousel.querySelector(".product-card");
    const cardWidth = firstCard ? firstCard.getBoundingClientRect().width : modelsCarousel.clientWidth * 0.82;
    const gap = 24;
    modelsCarousel.scrollBy({
      left: direction * (cardWidth + gap),
      behavior: "smooth",
    });
  };

  const startMomentum = () => {
    stopMomentum();

    const tick = () => {
      if (Math.abs(velocity) < 0.2) {
        stopMomentum();
        return;
      }

      modelsCarousel.scrollLeft -= velocity;
      velocity *= 0.95;
      momentumFrame = requestAnimationFrame(tick);
    };

    momentumFrame = requestAnimationFrame(tick);
  };

  modelsNavButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const direction = button.getAttribute("data-models-nav") === "prev" ? -1 : 1;
      stopMomentum();
      scrollByViewport(direction);
    });
  });

  modelsCarousel.addEventListener("pointerdown", (event) => {
    if (event.target instanceof Element && event.target.closest("a, button")) return;
    isPointerDown = true;
    isDragging = false;
    startX = event.clientX;
    startScrollLeft = modelsCarousel.scrollLeft;
    lastX = event.clientX;
    lastTime = performance.now();
    velocity = 0;
    stopMomentum();
    modelsCarousel.setPointerCapture(event.pointerId);
  });

  modelsCarousel.addEventListener("pointermove", (event) => {
    if (!isPointerDown) return;

    const deltaX = event.clientX - startX;
    if (!isDragging && Math.abs(deltaX) > dragThreshold) {
      isDragging = true;
      modelsCarousel.classList.add("is-dragging");
    }
    if (!isDragging) return;
    modelsCarousel.scrollLeft = startScrollLeft - deltaX;

    const now = performance.now();
    const deltaTime = now - lastTime;
    if (deltaTime > 0) {
      velocity = (event.clientX - lastX) / deltaTime * 16;
      lastX = event.clientX;
      lastTime = now;
    }
  });

  const endDrag = (event) => {
    if (!isPointerDown) return;
    isPointerDown = false;
    modelsCarousel.classList.remove("is-dragging");
    const shouldStartMomentum = isDragging;
    isDragging = false;
    if (event.pointerId !== undefined && modelsCarousel.hasPointerCapture(event.pointerId)) {
      modelsCarousel.releasePointerCapture(event.pointerId);
    }
    if (shouldStartMomentum) startMomentum();
  };

  modelsCarousel.addEventListener("pointerup", endDrag);
  modelsCarousel.addEventListener("pointercancel", endDrag);
  modelsCarousel.addEventListener("pointerleave", () => {
    if (!isPointerDown) return;
    isPointerDown = false;
    modelsCarousel.classList.remove("is-dragging");
    const shouldStartMomentum = isDragging;
    isDragging = false;
    if (shouldStartMomentum) startMomentum();
  });
}

/* =========================================
 *  PRODUCT: Gallery thumbnails
 * ========================================= */
const productGallery = document.querySelector("[data-product-gallery]");

if (productGallery) {
  const mainImage = productGallery.querySelector("[data-product-main-image]");
  const thumbnailButtons = Array.from(productGallery.querySelectorAll("[data-product-thumb]"));

  const syncActiveThumbnail = (activeButton) => {
    thumbnailButtons.forEach((button) => {
      const isActive = button === activeButton;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  };

  thumbnailButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (!(mainImage instanceof HTMLImageElement)) return;

      const nextSrc = button.getAttribute("data-image");
      const nextAlt = button.getAttribute("data-alt");

      if (!nextSrc) return;

      mainImage.src = nextSrc;
      if (nextAlt) {
        mainImage.alt = nextAlt;
      }

      syncActiveThumbnail(button);
    });
  });
}

/* =========================================
 *  PRODUCT: Tab panels
 * ========================================= */
const productTabsRoot = document.querySelector("[data-product-tabs]");

if (productTabsRoot) {
  const tabButtons = Array.from(productTabsRoot.querySelectorAll("[data-product-tab]"));
  const tabPanels = Array.from(productTabsRoot.querySelectorAll("[data-product-panel]"));

  const activateProductTab = (targetName) => {
    tabButtons.forEach((button) => {
      const isActive = button.getAttribute("data-product-tab") === targetName;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-selected", String(isActive));
      button.tabIndex = isActive ? 0 : -1;
    });

    tabPanels.forEach((panel) => {
      panel.hidden = panel.getAttribute("data-product-panel") !== targetName;
    });
  };

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetName = button.getAttribute("data-product-tab");
      if (!targetName) return;
      activateProductTab(targetName);
    });
  });

  const initialActiveButton = tabButtons.find((button) => button.classList.contains("is-active")) || tabButtons[0];
if (initialActiveButton) {
  activateProductTab(initialActiveButton.getAttribute("data-product-tab"));
  }
}

document.addEventListener("DOMContentLoaded", function() {
    // 1. Проверяем, есть ли уже запись в памяти браузера
    if (!localStorage.getItem("promcontur_cookie_accepted")) {
        
        // 2. Создаем контейнер для баннера
        const cookieBanner = document.createElement("div");
        cookieBanner.id = "system-cookie-banner";
        
        // 3. Задаем жесткие стили (Glassmorphism, темная тема)
        cookieBanner.style.cssText = `
            position: fixed !important;
            bottom: 0 !important;
            left: 0 !important;
            width: 100% !important;
            background-color: rgba(15, 15, 15, 0.95) !important;
            backdrop-filter: blur(10px) !important;
            -webkit-backdrop-filter: blur(10px) !important;
            border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
            padding: 16px 24px !important;
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            flex-wrap: wrap !important;
            gap: 16px !important;
            z-index: 2147483647 !important; /* Максимально возможный z-index */
            box-sizing: border-box !important;
            font-family: inherit !important;
            box-shadow: 0 -4px 20px rgba(0,0,0,0.5) !important;
        `;

        // 4. Вставляем текст и кнопку
        cookieBanner.innerHTML = `
            <div style="flex: 1 1 280px; font-size: 14px; line-height: 1.5; color: #e0e0e0; margin: 0;">
                Мы используем файлы cookie для улучшения работы сайта и аналитики. Продолжая работу, вы соглашаетесь с нашей 
                <a href="/privacy.html" style="color: #ffffff; text-decoration: underline; transition: color 0.3s;">Политикой конфиденциальности</a>.
            </div>
            <button id="cookie-accept-btn" style="
                background-color: #e50020; 
                color: #ffffff; 
                border: none; 
                padding: 12px 28px; 
                border-radius: 6px; 
                cursor: pointer; 
                font-size: 14px;
                font-weight: 600; 
                white-space: nowrap;
                transition: background-color 0.3s;
                margin: 0;
            ">Понятно, принять</button>
        `;

        // 5. Выводим баннер на экран
        document.body.appendChild(cookieBanner);

        // 6. Логика кнопки "Принять"
        const acceptBtn = document.getElementById("cookie-accept-btn");
        
        // Эффект наведения для кнопки (т.к. псевдоклассы не работают в inline-стилях)
        acceptBtn.addEventListener("mouseenter", () => acceptBtn.style.backgroundColor = "#c4001a");
        acceptBtn.addEventListener("mouseleave", () => acceptBtn.style.backgroundColor = "#e50020");

        // Обработка клика
        acceptBtn.addEventListener("click", function() {
            localStorage.setItem("promcontur_cookie_accepted", "true");
            cookieBanner.style.opacity = "0";
            cookieBanner.style.transition = "opacity 0.4s ease";
            setTimeout(() => cookieBanner.remove(), 400); // Плавное исчезновение
        });
    }
});

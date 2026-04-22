/* =========================================
 *  MAIN.JS: Minimal behaviour (no frameworks)
 * ========================================= */

/* =========================================
 * SMART HEADER: Hide Header on Scroll Down
 * ========================================= */
const header = document.querySelector(".site-header");
const headerBurger = document.querySelector(".header__burger");
const headerNav = document.querySelector(".header__nav");
const mobileNavBreakpoint = 900;
let lastScrollTop = 0;
const headerScrollThreshold = 100;

function isAnyModalOpen() {
  return Boolean(document.querySelector(".quiz-modal.is-open, .consult-modal.is-open"));
}

function syncBodyScrollLock() {
  const isMenuOpen = Boolean(headerNav?.classList.contains("nav-active"));
  const isModalOpen = isAnyModalOpen();
  const shouldLockBody = isMenuOpen || isModalOpen;

  document.body.classList.toggle("no-scroll", shouldLockBody);
  document.body.classList.toggle("modal-open", isModalOpen);
}

if (header) {
  window.addEventListener("scroll", () => {
    const currentScroll = Math.max(window.pageYOffset || document.documentElement.scrollTop, 0);
    const isMenuOpen = header.classList.contains("menu-open") || headerNav?.classList.contains("nav-active");

    if (isMenuOpen || currentScroll <= headerScrollThreshold) {
      header.classList.remove("header--hidden");
      lastScrollTop = currentScroll;
      return;
    }

    if (currentScroll > lastScrollTop) {
      header.classList.add("header--hidden");
    } else if (currentScroll < lastScrollTop) {
      header.classList.remove("header--hidden");
    }

    lastScrollTop = currentScroll;
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
  header.classList.toggle("header--hidden", false);
  headerBurger.setAttribute("aria-expanded", String(isOpen));
  headerBurger.setAttribute("aria-label", isOpen ? "Закрыть меню" : "Открыть меню");
  syncBodyScrollLock();
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
const consultModalTitle = consultModal ? consultModal.querySelector("[data-consult-title]") : null;
const consultModalSubtitle = consultModal ? consultModal.querySelector("[data-consult-subtitle]") : null;
const consultModalSubmit = consultForm ? consultForm.querySelector("[data-consult-submit]") : null;
const consultModalSubject = consultForm ? consultForm.querySelector("[data-consult-subject]") : null;
const consultModalCommentField = consultForm ? consultForm.querySelector("[data-consult-comment-field]") : null;
const consultModalCommentInput = consultForm ? consultForm.querySelector('textarea[name="user_comment"]') : null;
let quizCurrentStep = 0;
let updateQuizUi = () => {};
let isQuizStepComplete = () => false;

const modalRegistry = {
  "quiz-modal": quizModal,
  "consult-modal": consultModal,
};

Object.values(modalRegistry).forEach((modal) => {
  if (!modal || document.body.lastElementChild === modal) return;
  document.body.append(modal);
});

const closeModal = (modalId) => {
  const modal = modalRegistry[modalId];
  if (!modal) return;

  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  syncBodyScrollLock();
};

const syncConsultModalVariant = (trigger) => {
  if (
    !consultModal ||
    !consultForm ||
    !consultModalTitle ||
    !consultModalSubtitle ||
    !consultModalSubmit ||
    !consultModalSubject
  ) {
    return;
  }

  if (!consultModal.dataset.defaultTitle) {
    consultModal.dataset.defaultTitle = consultModalTitle.textContent.trim();
    consultModal.dataset.defaultSubtitle = consultModalSubtitle.textContent.trim();
    consultModal.dataset.defaultSubmit = consultModalSubmit.textContent.trim();
    consultModal.dataset.defaultSubject = consultModalSubject.value;
  }

  const isQuestionMode = trigger?.dataset.consultMode === "question";

  consultModalTitle.textContent = isQuestionMode
    ? "Задать вопрос менеджеру"
    : consultModal.dataset.defaultTitle;
  consultModalSubtitle.textContent = isQuestionMode
    ? "Напишите ваш вопрос или опишите задачу, и наш специалист свяжется с вами для ее оперативного решения."
    : consultModal.dataset.defaultSubtitle;
  consultModalSubmit.textContent = isQuestionMode
    ? "Отправить вопрос"
    : consultModal.dataset.defaultSubmit;
  consultModalSubject.value = isQuestionMode
    ? "Вопрос менеджеру"
    : consultModal.dataset.defaultSubject;

  if (consultModalCommentField) {
    consultModalCommentField.hidden = !isQuestionMode;
  }

  if (consultModalCommentInput && !isQuestionMode) {
    consultModalCommentInput.value = "";
  }
};

const openModal = (modalId, trigger = null) => {
  const modal = modalRegistry[modalId];
  if (!modal) return;

  if (headerNav?.classList.contains("nav-active")) {
    syncMenuState(false);
  }

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
    syncConsultModalVariant(trigger);
  }

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  syncBodyScrollLock();
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
      if (field instanceof HTMLInputElement && (field.type === "checkbox" || field.type === "radio")) {
        return field.checked;
      }

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
      openModal(modalId, button);
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

const COOKIE_BANNER_STORAGE_KEY = "promcontur_cookie_accepted";
const COOKIE_BANNER_TRANSITION_MS = 400;

document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem(COOKIE_BANNER_STORAGE_KEY)) {
    return;
  }

  const cookieBanner = document.createElement("div");
  cookieBanner.id = "system-cookie-banner";
  cookieBanner.className = "system-cookie-banner";

  cookieBanner.innerHTML = `
    <p class="system-cookie-banner__text">
      Мы используем файлы cookie для улучшения работы сайта и аналитики. Продолжая работу, вы соглашаетесь с нашей
      <a class="system-cookie-banner__link" href="/privacy.html">Политикой конфиденциальности</a>.
    </p>
    <button id="cookie-accept-btn" class="system-cookie-banner__button">Понятно, принять</button>
  `;

  document.body.appendChild(cookieBanner);

  const acceptBtn = document.getElementById("cookie-accept-btn");
  if (!acceptBtn) {
    return;
  }

  acceptBtn.addEventListener("click", () => {
    localStorage.setItem(COOKIE_BANNER_STORAGE_KEY, "true");
    cookieBanner.classList.add("is-hidden");
    window.setTimeout(() => cookieBanner.remove(), COOKIE_BANNER_TRANSITION_MS);
  });
});

/* =========================================
 * LEAD FORMS: AJAX Submit & Validation
 * ========================================= */
document.addEventListener("DOMContentLoaded", () => {
    // Находим все формы на сайте
    const forms = document.querySelectorAll("form");

    forms.forEach((form) => {
        // Игнорируем форму поиска (у нее action ведет на каталог)
        if (
            form.classList.contains("header__search") ||
            form.classList.contains("header__search-compact") ||
            form.classList.contains("header__search-mobile")
        ) {
            return;
        }

        form.addEventListener("submit", async (e) => {
            // Уважаем уже существующую валидацию формы, если она отменила submit ранее.
            if (e.defaultPrevented) {
                return;
            }

            e.preventDefault(); // Останавливаем стандартную отправку

            const submitBtn = form.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn ? submitBtn.textContent : "Отправить";
            const phoneInput = form.querySelector('input[name="user_phone"]');
            const privacyConsentInput = form.querySelector('input[name="privacy_consent"]');
            const submitUrl = form.getAttribute("action") || "/send.php";

            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            if (privacyConsentInput && !privacyConsentInput.checked) {
                privacyConsentInput.reportValidity();
                privacyConsentInput.focus();
                return;
            }

            // Базовая фронтенд-валидация телефона (хотя бы 10 символов)
            if (phoneInput && phoneInput.value.replace(/\D/g, "").length < 10) {
                alert("Пожалуйста, введите корректный номер телефона.");
                return;
            }

            // Меняем текст кнопки на время загрузки
            if (submitBtn) {
                submitBtn.textContent = "Отправка...";
                submitBtn.disabled = true;
            }

            const formData = new FormData(form);

            try {
                const response = await fetch(submitUrl, {
                    method: "POST",
                    body: formData,
                    headers: {
                        Accept: "application/json"
                    }
                });

                // Проверяем статус-коды от нашего нового безопасного бэкенда
                if (response.status === 429) {
                    alert("Вы отправляете заявки слишком часто. Подождите 30 секунд.");
                    resetButton(submitBtn, originalBtnText);
                    return;
                }

                if (!response.ok) {
                    throw new Error(`Ошибка сервера: ${response.status}`);
                }

                const result = await response.json();
                const isSuccessfulSubmit =
                    response.status === 200 &&
                    (result.success === true || result.status === "success");

                if (isSuccessfulSubmit) {
                    // Успех! Делаем клиентский редирект на страницу "Спасибо"
                    window.location.href = "/thanks.html";
                } else {
                    alert("Произошла ошибка при отправке: " + (result.message || "Неизвестная ошибка"));
                    resetButton(submitBtn, originalBtnText);
                }
            } catch (error) {
                console.error("Ошибка Fetch:", error);
                alert("Не удалось отправить заявку. Проверьте подключение к интернету.");
                resetButton(submitBtn, originalBtnText);
            }
        });
    });

    function resetButton(btn, text) {
        if (btn) {
            btn.textContent = text;
            btn.disabled = false;
        }
    }
});

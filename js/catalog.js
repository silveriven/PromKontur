const searchRoot = document.querySelector("[data-catalog-search]");
const searchInput = document.querySelector("[data-search-input]");
const suggestionsContainer = document.querySelector("[data-search-suggestions]");
const searchItems = Array.from(document.querySelectorAll("[data-search-item]"));
const brandFilterLinks = Array.from(document.querySelectorAll("[data-brand-filter]"));
const brandState = document.querySelector("[data-brand-state]");

let activeBrandFilter = "all";

const normalizeSearchValue = (value) => value.trim().toLowerCase();

const getItemBrand = (item) => normalizeSearchValue(item.dataset.searchBrand || "");

const matchesBrandFilter = (item) => {
  if (activeBrandFilter === "all") return true;
  return getItemBrand(item) === normalizeSearchValue(activeBrandFilter);
};

const matchesSearchFilter = (item, query) => {
  if (!query) return true;
  const content = normalizeSearchValue(
    [
      item.dataset.searchTitle || "",
      item.dataset.searchBrand || "",
      item.dataset.searchApplication || "",
      item.dataset.searchTags || "",
    ].join(" "),
  );
  return content.includes(query);
};

const syncSidebarState = () => {
  brandFilterLinks.forEach((link) => {
    const filter = link.getAttribute("data-brand-filter") || "all";
    link.classList.toggle("catalog-sidebar__link--active", normalizeSearchValue(filter) === normalizeSearchValue(activeBrandFilter));
  });

  if (brandState) {
    brandState.textContent = activeBrandFilter === "all" ? "Все товары" : activeBrandFilter;
  }
};

const applyCatalogFilters = () => {
  const normalizedQuery = normalizeSearchValue(searchInput?.value || "");

  searchItems.forEach((item) => {
    const isVisible = matchesBrandFilter(item) && matchesSearchFilter(item, normalizedQuery);
    item.dataset.searchHidden = String(!isVisible);
  });
};

const buildSearchResults = (query) => {
  const normalizedQuery = normalizeSearchValue(query);
  if (!normalizedQuery) return [];

  return searchItems
    .filter((item) => matchesBrandFilter(item) && matchesSearchFilter(item, normalizedQuery))
    .map((item) => ({
      href: item.getAttribute("href") || "#",
      title: item.dataset.searchTitle || "",
      brand: item.dataset.searchBrand || "",
      application: item.dataset.searchApplication || "",
    }))
    .slice(0, 6);
};

const renderSuggestions = (results) => {
  if (!suggestionsContainer) return;

  if (!results.length) {
    suggestionsContainer.innerHTML = '<div class="catalog-search__empty">Ничего не найдено. Попробуйте модель, бренд или другой запрос.</div>';
    suggestionsContainer.hidden = false;
    return;
  }

  suggestionsContainer.innerHTML = results
    .map(
      (result) => `
        <a class="catalog-search__suggestion" href="${result.href}">
          <span>${result.title}</span>
          <span class="catalog-search__suggestion-meta">${result.brand} · ${result.application}</span>
        </a>
      `,
    )
    .join("");
  suggestionsContainer.hidden = false;
};

if (searchRoot && searchInput && suggestionsContainer) {
  searchInput.addEventListener("input", () => {
    applyCatalogFilters();

    const query = normalizeSearchValue(searchInput.value);
    if (!query) {
      suggestionsContainer.hidden = true;
      suggestionsContainer.innerHTML = "";
      return;
    }

    renderSuggestions(buildSearchResults(searchInput.value));
  });

  document.addEventListener("click", (event) => {
    if (!(event.target instanceof Node)) return;
    if (searchRoot.contains(event.target)) return;
    suggestionsContainer.hidden = true;
  });

  searchInput.addEventListener("focus", () => {
    const query = normalizeSearchValue(searchInput.value);
    if (!query) return;
    renderSuggestions(buildSearchResults(searchInput.value));
  });
}

brandFilterLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const filter = link.getAttribute("data-brand-filter");
    if (!filter) return;

    event.preventDefault();
    activeBrandFilter = filter;
    syncSidebarState();
    applyCatalogFilters();

    if (searchInput && normalizeSearchValue(searchInput.value)) {
      renderSuggestions(buildSearchResults(searchInput.value));
    } else if (suggestionsContainer) {
      suggestionsContainer.hidden = true;
    }
  });
});

syncSidebarState();
applyCatalogFilters();

const modalOpenButtons = document.querySelectorAll("[data-modal-open]");
const modalCloseButtons = document.querySelectorAll("[data-modal-close]");

const closeModal = (modal) => {
  if (!modal) return;
  modal.hidden = true;
  document.body.style.overflow = "";
};

const openModal = (modal) => {
  if (!modal) return;
  modal.hidden = false;
  document.body.style.overflow = "hidden";
};

modalOpenButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const modalId = button.getAttribute("data-modal-open");
    if (!modalId) return;
    openModal(document.getElementById(modalId));
  });
});

modalCloseButtons.forEach((button) => {
  button.addEventListener("click", () => {
    closeModal(button.closest(".catalog-modal"));
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  closeModal(document.querySelector(".catalog-modal:not([hidden])"));
});

document.addEventListener("submit", (event) => {
  const form = event.target;
  if (!(form instanceof HTMLFormElement)) return;
  if (!form.closest(".catalog-modal")) return;

  event.preventDefault();
  closeModal(form.closest(".catalog-modal"));
});

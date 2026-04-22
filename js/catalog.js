const searchRoot = document.querySelector("[data-catalog-search]");
const searchInput = document.querySelector("[data-search-input]");
const suggestionsContainer = document.querySelector("[data-search-suggestions]");
const searchItems = Array.from(document.querySelectorAll("[data-search-item]"));
const brandFilterLinks = Array.from(document.querySelectorAll("[data-brand-filter]"));
const brandState = document.querySelector("[data-brand-state]");

let activeBrandFilter = "all";

const normalizeSearchValue = (value) => value.trim().toLowerCase();
const isPageNavigationLink = (link) => {
  const href = link.getAttribute("href");
  if (!href || href === "#" || href.startsWith("javascript:")) return false;

  try {
    const targetUrl = new URL(href, window.location.href);
    return targetUrl.pathname !== window.location.pathname;
  } catch {
    return false;
  }
};

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
    if (isPageNavigationLink(link)) return;

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

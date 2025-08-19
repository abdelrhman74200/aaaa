export function initNavbar() {
  // ======== Side Menu (Categories Only) ========
  const menuBtn = document.getElementById("menuBtn");
  const sideMenu = document.getElementById("sideMenu");
  const closeMenu = document.getElementById("closeMenu");

  const openMenu = () => {
    if (sideMenu) {
      sideMenu.classList.add("open");
      document.body.style.overflow = "hidden";
    }
  };

  const closeMenuFunc = () => {
    if (sideMenu) {
      sideMenu.classList.remove("open");
      document.body.style.overflow = "";
    }
  };

  menuBtn?.addEventListener("click", openMenu);
  closeMenu?.addEventListener("click", closeMenuFunc);

  sideMenu?.addEventListener("mouseleave", () => {
    document.body.style.overflowY = "auto";
  });

  sideMenu?.addEventListener("mouseenter", () => {
    document.body.style.overflowY = "hidden";
  });

  document.addEventListener("click", (e) => {
    if (
      sideMenu?.classList.contains("open") &&
      !sideMenu.contains(e.target) &&
      !menuBtn?.contains(e.target)
    ) {
      closeMenuFunc();
    }
  });

  document.addEventListener(
    "scroll",
    () => {
      if (sideMenu?.classList.contains("open") && !sideMenu.matches(":hover")) {
        closeMenuFunc();
      }
    },
    { passive: true }
  );

  // ======== Search ========
  const searchBtn = document.getElementById("searchBtn");
  const searchInput = document.getElementById("searchInput");

  if (searchBtn && searchInput) {
    searchBtn.addEventListener("click", () => {
      const query = searchInput.value.trim();
      if (query) {
        window.location.href = `projecy.html?search=${encodeURIComponent(query)}`;
      }
    });

    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        searchBtn.click();
      }
    });
  }

  // ======== Messages Sidebar ========
  document.querySelector('[data-i18n="messages"]').addEventListener("click", function (e) {
    e.preventDefault();
    document.getElementById("messagesSidebar").classList.add("open");
  });

  document.getElementById("closeMessages").addEventListener("click", function () {
    document.getElementById("messagesSidebar").classList.remove("open");
  });
}
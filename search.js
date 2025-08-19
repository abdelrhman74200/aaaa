document.addEventListener("DOMContentLoaded", () => {
  const layout = document.getElementById("container");
  const loader = document.getElementById("loader");

  let sidebarLoaded = false;

  function checkAllLoaded() {
    if (sidebarLoaded) {
      loader.style.display = "none";
      layout.style.display = "flex";
      console.log("All components loaded");
    } else {
      console.log("Waiting for sidebar to load:", { sidebarLoaded });
    }
  }

  // مهلة زمنية لإظهار الـ layout بعد 5 ثوانٍ في حالة الفشل
  setTimeout(() => {
    if (!sidebarLoaded) {
      console.warn("Sidebar loading timed out, showing layout anyway");
      loader.style.display = "none";
      layout.style.display = "flex";
    }
  }, 5000);

  // تحميل السايدبار
  fetch("product-search.html", { cache: "no-store" })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to load product.html");
      return res.text();
    })
    .then((html) => {
      const sidebar = layout.querySelector(".sidebar");
      if (sidebar) {
        sidebar.innerHTML = html;
        console.log("Sidebar loaded successfully");

        const toggleBtn = sidebar.querySelector("#toggle-brands");
        const moreBrands = sidebar.querySelector("#more-brands");

        if (toggleBtn && moreBrands) {
          let expanded = false;
          toggleBtn.addEventListener("click", () => {
            expanded = !expanded;
            moreBrands.classList.toggle("hidden");
            toggleBtn.textContent = expanded ? "عرض أقل" : "عرض المزيد";
            console.log("Toggle brands clicked, expanded:", expanded);
          });
        } else {
          console.error("Toggle button or more-brands not found");
        }

        sidebarLoaded = true;
        checkAllLoaded();
      } else {
        console.error("Sidebar container not found");
      }
    })
    .catch((err) => {
      console.error("Error loading sidebar:", err.message);
      loader.style.display = "none";
      layout.style.display = "flex";
    });
});

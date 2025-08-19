import { initNavbar } from "./navbar.js";
import { initAccount } from "./account.js";

// Function to load header dynamically
async function loadHeader() {
  try {
    const response = await fetch("header.html", { cache: "no-store" });
    if (!response.ok) throw new Error("Failed to load header");
    const headerHtml = await response.text();
    const headerContainer = document.getElementById("header-container");
    if (headerContainer) {
      headerContainer.innerHTML = headerHtml;
      console.log("Header loaded successfully");
    } else {
      console.error("Header container not found");
    }
  } catch (err) {
    console.error("Error loading header:", err.message);
  }
}

// Function to load product dynamically
async function loadProduct() {
  try {
    const response = await fetch("product-search.html");
    if (!response.ok) {
      throw new Error("Failed to load product");
    }
    const productHtml = await response.text();
    const productContainer = document.getElementById("product-container");
    if (productContainer) {
      productContainer.innerHTML = productHtml;
      console.log("Product loaded successfully");
    } else {
      console.error("Product container not found");
    }
  } catch (err) {
    console.error("Error loading product:", err.message);
  }
}

// تهيئة الصفحة بناءً على اسم الملف
document.addEventListener("DOMContentLoaded", async () => {
  console.log("DOM fully loaded and parsed");
  console.log("Current origin:", window.location.origin);
  console.log("Current page:", window.location.pathname);

  // تحميل الهيدر لجميع الصفحات
  await loadHeader();

  // تحديد الصفحة الحالية
  const currentPage = window.location.pathname.split("/").pop();
  initAccount()
  if (currentPage === "account.html") {
    // تهيئة صفحة الحساب
    initAccount();
    console.log("Initializing account page");
  } else {
    // تحميل المنتجات وتهيئة النافبار للصفحات الأخرى
    await loadProduct();
    initNavbar();

    console.log("Initializing navbar and products for non-account page");
  }
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}

// دالة setCookie (يجب توفيرها في app.js أو هنا)
function setCookie(name, value, days) {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}
  
  
  getCookie();
  fetch("productMain.html")
    
    .then((res) => res.text())
    .then((html) => {
      document.getElementById("product-container").innerHTML = html;
    })
    .catch((err) => console.error("Error loading productMain.html", err));
});

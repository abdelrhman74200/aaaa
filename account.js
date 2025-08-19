// account.js
import { countries } from "./sighup.js";

// ===== أدوات مساعدة للكوكيز =====
function setCookie(name, value, days) {
  let cookie = `${name}=${encodeURIComponent(
    value || ""
  )}; path=/; SameSite=Lax`;
  if (days && Number.isFinite(days)) {
    const date = new Date();
    date.setTime(date.getTime() + days * 86400000);
    cookie += `; expires=${date.toUTCString()}`;
  }
  document.cookie = cookie;
}

function getCookie(name) {
  const found = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return found ? decodeURIComponent(found.split("=")[1]) : null;
}

function deleteCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
}

export function initAccount() {
  console.log("Initializing account.js");

  // ===== تهيئة نموذج التسجيل (من account5.js لدعم الـ signup بشكل أفضل) =====
  function initSignupForm() {
    const signupForm = document.getElementById("registerForm");
    if (!signupForm) {
      console.error("Signup form not found");
      return;
    }

    // عناصر عامة
    const roleSelect = document.getElementById("role");
    const commonFields = document.getElementById("commonFields");

    // أقسام حسب الدور
    const buyerForm = document.getElementById("buyerform");
    const sellerForm = document.getElementById("supplierform");

    // حقول مشتركة (ستُفعّل بعد اختيار الدور)
    const email = document.getElementById("email");
    const password = document.getElementById("password");
    const confirmPassword = document.getElementById("confirmPassword");
    const nameField = document.getElementById("name");

    // Checkboxes + سياسة
    const buyerCheckboxes = document.getElementById("buyerCheckboxes");
    const sellerCheckboxes = document.getElementById("sellerCheckboxes");
    const buyerRemember = document.getElementById("buyer_rememberMe");
    const buyerPrivacy = document.getElementById("buyer_privacyCheckbox");
    const sellerRemember = document.getElementById("seller_rememberMe");
    const sellerPrivacy = document.getElementById("seller_privacyCheckbox");

    const showPrivacyBuyerBtn = document.getElementById("showPrivacy");
    const showPrivacySellerBtn = document.getElementById("showPrivacySeller");
    const privacyModal = document.getElementById("privacyModal");
    const closePrivacyBtn = document.getElementById("closePrivacy");

    const errorDiv = document.getElementById("signupError");

    // Dropdown دولة (قسم البايع)
    const ddContainer = document.getElementById("country-select");
    const ddList = document.getElementById("dropdown-list");
    const ddSelected = document.getElementById("selected-country");
    const companyCountryInput = document.getElementById("company_country");

    // Dropdown دولة (قسم المشتري)
    const ddContainerbuyer = document.getElementById("country-select-buyer");
    const ddListbuyer = document.getElementById("dropdown-list-buyer");
    const ddSelectedbuyer = document.getElementById("selected-country-buyer");
    const Country = document.getElementById("country");

    // متغير لحفظ timeout ID لإلغاؤه عند الحاجة
    let errorTimeout = null;

    // متغير لحفظ أسماء الملفات المرفوعة لعرضها للمستخدم
    const uploadedFiles = {
      commercial_registration_file: null,
      tax_file: null,
      license_file: null,
    };

    // حقول الدور لكل إرسال آمن
    const ROLE_FIELDS = {
      buyer: [
        "role",
        "email",
        "password",
        "confirmPassword",
        "name",
        "gender",
        "birthdate",
        "country",
        "city",
        "address_line1",
        "address_line2",
        "postal_code",
        "buyer_privacyCheckbox",
        "buyer_rememberMe",
      ],
      seller: [
        "role",
        "email",
        "password",
        "confirmPassword",
        "name",
        "company_name",
        "business_type",
        "commercial_registration",
        "tax_id",
        "company_address",
        "company_country",
        "vat_number",
        "contact_person",
        "contact_position",
        "contact_phone",
        "commercial_registration_file",
        "tax_file",
        "license_file",
        "seller_privacyCheckbox",
        "seller_rememberMe",
      ],
    };

    // أدوات واجهة
    const hide = (el) => el && el.classList.add("hidden");
    const show = (el) => el && el.classList.remove("hidden");

    const disableSection = (sec) => {
      if (!sec) return;
      sec.querySelectorAll("input,select,button").forEach((el) => {
        if (el.type !== "button") el.disabled = true;
        el.required = false;
      });
    };
    const enableSection = (sec) => {
      if (!sec) return;
      sec.querySelectorAll("input,select").forEach((el) => {
        el.disabled = false;
      });
    };

    function resetAll() {
      hide(commonFields);
      hide(buyerForm);
      hide(sellerForm);
      hide(buyerCheckboxes);
      hide(sellerCheckboxes);
      disableSection(buyerForm);
      disableSection(sellerForm);

      // إلغاء متطلبات الخصوصية افتراضيًا
      if (buyerPrivacy) {
        buyerPrivacy.required = false;
        buyerPrivacy.checked = false;
        buyerPrivacy.disabled = true;
      }
      if (sellerPrivacy) {
        sellerPrivacy.required = false;
        sellerPrivacy.checked = false;
        sellerPrivacy.disabled = true;
      }
      if (buyerRemember) buyerRemember.disabled = true;
      if (sellerRemember) sellerRemember.disabled = true;

      // تعطيل الحقول المشتركة لحين اختيار الدور
      [email, password, confirmPassword, nameField].forEach((el) => {
        if (el) {
          el.disabled = true;
          el.required = false;
        }
      });
    }

    function enableCommonFields() {
      show(commonFields);
      [email, password, confirmPassword, nameField].forEach((el) => {
        if (el) {
          el.disabled = false;
          el.required = true;
        }
      });
    }

    function applyBuyerRequirements() {
      // الحقول المطلوبة للمشتري
      ["gender", "birthdate", "country"].forEach((name) => {
        const el = signupForm.querySelector(`[name="${name}"]`);
        if (el) el.required = true;
      });
      // بقية العناوين اختيارية
    }

    function applySellerRequirements() {
      const required = [
        "company_name",
        "business_type",
        "commercial_registration",
        "tax_id",
        "company_address",
        "company_country",
        "vat_number",
        "contact_person",
        "contact_position",
        "contact_phone",
        "commercial_registration_file",
        "tax_file",
      ];
      required.forEach((name) => {
        const el = signupForm.querySelector(`[name="${name}"]`);
        if (el) el.required = true;
      });
      // license_file اختياري
    }

    function updateFormByRole() {
      resetAll();
      const role = roleSelect.value;

      if (!role) return;

      enableCommonFields();

      if (role === "buyer") {
        show(buyerForm);
        show(buyerCheckboxes);
        enableSection(buyerForm);
        if (buyerPrivacy) {
          buyerPrivacy.disabled = false;
          buyerPrivacy.required = true;
        }
        if (buyerRemember) buyerRemember.disabled = false;
        applyBuyerRequirements();
      } else if (role === "seller") {
        show(sellerForm);
        show(sellerCheckboxes);
        enableSection(sellerForm);
        if (sellerPrivacy) {
          sellerPrivacy.disabled = false;
          sellerPrivacy.required = true;
        }
        if (sellerRemember) sellerRemember.disabled = false;
        applySellerRequirements();
        // تأمين أن dropdown الدولة مُهيأ
        initCountryDropdown(
          ddContainer,
          ddList,
          ddSelected,
          companyCountryInput
        );
      }

      // عند تبديل الدور، اخفاء الأخطاء
      hideError();
    }

    function showError(msg) {
      if (!errorDiv) return;

      // إلغاء أي timeout سابق
      if (errorTimeout) {
        clearTimeout(errorTimeout);
        errorTimeout = null;
      }

      errorDiv.textContent = msg;
      errorDiv.style.display = "block";

      // إضافة زر إغلاق يدوي إذا لم يكن موجوداً
      if (!errorDiv.querySelector(".close-error")) {
        const closeBtn = document.createElement("button");
        closeBtn.innerHTML = "×";
        closeBtn.className = "close-error";
        closeBtn.style.cssText =
          "float: left; background: none; border: none; font-size: 18px; cursor: pointer; color: #a10000; margin-left: 10px;";
        closeBtn.onclick = hideError;
        errorDiv.appendChild(closeBtn);
      }

      // إخفاء الرسالة بعد 15 ثانية بدلاً من 5
      errorTimeout = setTimeout(hideError, 15000);
    }

    function hideError() {
      if (!errorDiv) return;

      // إلغاء timeout إذا كان موجوداً
      if (errorTimeout) {
        clearTimeout(errorTimeout);
        errorTimeout = null;
      }

      errorDiv.textContent = "";
      errorDiv.style.display = "none";

      // إزالة زر الإغلاق
      const closeBtn = errorDiv.querySelector(".close-error");
      if (closeBtn) {
        closeBtn.remove();
      }
    }

    // سياسة الخصوصية
    function openPrivacy() {
      if (privacyModal && typeof privacyModal.showModal === "function") {
        privacyModal.showModal();
      }
    }
    function closePrivacy() {
      if (privacyModal && privacyModal.open) {
        privacyModal.close();
      }
    }
    if (showPrivacyBuyerBtn)
      showPrivacyBuyerBtn.addEventListener("click", openPrivacy);
    if (showPrivacySellerBtn)
      showPrivacySellerBtn.addEventListener("click", openPrivacy);
    if (closePrivacyBtn)
      closePrivacyBtn.addEventListener("click", closePrivacy);

    // دالة تهيئة قائمة الدولة
    function initCountryDropdown(ddContainer, ddList, ddSelected, hiddenInput) {
      if (!ddContainer || !ddList || !ddSelected || !hiddenInput) return;

      // عشان ما تتنفذش مرتين
      if (ddList.dataset.bound === "1") return;

      ddList.innerHTML = "";

      // إنشاء عناصر الدول
      countries?.forEach((c) => {
        const item = document.createElement("div");
        item.textContent = c.name;
        item.dataset.code = c.code;
        item.addEventListener("click", (e) => {
          e.stopPropagation();
          ddSelected.textContent = c.name;
          hiddenInput.value = c.code;
          ddList.style.display = "none";
          ddList.dataset.open = "0";
        });
        ddList.appendChild(item);
      });

      // اختيار افتراضي (مصر)
      const eg = countries?.find((x) => x.name === "مصر");
      if (eg) {
        ddSelected.textContent = eg.name;
        hiddenInput.value = eg.code;
      } else {
        ddSelected.textContent = "اختر الدولة";
        hiddenInput.value = "";
      }

      // فتح/إغلاق القائمة
      ddContainer.addEventListener("click", (e) => {
        e.stopPropagation();
        const open = ddList.dataset.open === "1";
        ddList.style.display = open ? "none" : "block";
        ddList.dataset.open = open ? "0" : "1";
      });

      // إغلاق عند الضغط خارج القائمة
      document.addEventListener("click", () => {
        if (ddList.dataset.open === "1") {
          ddList.style.display = "none";
          ddList.dataset.open = "0";
        }
      });

      ddList.dataset.bound = "1";
    }

    // دالة لإضافة عرض أسماء الملفات
    function addFileDisplays() {
      const fileInputs = [
        "commercial_registration_file",
        "tax_file",
        "license_file",
      ];

      fileInputs.forEach((inputName) => {
        const input = document.getElementById(inputName);
        if (!input) return;

        // إضافة عنصر لعرض اسم الملف
        let display = input.parentNode.querySelector(".file-display");
        if (!display) {
          display = document.createElement("div");
          display.className = "file-display";
          display.style.cssText =
            "margin-top: 5px; font-size: 0.9rem; color: #666; word-break: break-all;";
          input.parentNode.insertBefore(display, input.nextSibling);
        }

        input.addEventListener("change", function (e) {
          if (e.target.files && e.target.files[0]) {
            const fileName = e.target.files[0].name;
            uploadedFiles[inputName] = fileName;
            display.innerHTML = `<strong>تم اختيار:</strong> ${fileName} <button type="button" onclick="clearFile('${inputName}')" style="margin-right: 10px; color: red; background: none; border: none; cursor: pointer;">✕</button>`;
          } else {
            uploadedFiles[inputName] = null;
            display.innerHTML = "";
          }
        });
      });
    }

    // دالة لمسح ملف معين
    window.clearFile = function (inputName) {
      const input = document.getElementById(inputName);
      const display = input?.parentNode?.querySelector(".file-display");

      if (input) {
        input.value = "";
        uploadedFiles[inputName] = null;
      }
      if (display) {
        display.innerHTML = "";
      }
    };

    // استدعاء للمشتري
    initCountryDropdown(
      ddContainerbuyer,
      ddListbuyer,
      ddSelectedbuyer,
      Country
    );

    // تحميل البيانات المحفوظة (كوكيز) لو موجودة
    function loadSavedFromCookie() {
      try {
        const raw = getCookie("signupFormData");
        if (!raw) return;
        const saved = JSON.parse(raw);

        if (saved.role) {
          roleSelect.value = saved.role;
          updateFormByRole();
        }
        Object.keys(saved).forEach((key) => {
          const els = signupForm.querySelectorAll(`[name="${key}"]`);
          els.forEach((el) => {
            if (!el) return;
            if (el.type === "file") return; // لا نحفظ الملفات في الكوكيز
            if (el.type === "checkbox") el.checked = !!saved[key];
            else el.value = saved[key] ?? "";
          });
        });
      } catch (e) {
        console.warn("Failed to parse signupFormData cookie");
      }
    }

    // بناء FormData بالحقول المسموح إرسالها فقط (حسب الدور)
    function buildFormDataByRole(role) {
      const fd = new FormData();
      const allowed = ROLE_FIELDS[role] || [];
      allowed.forEach((name) => {
        const el = signupForm.querySelector(`[name="${name}"]`);
        if (!el) return;
        if (el.type === "file") {
          if (el.files && el.files.length) fd.append(name, el.files[0]);
        } else if (el.type === "checkbox") {
          if (el.checked) fd.append(name, "on");
        } else {
          // إجبار الحقول المشتركة حتى لو فاضية للتوافق مع السيرفر
          if (el.value !== undefined && el.value !== null && el.value !== "") {
            fd.append(name, el.value);
          } else if (
            ["email", "password", "confirmPassword", "role", "name"].includes(
              name
            )
          ) {
            fd.append(name, el.value || "");
          }
        }
      });
      return fd;
    }

    // حفظ/مسح الكوكيز بناءً على "تذكرني"
    function rememberOrForget(role) {
      const remember =
        role === "buyer" ? buyerRemember?.checked : sellerRemember?.checked;
      const allowed = ROLE_FIELDS[role] || [];
      const store = {};
      allowed.forEach((name) => {
        if (
          ["commercial_registration_file", "tax_file", "license_file"].includes(
            name
          )
        )
          return; // لا نحفظ الملفات
        const el = signupForm.querySelector(`[name="${name}"]`);
        if (!el) return;
        if (el.type === "checkbox") store[name] = !!el.checked;
        else store[name] = el.value || "";
      });
      setCookie(
        "signupFormData",
        JSON.stringify(store),
        remember ? 365 : undefined
      ); // undefined => Session Cookie
    }

    // أحداث
    roleSelect.addEventListener("change", updateFormByRole);

    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault(); // منع أي Refresh نهائي
      hideError();

      const role = roleSelect.value;
      if (!role) return showError("يرجى اختيار نوع الحساب");

      const emailVal = email?.value?.trim();
      const passVal = password?.value || "";
      const cpassVal = confirmPassword?.value || "";
      const nameVal = nameField?.value?.trim();

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailVal || !emailRegex.test(emailVal))
        return showError("البريد الإلكتروني غير صالح");
      if (!nameVal) return showError("يرجى إدخال الاسم الكامل");
      if (!passVal || !cpassVal)
        return showError("يرجى كتابة كلمة المرور وتأكيدها");
      if (passVal !== cpassVal) return showError("كلمات السر غير متطابقة");

      if (role === "buyer" && !buyerPrivacy?.checked)
        return showError("يرجى الموافقة على سياسة الخصوصية");
      if (role === "seller" && !sellerPrivacy?.checked)
        return showError("يرجى الموافقة على سياسة الخصوصية");

      // التحقق من رفع الملفات المطلوبة للبائع
      if (role === "seller") {
        const commercialFile = document.getElementById(
          "commercial_registration_file"
        );
        const taxFile = document.getElementById("tax_file");

        if (!commercialFile?.files?.length) {
          return showError("يرجى رفع صورة السجل التجاري");
        }
        if (!taxFile?.files?.length) {
          return showError("يرجى رفع صورة البطاقة الضريبية");
        }
      }

      const fd = buildFormDataByRole(role);
      rememberOrForget(role); // حفظ الكوكيز أو جلسة مؤقتة

      try {
        const host = ["127.0.0.1", "localhost"].includes(location.hostname)
          ? location.hostname
          : "localhost";
        const url = `http://${host}:3011/register`;

        const res = await fetch(url, {
          method: "POST",
          credentials: "include",
          body: fd,
          redirect: "manual", // منع أي Redirect تلقائي
        });

        const data = await res.json().catch(() => ({}));

        if (res.ok) {
          // نجاح التسجيل - مسح الكوكيز والملفات
          deleteCookie("signupFormData");
          Object.keys(uploadedFiles).forEach((key) => {
            uploadedFiles[key] = null;
          });

          console.log("Signup successful");
          if (role === "buyer") {
            location.href = "index.html";
          } else if (role === "seller") {
            location.href = "seller-dashboard.html";
          }
        } else {
          // خطأ من السيرفر - الملفات تبقى محفوظة
          showError(data.error || "خطأ في التسجيل");
        }
      } catch (err) {
        showError("خطأ في الاتصال بالخادم");
      }
    });

    // تهيئة أولية
    resetAll();
    loadSavedFromCookie();
    if (roleSelect.value) updateFormByRole();

    // إضافة عرض أسماء الملفات
    addFileDisplays();

    // إتاحة إغلاق نافذة الخصوصية عبر window.closePrivacy لو محتاج
    window.closePrivacy = () => {
      if (privacyModal?.open) privacyModal.close();
    };
  }

  // ===== تسجيل الدخول (دمج من account.js لدعم التوجيه والتوكن) =====
  function initLoginForm() {
    const loginForm = document.getElementById("loginForm");
    if (!loginForm) {
      console.error("Login form not found in DOM");
      return;
    }

    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      console.log("Login form submitted");

      const email = document.getElementById("loginEmail")?.value.trim();
      const password = document.getElementById("loginPassword")?.value.trim();
      const rememberMe = document.getElementById("rememberMe")?.checked;

      const errorDiv = document.getElementById("loginError");
      if (errorDiv) {
        errorDiv.style.display = "none";
        errorDiv.textContent = "";
      }

      if (!email || !password) {
        errorDiv.textContent = "يرجى ملء جميع الحقول";
        errorDiv.style.display = "block";
        return;
      }

      try {
        const apiHost =
          window.location.hostname === "127.0.0.1" ? "127.0.0.1" : "localhost";
        const url = `http://${apiHost}:3011/login`;
        console.log("Sending login request to:", url);

        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password, rememberMe }),
        });

        const data = await res.json();
        if (res.ok) {
          console.log("Login successful");
          if (!rememberMe) {
            sessionStorage.setItem("tempToken", data.token);
          }
          if (data.role === "seller") {
            window.location.href = "seller-dashboard.html";
          } else if (data.role === "buyer") {
            window.location.href = "index.html";
          } else {
            window.location.href = "index.html";
          }
        } else {
          errorDiv.textContent = data.error || "خطأ في تسجيل الدخول";
          errorDiv.style.display = "block";
        }
      } catch (err) {
        console.error("Error during login request:", err.message);
        errorDiv.textContent = "خطأ في الاتصال بالخادم";
        errorDiv.style.display = "block";
      }
    });
  }

  // ======== Load Login Modal Dynamically ========
  async function loadLoginModal() {
    try {
      const response = await fetch("account.html", { cache: "no-store" });
      if (!response.ok) throw new Error("Failed to load login modal");
      const accountHtml = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(accountHtml, "text/html");
      const loginModal = doc.querySelector("#loginModal");
      if (loginModal) {
        document.body.appendChild(loginModal);
        console.log("Login modal appended to DOM");
      } else {
        console.error("Login modal not found in account.html");
      }
    } catch (err) {
      console.error("Error loading login modal:", err.message);
    }
  }

  // ======== Check Authentication for auth-text ========
  async function checkAuth() {
    try {
      const apiHost =
        window.location.hostname === "127.0.0.1" ? "127.0.0.1" : "localhost";
      const url = `http://${apiHost}:3011/verify-token`;
      console.log("Sending verify-token request to:", url);
      const headers = { Accept: "application/json" };
      const sessionToken = sessionStorage.getItem("tempToken");
      if (sessionToken) {
        headers["Authorization"] = `Bearer ${sessionToken}`;
      }
      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers,
      });
      console.log("Verify-token status:", response.status);
      const data = await response.json();
      console.log("Verify-token response:", data);

      const cookies = document.cookie;
      console.log("Client cookies:", cookies);
      console.log("Session token:", sessionToken);

      const authText = document.getElementById("auth-text");
      if (data.valid && authText) {
        authText.textContent = data.firstName || "Account";
        console.log("auth-text updated to:", authText.textContent);
        authText.addEventListener("click", (e) => {
          e.preventDefault();
          window.location.href = "account.html";
          console.log("Redirecting to account.html for logged-in user");
        });
      } else if (authText) {
        authText.textContent = "Account";
        console.log("auth-text set to 'Account' for non-logged-in user");
        authText.addEventListener("click", async (e) => {
          e.preventDefault();
          await loadLoginModal();
          const modal = new bootstrap.Modal(
            document.getElementById("loginModal")
          );
          modal.show();
          console.log("Login modal opened in current page");
          initLoginForm();
        });
      } else if (!data.valid) {
        const modal = new bootstrap.Modal(
          document.getElementById("loginModal")
        );
        modal.show();
        console.log("Login modal opened for non-logged-in user");
      }
    } catch (err) {
      console.error("CheckAuth error:", err.message);
      const authText = document.getElementById("auth-text");
      if (authText) {
        authText.textContent = "Account";
        console.log("auth-text set to 'Account' due to error");
        authText.addEventListener("click", async (e) => {
          e.preventDefault();
          await loadLoginModal();
          const modal = new bootstrap.Modal(
            document.getElementById("loginModal")
          );
          modal.show();
          console.log("Login modal opened in current page due to error");
          initLoginForm();
        });
      } else {
        const modal = new bootstrap.Modal(
          document.getElementById("loginModal")
        );
        modal.show();
        console.log("Login modal opened due to checkAuth error");
      }
    }
  }

  // ===== تسجيل الخروج (من account5.js لدعم مسح الكوكيز بالكامل) =====
  function initLogout() {
    const logoutBtn = document.getElementById("logoutBtn");
    if (!logoutBtn) {
      console.error("Logout button with ID 'logoutBtn' not found in DOM");
      return;
    }
    console.log("Logout button found in DOM");
    logoutBtn.addEventListener("click", async () => {
      console.log("Logout button clicked");
      try {
        const apiHost =
          window.location.hostname === "127.0.0.1" ? "127.0.0.1" : "localhost";
        const url = `http://${apiHost}:3011/logout`;
        console.log("Sending logout request to:", url);
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        console.log("Logout status:", response.status);
      } catch (err) {
        console.error("Error during logout request:", err.message);
      }
      sessionStorage.clear();
      console.log("Session storage cleared");
      document.cookie.split(";").forEach((cookie) => {
        const name = cookie.split("=")[0].trim();
        if (name) deleteCookie(name);
      });
      console.log("All cookies cleared");
      window.location.href = "index.html";
      console.log("Redirected to index.html after logout");
    });
  }

  // ======== Privacy Policy (من account.js) ========
  // const showPrivacyBtn = document.getElementById("showPrivacy");
  // if (showPrivacyBtn) {
  //   showPrivacyBtn.addEventListener("click", (e) => {
  //     e.preventDefault();
  //     const modal = document.getElementById("privacyModal");
  //     if (modal) modal.style.display = "flex";
  //   });
  // }
  // window.closePrivacy = () => {
  //   const modal = document.getElementById("privacyModal");
  //   if (modal) modal.style.display = "none";
  // };

  // تشغيل الكل
  initSignupForm();
  initLoginForm();
  checkAuth();
  initLogout();
}

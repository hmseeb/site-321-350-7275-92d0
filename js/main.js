/* =========================================================
   US 1 Roofing and Repairs Inc. — main.js
   Mobile nav, sticky header, smooth scrolling,
   contact form validation (no external APIs).
   ========================================================= */
(function () {
  "use strict";

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("footer-year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Sticky header shadow ---------- */
  var header = document.getElementById("site-header");
  function onScroll() {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile navigation ---------- */
  var toggle = document.getElementById("nav-toggle");
  var nav = document.getElementById("primary-nav");

  function closeNav() {
    if (!nav || !toggle) return;
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open navigation menu");
  }
  function openNav() {
    if (!nav || !toggle) return;
    nav.classList.add("open");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Close navigation menu");
  }

  if (toggle) {
    toggle.addEventListener("click", function () {
      if (nav && nav.classList.contains("open")) closeNav();
      else openNav();
    });
  }

  /* Close the mobile menu after choosing a link */
  if (nav) {
    nav.addEventListener("click", function (e) {
      var target = e.target;
      if (target && target.tagName === "A" && target.getAttribute("href") &&
          target.getAttribute("href").charAt(0) === "#") {
        closeNav();
      }
    });
  }

  window.addEventListener("resize", function () {
    if (window.innerWidth > 780) closeNav();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeNav();
  });

  /* ---------- Smooth scroll with sticky-header offset ---------- */
  document.addEventListener("click", function (e) {
    var link = e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!link) return;
    var id = link.getAttribute("href");
    if (!id || id === "#" || id.length < 2) return;
    var target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    var offset = header ? header.offsetHeight : 0;
    var top = target.getBoundingClientRect().top + window.pageYOffset - offset + 1;
    window.scrollTo({ top: top, behavior: "smooth" });
    if (history.replaceState) history.replaceState(null, "", id);
  });

  /* ---------- Contact form ---------- */
  var form = document.getElementById("contact-form");
  var status = document.getElementById("form-status");
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setError(field, message) {
    var wrapper = field.closest(".field");
    if (!wrapper) return;
    wrapper.classList.add("invalid");
    var existing = wrapper.querySelector(".field-error");
    if (!existing) {
      existing = document.createElement("p");
      existing.className = "field-error";
      wrapper.appendChild(existing);
    }
    existing.textContent = message;
    field.setAttribute("aria-invalid", "true");
  }

  function clearError(field) {
    var wrapper = field.closest(".field");
    if (!wrapper) return;
    wrapper.classList.remove("invalid");
    var existing = wrapper.querySelector(".field-error");
    if (existing) existing.remove();
    field.removeAttribute("aria-invalid");
  }

  function validate() {
    var ok = true;
    var fields = form.querySelectorAll("input, select, textarea");
    Array.prototype.forEach.call(fields, function (field) {
      clearError(field);
      var value = (field.value || "").trim();
      if (!value) {
        setError(field, "This field is required.");
        ok = false;
        return;
      }
      if (field.type === "email" && !EMAIL_RE.test(value)) {
        setError(field, "Please enter a valid email address.");
        ok = false;
        return;
      }
      if (field.type === "tel" && value.replace(/[^\d]/g, "").length < 10) {
        setError(field, "Please enter a valid phone number.");
        ok = false;
      }
    });
    return ok;
  }

  if (form) {
    /* Clear errors as the user corrects them */
    form.addEventListener("input", function (e) {
      if (e.target && e.target.closest && e.target.closest(".field.invalid")) {
        clearError(e.target);
      }
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate()) {
        if (status) {
          status.textContent = "Please correct the highlighted fields and try again.";
          status.className = "form-status error";
        }
        var firstInvalid = form.querySelector(".field.invalid input, .field.invalid select, .field.invalid textarea");
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      /* No backend service is configured. Hand the request to the user's
         email client so the message still reaches the business. */
      var name = form.name.value.trim();
      var phone = form.phone.value.trim();
      var email = form.email.value.trim();
      var service = form.service.value;
      var message = form.message.value.trim();

      var subject = "Free Roof Estimate Request — " + name;
      var body =
        "Name: " + name + "\n" +
        "Phone: " + phone + "\n" +
        "Email: " + email + "\n" +
        "Service Needed: " + service + "\n\n" +
        "Project Details:\n" + message + "\n";

      var mailto = "mailto:brian@us1roofingandrepairs.com" +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);

      if (status) {
        status.textContent = "Thank you, " + name + "! Opening your email app to send your request… " +
          "You can also call (321) 350-7275.";
        status.className = "form-status success";
      }

      window.location.href = mailto;
      form.reset();
    });
  }
})();
(function () {
  "use strict";

  const navToggle = document.getElementById("nav-toggle");
  const siteNav = document.getElementById("site-nav");
  const navLinks = siteNav ? siteNav.querySelectorAll('a[href^="#"]') : [];
  const themeToggle = document.getElementById("theme-toggle");
  const yearEl = document.getElementById("year");

  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* Profile photo: show initials + hint until images/profile.jpg loads */
  const profileWrap = document.getElementById("profile-photo-wrap");
  const profileImg = document.getElementById("profile-img");
  if (profileWrap && profileImg) {
    function markHasPhoto() {
      profileWrap.classList.remove("no-photo");
      profileWrap.classList.add("has-photo");
    }
    function markNoPhoto() {
      profileWrap.classList.remove("has-photo");
      profileWrap.classList.add("no-photo");
    }
    profileImg.addEventListener("load", function () {
      if (profileImg.naturalWidth > 0) markHasPhoto();
    });
    profileImg.addEventListener("error", markNoPhoto);
    if (profileImg.complete) {
      if (profileImg.naturalWidth > 0) markHasPhoto();
      else markNoPhoto();
    }
  }

  /* Theme: persist + respect system */
  const THEME_KEY = "portfolio-theme";
  function getStoredTheme() {
    try {
      return localStorage.getItem(THEME_KEY);
    } catch {
      return null;
    }
  }
  function setStoredTheme(value) {
    try {
      localStorage.setItem(THEME_KEY, value);
    } catch {
      /* ignore */
    }
  }
  function applyTheme(theme) {
    if (theme === "dark" || theme === "light") {
      document.documentElement.setAttribute("data-theme", theme);
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }
  const stored = getStoredTheme();
  if (stored === "dark" || stored === "light") {
    applyTheme(stored);
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      const root = document.documentElement;
      const current = root.getAttribute("data-theme");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const isDark =
        current === "dark" || (!current && prefersDark) || (current !== "light" && prefersDark);
      const next = isDark ? "light" : "dark";
      applyTheme(next);
      setStoredTheme(next);
      themeToggle.setAttribute(
        "aria-label",
        next === "dark" ? "Switch to light mode" : "Switch to dark mode"
      );
    });
  }

  /* Mobile nav */
  function closeNav() {
    if (!siteNav || !navToggle) return;
    siteNav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
  }
  function openNav() {
    if (!siteNav || !navToggle) return;
    siteNav.classList.add("is-open");
    navToggle.setAttribute("aria-expanded", "true");
    navToggle.setAttribute("aria-label", "Close menu");
  }

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", function () {
      if (siteNav.classList.contains("is-open")) {
        closeNav();
      } else {
        openNav();
      }
    });

    navLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        if (window.matchMedia("(max-width: 768px)").matches) {
          closeNav();
        }
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });
  }

  /* Smooth scroll: native CSS handles most; ensure offset for sticky header */
  const header = document.querySelector(".site-header");
  const headerOffset = header ? header.offsetHeight : 0;

  navLinks.forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      const id = anchor.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - headerOffset - 8;
      window.scrollTo({ top: top, behavior: "smooth" });
      history.pushState(null, "", id);
    });
  });

  /* Active section highlight (scroll position) */
  const sections = Array.prototype.slice.call(document.querySelectorAll("main section[id]"));
  function updateActiveNav() {
    if (!sections.length || !navLinks.length) return;
    const y = window.scrollY + headerOffset + 24;
    let currentId = sections[0].id;
    for (let i = 0; i < sections.length; i++) {
      const sec = sections[i];
      if (sec.offsetTop <= y) currentId = sec.id;
    }
    navLinks.forEach(function (link) {
      const href = link.getAttribute("href");
      link.classList.toggle("is-active", href === "#" + currentId);
    });
  }
  let ticking = false;
  window.addEventListener(
    "scroll",
    function () {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          updateActiveNav();
          ticking = false;
        });
        ticking = true;
      }
    },
    { passive: true }
  );
  updateActiveNav();
})();

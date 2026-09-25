/**
 * Flowbase — site interactions
 */

(function () {
  "use strict";

  const header = document.getElementById("site-header");
  const toggle = document.querySelector(".nav-toggle");
  const mobileNav = document.getElementById("mobile-nav");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Mobile navigation ---------------------------------------------------- */

  function setMenuOpen(open) {
    if (!toggle || !mobileNav) return;

    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    mobileNav.classList.toggle("is-open", open);
    if (header) header.classList.toggle("is-menu-open", open);

    if (open) {
      mobileNav.removeAttribute("hidden");
      mobileNav.setAttribute("aria-hidden", "false");
    } else {
      mobileNav.setAttribute("hidden", "");
      mobileNav.setAttribute("aria-hidden", "true");
    }

    document.body.style.overflow = open ? "hidden" : "";
  }

  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      setMenuOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setMenuOpen(false);
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setMenuOpen(false);
        toggle.focus();
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 992 && toggle.getAttribute("aria-expanded") === "true") {
        setMenuOpen(false);
      }
    });
  }

  /* Sticky header -------------------------------------------------------- */

  function updateHeader() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 4);
  }

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  /* Smooth scroll -------------------------------------------------------- */

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (event) {
      const id = anchor.getAttribute("href");
      if (!id || id === "#") return;

      const target = document.querySelector(id);
      if (!target) return;

      event.preventDefault();

      const headerOffset = header ? header.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - headerOffset - 8;

      window.scrollTo({
        top: Math.max(0, top),
        behavior: reduceMotion ? "auto" : "smooth",
      });

      if (!target.hasAttribute("tabindex")) {
        target.setAttribute("tabindex", "-1");
      }
      target.focus({ preventScroll: true });
    });
  });

  /* Reveal on scroll ----------------------------------------------------- */

  const reveals = document.querySelectorAll(".reveal");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) {
      el.classList.add("is-visible");
    });
  } else {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.08 }
    );

    reveals.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* Dashboard micro-interactions ----------------------------------------- */

  function activateExclusive(items, current, activeClass) {
    items.forEach(function (el) {
      el.classList.remove(activeClass);
    });
    current.classList.add(activeClass);
  }

  document.querySelectorAll(".mock-task[tabindex]").forEach(function (task) {
    const tasks = document.querySelectorAll(".mock-task[tabindex]");

    task.addEventListener("click", function () {
      activateExclusive(tasks, task, "is-active-task");
    });

    task.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activateExclusive(tasks, task, "is-active-task");
      }
    });
  });

  document.querySelectorAll(".dash-table .is-interactive").forEach(function (row) {
    const rows = document.querySelectorAll(".dash-table .is-interactive");

    row.addEventListener("click", function () {
      activateExclusive(rows, row, "is-selected");
    });

    row.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activateExclusive(rows, row, "is-selected");
      }
    });
  });

  document.querySelectorAll(".dash-projects li").forEach(function (item) {
    item.setAttribute("tabindex", "0");
    item.setAttribute("role", "button");

    function activate() {
      document.querySelectorAll(".dash-projects li").forEach(function (el) {
        el.classList.remove("is-active");
        const dot = el.querySelector(".dot");
        if (dot) dot.classList.remove("accent");
      });

      item.classList.add("is-active");
      const activeDot = item.querySelector(".dot");
      if (activeDot) activeDot.classList.add("accent");

      const heading = document.querySelector(".dash-heading");
      if (heading) {
        const label = item.childNodes[item.childNodes.length - 1];
        heading.textContent = label && label.textContent
          ? label.textContent.trim()
          : item.textContent.trim();
      }
    }

    item.addEventListener("click", activate);
    item.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activate();
      }
    });
  });
})();

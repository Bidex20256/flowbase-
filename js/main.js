/**
 * Flowbase — site interactions + accessibility
 */

(function () {
  "use strict";

  var header = document.getElementById("site-header");
  var toggle = document.querySelector(".nav-toggle");
  var mobileNav = document.getElementById("mobile-nav");
  var motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  var reduceMotion = motionQuery.matches;
  var lastFocusBeforeMenu = null;

  function prefersReducedMotion() {
    return reduceMotion;
  }

  if (typeof motionQuery.addEventListener === "function") {
    motionQuery.addEventListener("change", function (event) {
      reduceMotion = event.matches;
    });
  } else if (typeof motionQuery.addListener === "function") {
    motionQuery.addListener(function (event) {
      reduceMotion = event.matches;
    });
  }

  function activateExclusive(items, current, activeClass) {
    Array.prototype.forEach.call(items, function (el) {
      el.classList.remove(activeClass);
      if (el.getAttribute("aria-pressed") !== null) {
        el.setAttribute("aria-pressed", "false");
      }
    });
    current.classList.add(activeClass);
    if (current.getAttribute("aria-pressed") !== null) {
      current.setAttribute("aria-pressed", "true");
    }
  }

  /* Mobile navigation ---------------------------------------------------- */

  function getMenuFocusable() {
    if (!mobileNav) return [];
    return mobileNav.querySelectorAll('a[href], button:not([disabled])');
  }

  function setMenuOpen(open) {
    if (!toggle || !mobileNav) return;

    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    mobileNav.classList.toggle("is-open", open);
    if (header) header.classList.toggle("is-menu-open", open);

    if (open) {
      lastFocusBeforeMenu = document.activeElement;
      mobileNav.removeAttribute("hidden");
      mobileNav.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";

      var focusable = getMenuFocusable();
      if (focusable.length) {
        window.setTimeout(function () {
          focusable[0].focus();
        }, 0);
      }
    } else {
      mobileNav.setAttribute("hidden", "");
      mobileNav.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";

      var restore = lastFocusBeforeMenu || toggle;
      if (restore && typeof restore.focus === "function") {
        restore.focus();
      }
      lastFocusBeforeMenu = null;
    }
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
      var isOpen = toggle.getAttribute("aria-expanded") === "true";
      if (!isOpen) return;

      if (event.key === "Escape") {
        event.preventDefault();
        setMenuOpen(false);
        return;
      }

      if (event.key !== "Tab") return;

      var focusable = Array.prototype.slice.call(getMenuFocusable());
      if (!focusable.length) return;

      var first = focusable[0];
      var last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
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
      var id = anchor.getAttribute("href");
      if (!id || id === "#") return;

      var target = document.querySelector(id);
      if (!target) return;

      event.preventDefault();

      var headerOffset = header ? header.offsetHeight : 0;
      var top = target.getBoundingClientRect().top + window.scrollY - headerOffset - 8;

      window.scrollTo({
        top: Math.max(0, top),
        behavior: prefersReducedMotion() ? "auto" : "smooth",
      });

      if (!target.hasAttribute("tabindex")) {
        target.setAttribute("tabindex", "-1");
      }
      target.focus({ preventScroll: true });

      if (history.replaceState) {
        history.replaceState(null, "", id);
      }
    });
  });

  /* Active section nav highlighting -------------------------------------- */

  var sectionIds = ["product", "features", "pricing", "customers", "faq"];
  var navLinks = document.querySelectorAll("[data-nav]");

  function setActiveNav(id) {
    navLinks.forEach(function (link) {
      var href = link.getAttribute("href");
      var match = href === "#" + id;
      link.classList.toggle("is-active", match);
      if (match) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  if ("IntersectionObserver" in window && navLinks.length) {
    var sectionObserver = new IntersectionObserver(
      function (entries) {
        var visible = entries
          .filter(function (entry) {
            return entry.isIntersecting;
          })
          .sort(function (a, b) {
            return b.intersectionRatio - a.intersectionRatio;
          });

        if (visible.length) {
          setActiveNav(visible[0].target.id);
        }
      },
      {
        rootMargin: "-35% 0px -50% 0px",
        threshold: [0.1, 0.25, 0.5],
      }
    );

    sectionIds.forEach(function (id) {
      var section = document.getElementById(id);
      if (section) sectionObserver.observe(section);
    });
  }

  /* Reveal on scroll ----------------------------------------------------- */

  var reveals = document.querySelectorAll(".reveal");

  if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) {
      el.classList.add("is-visible");
    });
  } else {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -4% 0px", threshold: 0.06 }
    );

    reveals.forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  /* Hero mock task selection --------------------------------------------- */

  document.querySelectorAll(".mock-task[tabindex]").forEach(function (task) {
    var tasks = document.querySelectorAll(".mock-task[tabindex]");

    function selectTask() {
      activateExclusive(tasks, task, "is-active-task");
    }

    task.addEventListener("click", selectTask);
    task.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectTask();
      }
    });
  });

  /* Workspace showcase --------------------------------------------------- */

  var workspace = document.getElementById("workspace-demo");
  var dashLive = document.getElementById("dash-live");

  var STATUS = {
    done: { label: "Done", className: "tag tag-done" },
    progress: { label: "In progress", className: "tag tag-progress" },
    review: { label: "Review", className: "tag tag-review" },
    todo: { label: "Todo", className: "tag tag-todo" },
  };

  var PROJECTS = {
    atlas: {
      name: "Atlas Launch",
      slug: "atlas-launch",
      sub: "Engineering · Due Sep 30",
      status: "On track",
      complete: "72%",
      completeBar: 72,
      open: "18",
      openBar: 45,
      due: "6d",
      dueLabel: "Until launch",
      dueBar: 85,
      avatars: [
        { initials: "AK", tone: "a" },
        { initials: "ML", tone: "b" },
        { initials: "JR", tone: "c" },
      ],
      members: [
        { initials: "AK", tone: "a", name: "Aisha K.", role: "Lead" },
        { initials: "ML", tone: "b", name: "Marco L.", role: "Design" },
        { initials: "JR", tone: "c", name: "Jules R.", role: "Eng" },
        { initials: "TS", tone: "d", name: "Taylor S.", role: "Ops" },
      ],
      tasks: [
        { title: "Ship landing page v2", owner: "Marco L.", initials: "ML", tone: "b", prio: "P1", high: true, status: "progress", due: "Sep 22", selected: true },
        { title: "Finalize brand guidelines", owner: "Aisha K.", initials: "AK", tone: "a", prio: "P3", high: false, status: "done", due: "Sep 12" },
        { title: "QA onboarding flow", owner: "Jules R.", initials: "JR", tone: "c", prio: "P2", high: false, status: "review", due: "Sep 24" },
        { title: "Prepare launch checklist", owner: "Taylor S.", initials: "TS", tone: "d", prio: "P2", high: false, status: "todo", due: "Sep 28" },
        { title: "Send partner announcements", owner: "Aisha K.", initials: "AK", tone: "a", prio: "P3", high: false, status: "todo", due: "Sep 29" },
      ],
      activity: [
        { who: "Marco", text: " moved task to In progress", when: "2h ago", datetime: "2026-09-25T09:12" },
        { who: "Jules", text: " left a comment on QA flow", when: "4h ago", datetime: "2026-09-25T07:40" },
        { who: "Aisha", text: " marked guidelines as Done", when: "Yesterday", datetime: "2026-09-24T16:20" },
      ],
    },
    roadmap: {
      name: "Q3 Roadmap",
      slug: "q3-roadmap",
      sub: "Product · Due Oct 15",
      status: "At risk",
      complete: "41%",
      completeBar: 41,
      open: "24",
      openBar: 62,
      due: "20d",
      dueLabel: "Until review",
      dueBar: 40,
      avatars: [
        { initials: "AK", tone: "a" },
        { initials: "JR", tone: "c" },
        { initials: "TS", tone: "d" },
      ],
      members: [
        { initials: "AK", tone: "a", name: "Aisha K.", role: "PM" },
        { initials: "JR", tone: "c", name: "Jules R.", role: "Eng" },
        { initials: "TS", tone: "d", name: "Taylor S.", role: "Research" },
      ],
      tasks: [
        { title: "Prioritize Q3 epics", owner: "Aisha K.", initials: "AK", tone: "a", prio: "P1", high: true, status: "progress", due: "Sep 26", selected: true },
        { title: "Estimate engineering capacity", owner: "Jules R.", initials: "JR", tone: "c", prio: "P1", high: true, status: "review", due: "Sep 27" },
        { title: "Draft customer interview guide", owner: "Taylor S.", initials: "TS", tone: "d", prio: "P2", high: false, status: "todo", due: "Oct 02" },
        { title: "Sync roadmap with sales", owner: "Aisha K.", initials: "AK", tone: "a", prio: "P2", high: false, status: "todo", due: "Oct 05" },
        { title: "Publish public changelog", owner: "Jules R.", initials: "JR", tone: "c", prio: "P3", high: false, status: "done", due: "Sep 18" },
      ],
      activity: [
        { who: "Aisha", text: " flagged capacity risk", when: "1h ago", datetime: "2026-09-25T10:05" },
        { who: "Jules", text: " updated epic estimates", when: "3h ago", datetime: "2026-09-25T08:20" },
        { who: "Taylor", text: " added interview targets", when: "Yesterday", datetime: "2026-09-24T15:10" },
      ],
    },
    portal: {
      name: "Customer Portal",
      slug: "customer-portal",
      sub: "Design · Due Nov 8",
      status: "On track",
      complete: "58%",
      completeBar: 58,
      open: "12",
      openBar: 38,
      due: "44d",
      dueLabel: "Until release",
      dueBar: 55,
      avatars: [
        { initials: "ML", tone: "b" },
        { initials: "JR", tone: "c" },
        { initials: "AK", tone: "a" },
      ],
      members: [
        { initials: "ML", tone: "b", name: "Marco L.", role: "Design" },
        { initials: "JR", tone: "c", name: "Jules R.", role: "Eng" },
        { initials: "AK", tone: "a", name: "Aisha K.", role: "PM" },
      ],
      tasks: [
        { title: "Define account settings IA", owner: "Marco L.", initials: "ML", tone: "b", prio: "P1", high: true, status: "progress", due: "Oct 01", selected: true },
        { title: "Build billing summary API", owner: "Jules R.", initials: "JR", tone: "c", prio: "P1", high: true, status: "todo", due: "Oct 08" },
        { title: "Prototype support inbox", owner: "Marco L.", initials: "ML", tone: "b", prio: "P2", high: false, status: "review", due: "Oct 03" },
        { title: "Write help center articles", owner: "Aisha K.", initials: "AK", tone: "a", prio: "P3", high: false, status: "todo", due: "Oct 12" },
        { title: "Audit accessibility pass", owner: "Jules R.", initials: "JR", tone: "c", prio: "P2", high: false, status: "done", due: "Sep 20" },
      ],
      activity: [
        { who: "Marco", text: " shared settings wireframes", when: "35m ago", datetime: "2026-09-25T10:40" },
        { who: "Jules", text: " opened billing API ticket", when: "2h ago", datetime: "2026-09-25T09:00" },
        { who: "Aisha", text: " approved support scope", when: "Yesterday", datetime: "2026-09-24T17:45" },
      ],
    },
  };

  function setBarWidth(el, pct) {
    if (!el) return;
    el.className = "";
    el.style.width = pct + "%";
  }

  function announce(message) {
    if (!dashLive) return;
    dashLive.textContent = "";
    window.setTimeout(function () {
      dashLive.textContent = message;
    }, 10);
  }

  function renderAvatars(container, avatars) {
    if (!container) return;
    container.innerHTML = avatars
      .map(function (a) {
        return (
          '<span class="avatar avatar-' +
          a.tone +
          '" aria-hidden="true">' +
          a.initials +
          "</span>"
        );
      })
      .join("");
  }

  function renderMembers(listEl, sideEl, members) {
    if (listEl) {
      listEl.innerHTML = members
        .map(function (m) {
          return (
            "<li>" +
            '<span class="avatar xs avatar-' +
            m.tone +
            '" aria-hidden="true">' +
            m.initials +
            "</span>" +
            "<div><strong>" +
            m.name +
            "</strong><span>" +
            m.role +
            "</span></div>" +
            "</li>"
          );
        })
        .join("");
    }
    if (sideEl) {
      sideEl.innerHTML = members
        .map(function (m) {
          return (
            "<li>" +
            '<span class="avatar xs avatar-' +
            m.tone +
            '" aria-hidden="true">' +
            m.initials +
            "</span>" +
            "<span>" +
            m.name +
            "</span>" +
            "</li>"
          );
        })
        .join("");
    }
  }

  function renderActivity(listEl, activity) {
    if (!listEl) return;
    listEl.innerHTML = activity
      .map(function (item) {
        return (
          "<li>" +
          '<span class="activity-dot" aria-hidden="true"></span>' +
          "<div><p><strong>" +
          item.who +
          "</strong>" +
          item.text +
          "</p>" +
          '<time datetime="' +
          item.datetime +
          '">' +
          item.when +
          "</time></div>" +
          "</li>"
        );
      })
      .join("");
  }

  function renderTasks(tbody, tasks) {
    if (!tbody) return;
    tbody.innerHTML = tasks
      .map(function (task) {
        var st = STATUS[task.status] || STATUS.todo;
        var checked = task.status === "done";
        var selected = task.selected ? " is-selected" : "";
        var complete = checked ? " is-complete" : "";
        var prioClass = task.high ? "prio prio-high" : "prio";
        var checkLabel = (checked ? "Mark incomplete: " : "Mark complete: ") + task.title;
        return (
          '<tr class="is-interactive' +
          selected +
          complete +
          '" tabindex="0" data-status="' +
          task.status +
          '" aria-selected="' +
          String(!!task.selected) +
          '">' +
          "<td><button type=\"button\" class=\"task-check" +
          (checked ? " is-checked" : "") +
          '" aria-label="' +
          checkLabel +
          '" aria-pressed="' +
          checked +
          '"></button></td>' +
          "<td>" +
          task.title +
          "</td>" +
          '<td><span class="owner"><span class="avatar xs avatar-' +
          task.tone +
          '" aria-hidden="true">' +
          task.initials +
          "</span> " +
          task.owner +
          "</span></td>" +
          '<td><span class="' +
          prioClass +
          '">' +
          task.prio +
          "</span></td>" +
          '<td><span class="' +
          st.className +
          '">' +
          st.label +
          "</span></td>" +
          '<td class="muted">' +
          task.due +
          "</td>" +
          "</tr>"
        );
      })
      .join("");
    bindTaskRows(tbody);
  }

  function bindTaskRows(tbody) {
    if (!tbody) return;
    var rows = tbody.querySelectorAll(".is-interactive");

    rows.forEach(function (row) {
      row.addEventListener("click", function (event) {
        if (event.target.closest(".task-check")) return;
        activateExclusive(rows, row, "is-selected");
        rows.forEach(function (r) {
          r.setAttribute("aria-selected", String(r === row));
        });
      });

      row.addEventListener("keydown", function (event) {
        if (event.target.classList.contains("task-check")) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          activateExclusive(rows, row, "is-selected");
          rows.forEach(function (r) {
            r.setAttribute("aria-selected", String(r === row));
          });
        }
      });
    });

    tbody.querySelectorAll(".task-check").forEach(function (btn) {
      btn.addEventListener("click", function (event) {
        event.stopPropagation();
        var row = btn.closest("tr");
        var titleCell = row ? row.children[1] : null;
        var title = titleCell ? titleCell.textContent.trim() : "task";
        var done = !btn.classList.contains("is-checked");

        btn.classList.toggle("is-checked", done);
        btn.setAttribute("aria-pressed", String(done));
        btn.setAttribute(
          "aria-label",
          (done ? "Mark incomplete: " : "Mark complete: ") + title
        );

        if (row) {
          row.classList.toggle("is-complete", done);
          var tag = row.querySelector(".tag");
          if (tag) {
            tag.className = done ? "tag tag-done" : "tag tag-todo";
            tag.textContent = done ? "Done" : "Todo";
          }
          row.setAttribute("data-status", done ? "done" : "todo");
        }
      });
    });
  }

  function loadProject(id) {
    var data = PROJECTS[id];
    if (!data || !workspace) return;

    var heading = document.getElementById("dash-heading");
    var sub = document.getElementById("dash-sub");
    var status = document.getElementById("dash-status");
    var url = document.getElementById("dash-url");
    var complete = document.getElementById("dash-metric-complete");
    var open = document.getElementById("dash-metric-open");
    var due = document.getElementById("dash-metric-due");
    var dueLabel = document.getElementById("dash-metric-due-label");
    var memberCount = document.getElementById("dash-member-count");

    if (heading) heading.textContent = data.name;
    if (sub) sub.textContent = data.sub;
    if (status) {
      status.textContent = data.status;
      status.classList.toggle("is-risk", data.status !== "On track");
    }
    if (url) url.textContent = "app.flowbase.io / " + data.slug;
    if (complete) complete.textContent = data.complete;
    if (open) open.textContent = data.open;
    if (due) due.textContent = data.due;
    if (dueLabel) dueLabel.textContent = data.dueLabel;
    if (memberCount) memberCount.textContent = String(data.members.length);

    setBarWidth(document.getElementById("dash-bar-complete"), data.completeBar);
    setBarWidth(document.getElementById("dash-bar-open"), data.openBar);
    setBarWidth(document.getElementById("dash-bar-due"), data.dueBar);
    renderAvatars(document.getElementById("dash-avatars"), data.avatars);
    renderMembers(
      document.getElementById("dash-member-list"),
      document.getElementById("dash-side-members"),
      data.members
    );
    renderActivity(document.getElementById("dash-activity"), data.activity);
    renderTasks(document.getElementById("dash-task-body"), data.tasks);

    document.querySelectorAll(".dash-projects li").forEach(function (item) {
      var active = item.getAttribute("data-project") === id;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", String(active));
      var dot = item.querySelector(".dot");
      if (dot) dot.classList.toggle("accent", active);
    });

    document.querySelectorAll(".dash-mobile-btn").forEach(function (btn) {
      var active = btn.getAttribute("data-project") === id;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", String(active));
    });

    announce("Showing project " + data.name);
  }

  if (workspace) {
    document.querySelectorAll(".dash-projects li[data-project]").forEach(function (item) {
      item.setAttribute("aria-pressed", item.classList.contains("is-active") ? "true" : "false");

      function activate() {
        loadProject(item.getAttribute("data-project"));
      }

      item.addEventListener("click", activate);
      item.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          activate();
        }
      });
    });

    document.querySelectorAll(".dash-mobile-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        loadProject(btn.getAttribute("data-project"));
      });
    });

    document.querySelectorAll(".dash-nav li[role='button']").forEach(function (item) {
      var navItems = document.querySelectorAll(".dash-nav li[role='button']");
      item.addEventListener("click", function () {
        activateExclusive(navItems, item, "is-active");
      });
      item.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          activateExclusive(navItems, item, "is-active");
        }
      });
    });

    bindTaskRows(document.getElementById("dash-task-body"));
  }

  /* View tabs ------------------------------------------------------------ */

  document.querySelectorAll(".mock-toolbar, .dash-views").forEach(function (group) {
    var tabs = group.querySelectorAll(".mock-tab");
    tabs.forEach(function (tab) {
      tab.setAttribute("tabindex", "0");

      function activateTab() {
        tabs.forEach(function (el) {
          el.classList.remove("is-active");
          if (el.getAttribute("role") === "tab") {
            el.setAttribute("aria-selected", "false");
            el.setAttribute("tabindex", "-1");
          }
        });
        tab.classList.add("is-active");
        if (tab.getAttribute("role") === "tab") {
          tab.setAttribute("aria-selected", "true");
          tab.setAttribute("tabindex", "0");
        }
      }

      tab.addEventListener("click", activateTab);
      tab.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          activateTab();
          return;
        }

        if (tab.getAttribute("role") !== "tab") return;

        var tabsArr = Array.prototype.slice.call(tabs);
        var index = tabsArr.indexOf(tab);
        var next = null;

        if (event.key === "ArrowRight" || event.key === "ArrowDown") {
          next = tabsArr[(index + 1) % tabsArr.length];
        } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
          next = tabsArr[(index - 1 + tabsArr.length) % tabsArr.length];
        } else if (event.key === "Home") {
          next = tabsArr[0];
        } else if (event.key === "End") {
          next = tabsArr[tabsArr.length - 1];
        }

        if (next) {
          event.preventDefault();
          next.focus();
          next.click();
        }
      });
    });
  });

  /* Pricing billing toggle ----------------------------------------------- */

  var billingButtons = document.querySelectorAll(".pricing-toggle-btn");
  var priceAmounts = document.querySelectorAll(".price-amount");
  var priceBilled = document.querySelectorAll(".price-billed");
  var pricingSave = document.getElementById("pricing-save");
  var pricingLive = document.getElementById("pricing-live");

  function setBilling(period) {
    if (period !== "monthly" && period !== "yearly") return;
    var isYearly = period === "yearly";

    billingButtons.forEach(function (btn) {
      var active = btn.getAttribute("data-billing") === period;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", String(active));
    });

    priceAmounts.forEach(function (el) {
      var next = el.getAttribute(isYearly ? "data-yearly" : "data-monthly");
      if (!next || el.textContent === next) return;

      if (prefersReducedMotion()) {
        el.textContent = next;
        return;
      }

      el.classList.add("is-updating");
      window.setTimeout(function () {
        el.textContent = next;
        el.classList.remove("is-updating");
      }, 120);
    });

    priceBilled.forEach(function (el) {
      if (isYearly) {
        el.removeAttribute("hidden");
      } else {
        el.setAttribute("hidden", "");
      }
    });

    if (pricingSave) {
      if (isYearly) {
        pricingSave.removeAttribute("hidden");
      } else {
        pricingSave.setAttribute("hidden", "");
      }
    }

    if (pricingLive) {
      pricingLive.textContent = isYearly
        ? "Yearly billing selected. Prices show monthly cost billed yearly. Save 20 percent."
        : "Monthly billing selected.";
    }
  }

  if (billingButtons.length) {
    billingButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        setBilling(btn.getAttribute("data-billing"));
      });

      btn.addEventListener("keydown", function (event) {
        var buttons = Array.prototype.slice.call(billingButtons);
        var index = buttons.indexOf(btn);
        var next = null;

        if (event.key === "ArrowRight" || event.key === "ArrowDown") {
          next = buttons[(index + 1) % buttons.length];
        } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
          next = buttons[(index - 1 + buttons.length) % buttons.length];
        } else if (event.key === "Home") {
          next = buttons[0];
        } else if (event.key === "End") {
          next = buttons[buttons.length - 1];
        }

        if (next) {
          event.preventDefault();
          next.focus();
          setBilling(next.getAttribute("data-billing"));
        }
      });
    });
  }

  /* Customer stories ----------------------------------------------------- */

  var storyTabs = document.querySelectorAll(".stories-tab");
  var storyPanels = document.querySelectorAll(".story-panel");
  var storiesTablist = document.querySelector(".stories-tabs");
  var storiesPrev = document.getElementById("stories-prev");
  var storiesNext = document.getElementById("stories-next");
  var storiesStatus = document.getElementById("stories-status");
  var storyIndex = 0;

  function updateStoriesOrientation() {
    if (!storiesTablist) return;
    storiesTablist.setAttribute(
      "aria-orientation",
      window.innerWidth <= 768 ? "horizontal" : "vertical"
    );
  }

  function showStory(index, options) {
    if (!storyTabs.length || !storyPanels.length) return;

    var total = storyTabs.length;
    var nextIndex = ((index % total) + total) % total;
    var opts = options || {};
    storyIndex = nextIndex;

    storyTabs.forEach(function (tab, i) {
      var active = i === nextIndex;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
      tab.setAttribute("tabindex", active ? "0" : "-1");
    });

    storyPanels.forEach(function (panel, i) {
      var active = i === nextIndex;
      panel.classList.toggle("is-active", active);
      panel.classList.remove("is-entering", "is-visible");

      if (active) {
        panel.removeAttribute("hidden");

        if (!prefersReducedMotion() && !opts.instant) {
          panel.classList.add("is-entering");
          window.requestAnimationFrame(function () {
            panel.classList.add("is-visible");
            panel.classList.remove("is-entering");
          });
        }
      } else {
        panel.setAttribute("hidden", "");
      }
    });

    if (storiesStatus) {
      storiesStatus.textContent = nextIndex + 1 + " of " + total;
    }

    if (storiesPrev) {
      storiesPrev.disabled = nextIndex === 0;
    }
    if (storiesNext) {
      storiesNext.disabled = nextIndex === total - 1;
    }

    if (opts.focusTab && storyTabs[nextIndex]) {
      storyTabs[nextIndex].focus();
    }
  }

  if (storyTabs.length) {
    updateStoriesOrientation();
    window.addEventListener("resize", updateStoriesOrientation);

    showStory(0, { instant: true });

    storyTabs.forEach(function (tab, index) {
      tab.addEventListener("click", function () {
        showStory(index);
      });

      tab.addEventListener("keydown", function (event) {
        var tabsArr = Array.prototype.slice.call(storyTabs);
        var current = tabsArr.indexOf(tab);
        var next = null;
        var orientation =
          storiesTablist && storiesTablist.getAttribute("aria-orientation");
        var forwardKey = orientation === "horizontal" ? "ArrowRight" : "ArrowDown";
        var backKey = orientation === "horizontal" ? "ArrowLeft" : "ArrowUp";

        if (event.key === forwardKey) {
          next = tabsArr[(current + 1) % tabsArr.length];
        } else if (event.key === backKey) {
          next = tabsArr[(current - 1 + tabsArr.length) % tabsArr.length];
        } else if (event.key === "Home") {
          next = tabsArr[0];
        } else if (event.key === "End") {
          next = tabsArr[tabsArr.length - 1];
        } else if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
          if (orientation === "vertical") {
            if (event.key === "ArrowRight") {
              next = tabsArr[(current + 1) % tabsArr.length];
            } else {
              next = tabsArr[(current - 1 + tabsArr.length) % tabsArr.length];
            }
          }
        }

        if (next) {
          event.preventDefault();
          showStory(tabsArr.indexOf(next), { focusTab: true });
        }
      });
    });

    if (storiesPrev) {
      storiesPrev.addEventListener("click", function () {
        showStory(storyIndex - 1);
      });
    }

    if (storiesNext) {
      storiesNext.addEventListener("click", function () {
        showStory(storyIndex + 1);
      });
    }
  }

  /* FAQ accordion -------------------------------------------------------- */

  var faqList = document.querySelector(".faq-list");
  var faqItems = faqList ? faqList.querySelectorAll(".faq-item") : [];

  function closeFaqItem(item) {
    var trigger = item.querySelector(".faq-trigger");
    var panel = item.querySelector(".faq-panel");
    if (!trigger || !panel) return;

    trigger.setAttribute("aria-expanded", "false");
    item.classList.remove("is-open");

    if (prefersReducedMotion()) {
      panel.setAttribute("hidden", "");
      return;
    }

    var finished = false;

    function finishClose(event) {
      if (finished) return;
      if (event && event.target !== panel) return;
      if (event && event.propertyName && event.propertyName !== "grid-template-rows") {
        return;
      }
      finished = true;
      panel.removeEventListener("transitionend", finishClose);
      if (trigger.getAttribute("aria-expanded") === "false") {
        panel.setAttribute("hidden", "");
      }
    }

    panel.addEventListener("transitionend", finishClose);
    window.setTimeout(finishClose, 320);
  }

  function openFaqItem(item) {
    var trigger = item.querySelector(".faq-trigger");
    var panel = item.querySelector(".faq-panel");
    if (!trigger || !panel) return;

    faqItems.forEach(function (other) {
      if (other !== item && other.classList.contains("is-open")) {
        closeFaqItem(other);
      }
    });

    panel.removeAttribute("hidden");
    trigger.setAttribute("aria-expanded", "true");

    if (prefersReducedMotion()) {
      item.classList.add("is-open");
      return;
    }

    window.requestAnimationFrame(function () {
      item.classList.add("is-open");
    });
  }

  function toggleFaqItem(item) {
    var trigger = item.querySelector(".faq-trigger");
    if (!trigger) return;

    if (trigger.getAttribute("aria-expanded") === "true") {
      closeFaqItem(item);
    } else {
      openFaqItem(item);
    }
  }

  if (faqItems.length) {
    faqItems.forEach(function (item, index) {
      var trigger = item.querySelector(".faq-trigger");
      if (!trigger) return;

      trigger.addEventListener("click", function () {
        toggleFaqItem(item);
      });

      trigger.addEventListener("keydown", function (event) {
        var triggers = Array.prototype.map.call(faqItems, function (el) {
          return el.querySelector(".faq-trigger");
        }).filter(Boolean);

        var current = triggers.indexOf(trigger);
        var next = null;

        if (event.key === "ArrowDown") {
          next = triggers[(current + 1) % triggers.length];
        } else if (event.key === "ArrowUp") {
          next = triggers[(current - 1 + triggers.length) % triggers.length];
        } else if (event.key === "Home") {
          next = triggers[0];
        } else if (event.key === "End") {
          next = triggers[triggers.length - 1];
        }

        if (next) {
          event.preventDefault();
          next.focus();
        }
      });
    });
  }
})();

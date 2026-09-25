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

  /* Workspace showcase --------------------------------------------------- */

  var workspace = document.getElementById("workspace-demo");

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

  function renderAvatars(container, avatars) {
    if (!container) return;
    container.innerHTML = avatars
      .map(function (a) {
        return '<span class="avatar avatar-' + a.tone + '">' + a.initials + "</span>";
      })
      .join("");
  }

  function renderMembers(listEl, sideEl, members) {
    if (listEl) {
      listEl.innerHTML = members
        .map(function (m) {
          return (
            "<li>" +
            '<span class="avatar xs avatar-' + m.tone + '">' + m.initials + "</span>" +
            "<div><strong>" + m.name + "</strong><span>" + m.role + "</span></div>" +
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
            '<span class="avatar xs avatar-' + m.tone + '">' + m.initials + "</span>" +
            "<span>" + m.name + "</span>" +
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
          "<div><p><strong>" + item.who + "</strong>" + item.text + "</p>" +
          '<time datetime="' + item.datetime + '">' + item.when + "</time></div>" +
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
        return (
          '<tr class="is-interactive' + selected + complete + '" tabindex="0" data-status="' + task.status + '">' +
          "<td><button type=\"button\" class=\"task-check" + (checked ? " is-checked" : "") +
          "\" aria-label=\"Toggle task complete\" aria-pressed=\"" + checked + "\"></button></td>" +
          "<td>" + task.title + "</td>" +
          '<td><span class="owner"><span class="avatar xs avatar-' + task.tone + '">' +
          task.initials + "</span> " + task.owner + "</span></td>" +
          '<td><span class="' + prioClass + '">' + task.prio + "</span></td>" +
          '<td><span class="' + st.className + '">' + st.label + "</span></td>" +
          '<td class="muted">' + task.due + "</td>" +
          "</tr>"
        );
      })
      .join("");
    bindTaskRows(tbody);
  }

  function bindTaskRows(tbody) {
    var rows = tbody.querySelectorAll(".is-interactive");
    rows.forEach(function (row) {
      row.addEventListener("click", function (event) {
        if (event.target.closest(".task-check")) return;
        activateExclusive(rows, row, "is-selected");
      });
      row.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          if (event.target.classList.contains("task-check")) return;
          event.preventDefault();
          activateExclusive(rows, row, "is-selected");
        }
      });
    });

    tbody.querySelectorAll(".task-check").forEach(function (btn) {
      btn.addEventListener("click", function (event) {
        event.stopPropagation();
        var row = btn.closest("tr");
        var done = !btn.classList.contains("is-checked");
        btn.classList.toggle("is-checked", done);
        btn.setAttribute("aria-pressed", String(done));
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
      var dot = item.querySelector(".dot");
      if (dot) dot.classList.toggle("accent", active);
    });

    document.querySelectorAll(".dash-mobile-btn").forEach(function (btn) {
      btn.classList.toggle("is-active", btn.getAttribute("data-project") === id);
    });
  }

  if (workspace) {
    document.querySelectorAll(".dash-projects li[data-project]").forEach(function (item) {
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

  /* View tabs (decorative mock UI) --------------------------------------- */

  document.querySelectorAll(".mock-toolbar, .dash-views").forEach(function (group) {
    var tabs = group.querySelectorAll(".mock-tab");
    tabs.forEach(function (tab) {
      tab.setAttribute("tabindex", "0");

      function activateTab() {
        tabs.forEach(function (el) {
          el.classList.remove("is-active");
          if (el.getAttribute("role") === "tab") {
            el.setAttribute("aria-selected", "false");
          }
        });
        tab.classList.add("is-active");
        if (tab.getAttribute("role") === "tab") {
          tab.setAttribute("aria-selected", "true");
        }
      }

      tab.addEventListener("click", activateTab);
      tab.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          activateTab();
        }
      });
    });
  });
})();

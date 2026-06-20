/* PivotX site — shared interactions (no dependencies) */
(function () {
  "use strict";

  /* Mark JS active so reveal animations engage (CSS keeps content visible without this) */
  document.documentElement.classList.add("js");

  /* Sticky nav background on scroll */
  var nav = document.querySelector(".nav");
  function onScroll() {
    if (!nav) return;
    nav.classList.toggle("scrolled", window.scrollY > 24);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Active nav — current page (subpages) + scrollspy (home sections); active = colour only, no box */
  var navLinks = document.querySelectorAll(".nav-links a");
  if (navLinks.length) {
    var setActive = function (href) {
      navLinks.forEach(function (a) { a.classList.toggle("active", a.getAttribute("href") === href); });
    };
    var clearActive = function () { navLinks.forEach(function (a) { a.classList.remove("active"); }); };
    var page = location.pathname.split("/").pop() || "index.html";
    var isHome = page === "index.html" || page === "";
    if (!isHome) {
      var key = page;
      if (/^case-study-/.test(page)) key = "case-studies.html";
      else if (/^insight-/.test(page)) key = "insights.html";
      setActive(key);
    } else if ("IntersectionObserver" in window) {
      var spy = ["offerings", "about", "method"];
      var secs = spy.map(function (id) { return document.getElementById(id); }).filter(Boolean);
      if (secs.length) {
        var inView = {};
        var spyIO = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) { inView[e.target.id] = e.isIntersecting; });
          clearActive();
          for (var i = spy.length - 1; i >= 0; i--) { if (inView[spy[i]]) { setActive("#" + spy[i]); break; } }
        }, { rootMargin: "-45% 0px -50% 0px" });
        secs.forEach(function (s) { spyIO.observe(s); });
      }
    }
  }

  /* Mobile menu */
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.querySelector(".mobile-menu");
  var scrim = document.querySelector(".scrim");
  var closeBtn = document.querySelector(".mobile-close");
  function setMenu(open) {
    if (!menu) return;
    menu.classList.toggle("open", open);
    if (scrim) scrim.classList.toggle("open", open);
    document.body.style.overflow = open ? "hidden" : "";
  }
  if (toggle) toggle.addEventListener("click", function () { setMenu(true); });
  if (closeBtn) closeBtn.addEventListener("click", function () { setMenu(false); });
  if (scrim) scrim.addEventListener("click", function () { setMenu(false); });
  if (menu) menu.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () { setMenu(false); });
  });

  /* Reveal on scroll */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
    /* backstop: never leave content hidden if the observer misfires */
    setTimeout(function () { reveals.forEach(function (el) { el.classList.add("in"); }); }, 2600);
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* Count-up stats (animate number upward on scroll into view) */
  var counters = document.querySelectorAll("[data-count]");
  if (counters.length && "IntersectionObserver" in window) {
    var countIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        countIO.unobserve(e.target);
        var el = e.target, target = parseInt(el.getAttribute("data-count"), 10) || 0, dur = 1500, start = null;
        function tick(ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / dur, 1), eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(eased * target);
          if (p < 1) requestAnimationFrame(tick);
        }
        el.textContent = "0";
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { countIO.observe(c); });
  }

  /* Modals (Book a Call / Contact) */
  var modalScrim = document.querySelector("[data-modal-scrim]");
  function closeModals() {
    document.querySelectorAll(".modal.open").forEach(function (m) { m.classList.remove("open"); });
    if (modalScrim) modalScrim.classList.remove("open");
    document.body.style.overflow = "";
  }
  function openModal(id) {
    var m = document.getElementById(id);
    if (!m) return;
    setMenu(false);
    if (modalScrim) modalScrim.classList.add("open");
    m.classList.add("open");
    document.body.style.overflow = "hidden";
    var f = m.querySelector("input, textarea");
    if (f) setTimeout(function () { f.focus(); }, 60);
  }
  document.querySelectorAll("[data-modal]").forEach(function (t) {
    t.addEventListener("click", function (e) { e.preventDefault(); openModal("modal-" + t.getAttribute("data-modal")); });
  });
  document.querySelectorAll("[data-modal-close]").forEach(function (b) { b.addEventListener("click", closeModals); });
  if (modalScrim) modalScrim.addEventListener("click", closeModals);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeModals(); });

  /* Offerings tabs */
  var tabBtns = document.querySelectorAll(".tab-btn");
  if (tabBtns.length) {
    tabBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-tab");
        tabBtns.forEach(function (b) {
          var on = b === btn;
          b.classList.toggle("active", on);
          b.setAttribute("aria-selected", on ? "true" : "false");
        });
        document.querySelectorAll(".offer-panel").forEach(function (p) {
          p.classList.toggle("active", p.id === id);
        });
      });
    });
  }

  /* Insights category filter (insights index page) */
  var filters = document.querySelectorAll("[data-filter]");
  var items = document.querySelectorAll("[data-cat]");
  if (filters.length && items.length) {
    filters.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var cat = btn.getAttribute("data-filter");
        filters.forEach(function (b) { b.classList.toggle("active", b === btn); });
        items.forEach(function (it) {
          var show = cat === "all" || it.getAttribute("data-cat") === cat;
          it.style.display = show ? "" : "none";
        });
      });
    });
  }

  /* Load more (insights / case studies) */
  var loadBtn = document.querySelector("[data-loadmore]");
  if (loadBtn) {
    loadBtn.addEventListener("click", function () {
      document.querySelectorAll("[data-hidden]").forEach(function (el) {
        el.removeAttribute("data-hidden");
        el.style.display = "";
      });
      loadBtn.style.display = "none";
    });
  }

  /* Demo forms — prevent navigation, show acknowledgement */
  document.querySelectorAll("form[data-demo]").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var note = f.querySelector("[data-formnote]");
      if (note) { note.style.display = "block"; }
      f.reset();
    });
  });

  /* Current year in footer */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();

(function () {
  "use strict";

  var buttons = document.querySelectorAll("[data-filter]");
  var items = document.querySelectorAll("[data-category]");
  var countEl = document.querySelector("[data-filter-count]");
  var emptyEl = document.querySelector("[data-gallery-empty]");
  if (!buttons.length) return;

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var LEAVE_MS = reduced ? 0 : 200;
  var STAGGER_MS = reduced ? 0 : 28;
  var STAGGER_CAP = 14;

  function swapAndEnter(filter, animate) {
    var visible = 0;
    var toShow = [];

    items.forEach(function (item) {
      var show = filter === "all" || item.getAttribute("data-category") === filter;
      item.classList.remove("is-leaving");
      item.classList.toggle("is-hidden", !show);
      if (show) {
        visible++;
        toShow.push(item);
      }
    });

    if (animate && !reduced) {
      toShow.forEach(function (item, i) {
        item.style.transitionDelay = Math.min(i, STAGGER_CAP) * STAGGER_MS + "ms";
        item.classList.add("is-entering");
      });
      // Force a style flush so the browser commits the "entering" (pre-transition)
      // state before we remove it — more reliable than requestAnimationFrame, which
      // browsers can throttle or pause entirely for backgrounded/inactive tabs.
      void document.body.offsetHeight;
      toShow.forEach(function (item) {
        item.classList.remove("is-entering");
      });
    }

    if (countEl) {
      countEl.textContent = "Showing " + visible + (visible === 1 ? " project" : " projects");
    }
    if (emptyEl) {
      emptyEl.classList.toggle("is-visible", visible === 0);
    }
  }

  function applyFilter(filter) {
    var currentlyVisible = document.querySelectorAll("[data-category]:not(.is-hidden)");
    if (!currentlyVisible.length || reduced) {
      swapAndEnter(filter, true);
      return;
    }
    currentlyVisible.forEach(function (item) {
      item.classList.add("is-leaving");
    });
    setTimeout(function () {
      swapAndEnter(filter, true);
    }, LEAVE_MS);
  }

  buttons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (btn.classList.contains("is-active")) return;
      buttons.forEach(function (b) {
        b.classList.remove("is-active");
        b.setAttribute("aria-pressed", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-pressed", "true");
      applyFilter(btn.getAttribute("data-filter"));
    });
  });

  swapAndEnter("all", false);
})();

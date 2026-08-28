(function () {
  "use strict";

  var header = document.querySelector(".site-header");
  var servicesBtn = document.querySelector("[data-services-toggle]");
  var servicesDropdown = document.querySelector("[data-services-dropdown]");
  var mobileBtn = document.querySelector("[data-mobile-toggle]");
  var mobileMenu = document.querySelector("[data-mobile-menu]");
  var mobileCloseBtn = document.querySelector("[data-mobile-close]");

  function setServicesOpen(open) {
    if (!servicesBtn || !servicesDropdown) return;
    servicesBtn.setAttribute("aria-expanded", String(open));
    servicesDropdown.hidden = !open;
  }

  function setMobileOpen(open) {
    if (!mobileBtn || !mobileMenu) return;
    mobileBtn.setAttribute("aria-expanded", String(open));
    mobileMenu.hidden = !open;
    document.body.style.overflow = open ? "hidden" : "";
  }

  if (servicesBtn && servicesDropdown) {
    servicesBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      setServicesOpen(servicesDropdown.hidden);
    });
    document.addEventListener("click", function (e) {
      if (servicesDropdown.hidden) return;
      if (header && !header.contains(e.target)) setServicesOpen(false);
    });
  }

  if (mobileBtn && mobileMenu) {
    mobileBtn.addEventListener("click", function () {
      setMobileOpen(mobileMenu.hidden);
    });
  }
  if (mobileCloseBtn) {
    mobileCloseBtn.addEventListener("click", function () { setMobileOpen(false); });
  }
  document.querySelectorAll("[data-mobile-menu] a").forEach(function (a) {
    a.addEventListener("click", function () { setMobileOpen(false); });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    setServicesOpen(false);
    setMobileOpen(false);
  });

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- Brick course strip (decorative) ----
  var brickStrip = document.querySelector("[data-brick-strip]");
  if (brickStrip) {
    var tones = ["#E4DED4", "#D6CDBD", "#C9BCA7", "#DCD4C6"];
    var rows = [];
    for (var r = 0; r < 3; r++) {
      var row = document.createElement("div");
      row.className = "brick-row";
      row.style.marginLeft = r % 2 ? "calc(clamp(48px,6vw,86px) / -2)" : "0px";
      var bricks = [];
      for (var i = 0; i < 24; i++) {
        var brick = document.createElement("div");
        brick.className = "brick";
        brick.style.background = tones[(i * 5 + r * 2) % 4];
        row.appendChild(brick);
        bricks.push(brick);
      }
      brickStrip.appendChild(row);
      rows.push(bricks);
    }

    if (!reduced) {
      var allBricks = rows.flat();
      var stripRect = brickStrip.getBoundingClientRect();
      if (stripRect.top >= window.innerHeight * 0.92) {
        allBricks.forEach(function (b) {
          b.style.opacity = "0";
          b.style.transform = "translateY(14px)";
        });
        var brickObserver = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            allBricks.forEach(function (b, i) {
              b.style.transition = "opacity .4s " + "cubic-bezier(.22,.61,.36,1) " + (i * 16) + "ms, transform .4s cubic-bezier(.22,.61,.36,1) " + (i * 16) + "ms";
              requestAnimationFrame(function () {
                b.style.opacity = "1";
                b.style.transform = "none";
              });
            });
            brickObserver.disconnect();
          });
        }, { threshold: 0.25 });
        brickObserver.observe(brickStrip);
      }
    }
  }

  // ---- Scroll reveal ----
  if (!reduced) {
    var revealEls = document.querySelectorAll("[data-reveal]");
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, idx) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.classList.remove("is-hidden");
        el.classList.add("is-visible");
        revealObserver.unobserve(el);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });

    revealEls.forEach(function (el, i) {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;
      el.classList.add("is-hidden");
      el.style.transition = "opacity .7s cubic-bezier(.22,.61,.36,1) " + ((i % 3) * 70) + "ms, transform .7s cubic-bezier(.22,.61,.36,1) " + ((i % 3) * 70) + "ms";
      revealObserver.observe(el);
    });
  }
})();

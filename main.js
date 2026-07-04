/* johnfissel.com — vanilla JS, no dependencies.
   Theme toggle • scroll reveals • hero parallax • scroll index • cursor dot */
(function () {
  "use strict";

  var doc = document.documentElement;
  var motionOK = matchMedia("(prefers-reduced-motion: no-preference)").matches;
  var systemDark = matchMedia("(prefers-color-scheme: dark)");

  /* ---------- Theme toggle ---------- */

  var toggle = document.getElementById("theme-toggle");
  var LIGHT_BG = "#f6f6f6";
  var DARK_BG = "#0a0a0a";

  function effectiveTheme() {
    var t = doc.getAttribute("data-theme");
    if (t === "light" || t === "dark") return t;
    return systemDark.matches ? "dark" : "light";
  }

  function syncThemeUI() {
    var dark = effectiveTheme() === "dark";
    toggle.setAttribute("aria-pressed", String(dark));
    var metas = document.querySelectorAll('meta[name="theme-color"]');
    for (var i = 0; i < metas.length; i++) {
      if (doc.hasAttribute("data-theme")) {
        metas[i].setAttribute("content", dark ? DARK_BG : LIGHT_BG);
      } else {
        metas[i].setAttribute(
          "content",
          metas[i].getAttribute("media").indexOf("dark") > -1 ? DARK_BG : LIGHT_BG
        );
      }
    }
  }

  toggle.addEventListener("click", function () {
    var next = effectiveTheme() === "dark" ? "light" : "dark";
    doc.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) {}
    syncThemeUI();
  });

  systemDark.addEventListener("change", syncThemeUI);
  syncThemeUI();

  /* ---------- Marquee pause (WCAG 2.2.2 pause/stop/hide) ----------
     Safari runs transform animations on the compositor thread, and pausing
     via animation-play-state snaps the track to the main thread's stale
     position. Instead: freeze by pinning the live transform inline and
     removing the animation; resume from the same spot with a negative
     animation-delay. */

  var marqueeToggle = document.getElementById("marquee-toggle");
  var marqueeTrack = document.querySelector(".marquee-track");
  var marqueeProgress = 0; /* fraction of one loop completed at pause time */

  function marqueeX(el) {
    var t = getComputedStyle(el).transform;
    return t && t !== "none" ? new DOMMatrixReadOnly(t).m41 : 0;
  }

  if (marqueeToggle && marqueeTrack) {
    marqueeToggle.addEventListener("click", function () {
      var paused = doc.classList.toggle("marquee-paused");
      marqueeToggle.setAttribute("aria-pressed", String(paused));
      try {
        if (paused) {
          var x = marqueeX(marqueeTrack);
          var half = marqueeTrack.scrollWidth / 2;
          marqueeProgress = half > 0 ? Math.min(Math.max(-x / half, 0), 1) : 0;
          marqueeTrack.style.transform = "translateX(" + x + "px)";
          marqueeTrack.style.animation = "none";
        } else {
          marqueeTrack.style.animation = "";
          var dur = parseFloat(getComputedStyle(marqueeTrack).animationDuration) || 0;
          marqueeTrack.style.animationDelay = (-marqueeProgress * dur).toFixed(3) + "s";
          marqueeTrack.style.transform = "";
        }
      } catch (e) {
        /* fall back to the CSS play-state rule (class is already toggled) */
        marqueeTrack.style.animation = "";
        marqueeTrack.style.transform = "";
      }
    });
  }

  /* ---------- Copyright year ---------- */

  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------- Scroll reveals ---------- */

  var revealEls = document.querySelectorAll("[data-reveal]");
  if (motionOK && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Hero parallax + scroll index (one rAF loop) ---------- */

  var heroImg = document.querySelector(".hero-media img");
  var readoutN = document.getElementById("readout-n");
  var ticking = false;

  function onScrollFrame() {
    ticking = false;
    var y = window.scrollY;
    if (motionOK && heroImg && y < window.innerHeight * 1.2) {
      heroImg.style.transform = "translate3d(0," + (y * 0.14).toFixed(1) + "px,0)";
    }
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var p = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
    readoutN.textContent = p.toFixed(3);
  }

  function requestFrame() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(onScrollFrame);
    }
  }

  addEventListener("scroll", requestFrame, { passive: true });
  addEventListener("resize", requestFrame, { passive: true });
  onScrollFrame();

  /* ---------- Cursor dot (fine pointers, motion allowed) ---------- */

  if (motionOK && matchMedia("(pointer: fine)").matches) {
    var dot = document.createElement("div");
    dot.className = "cursor-dot";
    dot.setAttribute("aria-hidden", "true");
    document.body.appendChild(dot);

    var mx = 0, my = 0, dx = 0, dy = 0, seen = false, raf = null;

    function lerpFrame() {
      dx += (mx - dx) * 0.22;
      dy += (my - dy) * 0.22;
      dot.style.transform = "translate3d(" + dx.toFixed(1) + "px," + dy.toFixed(1) + "px,0)";
      if (Math.abs(mx - dx) + Math.abs(my - dy) > 0.2) {
        raf = requestAnimationFrame(lerpFrame);
      } else {
        raf = null;
      }
    }

    addEventListener("mousemove", function (e) {
      mx = e.clientX;
      my = e.clientY;
      if (!seen) {
        seen = true;
        dx = mx;
        dy = my;
        dot.classList.add("on");
      }
      var t = e.target;
      var interactive = t.closest && t.closest("a, button");
      dot.classList.toggle("grow", !!interactive);
      if (!raf) raf = requestAnimationFrame(lerpFrame);
    }, { passive: true });

    document.addEventListener("mouseleave", function () {
      dot.classList.remove("on");
      seen = false;
    });
  }
})();

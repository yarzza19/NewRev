/* =====================================================================
   SILEX — interaction layer (GSAP · ScrollTrigger · Lenis)
   ===================================================================== */
(function () {
  "use strict";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  gsap.registerPlugin(ScrollTrigger);

  /* ---------------- Lenis smooth scroll ---------------- */
  let lenis = null;
  if (!reduceMotion) {
    lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  /* feed 3D scene global scroll progress + warp on fast scroll */
  let lastY = 0, lastT = performance.now();
  function feedScene() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const y = window.scrollY || window.pageYOffset;
    const p = max > 0 ? y / max : 0;
    if (window.SILEX) {
      window.SILEX.setScroll(p);
      const now = performance.now();
      const v = Math.abs(y - lastY) / Math.max(now - lastT, 1);
      window.SILEX.setWarp(Math.min(v * 0.25, 1.2));
      lastY = y; lastT = now;
    }
    requestAnimationFrame(feedScene);
  }
  requestAnimationFrame(feedScene);

  /* ---------------- Custom cursor ---------------- */
  (function cursor() {
    if (window.matchMedia("(hover: none)").matches) return;
    const ring = document.getElementById("cursor");
    const dot = document.getElementById("cursorDot");
    const label = ring.querySelector(".cursor__label");
    let rx = innerWidth / 2, ry = innerHeight / 2, dx = rx, dy = ry;
    let tx = rx, ty = ry;
    window.addEventListener("pointermove", (e) => { tx = e.clientX; ty = e.clientY; });
    function loop() {
      rx += (tx - rx) * 0.18; ry += (ty - ry) * 0.18;
      dx += (tx - dx) * 0.5; dy += (ty - dy) * 0.5;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      dot.style.transform = `translate(${dx}px, ${dy}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    }
    loop();
    document.querySelectorAll("[data-cursor], a, button").forEach((el) => {
      el.addEventListener("pointerenter", () => {
        const txt = el.getAttribute("data-cursor");
        ring.classList.add("is-active");
        label.textContent = txt || "";
        if (!txt) ring.classList.remove("is-active");
      });
      el.addEventListener("pointerleave", () => {
        ring.classList.remove("is-active");
        label.textContent = "";
      });
    });
    document.addEventListener("mouseleave", () => document.body.classList.add("cursor-hidden"));
    document.addEventListener("mouseenter", () => document.body.classList.remove("cursor-hidden"));
  })();

  /* ---------------- Anchor links via Lenis ---------------- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id === "#" || !document.querySelector(id)) return;
      e.preventDefault();
      const target = document.querySelector(id);
      if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.4 });
      else target.scrollIntoView({ behavior: "smooth" });
    });
  });

  /* ---------------- Preloader ---------------- */
  function startExperience() {
    const counter = document.getElementById("counter");
    const bar = document.getElementById("loadbar");
    const status = document.getElementById("loadstatus");
    const pre = document.getElementById("preloader");
    const stages = [
      "Sondeando la roca madre",
      "Tomando muestras del mercado",
      "Golpeando el sílex",
      "Asentando los cimientos",
      "Chispa prendida — entrando",
    ];
    const obj = { v: 0 };
    if (lenis) lenis.stop();
    gsap.to(obj, {
      v: 100,
      duration: 2.4,
      ease: "power2.inOut",
      onUpdate() {
        const val = Math.round(obj.v);
        counter.textContent = val;
        bar.style.width = val + "%";
        status.textContent = stages[Math.min(stages.length - 1, Math.floor(val / 20))];
      },
      onComplete() {
        const tl = gsap.timeline({
          onComplete() { if (lenis) lenis.start(); revealHero(); },
        });
        tl.to(pre.querySelector(".preloader__inner"), { y: -30, opacity: 0, duration: 0.6, ease: "power2.in" })
          .to(pre, { yPercent: -100, duration: 1.0, ease: "expo.inOut" }, "-=0.2")
          .set(pre, { display: "none" });
      },
    });
  }

  /* ---------------- Hero intro reveal ---------------- */
  function revealHero() {
    const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
    tl.from(".hero__title .line > span", { yPercent: 110, duration: 1.2, stagger: 0.12 })
      .from(".hero__eyebrow > span", { yPercent: 110, opacity: 0, duration: 0.9 }, "-=0.9")
      .from(".hero__sub .reveal-line > span", { yPercent: 110, opacity: 0, duration: 0.9, stagger: 0.1 }, "-=0.7")
      .from(".hero__meta, .hero__scroll, .hero__index", { opacity: 0, y: 16, duration: 0.8, stagger: 0.08 }, "-=0.6")
      .from(".nav", { opacity: 0, y: -20, duration: 0.8 }, "-=0.8");
  }

  /* ---------------- Nav hide on scroll down ---------------- */
  (function navHide() {
    const nav = document.getElementById("nav");
    let prev = 0;
    ScrollTrigger.create({
      start: 0, end: "max",
      onUpdate(self) {
        const y = self.scroll();
        if (y > prev && y > 300) nav.classList.add("is-hidden");
        else nav.classList.remove("is-hidden");
        prev = y;
      },
    });
  })();

  /* ---------------- Marquee loop ---------------- */
  (function marquee() {
    const track = document.querySelector(".marquee__track");
    if (!track) return;
    let pos = 0;
    const width = track.scrollWidth / 2;
    gsap.ticker.add(() => {
      pos -= 0.6;
      if (pos <= -width) pos = 0;
      track.style.transform = `translateX(${pos}px)`;
    });
  })();

  /* ---------------- Scroll-driven reveals ---------------- */
  function buildScrollAnims() {
    // ethos words light up
    gsap.to(".ethos__statement .word", {
      opacity: 1,
      stagger: 0.06,
      ease: "none",
      scrollTrigger: {
        trigger: ".ethos",
        start: "top 70%",
        end: "bottom 75%",
        scrub: 1,
      },
    });

    // generic reveals
    gsap.utils.toArray(".section-head, .pricing__title, .pricing__sub, .pricing__note, .contact__sub, .contact__windows, .footer__grid").forEach((el) => {
      gsap.from(el, {
        y: 40, opacity: 0, duration: 1, ease: "expo.out",
        scrollTrigger: { trigger: el, start: "top 88%" },
      });
    });

    // pricing cards
    gsap.utils.toArray(".plan").forEach((el, i) => {
      gsap.from(el, {
        y: 50, opacity: 0, duration: 1, ease: "expo.out", delay: i * 0.1,
        scrollTrigger: { trigger: ".plans", start: "top 82%" },
      });
    });

    // contact title lines
    gsap.from(".contact__title .line > span", {
      yPercent: 110, duration: 1.1, ease: "expo.out", stagger: 0.1,
      scrollTrigger: { trigger: ".contact", start: "top 70%" },
    });

    // big footer word
    gsap.from(".footer__big", {
      scale: 1.15, opacity: 0, duration: 1.4, ease: "expo.out",
      scrollTrigger: { trigger: ".footer", start: "top 85%" },
    });

    // stats counters
    gsap.utils.toArray(".stat__num").forEach((el) => {
      const end = parseFloat(el.dataset.count);
      const dec = parseInt(el.dataset.decimals || "0", 10);
      const suffix = el.dataset.suffix || "";
      const o = { v: 0 };
      ScrollTrigger.create({
        trigger: el,
        start: "top 88%",
        once: true,
        onEnter() {
          gsap.to(o, {
            v: end, duration: 2, ease: "power2.out",
            onUpdate() { el.textContent = o.v.toFixed(dec) + suffix; },
          });
        },
      });
    });

    // CAPABILITIES horizontal pinned scroll
    const track = document.getElementById("seamsTrack");
    const pin = document.getElementById("seamsPin");
    if (track && pin && !reduceMotion) {
      const getScrollX = () => track.scrollWidth - window.innerWidth;
      gsap.to(track, {
        x: () => -getScrollX(),
        ease: "none",
        scrollTrigger: {
          trigger: "#capabilities",
          start: "top top",
          end: () => "+=" + getScrollX(),
          scrub: 1,
          pin: pin,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
    }
  }

  /* ---------------- Boot ---------------- */
  let booted = false;
  function boot() {
    if (booted) return;
    booted = true;
    buildScrollAnims();
    startExperience();
    ScrollTrigger.refresh();
  }

  if (document.readyState === "complete") {
    if (window.SILEX) boot();
    else window.addEventListener("silex:ready", boot, { once: true });
  } else {
    window.addEventListener("load", () => {
      if (window.SILEX) boot();
      else window.addEventListener("silex:ready", boot, { once: true });
    });
  }
  // safety fallback — never leave the preloader stuck
  setTimeout(() => { if (!booted) boot(); }, 4000);

  /* ---------------- Live studio coords flicker ---------------- */
  (function coords() {
    const el = document.getElementById("coords");
    if (!el) return;
    setInterval(() => {
      const lat = (41.3874 + (Math.random() - 0.5) * 0.01).toFixed(4);
      const lon = (2.1686 + (Math.random() - 0.5) * 0.01).toFixed(4);
      el.textContent = `${lat}° N / ${lon}° E`;
    }, 1800);
  })();

  /* ---------------- Intake countdown ---------------- */
  (function countdown() {
    const el = document.getElementById("intake");
    if (!el) return;
    let total = 6 * 3600 + 12 * 60 + 48;
    setInterval(() => {
      total = total > 0 ? total - 1 : 6 * 3600 + 12 * 60 + 48;
      const h = String(Math.floor(total / 3600)).padStart(2, "0");
      const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
      const s = String(total % 60).padStart(2, "0");
      el.textContent = `T– ${h} : ${m} : ${s}`;
    }, 1000);
  })();
})();

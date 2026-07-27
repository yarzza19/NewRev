/* =====================================================================
   NEWREV — interaction layer (GSAP · ScrollTrigger · Lenis)
   ===================================================================== */
(function () {
  "use strict";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  gsap.registerPlugin(ScrollTrigger);

  // always boot from the top (the hero build-up is the intended first impression)
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  window.scrollTo(0, 0);

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

  /* feed 3D scene global scroll progress */
  function feedScene() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const y = window.scrollY || window.pageYOffset;
    const p = max > 0 ? y / max : 0;
    if (window.NEWREV) window.NEWREV.setScroll(p);
    requestAnimationFrame(feedScene);
  }
  requestAnimationFrame(feedScene);

  /* ---------------- Custom cursor ---------------- */
  (function cursor() {
    if (window.matchMedia("(hover: none)").matches) return;
    const ring = document.getElementById("cursor");
    const dot = document.getElementById("cursorDot");
    const label = ring.querySelector(".cursor__label");
    let rx = innerWidth / 2, ry = innerHeight / 2, dx = rx, dy = ry, tx = rx, ty = ry;
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

  /* ---------------- Magnetic buttons ---------------- */
  (function magnetic() {
    if (window.matchMedia("(hover: none)").matches) return;
    document.querySelectorAll("[data-magnetic]").forEach((el) => {
      const strength = 0.4;
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const mx = e.clientX - (r.left + r.width / 2);
        const my = e.clientY - (r.top + r.height / 2);
        gsap.to(el, { x: mx * strength, y: my * strength, duration: 0.6, ease: "power3.out" });
      });
      el.addEventListener("pointerleave", () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" });
      });
    });
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
      "Calibrando cabezal de impresión",
      "Cargando geometría de referencia",
      "Fundiendo capa base",
      "Depositando material",
      "Pieza lista — arrancando",
    ];
    const obj = { v: 0 };
    if (lenis) lenis.stop();
    gsap.to(obj, {
      v: 100, duration: 2.4, ease: "power2.inOut",
      onUpdate() {
        const val = Math.round(obj.v);
        counter.textContent = val;
        bar.style.width = val + "%";
        status.textContent = stages[Math.min(stages.length - 1, Math.floor(val / 20))];
      },
      onComplete() {
        const tl = gsap.timeline({ onComplete() { if (lenis) lenis.start(); revealHero(); } });
        // kick off the 3D print build-up just as the curtain lifts
        if (window.NEWREV) window.NEWREV.playBuild(2.8);
        tl.to(pre.querySelector(".preloader__inner"), { y: -30, opacity: 0, duration: 0.6, ease: "power2.in" })
          .to(pre, { yPercent: -100, duration: 1.0, ease: "expo.inOut" }, "-=0.2")
          .set(pre, { display: "none" });
      },
    });
  }

  /* ---------------- Hero intro reveal ---------------- */
  function revealHero() {
    const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
    tl.from(".hero__title .line > span", { yPercent: 115, duration: 1.2, stagger: 0.12 })
      .from(".hero__eyebrow > span", { yPercent: 115, opacity: 0, duration: 0.9 }, "-=0.95")
      .from(".hero__sub .reveal-line > span", { yPercent: 115, opacity: 0, duration: 0.9, stagger: 0.1 }, "-=0.75")
      .from(".hero__actions > *", { y: 24, opacity: 0, duration: 0.8, stagger: 0.1 }, "-=0.6")
      .from(".hero__meta, .hero__scroll, .hero__index, .hero__drag", { opacity: 0, y: 16, duration: 0.8, stagger: 0.06 }, "-=0.6")
      .from(".nav", { opacity: 0, y: -20, duration: 0.8 }, "-=0.9");
  }

  /* ---------------- Nav hide on scroll down ---------------- */
  (function navHide() {
    const nav = document.getElementById("nav");
    let prev = 0;
    ScrollTrigger.create({
      start: 0, end: "max",
      onUpdate(self) {
        const y = self.scroll();
        if (y > prev && y > 320) nav.classList.add("is-hidden");
        else nav.classList.remove("is-hidden");
        prev = y;
      },
    });
  })();

  /* ---------------- Marquee ---------------- */
  (function marquee() {
    const track = document.querySelector(".marquee__track");
    if (!track) return;
    let pos = 0;
    const width = track.scrollWidth / 2;
    gsap.ticker.add(() => {
      pos -= 0.55;
      if (pos <= -width) pos = 0;
      track.style.transform = `translateX(${pos}px)`;
    });
  })();

  /* ---------------- Material world toggle ---------------- */
  (function materialToggle() {
    let current = "metal";
    function setWorld(mode) {
      if (mode === current) return;
      current = mode;
      document.body.classList.toggle("theme-plastic", mode === "plastic");
      document.body.classList.toggle("theme-metal", mode === "metal");
      if (window.NEWREV) window.NEWREV.setMaterial(mode);
      // sync both switches' active option
      document.querySelectorAll(".matswitch__opt, .bigtoggle__opt").forEach((o) => {
        o.classList.toggle("is-active", o.dataset.mat === mode);
      });
    }
    // mini switch toggles to the other world
    const mini = document.getElementById("matSwitch");
    if (mini) mini.addEventListener("click", () => setWorld(current === "metal" ? "plastic" : "metal"));
    // big toggle: click a specific option
    document.querySelectorAll(".bigtoggle__opt").forEach((o) => {
      o.addEventListener("click", () => setWorld(o.dataset.mat));
    });
    const big = document.getElementById("bigToggle");
    if (big) big.addEventListener("click", (e) => {
      if (e.target.classList.contains("bigtoggle__opt")) return; // handled above
      setWorld(current === "metal" ? "plastic" : "metal");
    });
  })();

  /* ---------------- Counters ---------------- */
  // animate a single counter element to its data-count when scrolled into view
  function countUp(el) {
    const end = parseFloat(el.dataset.count);
    if (isNaN(end)) return;
    const dec = parseInt(el.dataset.decimals || "0", 10);
    const suffix = el.dataset.suffix || "";
    const prefix = el.dataset.prefix || "";
    const o = { v: 0 };
    ScrollTrigger.create({
      trigger: el, start: "top 90%", once: true,
      onEnter() {
        gsap.to(o, {
          v: end, duration: 2, ease: "power2.out",
          onUpdate() {
            let n = o.v.toFixed(dec);
            if (dec === 0) n = Math.round(o.v).toLocaleString("es-ES");
            el.textContent = prefix + n + suffix;
          },
        });
      },
    });
  }
  function buildCounters() {
    // skip [data-dynamic] elements — those are filled with real values once data loads
    gsap.utils.toArray(".bigstat__num, .community__num").forEach((el) => {
      if (el.hasAttribute("data-dynamic")) return;
      countUp(el);
    });
  }
  window.__newrevCountUp = countUp;

  /* ---------------- Problem section: animated data viz ---------------- */
  (function dataViz() {
    const svg = document.getElementById("chartSvg");
    if (!svg) return;
    const W = 720, H = 360;
    const demandLine = document.getElementById("demandLine");
    const supplyLine = document.getElementById("supplyLine");
    const demandArea = document.getElementById("demandArea");
    const supplyArea = document.getElementById("supplyArea");
    const crossDot = document.getElementById("crossDot");
    const crossNote = document.getElementById("crossNote");

    // sample curves across 0..1
    const N = 60;
    const demandY = (x) => H - (0.18 + 0.7 * Math.pow(x, 1.35)) * H;       // rising
    const supplyY = (x) => H - (0.78 - 0.62 * Math.pow(x, 1.1)) * H;       // falling
    function path(fn) {
      let d = "";
      for (let i = 0; i <= N; i++) { const x = i / N; d += (i ? "L" : "M") + (x * W).toFixed(1) + " " + fn(x).toFixed(1) + " "; }
      return d.trim();
    }
    function area(fn) {
      return path(fn) + ` L ${W} ${H} L 0 ${H} Z`;
    }
    const dPath = path(demandY), sPath = path(supplyY);
    demandLine.setAttribute("d", dPath);
    supplyLine.setAttribute("d", sPath);
    demandArea.setAttribute("d", area(demandY));
    supplyArea.setAttribute("d", area(supplyY));

    // crossover point (demand == supply)
    let cx = 0.5;
    for (let i = 0; i <= N; i++) { const x = i / N; if (demandY(x) <= supplyY(x)) { cx = x; break; } }
    crossDot.setAttribute("cx", (cx * W).toFixed(1));
    crossDot.setAttribute("cy", demandY(cx).toFixed(1));

    // draw-on animation: demand line draws via dash-offset, supply fades in dashed
    const demandLen = demandLine.getTotalLength();
    demandLine.style.strokeDasharray = demandLen;
    demandLine.style.strokeDashoffset = demandLen;
    supplyLine.style.strokeDasharray = "2 6";
    gsap.set([demandArea, supplyArea, supplyLine], { opacity: 0 });

    ScrollTrigger.create({
      trigger: "#problema", start: "top 65%", once: true,
      onEnter() {
        gsap.to(demandLine, { strokeDashoffset: 0, duration: 1.8, ease: "power2.inOut" });
        gsap.fromTo(supplyLine, { opacity: 0 }, { opacity: 1, duration: 1.4, ease: "power2.out", delay: 0.2 });
        gsap.to([demandArea, supplyArea], { opacity: 1, duration: 1.2, delay: 0.6, stagger: 0.15 });
        gsap.fromTo(crossDot, { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration: 0.6, delay: 1.5, ease: "back.out(2)", transformOrigin: "center" });
        gsap.fromTo(crossNote, { opacity: 0 }, { opacity: 1, duration: 0.8, delay: 1.7 });
      },
    });
  })();

  /* ---------------- Generic reveals ---------------- */
  function buildReveals() {
    gsap.utils.toArray(".section-head, .problem__title, .problem__lede, .materials__title, .materials__lede, .materials__toggle, .cta__sub, .search, .cta__chips, .footer__grid").forEach((el) => {
      gsap.from(el, { y: 40, opacity: 0, duration: 1, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 88%" } });
    });
    gsap.utils.toArray(".matcard").forEach((el, i) => {
      gsap.from(el, { y: 50, opacity: 0, duration: 1, ease: "expo.out", delay: (i % 3) * 0.08, scrollTrigger: { trigger: ".matdeck.is-active", start: "top 82%" } });
    });
    gsap.from(".cta__title .line > span", {
      yPercent: 115, duration: 1.1, ease: "expo.out", stagger: 0.1,
      scrollTrigger: { trigger: ".cta", start: "top 70%" },
    });
    gsap.from(".footer__big", {
      scale: 1.12, opacity: 0, duration: 1.4, ease: "expo.out",
      scrollTrigger: { trigger: ".footer", start: "top 85%" },
    });
  }

  /* ---------------- PROCESS: pinned explode + step activation ---------------- */
  function buildProcess() {
    const pin = document.getElementById("processPin");
    const steps = gsap.utils.toArray(".pstep");
    const bar = document.getElementById("processBar");
    if (!pin) return;

    ScrollTrigger.create({
      trigger: "#proceso",
      start: "top top",
      end: () => "+=" + (reduceMotion ? 100 : window.innerHeight * 3),
      pin: reduceMotion ? false : pin,
      scrub: 1,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate(self) {
        const v = self.progress; // 0..1 through the pinned section
        // explode rises to 1 by 70%, reassembles to ~0 by 100%
        let ex;
        if (v < 0.7) ex = v / 0.7;
        else ex = 1 - (v - 0.7) / 0.3;
        if (window.NEWREV) window.NEWREV.setExplode(ex);
        if (bar) bar.style.width = (v * 100).toFixed(1) + "%";
        // active step (4 stages)
        const idx = Math.min(3, Math.floor(v * 4));
        steps.forEach((s, i) => s.classList.toggle("is-active", i === idx));
      },
    });
  }

  /* ---------------- Exploded-view labels follow 3D anchors ---------------- */
  (function partLabels() {
    if (window.matchMedia("(max-width: 820px)").matches) return;
    const wrap = document.getElementById("partLabels");
    if (!wrap) return;
    const els = {};
    wrap.querySelectorAll(".part-label").forEach((el) => { els[el.dataset.part] = el; });
    let active = false;
    ScrollTrigger.create({
      trigger: "#proceso", start: "top 60%", end: "bottom 40%",
      onToggle(self) { active = self.isActive; },
    });
    function loop() {
      if (active && window.NEWREV && window.NEWREV.getLabelTargets) {
        const targets = window.NEWREV.getLabelTargets();
        const ex = currentExplode();
        targets.forEach((t) => {
          const el = els[t.id];
          if (!el) return;
          el.style.transform = `translate(${t.x}px, ${t.y}px) translate(-50%, -50%)`;
          el.style.opacity = (t.visible && ex > 0.25) ? "1" : "0";
        });
      } else {
        Object.values(els).forEach((el) => (el.style.opacity = "0"));
      }
      requestAnimationFrame(loop);
    }
    // track explode locally by reading the bar width (cheap, avoids extra API)
    function currentExplode() {
      const bar = document.getElementById("processBar");
      if (!bar) return 1;
      const v = parseFloat(bar.style.width) / 100 || 0;
      return v < 0.7 ? v / 0.7 : 1 - (v - 0.7) / 0.3;
    }
    loop();
  })();

  /* ---------------- PIEZAS: horizontal pinned scroll ---------------- */
  function buildGallery() {
    const track = document.getElementById("galleryTrack");
    const pin = document.getElementById("galleryPin");
    if (track && pin && !reduceMotion) {
      const getScrollX = () => track.scrollWidth - window.innerWidth;
      gsap.to(track, {
        x: () => -getScrollX(), ease: "none",
        scrollTrigger: {
          trigger: "#piezas", start: "top top",
          end: () => "+=" + getScrollX(),
          scrub: 1, pin: pin, anticipatePin: 1, invalidateOnRefresh: true,
        },
      });
    }
  }

  /* ---------------- Real catalog: data, gallery, search, stats ---------------- */
  const CATALOG = { index: [] };

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  }
  // map a coches.json stlUrl to the microsite's local GLB path (only .glb is viewable)
  function localGlb(stlUrl) {
    if (!stlUrl || typeof stlUrl !== "string") return null;
    if (!/\.glb$/i.test(stlUrl)) return null;
    const base = stlUrl.split("/").pop();
    return "assets/models/biscuter/" + encodeURI(base);
  }
  function yearFrom(specs) {
    const f = specs && (specs["Fabricación"] || specs["Fabricacion"]);
    const m = f && String(f).match(/\d{4}/);
    return m ? m[0] : "";
  }

  // recursively pull every part out of the nested cars DB, carrying car context
  function extractCarParts(nodes, ctx, out) {
    if (!Array.isArray(nodes)) return;
    nodes.forEach((n) => {
      if (!n || typeof n !== "object") return;
      const here = {
        brand: n.brand || ctx.brand,
        model: n.name && !n.brand ? n.name : ctx.model,
        specs: n.specs || ctx.specs,
        image: n.image || ctx.image,
      };
      if (Array.isArray(n.parts)) {
        n.parts.forEach((p) => {
          out.push({
            type: "oficial",
            name: p.name,
            desc: p.description || "",
            price: p.price || "",
            glb: localGlb(p.stlUrl),
            brand: here.brand || "",
            model: here.model || here.brand || "",
            anio: yearFrom(here.specs),
            material: "",
            estado: "verificada",
          });
        });
      }
      if (Array.isArray(n.models)) extractCarParts(n.models, here, out);
      if (Array.isArray(n.submodels)) extractCarParts(n.submodels, here, out);
    });
  }

  function normalizeCommunity(arr) {
    if (!Array.isArray(arr)) return [];
    return arr.map((p) => ({
      type: "comunidad",
      name: p.nombre_pieza || "Pieza",
      desc: p.funcion || "",
      price: "",
      glb: localGlb(p.url_archivo_3d),
      brand: p.coche_marca || "",
      model: p.coche_modelo || "",
      anio: p.coche_anio ? String(p.coche_anio) : "",
      material: p.material_recomendado || "",
      medidas: p.medidas_exteriores || "",
      estado: p.estado === "verificada" ? "verificada" : "no_revisada",
    }));
  }

  // strip diacritics so "biscuter" matches "Biscúter", "culata" matches etc.
  function deaccent(s) {
    return String(s == null ? "" : s).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }
  function partSearchText(p) {
    return deaccent([p.name, p.brand, p.model, p.material, p.desc, p.anio, p.type].join(" "));
  }

  // ---- card builders ----
  function modelViewer(glb, alt) {
    return `<model-viewer src="${esc(glb)}" alt="${esc(alt)}" camera-controls auto-rotate auto-rotate-delay="0"
        rotation-per-second="22deg" interaction-prompt="none" shadow-intensity="1" shadow-softness="1"
        exposure="1.15" environment-image="neutral" camera-orbit="35deg 75deg 105%" min-camera-orbit="auto auto auto"
        loading="eager" reveal="auto" disable-tap></model-viewer>`;
  }
  function ratingFor(p) { return p.glb ? "★★★★★" : (p.estado === "verificada" ? "★★★★☆" : "★★★☆☆"); }

  function metaFor(p) {
    const meta = [];
    if (p.material) meta.push(["Material", p.material]);
    if (p.price) meta.push(["Precio", p.price]);
    meta.push(["Formato", p.glb ? "GLB · 3D" : (p.estado === "verificada" ? "Bajo demanda" : "Comunidad")]);
    meta.push(["Imprimible", ratingFor(p)]);
    return meta;
  }

  // small "ver en grande" button overlaid on a part's 3D preview — opens the part viewer modal
  function expandBtn(p, ctxLine) {
    if (!p.glb) return "";
    return `<button type="button" class="part-expand" data-part-expand
      data-glb="${esc(p.glb)}" data-name="${esc(p.name)}"
      data-ctx="${esc(ctxLine || "Catálogo NewRev")}"
      data-desc="${esc(p.desc || "Geometría digitalizada y verificada por NewRev.")}"
      data-meta='${esc(JSON.stringify(metaFor(p)))}'
      data-cursor="ampliar" aria-label="Ver ${esc(p.name)} en grande">
      <svg viewBox="0 0 24 24" width="16" height="16"><path d="M9 3H4v5M15 3h5v5M9 21H4v-5M15 21h5v-5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>`;
  }

  function partCard(p, idx) {
    const ctxLine = [p.brand, p.model && p.model !== p.brand ? p.model : "", p.anio].filter(Boolean).join(" · ");
    const visual = p.glb
      ? `<div class="part__visual part--model">${modelViewer(p.glb, p.name)}${expandBtn(p, ctxLine)}<span class="part__badge part__badge--3d">3D · GLB</span></div>`
      : `<div class="part__visual part--head"><span class="part__grid"></span><span class="part__badge">${p.estado === "verificada" ? "Verificada" : "En revisión"}</span></div>`;
    const meta = metaFor(p);
    const metaHtml = meta.slice(0, 3).map(([k, v]) => `<li><span>${esc(k)}</span><b>${esc(v)}</b></li>`).join("");
    return `<article class="part panel" data-cursor="${p.glb ? "rotar" : "ver"}">
      <div class="part__index">${String(idx).padStart(2, "0")}</div>
      ${visual}
      <div class="part__body">
        <h3>${esc(p.name)}</h3>
        <p class="part__for">${esc(ctxLine || "Catálogo NewRev")}</p>
        <p class="part__desc">${esc(p.desc || "Geometría digitalizada y verificada por NewRev.")}</p>
        <ul class="part__meta">${metaHtml}</ul>
      </div>
    </article>`;
  }

  function vehicleCard(car, idx) {
    const s = car.specs || {};
    const rows = [["Motor", s["Motor"]], ["Potencia", s["Potencia"]], ["Velocidad Máx.", s["Velocidad Máx."]]]
      .filter(([, v]) => v)
      .map(([k, v]) => `<li><span>${esc(k)}</span><b>${esc(v)}</b></li>`).join("");
    return `<article class="part panel part--vehicle" data-cursor="ver">
      <div class="part__index">${String(idx).padStart(2, "0")}</div>
      <div class="part__visual part--photo" style="background-image:url('${esc(car.image)}')"><span class="part__badge">${esc(yearFrom(s) || "Clásico")}</span></div>
      <div class="part__body">
        <p class="part__for">Vehículo destacado · ${esc(s["Fabricación"] || "")}</p>
        <h3>${esc(car.brand)}</h3>
        <p class="part__desc">${esc(car.partsCount)} piezas ya digitalizadas. ${esc(s["Motor"] ? "Motor " + s["Motor"] + "." : "")}</p>
        <ul class="part__meta">${rows}</ul>
      </div>
    </article>`;
  }

  // ---- gallery population ----
  function renderGallery(featuredCar, parts) {
    const track = document.getElementById("galleryTrack");
    const end = track && track.querySelector(".gallery__end");
    if (!track || !end) return;
    let i = 1;
    const frag = document.createDocumentFragment();
    const wrap = document.createElement("div");
    let html = "";
    if (featuredCar) html += vehicleCard(featuredCar, i++);
    parts.forEach((p) => { html += partCard(p, i++); });
    wrap.innerHTML = html;
    while (wrap.firstChild) frag.appendChild(wrap.firstChild);
    track.insertBefore(frag, end);
  }

  // ---- stats ----
  function setStats(parts) {
    const verified = parts.filter((p) => p.estado === "verificada");
    const models = parts.filter((p) => p.glb);
    const brands = new Set(verified.map((p) => (p.brand || "").trim().toLowerCase()).filter(Boolean));
    const set = (id, n) => { const el = document.getElementById(id); if (el) { el.dataset.count = n; if (window.__newrevCountUp) window.__newrevCountUp(el); } };
    set("statParts", verified.length);
    set("statBrands", brands.size);
    set("statModels", models.length);
  }

  // ---- search ----
  function renderResults(q) {
    const result = document.getElementById("searchResult");
    const box = document.getElementById("searchResults");
    if (!box) return;
    const query = q.trim().toLowerCase();
    if (!query) { box.innerHTML = ""; if (result) result.textContent = ""; return; }
    const tokens = query.split(/\s+/).filter(Boolean);
    const hits = CATALOG.index.filter((p) => { const t = partSearchText(p); return tokens.every((tok) => t.includes(tok)); });
    if (result) result.textContent = hits.length
      ? `${hits.length} ${hits.length === 1 ? "coincidencia" : "coincidencias"} en el archivo`
      : `Sin resultados para “${q.trim()}”. Súbela y la digitalizamos contigo.`;
    box.innerHTML = hits.slice(0, 8).map((p) => {
      const tags = [p.brand, p.model && p.model !== p.brand ? p.model : "", p.anio].filter(Boolean).join(" · ");
      const visual = p.glb
        ? `<div class="rcard__media">${modelViewer(p.glb, p.name)}${expandBtn(p, tags)}</div>`
        : `<div class="rcard__media rcard__media--ph"><span>${p.type === "comunidad" ? "Comunidad" : "Oficial"}</span></div>`;
      const badge = p.estado === "verificada" ? `<span class="rcard__badge rcard__badge--ok">Verificada</span>` : `<span class="rcard__badge">En revisión</span>`;
      const extra = p.price ? esc(p.price) : (p.material ? esc(p.material) : (p.glb ? "GLB · 3D" : "Bajo demanda"));
      return `<article class="rcard" data-cursor="${p.glb ? "rotar" : ""}">
        ${visual}
        <div class="rcard__body">
          <div class="rcard__top"><h4>${esc(p.name)}</h4>${badge}</div>
          <p class="rcard__for">${esc(tags || "Catálogo NewRev")}</p>
          <p class="rcard__extra">${extra}${p.glb ? " · arrastra para girar" : ""}</p>
        </div>
      </article>`;
    }).join("");
    ScrollTrigger.refresh();
  }

  /* ---------------- Generic modal helper (shared by all modals) ---------------- */
  function createModal(modalId, opts) {
    const modal = document.getElementById(modalId);
    if (!modal) return null;
    const focusId = opts && opts.focusId;
    let lastFocus = null;
    function open() {
      lastFocus = document.activeElement;
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      if (lenis) lenis.stop();
      document.body.classList.add("no-scroll");
      if (focusId) setTimeout(() => document.getElementById(focusId)?.focus(), 350);
    }
    function close() {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      if (!document.querySelector(".modal.is-open")) {
        if (lenis) lenis.start();
        document.body.classList.remove("no-scroll");
      }
      if (lastFocus) lastFocus.focus();
      if (opts && opts.onClose) opts.onClose();
    }
    modal.querySelectorAll("[data-modal-close]").forEach((el) => el.addEventListener("click", close));
    return { modal, open, close };
  }
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const open = document.querySelector(".modal.is-open");
    if (open) open.querySelector("[data-modal-close]")?.click();
  });

  /* ---------------- Mock auth (demo account, no real backend) ---------------- */
  const NewRevAuth = (function () {
    const KEY = "newrev_user";
    function get() { try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; } }
    function login(user) {
      try { localStorage.setItem(KEY, JSON.stringify(user)); } catch (e) { /* ignore quota/privacy errors */ }
      document.dispatchEvent(new CustomEvent("newrev:authchange", { detail: user }));
    }
    function logout() {
      try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
      document.dispatchEvent(new CustomEvent("newrev:authchange", { detail: null }));
    }
    return { get, login, logout };
  })();
  function requireAuth() {
    const user = NewRevAuth.get();
    if (!user && window.__openLoginModal) window.__openLoginModal();
    return !!user;
  }

  /* ---------------- Avatar helpers ---------------- */
  const AVATAR_COLORS = ["#e0685f", "#5fa8d3", "#e0a23c", "#7fd88f", "#b98ce0", "#5fd0c4", "#e07fb9", "#c9ad7a"];
  function initials(name) {
    const parts = String(name || "?").trim().split(/\s+/).slice(0, 2);
    const s = parts.map((w) => w[0]).join("").toUpperCase();
    return s || "?";
  }
  function colorFor(seed) {
    let h = 0;
    const s = String(seed || "x");
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return AVATAR_COLORS[h % AVATAR_COLORS.length];
  }
  function handleFor(user) {
    return (user.email || user.name || "tu").split("@")[0].replace(/[^a-z0-9]/gi, "").toLowerCase() || "tu";
  }

  /* ---------------- Community tabs (feed / peticiones) ---------------- */
  function switchTab(name) {
    document.querySelectorAll(".chtab").forEach((b) => {
      const active = b.dataset.tab === name;
      b.classList.toggle("is-active", active);
      b.setAttribute("aria-selected", String(active));
    });
    document.querySelectorAll(".chpanel").forEach((p) => p.classList.toggle("is-active", p.dataset.panel === name));
  }
  (function wireTabs() {
    document.querySelectorAll(".chtab").forEach((b) => b.addEventListener("click", () => switchTab(b.dataset.tab)));
  })();

  /* ---------------- Digitize-a-part modal + form ---------------- */
  (function wireDigitizeModal() {
    const openBtn = document.getElementById("openDigitizeForm");
    const label = document.getElementById("digModalLabel");
    const title = document.getElementById("digitizeTitle");
    const lede = document.getElementById("digitizeLede");
    const descInput = document.getElementById("digDescription");
    const DEFAULTS = {
      label: "Digitalizar pieza",
      title: "Cuéntanos qué te falta",
      lede: "Danos los datos de la pieza y algunas fotos. Te contactamos para valorar el escaneo y la fabricación.",
    };
    const m = createModal("digitizeModal", {
      focusId: "digNombre",
      onClose: () => {
        label.textContent = DEFAULTS.label;
        title.textContent = DEFAULTS.title;
        lede.textContent = DEFAULTS.lede;
        if (descInput) descInput.value = "";
      },
    });
    if (!openBtn || !m) return;
    const form = document.getElementById("digitizeForm");
    const status = document.getElementById("digitizeStatus");
    const submitBtn = document.getElementById("digitizeSubmit");
    const fileInput = document.getElementById("digFotos");
    const fileField = document.getElementById("digFileField");
    const fileHint = document.getElementById("digFileHint");

    function openDigitize(opts) {
      opts = opts || {};
      label.textContent = opts.label || DEFAULTS.label;
      title.textContent = opts.title || DEFAULTS.title;
      lede.textContent = opts.lede || DEFAULTS.lede;
      if (descInput) descInput.value = opts.description || "";
      m.open();
    }
    window.__openDigitizeModal = openDigitize;

    openBtn.addEventListener("click", () => openDigitize());

    if (fileInput && fileField && fileHint) {
      fileInput.addEventListener("change", () => {
        const n = fileInput.files.length;
        fileHint.textContent = n ? `${n} ${n === 1 ? "imagen seleccionada" : "imágenes seleccionadas"}` : "Arrastra o selecciona una o varias imágenes (JPG, PNG, WEBP)";
      });
      ["dragenter", "dragover"].forEach((evt) => fileField.addEventListener(evt, (e) => { e.preventDefault(); fileField.classList.add("is-dragover"); }));
      ["dragleave", "drop"].forEach((evt) => fileField.addEventListener(evt, (e) => { e.preventDefault(); fileField.classList.remove("is-dragover"); }));
      fileField.addEventListener("drop", (e) => {
        if (e.dataTransfer && e.dataTransfer.files.length) {
          fileInput.files = e.dataTransfer.files;
          fileInput.dispatchEvent(new Event("change"));
        }
      });
    }

    if (form) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        status.textContent = "Enviando…";
        status.classList.remove("is-error");
        submitBtn.setAttribute("disabled", "true");
        try {
          const fd = new FormData(form);
          const res = await fetch("/send-pieza", { method: "POST", body: fd });
          const data = await res.json().catch(() => ({ ok: res.ok }));
          if (!res.ok || data.ok === false) throw new Error(data.error || "No se pudo enviar la solicitud.");
          status.textContent = "¡Solicitud enviada! Te contactaremos pronto.";
          form.reset();
          if (fileHint) fileHint.textContent = "Arrastra o selecciona una o varias imágenes (JPG, PNG, WEBP)";
          setTimeout(m.close, 1600);
        } catch (err) {
          status.textContent = err.message || "Error al enviar. Inténtalo de nuevo.";
          status.classList.add("is-error");
        } finally {
          submitBtn.removeAttribute("disabled");
        }
      });
    }
  })();

  /* ---------------- Login modal + nav account state ---------------- */
  (function wireLoginModal() {
    const navUser = document.getElementById("navUser");
    const m = createModal("loginModal", { focusId: "loginName" });
    if (!navUser || !m) return;
    window.__openLoginModal = m.open;

    const form = document.getElementById("loginForm");
    const status = document.getElementById("loginStatus");

    function renderNavUser() {
      const user = NewRevAuth.get();
      if (user) {
        navUser.innerHTML = `
          <div class="nav__account">
            <span class="nav__account-avatar" style="background:${colorFor(user.email)}">${esc(initials(user.name))}</span>
            <span class="nav__account-name">${esc(user.name)}</span>
            <button type="button" class="nav__logout" id="navLogoutBtn" data-cursor="salir" aria-label="Cerrar sesión">
              <svg viewBox="0 0 24 24" width="14" height="14"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
          </div>`;
        document.getElementById("navLogoutBtn").addEventListener("click", () => NewRevAuth.logout());
      } else {
        navUser.innerHTML = `<button type="button" class="nav__login" id="navLoginBtn" data-cursor="entrar">Iniciar sesión</button>`;
        document.getElementById("navLoginBtn").addEventListener("click", m.open);
      }
    }
    renderNavUser();
    document.addEventListener("newrev:authchange", renderNavUser);

    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("loginName").value.trim();
        const email = document.getElementById("loginEmail").value.trim();
        if (!name || !email) {
          status.textContent = "Rellena nombre y correo.";
          status.classList.add("is-error");
          return;
        }
        NewRevAuth.login({ name, email });
        status.classList.remove("is-error");
        status.textContent = `¡Bienvenido, ${name}!`;
        setTimeout(() => { m.close(); form.reset(); status.textContent = ""; }, 900);
      });
    }
  })();

  /* ---------------- Community feed (invented seed content, mock interactions) ---------------- */
  (function wireCommunity() {
    const feedEl = document.getElementById("feed");
    if (!feedEl) return;
    const composerInput = document.getElementById("composerInput");
    const composerAvatar = document.getElementById("composerAvatar");
    const composerHint = document.getElementById("composerHint");
    const composerSubmit = document.getElementById("composerSubmit");

    const ICONS = {
      comment: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none"><path d="M4 5h16v11H8l-4 4V5Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
      repost: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none"><path d="M6 4v9a3 3 0 0 0 3 3h9M18 20v-9a3 3 0 0 0-3-3H6M9 3 6 6l3 3M15 21l3-3-3-3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      like: '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 21s-7.2-4.6-9.9-9.1C.5 8.7 1.8 5 5.3 4.2c2-.5 3.9.3 5 2 .9-1.7 2.9-2.5 5-2 3.5.8 4.8 4.5 3.2 7.7C19.2 16.4 12 21 12 21Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
    };

    const FEED_SEED = [
      { name: "Laura Campos", handle: "lauracoches", time: "2 h", likes: 128, reposts: 9,
        text: "Después de 3 años buscando, NewRev me imprimió la culata exacta de mi Biscúter 1953. Encaja a la primera 🔧🙌",
        comments: [
          { name: "Iker Zubi", handle: "tallerdelmotor", text: "Qué envidia, llevo meses detrás de la mía 😭" },
          { name: "Marta Solé", handle: "clasicos_es", text: "¿Cuánto tardaron en fabricarla?" },
          { name: "Laura Campos", handle: "lauracoches", text: "3 semanas desde que subí las fotos, ¡una pasada!" },
        ] },
      { name: "Iker Zubi", handle: "tallerdelmotor", time: "4 h", likes: 34, reposts: 2,
        text: "¿Alguien tiene los planos del piloto trasero del SEAT 850? Se me ha roto el original y no encuentro repuesto en ningún sitio.",
        comments: [{ name: "NewRev", handle: "newrev", text: "¡Ábrelo como petición en la comunidad y lo valoramos para digitalizarlo!" }] },
      { name: "Rubén Ferrer", handle: "rusty_restorer", time: "6 h", likes: 76, reposts: 15,
        text: "La demanda de piezas de coches clásicos ha subido un 40% este año. Cada vez somos más los que apostamos por preservarlos en vez de achatarrarlos.", comments: [] },
      { name: "Marta Solé", handle: "clasicos_es", time: "9 h", likes: 52, reposts: 6,
        text: "Hoy hemos firmado la petición del clip de paragolpes del BMW E30. ¡Vamos a por las 500 firmas! 💪",
        comments: [{ name: "Diego Roldán", handle: "mecanica_vintage", text: "Firmado. Yo también lo necesito para el mío." }] },
      { name: "Diego Roldán", handle: "mecanica_vintage", time: "1 d", likes: 210, reposts: 38,
        text: "Escaneo 3D + impresión en metal = la combinación que va a salvar miles de coches clásicos de la chatarra.", comments: [] },
      { name: "Pablo Yarza", handle: "pablo_biscuter", time: "1 d", likes: 45, reposts: 4,
        text: "Subí ayer la pieza de arranque de mi Biscúter a la comunidad y en 48h ya la tenían verificada. Impresionante trabajo.", comments: [] },
      { name: "Ferralla Amiga", handle: "ferralla_amiga", time: "2 d", likes: 12, reposts: 1,
        text: "¿NewRev fabrica también en polímero? Necesito una junta de TPU para el motor de mi Dodge.",
        comments: [{ name: "NewRev", handle: "newrev", text: "¡Sí! Mira el apartado de Materiales — tenemos TPU flexible en el catálogo." }] },
      { name: "Asociación de Clásicos", handle: "asociacion_clasicos", time: "3 d", likes: 88, reposts: 20,
        text: "Recordatorio: si tu pieza reúne suficientes firmas, entra directa en la cola de fabricación de NewRev.", comments: [] },
    ];

    let nextId = 1;
    let posts = FEED_SEED.map((p) => ({ id: nextId++, liked: false, reposted: false, ...p, comments: p.comments.slice() }));

    function renderComments(post) {
      return post.comments.map((c) => `
        <div class="comment">
          <span class="comment__avatar" style="background:${colorFor(c.handle)}">${esc(initials(c.name))}</span>
          <div class="comment__body">
            <div class="comment__top"><b>${esc(c.name)}</b><span>@${esc(c.handle)}</span></div>
            <p class="comment__text">${esc(c.text)}</p>
          </div>
        </div>`).join("");
    }

    function renderPost(post) {
      const user = NewRevAuth.get();
      return `<article class="post" data-id="${post.id}">
        <span class="post__avatar" style="background:${colorFor(post.handle)}">${esc(initials(post.name))}</span>
        <div class="post__body">
          <div class="post__top"><b>${esc(post.name)}</b><span>@${esc(post.handle)}</span><span class="post__dot">·</span><span>${esc(post.time)}</span></div>
          <p class="post__text">${esc(post.text)}</p>
          <div class="post__actions">
            <button type="button" class="post__action" data-action="comment">${ICONS.comment}<span>${post.comments.length}</span></button>
            <button type="button" class="post__action post__action--repost${post.reposted ? " is-active" : ""}" data-action="repost">${ICONS.repost}<span>${post.reposts}</span></button>
            <button type="button" class="post__action post__action--like${post.liked ? " is-active" : ""}" data-action="like">${ICONS.like}<span>${post.likes}</span></button>
          </div>
          <div class="post__comments" hidden>
            ${renderComments(post)}
            <form class="comment-form" data-comment-form>
              <input type="text" placeholder="${user ? "Escribe una respuesta…" : "Inicia sesión para responder"}" maxlength="200" />
              <button type="submit">Responder</button>
            </form>
          </div>
        </div>
      </article>`;
    }

    function render(forceOpenId) {
      const openIds = Array.from(feedEl.querySelectorAll(".post__comments"))
        .filter((b) => !b.hidden)
        .map((b) => b.closest(".post").dataset.id);
      const openSet = new Set(openIds);
      if (forceOpenId != null) openSet.add(String(forceOpenId));
      feedEl.innerHTML = posts.map(renderPost).join("");
      openSet.forEach((id) => {
        const box = feedEl.querySelector(`.post[data-id="${id}"] .post__comments`);
        if (box) box.hidden = false;
      });
    }

    feedEl.addEventListener("click", (e) => {
      const btn = e.target.closest(".post__action");
      if (!btn) return;
      const article = btn.closest(".post");
      const post = posts.find((p) => String(p.id) === article.dataset.id);
      if (!post) return;
      const action = btn.dataset.action;
      if (action === "comment") {
        const box = article.querySelector(".post__comments");
        box.hidden = !box.hidden;
        return;
      }
      if (!requireAuth()) return;
      if (action === "like") { post.liked = !post.liked; post.likes += post.liked ? 1 : -1; }
      else if (action === "repost") { post.reposted = !post.reposted; post.reposts += post.reposted ? 1 : -1; }
      render();
    });

    feedEl.addEventListener("submit", (e) => {
      const form = e.target.closest("[data-comment-form]");
      if (!form) return;
      e.preventDefault();
      if (!requireAuth()) return;
      const input = form.querySelector("input");
      const text = input.value.trim();
      if (!text) return;
      const article = form.closest(".post");
      const post = posts.find((p) => String(p.id) === article.dataset.id);
      const user = NewRevAuth.get();
      post.comments.push({ name: user.name, handle: handleFor(user), text });
      render(post.id);
    });

    function updateComposer() {
      const user = NewRevAuth.get();
      if (user) {
        composerAvatar.textContent = initials(user.name);
        composerAvatar.style.background = colorFor(user.email);
        composerHint.textContent = "Comparte tu progreso con la comunidad";
        composerSubmit.textContent = "Publicar";
      } else {
        composerAvatar.textContent = "?";
        composerAvatar.style.background = "";
        composerHint.textContent = "Inicia sesión para publicar en la comunidad";
        composerSubmit.textContent = "Iniciar sesión";
      }
    }

    if (composerSubmit) {
      composerSubmit.addEventListener("click", () => {
        if (!requireAuth()) return;
        const text = composerInput.value.trim();
        if (!text) return;
        const user = NewRevAuth.get();
        posts.unshift({ id: nextId++, name: user.name, handle: handleFor(user), time: "ahora", likes: 0, reposts: 0, liked: false, reposted: false, text, comments: [] });
        composerInput.value = "";
        render();
      });
    }

    document.addEventListener("newrev:authchange", () => { updateComposer(); render(); });
    updateComposer();
    render();
  })();

  /* ---------------- Petitions: signature drive for discontinued parts ---------------- */
  (function wirePetitions() {
    const list = document.getElementById("petitions");
    if (!list) return;

    const PETITIONS_SEED = [
      { nombre: "Clip de paragolpes M3", coche: "BMW E46", anio: "2002", descripcion: "Sustituto impreso en 3D para los clips frágiles laterales del paragolpes M3.", firmas: 487, meta: 500 },
      { nombre: "Piloto trasero", coche: "SEAT 850", anio: "1969", descripcion: "Óptica trasera completa, imposible de encontrar nueva en el mercado de segunda mano.", firmas: 356, meta: 500 },
      { nombre: "Junta tapa válvulas", coche: "Citroën 2CV", anio: "1978", descripcion: "Junta de estanqueidad para la tapa de válvulas, descatalogada desde hace una década.", firmas: 291, meta: 400 },
      { nombre: "Adaptador filtro cónico", coche: "Honda Civic", anio: "1998", descripcion: "Adaptador MAF a filtro cónico de 3 pulgadas para el motor original.", firmas: 212, meta: 500 },
      { nombre: "Manguito TPU de motor", coche: "Dodge Charger", anio: "1970", descripcion: "Manguito flexible que sella el circuito de refrigeración del motor V8.", firmas: 128, meta: 300 },
      { nombre: "Embellecedor de llanta", coche: "Renault 5 GTL", anio: "1985", descripcion: "Tapacubos central con el logo original, roto en la mayoría de unidades supervivientes.", firmas: 64, meta: 300 },
      { nombre: "Culata completa", coche: "Biscúter", anio: "1953", descripcion: "Culata de aluminio ya digitalizada y verificada — pieza piloto del archivo NewRev.", firmas: 500, meta: 500 },
    ];

    let nextId = 1;
    let petitions = PETITIONS_SEED.map((p) => ({ id: nextId++, ...p }));

    const SIGNED_KEY = "newrev_signed_petitions";
    function getSigned() { try { return new Set(JSON.parse(localStorage.getItem(SIGNED_KEY)) || []); } catch (e) { return new Set(); } }
    function saveSigned(set) { try { localStorage.setItem(SIGNED_KEY, JSON.stringify([...set])); } catch (e) { /* ignore */ } }
    let signed = getSigned();

    function render() {
      const sorted = petitions.slice().sort((a, b) => b.firmas - a.firmas);
      list.innerHTML = sorted.map((p, i) => {
        const pct = Math.min(100, Math.round((p.firmas / p.meta) * 100));
        const viable = p.firmas >= p.meta;
        const isSigned = signed.has(p.id);
        return `<article class="petition" data-id="${p.id}">
          <div class="petition__top">
            <h3>${esc(p.nombre)}</h3>
            <span class="petition__badge${viable ? " petition__badge--viable" : ""}">${viable ? "Viable ✓" : `#${i + 1} más pedida`}</span>
          </div>
          <p class="petition__car">${esc(p.coche)}${p.anio ? " · " + esc(p.anio) : ""}</p>
          <p class="petition__desc">${esc(p.descripcion)}</p>
          <div class="petition__bar"><span style="width:${pct}%"></span></div>
          <div class="petition__foot">
            <span class="petition__count">${p.firmas.toLocaleString("es-ES")} / ${p.meta.toLocaleString("es-ES")} firmas</span>
            <button type="button" class="petition__sign${isSigned ? " is-signed" : ""}" data-id="${p.id}">${isSigned ? "Firmado ✓" : "Firmar"}</button>
          </div>
        </article>`;
      }).join("");
    }

    list.addEventListener("click", (e) => {
      const btn = e.target.closest(".petition__sign");
      if (!btn) return;
      if (!requireAuth()) return;
      const id = parseInt(btn.dataset.id, 10);
      const petition = petitions.find((p) => p.id === id);
      if (!petition) return;
      if (signed.has(id)) { signed.delete(id); petition.firmas = Math.max(0, petition.firmas - 1); }
      else { signed.add(id); petition.firmas += 1; }
      saveSigned(signed);
      render();
    });

    render();
    document.addEventListener("newrev:authchange", render);

    // ---- propose a new petition ----
    const openBtn = document.getElementById("newPetitionBtn");
    const m = createModal("petitionModal", { focusId: "petNombre" });
    const form = document.getElementById("petitionForm");
    const status = document.getElementById("petitionStatus");
    if (openBtn && m) openBtn.addEventListener("click", () => { if (requireAuth()) m.open(); });
    if (form && m) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        if (!requireAuth()) return;
        const nombre = document.getElementById("petNombre").value.trim();
        const coche = document.getElementById("petCoche").value.trim();
        const anio = document.getElementById("petAnio").value.trim();
        const descripcion = document.getElementById("petDescripcion").value.trim();
        if (!nombre || !coche || !descripcion) return;
        const id = nextId++;
        petitions.push({ id, nombre, coche, anio, descripcion, firmas: 1, meta: 300 });
        signed.add(id); saveSigned(signed);
        render();
        status.classList.remove("is-error");
        status.textContent = "¡Petición abierta! Ya cuenta con tu firma.";
        form.reset();
        setTimeout(() => { m.close(); status.textContent = ""; switchTab("peticiones"); }, 1200);
      });
    }
  })();

  /* ---------------- Part viewer: open a single part's 3D model larger ---------------- */
  (function wirePartViewer() {
    const stage = document.getElementById("partViewStage");
    const tag = document.getElementById("partViewTag");
    const title = document.getElementById("partModalTitle");
    const desc = document.getElementById("partViewDesc");
    const metaEl = document.getElementById("partViewMeta");
    const m = createModal("partModal", { onClose: () => { stage.innerHTML = ""; } });
    if (!stage || !m) return;

    document.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-part-expand]");
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      stage.innerHTML = `<model-viewer src="${esc(btn.dataset.glb)}" alt="${esc(btn.dataset.name)}" camera-controls
        auto-rotate auto-rotate-delay="1200" rotation-per-second="18deg" shadow-intensity="1" shadow-softness="1"
        exposure="1.15" environment-image="neutral" camera-orbit="35deg 75deg 120%" min-camera-orbit="auto auto auto"
        loading="eager" reveal="auto"></model-viewer>`;
      tag.textContent = btn.dataset.ctx || "Catálogo NewRev";
      title.textContent = btn.dataset.name || "Pieza";
      desc.textContent = btn.dataset.desc || "";
      let meta = [];
      try { meta = JSON.parse(btn.dataset.meta || "[]"); } catch (err) { meta = []; }
      metaEl.innerHTML = meta.map(([k, v]) => `<li><span>${esc(k)}</span><b>${esc(v)}</b></li>`).join("");
      m.open();
    });

    const requestBtn = document.getElementById("partRequestBtn");
    if (requestBtn) {
      requestBtn.addEventListener("click", () => {
        const name = title.textContent || "esta pieza";
        const ctx = tag.textContent && tag.textContent !== "Catálogo NewRev" ? ` (${tag.textContent})` : "";
        m.close();
        if (window.__openDigitizeModal) {
          window.__openDigitizeModal({
            label: "Solicitar pieza",
            title: "Solicita esta pieza",
            lede: "Confírmanos tus datos y te contactamos con el precio final y el plazo de fabricación.",
            description: `Quiero solicitar: ${name}${ctx}`,
          });
        }
      });
    }
  })();

  (function wireSearch() {
    const form = document.getElementById("searchForm");
    const input = document.getElementById("searchInput");
    if (!form || !input) return;
    let t;
    const run = () => renderResults(input.value);
    input.addEventListener("input", () => { clearTimeout(t); t = setTimeout(run, 220); });
    form.addEventListener("submit", (e) => { e.preventDefault(); clearTimeout(t); run(); });
    document.querySelectorAll("#searchChips .chip").forEach((c) => {
      c.addEventListener("click", () => { input.value = c.textContent; input.focus(); run(); });
    });
  })();

  // ---- load real data, then populate ----
  async function buildCatalog() {
    try {
      const [cars, comunidad] = await Promise.all([
        fetch("data/coches.json").then((r) => r.json()).catch(() => []),
        fetch("data/comunidad_piezas.json").then((r) => r.json()).catch(() => []),
      ]);

      const carParts = [];
      extractCarParts(cars, {}, carParts);
      // dedupe community by part+brand, preferring verified entries (collapses test repeats)
      const commParts = normalizeCommunity(comunidad)
        .sort((a, b) => (a.estado === "verificada" ? 0 : 1) - (b.estado === "verificada" ? 0 : 1));
      const seen = new Set();
      const commUnique = commParts.filter((p) => { const k = (p.name + "|" + p.brand).toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; });

      CATALOG.index = carParts.concat(commUnique);

      // featured vehicle = first brand in DB that actually has parts
      let featured = null;
      (function findCar(nodes, ctx) {
        if (featured || !Array.isArray(nodes)) return;
        nodes.forEach((n) => {
          if (featured || !n || typeof n !== "object") return;
          const brand = n.brand || ctx.brand;
          if (Array.isArray(n.parts) && n.parts.length) {
            featured = { brand, image: n.image || ctx.image, specs: n.specs || {}, partsCount: n.parts.length };
          }
          if (Array.isArray(n.models)) findCar(n.models, { brand, image: n.image });
          if (Array.isArray(n.submodels)) findCar(n.submodels, { brand, image: n.image });
        });
      })(cars, {});
      if (featured && featured.image) featured.image = featured.image.replace(/^\/assets\/img\//, "assets/img/").replace(/Serie_over_Spanje.*$/, "biscuter-1953.jpg");

      // gallery: featured vehicle + official GLB parts first, then verified community
      const galleryParts = carParts.concat(commUnique.filter((p) => p.estado === "verificada"));
      renderGallery(featured, galleryParts);
      setStats(CATALOG.index);

      ScrollTrigger.refresh();
    } catch (err) {
      console.warn("NewRev catalog load failed", err);
    }
  }

  /* ---------------- Boot ---------------- */
  let booted = false;
  function boot() {
    if (booted) return;
    booted = true;
    buildCounters();
    buildReveals();
    buildProcess();
    buildGallery();
    startExperience();
    ScrollTrigger.refresh();
    buildCatalog(); // async: loads real data, injects gallery cards + stats, refreshes
  }
  if (document.readyState === "complete") {
    if (window.NEWREV && window.NEWREV.ready) boot();
    else window.addEventListener("newrev:ready", boot, { once: true });
  } else {
    window.addEventListener("load", () => {
      if (window.NEWREV && window.NEWREV.ready) boot();
      else window.addEventListener("newrev:ready", boot, { once: true });
    });
  }
  // safety fallback — never leave the preloader stuck
  setTimeout(() => { if (!booted) boot(); }, 4500);
})();

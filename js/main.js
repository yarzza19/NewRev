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

  function partCard(p, idx) {
    const visual = p.glb
      ? `<div class="part__visual part--model">${modelViewer(p.glb, p.name)}<span class="part__badge part__badge--3d">3D · GLB</span></div>`
      : `<div class="part__visual part--head"><span class="part__grid"></span><span class="part__badge">${p.estado === "verificada" ? "Verificada" : "En revisión"}</span></div>`;
    const ctxLine = [p.brand, p.model && p.model !== p.brand ? p.model : "", p.anio].filter(Boolean).join(" · ");
    const meta = [];
    if (p.material) meta.push(["Material", p.material]);
    if (p.price) meta.push(["Precio", p.price]);
    meta.push(["Formato", p.glb ? "GLB · 3D" : (p.estado === "verificada" ? "Bajo demanda" : "Comunidad")]);
    meta.push(["Imprimible", ratingFor(p)]);
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
      const visual = p.glb
        ? `<div class="rcard__media">${modelViewer(p.glb, p.name)}</div>`
        : `<div class="rcard__media rcard__media--ph"><span>${p.type === "comunidad" ? "Comunidad" : "Oficial"}</span></div>`;
      const tags = [p.brand, p.model && p.model !== p.brand ? p.model : "", p.anio].filter(Boolean).join(" · ");
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

  /* ---------------- Live part counter flicker (hero) ---------------- */
  (function partCounter() {
    const el = document.getElementById("partCounter");
    if (!el) return;
    let n = 12480;
    setInterval(() => {
      n += Math.floor(Math.random() * 3);
      el.textContent = n.toLocaleString("es-ES") + " PIEZAS DIGITALIZADAS";
    }, 2600);
  })();

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

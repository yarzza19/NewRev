// =====================================================================
// NEWREV — Three.js scene
// Hero car = real GLB (Dodge Charger, CC-BY · David Sirera) with PBR studio
// render, layer-by-layer "3D-print" build-up, drag-to-orbit, scroll-driven
// exploded view (wheels detach + real Biscúter parts float out), metal/plastic.
// =====================================================================
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const canvas = document.getElementById("stage");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const isMobile = window.matchMedia("(max-width: 820px)").matches || window.matchMedia("(hover: none)").matches;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x07080a, 0.018);

const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(7, 3.4, 9);

const pmrem = new THREE.PMREMGenerator(renderer);
const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
scene.environment = envRT.texture;

// =====================================================================
//  LIGHTING — studio key / rim / warm accent
// =====================================================================
const keyLight = new THREE.DirectionalLight(0xfff3e0, 2.6);
keyLight.position.set(6, 10, 6);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(isMobile ? 1024 : 2048, isMobile ? 1024 : 2048);
keyLight.shadow.camera.near = 1; keyLight.shadow.camera.far = 40;
keyLight.shadow.camera.left = -9; keyLight.shadow.camera.right = 9;
keyLight.shadow.camera.top = 9; keyLight.shadow.camera.bottom = -9;
keyLight.shadow.bias = -0.0004; keyLight.shadow.radius = 6;
scene.add(keyLight);

const rimLight = new THREE.DirectionalLight(0x6f86ff, 1.2);
rimLight.position.set(-8, 5, -6);
scene.add(rimLight);

const accentLight = new THREE.PointLight(0xe0a23c, 20, 30, 2);
accentLight.position.set(-3, 2.2, 5);
scene.add(accentLight);

scene.add(new THREE.AmbientLight(0x404654, 0.55));

// =====================================================================
//  GROUND — shadow catcher + soft contact shadow + print bed
// =====================================================================
const groundGroup = new THREE.Group();
scene.add(groundGroup);

const shadowFloor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.ShadowMaterial({ opacity: 0.42 }));
shadowFloor.rotation.x = -Math.PI / 2;
shadowFloor.receiveShadow = true;
groundGroup.add(shadowFloor);

function radialShadowTexture() {
  const s = 256; const cv = document.createElement("canvas"); cv.width = cv.height = s;
  const ctx = cv.getContext("2d");
  const g = ctx.createRadialGradient(s/2, s/2, 0, s/2, s/2, s/2);
  g.addColorStop(0, "rgba(0,0,0,0.55)"); g.addColorStop(0.55, "rgba(0,0,0,0.22)"); g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g; ctx.fillRect(0, 0, s, s);
  return new THREE.CanvasTexture(cv);
}
const contactShadow = new THREE.Mesh(
  new THREE.PlaneGeometry(11, 5.6),
  new THREE.MeshBasicMaterial({ map: radialShadowTexture(), transparent: true, depthWrite: false, opacity: 0.9 })
);
contactShadow.rotation.x = -Math.PI / 2; contactShadow.position.y = 0.01;
groundGroup.add(contactShadow);

const printBed = new THREE.Mesh(
  new THREE.RingGeometry(0.1, 5.2, 96),
  new THREE.MeshBasicMaterial({ color: 0xe0a23c, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })
);
printBed.rotation.x = -Math.PI / 2; printBed.position.y = 0.015;
groundGroup.add(printBed);

// =====================================================================
//  MATERIAL WORLDS — metal (glossy) vs plastic (matte). Eased per frame.
// =====================================================================
const WORLDS = {
  metal:   { body: { color: 0xb01a18, metalness: 0.45, roughness: 0.26 }, chrome: { color: 0xcfd3da, metalness: 1.0, roughness: 0.18 }, accent: 0xe0a23c, rim: 0x6f86ff, bed: 0xe0a23c },
  plastic: { body: { color: 0xcf4a3e, metalness: 0.0,  roughness: 0.62 }, chrome: { color: 0xbfeae3, metalness: 0.1, roughness: 0.4 },  accent: 0x5fd0c4, rim: 0x57c9bd, bed: 0x5fd0c4 },
};
const target = JSON.parse(JSON.stringify(WORLDS.metal));

// =====================================================================
//  BUILD-UP SHADER — shared uniforms injected into every car material.
// =====================================================================
const buildUniforms = {
  uBuildY: { value: 999 },
  uBuildOn: { value: 0 },
  uPrintColor: { value: new THREE.Color(0xe0a23c) },
};
function applyBuildShader(mat) {
  if (mat.userData.__build) return mat;
  mat.userData.__build = true;
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uBuildY = buildUniforms.uBuildY;
    shader.uniforms.uBuildOn = buildUniforms.uBuildOn;
    shader.uniforms.uPrintColor = buildUniforms.uPrintColor;
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\n varying vec3 vBuildWorld;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\n vBuildWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;");
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\n varying vec3 vBuildWorld;\n uniform float uBuildY;\n uniform float uBuildOn;\n uniform vec3 uPrintColor;")
      .replace("#include <dithering_fragment>",
        `#include <dithering_fragment>
         if (uBuildOn > 0.001) {
           if (vBuildWorld.y > uBuildY) discard;
           float d = uBuildY - vBuildWorld.y;
           float band = smoothstep(0.22, 0.0, d);
           gl_FragColor.rgb += uPrintColor * band * 2.2 * uBuildOn;
           float layer = 0.5 + 0.5 * sin(vBuildWorld.y * 110.0);
           gl_FragColor.rgb *= 1.0 - 0.10 * layer * uBuildOn;
         }`);
  };
  mat.customProgramCacheKey = () => "newrev-build";
  return mat;
}

// =====================================================================
//  HERO CAR (GLB) + detachables + label anchors
// =====================================================================
const carGroup = new THREE.Group();
scene.add(carGroup);

const detachables = [];   // { obj, base, dir, dist, emerge(bool) }
const labelAnchors = {};
let bodyMats = [], chromeMats = [];
let carMinY = 0, carMaxY = 1.6;
const carCenter = new THREE.Vector3(0, 0.7, 0);
let loaded = false;

const loader = new GLTFLoader();

function normalize(obj, targetSize, sitOnGround) {
  const box = new THREE.Box3().setFromObject(obj);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  const s = targetSize / maxDim;
  obj.scale.setScalar(s);
  obj.position.sub(center.multiplyScalar(s));
  if (sitOnGround) {
    const b2 = new THREE.Box3().setFromObject(obj);
    obj.position.y -= b2.min.y;
  }
  return obj;
}

function upgradeMaterial(mat) {
  if (!mat || mat.userData.__up) return;
  mat.userData.__up = true;
  mat.envMapIntensity = 1.3;
  const n = (mat.name || "").toLowerCase();
  if (n.includes("chasis") || n === "red" || n.includes("red_chasis")) {
    mat.metalness = target.body.metalness; mat.roughness = target.body.roughness;
    mat.color.set(target.body.color); mat.envMapIntensity = 1.5;
    bodyMats.push(mat);
  } else if (n.includes("metalic") || n.includes("chrome") || n === "grey") {
    mat.metalness = 1.0; mat.roughness = 0.2; mat.envMapIntensity = 1.6;
    chromeMats.push(mat);
  } else if (n.includes("glass")) {
    mat.transparent = true; mat.opacity = 0.42; mat.metalness = 0; mat.roughness = 0.06; mat.envMapIntensity = 1.6;
  } else if (n.includes("tire")) {
    mat.metalness = 0; mat.roughness = 0.95;
  } else if (n.includes("light")) {
    mat.emissive = new THREE.Color(0xff2a18); mat.emissiveIntensity = 0.9; mat.roughness = 0.4;
  } else {
    mat.metalness = Math.min(mat.metalness + 0.1, 0.5); mat.roughness = Math.max(mat.roughness - 0.2, 0.35);
  }
  applyBuildShader(mat);
}

const CAR_YAW = Math.PI * 0.38;   // orient model to a flattering front 3/4 view

loader.load(
  "assets/models/hero/dodge-charger.glb",
  (gltf) => {
    const car = gltf.scene;
    normalize(car, 5.0, true);
    car.rotation.y = CAR_YAW;

    car.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true; o.receiveShadow = true;
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        mats.forEach(upgradeMaterial);
      }
    });
    carGroup.add(car);

    // collect wheels (nodes named Circle.*) — stay attached to the car, only used for the wheel label
    const bbox = new THREE.Box3().setFromObject(car);
    const c = bbox.getCenter(new THREE.Vector3());
    const wheels = [];
    car.children.slice().forEach((node) => {
      if (/circle/i.test(node.name)) wheels.push(node);
    });

    carMinY = bbox.min.y; carMaxY = bbox.max.y;
    carCenter.set(c.x, (bbox.min.y + bbox.max.y) * 0.5, c.z);
    labelAnchors.carroceria = anchor(carGroup, c.x, bbox.max.y + 0.05, c.z);
    // a wheel label
    const firstWheel = wheels[0];
    if (firstWheel) labelAnchors.rueda = anchor(carGroup, firstWheel.position.x, 0.5, firstWheel.position.z);

    loaded = true;
    finishReady();
    loadRealParts(c, bbox);
  },
  undefined,
  (err) => { console.warn("hero GLB failed", err); loaded = true; finishReady(); }
);

function anchor(parent, x, y, z) {
  const a = new THREE.Object3D(); a.position.set(x, y, z); parent.add(a); return a;
}

// real Biscúter parts emerge & float out during the explode (highlighted components)
function loadRealParts(center, carBox) {
  const parts = [
    { file: "assets/models/biscuter/culata.glb",                id: "culata",  dir: new THREE.Vector3(0.2, 1.0, 0.5),  size: 1.5, label: "Culata" },
    { file: "assets/models/biscuter/Pieza%20motor%20tubo.glb",  id: "motor",   dir: new THREE.Vector3(-0.7, 0.9, 0.2), size: 1.2, label: "Pieza motor" },
    { file: "assets/models/biscuter/Pieza%20arranque%20motor.glb", id: "arranque", dir: new THREE.Vector3(0.6, 0.85, -0.5), size: 1.2, label: "Arranque" },
  ];
  const topY = carBox.max.y;
  parts.forEach((p, i) => {
    loader.load(p.file, (gltf) => {
      const obj = gltf.scene;
      normalize(obj, p.size, false);
      const base = new THREE.Vector3(center.x + (i - 1) * 0.4, topY * 0.62, center.z);
      obj.position.copy(base);
      obj.traverse((o) => {
        if (o.isMesh) {
          o.castShadow = true;
          const mats = Array.isArray(o.material) ? o.material : [o.material];
          mats.forEach((m) => {
            m.metalness = 0.6; m.roughness = 0.32;
            m.color = new THREE.Color(0xd7b27a); m.envMapIntensity = 1.4;
            applyBuildShader(m);
          });
        }
      });
      obj.userData.normScale = obj.scale.x; // remember the fitted scale
      obj.scale.setScalar(0.0001);          // start hidden, emerge with explode
      carGroup.add(obj);
      detachables.push({ obj, base, dir: p.dir.clone().normalize(), dist: 2.2, emerge: true, spin: 0.5 });
      labelAnchors[p.id] = anchor(obj, 0, 0, 0);
    }, undefined, () => {});
  });
}

// =====================================================================
//  PARTICLES — dust + sparks near the print line
// =====================================================================
function spriteTexture(stops) {
  const s = 64; const cv = document.createElement("canvas"); cv.width = cv.height = s;
  const ctx = cv.getContext("2d");
  const g = ctx.createRadialGradient(s/2, s/2, 0, s/2, s/2, s/2);
  stops.forEach(([o, col]) => g.addColorStop(o, col));
  ctx.fillStyle = g; ctx.fillRect(0, 0, s, s);
  return new THREE.CanvasTexture(cv);
}
const dustTex = spriteTexture([[0, "rgba(255,255,255,0.9)"], [0.4, "rgba(255,255,255,0.25)"], [1, "rgba(255,255,255,0)"]]);

const dustCount = isMobile ? 260 : 700;
const dustGeo = new THREE.BufferGeometry();
const dustPos = new Float32Array(dustCount * 3); const dustRnd = new Float32Array(dustCount);
for (let i = 0; i < dustCount; i++) {
  dustPos[i*3] = (Math.random()-0.5)*22; dustPos[i*3+1] = Math.random()*9; dustPos[i*3+2] = (Math.random()-0.5)*18; dustRnd[i] = Math.random();
}
dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
const dustMat = new THREE.PointsMaterial({ size: 0.05, map: dustTex, transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xe0a23c, sizeAttenuation: true });
scene.add(new THREE.Points(dustGeo, dustMat));

const sparkCount = isMobile ? 60 : 140;
const sparkGeo = new THREE.BufferGeometry();
const sparkPos = new Float32Array(sparkCount * 3); const sparkVel = []; const sparkLife = new Float32Array(sparkCount);
function resetSpark(i, init) {
  const a = Math.random()*Math.PI*2, r = Math.random()*3.2;
  sparkPos[i*3] = Math.cos(a)*r; sparkPos[i*3+1] = init ? Math.random()*2 : 0.05; sparkPos[i*3+2] = Math.sin(a)*r;
  sparkVel[i] = new THREE.Vector3((Math.random()-0.5)*0.4, 0.6+Math.random()*1.4, (Math.random()-0.5)*0.4);
  sparkLife[i] = Math.random();
}
for (let i = 0; i < sparkCount; i++) resetSpark(i, true);
sparkGeo.setAttribute("position", new THREE.BufferAttribute(sparkPos, 3));
const sparkMat = new THREE.PointsMaterial({ size: 0.07, map: dustTex, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xffcf7a, sizeAttenuation: true });
scene.add(new THREE.Points(sparkGeo, sparkMat));

// =====================================================================
//  ORBIT (drag) + interaction
// =====================================================================
const orbit = { az: 0.7, azTarget: 0.7, pol: 1.15, polTarget: 1.15, vel: 0 };
let dragging = false, lastX = 0, lastY = 0;
const mouse = new THREE.Vector2(0, 0), mouseT = new THREE.Vector2(0, 0);
function isInteractive(el) { return el && el.closest && el.closest("a, button, input, model-viewer, .matswitch, .bigtoggle, [data-magnetic]"); }
window.addEventListener("pointerdown", (e) => {
  if (isInteractive(e.target)) return;
  dragging = true; lastX = e.clientX; lastY = e.clientY; document.body.classList.add("is-dragging");
});
window.addEventListener("pointermove", (e) => {
  mouseT.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouseT.y = -((e.clientY / window.innerHeight) * 2 - 1);
  if (!dragging) return;
  const dx = (e.clientX - lastX) / window.innerWidth, dy = (e.clientY - lastY) / window.innerHeight;
  orbit.azTarget -= dx * 3.4; orbit.polTarget = THREE.MathUtils.clamp(orbit.polTarget - dy * 2.6, 0.5, 1.5);
  orbit.vel = -dx * 3.4; lastX = e.clientX; lastY = e.clientY;
});
window.addEventListener("pointerup", () => { dragging = false; document.body.classList.remove("is-dragging"); });
window.addEventListener("pointerleave", () => { dragging = false; document.body.classList.remove("is-dragging"); });

// =====================================================================
//  STATE + PUBLIC API
// =====================================================================
const state = { scroll: 0, scrollTarget: 0, explode: 0, explodeTarget: 0, building: false, buildStart: -1, buildDur: 2.8, buildDone: false, buildEndT: 0 };
const api = {
  ready: false,
  setScroll(p) { state.scrollTarget = THREE.MathUtils.clamp(p, 0, 1); },
  setExplode(v) { state.explodeTarget = THREE.MathUtils.clamp(v, 0, 1); },
  playBuild(dur = 2.8) { state.buildDur = dur; state.buildStart = clock.getElapsedTime(); state.building = true; state.buildDone = false; buildUniforms.uBuildOn.value = 1; },
  setMaterial(name) {
    if (!WORLDS[name]) return;
    const w = WORLDS[name];
    target.body = { ...w.body }; target.chrome = { ...w.chrome };
    target.accent = w.accent; target.rim = w.rim; target.bed = w.bed;
  },
  getLabelTargets() {
    const out = []; const w = window.innerWidth, h = window.innerHeight;
    for (const id in labelAnchors) {
      const v = labelAnchors[id].getWorldPosition(new THREE.Vector3()).project(camera);
      out.push({ id, x: (v.x*0.5+0.5)*w, y: (-v.y*0.5+0.5)*h, visible: v.z < 1 && v.z > -1 });
    }
    return out;
  },
};
window.NEWREV = api;

let readyFired = false;
function finishReady() {
  if (readyFired) return; readyFired = true; api.ready = true;
  window.dispatchEvent(new Event("newrev:ready"));
}

// =====================================================================
//  RESIZE + CAMERA PATH
// =====================================================================
function resize() {
  const w = window.innerWidth, h = window.innerHeight;
  camera.aspect = w / h; camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}
window.addEventListener("resize", resize);

const tmpColor = new THREE.Color();
function easeInOut(t) { return t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t+2, 2)/2; }
const lerp = (a, b, t) => a + (b - a) * t;

function cameraForScroll(p, ex) {
  const portrait = camera.aspect < 0.85;
  const base = portrait ? 1.32 : 1.0;
  let radius =
    p < 0.18 ? lerp(9.2, 8.4, easeInOut(p / 0.18)) :
    p < 0.40 ? lerp(8.4, 11.0, easeInOut((p - 0.18) / 0.22)) :
    p < 0.62 ? lerp(11.0, 7.8, easeInOut((p - 0.40) / 0.22)) :
    lerp(7.8, 9.4, easeInOut((p - 0.62) / 0.38));
  radius *= base; radius += ex * 1.6;
  const scrollAz = p * Math.PI * 1.7;
  const scrollPol = lerp(0, -0.26, Math.sin(Math.min(p, 0.5) / 0.5 * Math.PI)) - ex * 0.16;
  const targetY = carCenter.y + ex * 0.7;
  return { radius, scrollAz, scrollPol, targetY };
}

// =====================================================================
//  RENDER LOOP
// =====================================================================
const clock = new THREE.Clock();
let started = false;

function tick() {
  const t = clock.getElapsedTime();
  const dt = Math.min(clock.getDelta(), 0.05);

  state.scroll = lerp(state.scroll, state.scrollTarget, 0.07);
  state.explode = lerp(state.explode, state.explodeTarget, 0.08);
  mouse.x = lerp(mouse.x, mouseT.x, 0.06); mouse.y = lerp(mouse.y, mouseT.y, 0.06);
  const p = state.scroll, ex = easeInOut(state.explode);

  if (state.building) {
    const bp = THREE.MathUtils.clamp((t - state.buildStart) / state.buildDur, 0, 1);
    const eased = easeInOut(bp);
    buildUniforms.uBuildY.value = lerp(carMinY - 0.3, carMaxY + 0.45, eased);
    printBed.material.opacity = (0.5 + 0.5*Math.sin(t*8)) * 0.5 * (1 - bp*0.3);
    printBed.scale.setScalar(0.2 + eased * 1.0);
    sparkMat.opacity = 0.9 * (1 - bp*0.4);
    if (bp >= 1 && !state.buildDone) { state.buildDone = true; state.buildEndT = t; }
    if (state.buildDone) {
      const f = THREE.MathUtils.clamp((t - state.buildEndT) / 0.6, 0, 1);
      buildUniforms.uBuildOn.value = 1 - f; buildUniforms.uBuildY.value = 999;
      printBed.material.opacity *= (1 - f); sparkMat.opacity *= (1 - f);
      if (f >= 1) { state.building = false; buildUniforms.uBuildOn.value = 0; }
    }
  }

  // ease material worlds
  const ms = 0.06;
  bodyMats.forEach((m) => { m.metalness = lerp(m.metalness, target.body.metalness, ms); m.roughness = lerp(m.roughness, target.body.roughness, ms); m.color.lerp(tmpColor.set(target.body.color), ms); });
  chromeMats.forEach((m) => { m.metalness = lerp(m.metalness, target.chrome.metalness, ms); m.roughness = lerp(m.roughness, target.chrome.roughness, ms); m.color.lerp(tmpColor.set(target.chrome.color), ms); });
  buildUniforms.uPrintColor.value.lerp(tmpColor.set(target.accent), ms);
  accentLight.color.lerp(tmpColor.set(target.accent), ms);
  rimLight.color.lerp(tmpColor.set(target.rim), ms);
  dustMat.color.lerp(tmpColor.set(target.accent), ms);
  printBed.material.color.lerp(tmpColor.set(target.bed), ms);

  // explode parts
  detachables.forEach((d) => {
    d.obj.position.copy(d.base).addScaledVector(d.dir, d.dist * ex);
    if (d.emerge) d.obj.scale.setScalar(Math.max(0.0001, ex) * (d.obj.userData.normScale || 1));
    if (d.spin) d.obj.rotation.y += dt * d.spin * (0.4 + ex);
  });

  // camera (single orbit model)
  orbit.az = lerp(orbit.az, orbit.azTarget, 0.08); orbit.pol = lerp(orbit.pol, orbit.polTarget, 0.08);
  if (!dragging) {
    orbit.azTarget += orbit.vel * 0.02; orbit.vel *= 0.94;
    if (Math.abs(orbit.vel) < 0.0008) orbit.azTarget += 0.0009 + (reduceMotion ? 0 : 0.0008);
  }
  const cs = cameraForScroll(p, ex);
  const az = orbit.az + cs.scrollAz + mouse.x * 0.15;
  const pol = THREE.MathUtils.clamp(orbit.pol + cs.scrollPol - mouse.y * 0.08, 0.42, 1.55);
  const r = cs.radius, sinPol = Math.sin(pol);
  camera.position.set(Math.cos(az)*sinPol*r, Math.max(Math.cos(pol)*r + 0.6, 0.4), Math.sin(az)*sinPol*r);
  camera.lookAt(carCenter.x, cs.targetY, carCenter.z);

  // particles
  for (let i = 0; i < dustCount; i++) { dustPos[i*3+1] += dt * (0.05 + dustRnd[i]*0.12); if (dustPos[i*3+1] > 9) dustPos[i*3+1] = 0; }
  dustGeo.attributes.position.needsUpdate = true;
  dustMat.opacity = lerp(0.5, 0.22, p);
  if (sparkMat.opacity > 0.01) {
    for (let i = 0; i < sparkCount; i++) {
      sparkPos[i*3] += sparkVel[i].x*dt; sparkPos[i*3+1] += sparkVel[i].y*dt; sparkPos[i*3+2] += sparkVel[i].z*dt;
      sparkVel[i].y -= dt*0.6; sparkLife[i] -= dt*0.5;
      if (sparkLife[i] <= 0 || sparkPos[i*3+1] > buildUniforms.uBuildY.value + 0.2) resetSpark(i, false);
    }
    sparkGeo.attributes.position.needsUpdate = true;
  }

  renderer.render(scene, camera);
  if (!started) { started = true; setTimeout(finishReady, 2500); } // safety if GLB stalls
  requestAnimationFrame(tick);
}
tick();

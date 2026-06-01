/**
 * Scroll-driven frame animation — NewRev
 * 240 WebP frames: frame_0001.webp → frame_0240.webp
 * Served via server.js at /frames/
 */

(function () {
    'use strict';

    // ─── CONFIG ────────────────────────────────────────────────────────────────
    const TOTAL_FRAMES = 97;
    const FRAMES_DIR = '/frames/';
    const SCROLL_HEIGHT_VH = 2;   // scroll zone = 2× viewport height

    // ─── DOM ───────────────────────────────────────────────────────────────────
    const canvas = document.getElementById('hero-canvas');
    const ctx = canvas.getContext('2d');
    const scrollContainer = document.getElementById('scroll-container');
    const scrollSpacer = document.getElementById('scroll-spacer');
    const loadingOverlay = document.getElementById('loading-overlay');

    // Inject progress bar
    const progressBar = document.createElement('div');
    progressBar.id = 'progress-bar';
    document.body.appendChild(progressBar);

    // Inject scroll hint
    const scrollHint = document.createElement('div');
    scrollHint.id = 'scroll-hint';
    scrollHint.innerHTML = '<span>Scroll</span><div class="scroll-arrow"></div>';
    document.body.appendChild(scrollHint);

    // ─── STATE ─────────────────────────────────────────────────────────────────
    const frames = new Array(TOTAL_FRAMES).fill(null); // loaded Image objects
    let drawnFrame = -1;   // last frame actually drawn on canvas
    let targetFrame = 0;    // frame we WANT to show right now

    // ─── HELPERS ───────────────────────────────────────────────────────────────
    function pad4(n) {
        return String(n).padStart(4, '0');
    }

    function frameSrc(i) {
        // i is 0-based; files are 1-based
        return FRAMES_DIR + 'frame_' + pad4(i + 1) + '.webp';
    }

    // ─── CANVAS ────────────────────────────────────────────────────────────────
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        draw(drawnFrame < 0 ? targetFrame : drawnFrame);
    }

    // ─── DRAW ──────────────────────────────────────────────────────────────────
    function draw(index) {
        if (index < 0 || index >= TOTAL_FRAMES) return;

        // Walk towards targetFrame to find the closest loaded frame
        const img = findBestFrame(index);
        if (!img) return;

        const cw = canvas.width;
        const ch = canvas.height;
        const iw = img.naturalWidth;
        const ih = img.naturalHeight;
        if (!iw || !ih) return;

        // Cover-fit: fill full screen width
        const scale = Math.max(cw / iw, ch / ih);
        const dw = iw * scale;
        const dh = ih * scale;
        const dx = (cw - dw) / 2;
        const dy = (ch - dh) / 2;

        ctx.clearRect(0, 0, cw, ch);
        ctx.drawImage(img, dx, dy, dw, dh);
        drawnFrame = index;
    }

    // Find the closest loaded frame to `index` (prefer exact, then search outward)
    function findBestFrame(index) {
        if (frames[index]) return frames[index];
        // Search outward from index
        for (let d = 1; d < TOTAL_FRAMES; d++) {
            if (index - d >= 0 && frames[index - d]) return frames[index - d];
            if (index + d < TOTAL_FRAMES && frames[index + d]) return frames[index + d];
        }
        return null;
    }

    // ─── SCROLL → FRAME ────────────────────────────────────────────────────────
    function getScrollProgress() {
        const scrollTop = window.scrollY;
        // The scrollable distance is exactly the spacer height
        const scrollHeight = scrollSpacer.offsetHeight;
        return scrollHeight > 0 ? Math.min(Math.max(scrollTop / scrollHeight, 0), 1) : 0;
    }

    function onScroll() {
        const progress = getScrollProgress();
        targetFrame = Math.min(Math.round(progress * (TOTAL_FRAMES - 1)), TOTAL_FRAMES - 1);

        draw(targetFrame);

        progressBar.style.width = (progress * 100) + '%';

        if (window.scrollY > 60) {
            scrollHint.classList.add('hidden');
        } else {
            scrollHint.classList.remove('hidden');
        }
    }

    // ─── PRELOADING ────────────────────────────────────────────────────────────
    let loadedCount = 0;
    let started = false;

    function onFrameLoaded(i) {
        loadedCount++;

        // Redraw if this frame is closer to target than what's currently shown
        if (Math.abs(i - targetFrame) <= Math.abs(drawnFrame - targetFrame) || drawnFrame < 0) {
            draw(targetFrame);
        }

        // Show canvas once first frame is ready
        if (!started && frames[0]) {
            started = true;
            draw(0);
            loadingOverlay.classList.add('hidden');
        }
    }

    function preloadAll() {
        // Load frame 0 first so we can show something immediately
        loadSingle(0);

        // Then load all frames in order
        for (let i = 1; i < TOTAL_FRAMES; i++) {
            loadSingle(i);
        }
    }

    function loadSingle(i) {
        const img = new Image();
        img.onload = () => {
            frames[i] = img;
            onFrameLoaded(i);
        };
        img.onerror = () => {
            console.warn('Failed to load frame', i, frameSrc(i));
            loadedCount++;
        };
        img.src = frameSrc(i);
    }

    // ─── LAYOUT ────────────────────────────────────────────────────────────────
    function setLayout() {
        const scrollZone = window.innerHeight * SCROLL_HEIGHT_VH;
        scrollSpacer.style.height = scrollZone + 'px';
        // scroll-container wraps spacer + sticky canvas (1vh)
        // The sticky canvas is inside, so total height = spacer + 100vh
        scrollContainer.style.height = (scrollZone + window.innerHeight) + 'px';
    }

    // ─── INIT ──────────────────────────────────────────────────────────────────
    function init() {
        setLayout();
        resizeCanvas();

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', () => {
            setLayout();
            resizeCanvas();
        });

        preloadAll();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

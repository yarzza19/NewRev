(function () {
    'use strict';

    const canvas = document.getElementById('sequence-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const container = document.getElementById('scroll-animation-section');

    // Config: 289 frames (imagen0001.jpg - imagen0289.jpg)
    const frameCount = 289;
    const currentFrame = index => (
        `assets/img/animacion/animacion2/imagen${index.toString().padStart(4, '0')}.jpg`
    );

    const images = [];
    let imagesLoaded = 0;
    let initialDrawComplete = false;

    // Load images
    for (let i = 1; i <= frameCount; i++) {
        const img = new Image();
        img.src = currentFrame(i);
        images.push(img);

        img.onload = () => {
            imagesLoaded++;
            if (i === 1 && !initialDrawComplete) {
                render(0);
                initialDrawComplete = true;
            } else if (imagesLoaded > frameCount * 0.1 && !initialDrawComplete) {
                // If the first frame isn't loaded yet, try to draw the first one we have
                render(0);
                initialDrawComplete = true;
            }
        };
    }

    function render(frameIndex) {
        if (images[frameIndex] && images[frameIndex].complete && images[frameIndex].naturalWidth > 0) {
            const img = images[frameIndex];

            // Adjust canvas resolution dynamically to match image ratio
            if (canvas.width !== img.naturalWidth) {
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
    }

    // Scroll Logic
    window.addEventListener('scroll', () => {
        const rect = container.getBoundingClientRect();

        // Start animating when the container is in view
        const scrollTop = -rect.top;
        const maxScrollDist = container.offsetHeight - window.innerHeight;

        if (scrollTop < 0) {
            render(0);
            return;
        }
        if (scrollTop > maxScrollDist) {
            render(frameCount - 1);
            return;
        }

        // Calculate progress (0 to 1)
        let scrollFraction = scrollTop / maxScrollDist;

        // Calculate frame index
        const frameIndex = Math.min(
            frameCount - 1,
            Math.floor(scrollFraction * frameCount)
        );

        requestAnimationFrame(() => render(frameIndex));
    });
})();

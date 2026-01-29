import React, { useRef, useEffect } from 'react';
import { useThemeStore } from '../../store/themeStore';

const Smoke = () => {
  const canvasRef = useRef(null);
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true }); // optimize for alpha
    if (!ctx) return;

    let animationFrameId;
    let particles = [];
    let width = 0;
    let height = 0;
    let smokeImage = null; // Cache for the gradient

    // Configuration
    const particleColor = isDark ? '255, 255, 255' : '0, 0, 0';
    // Reduced opacity slightly since we might have overlaps, but keeping it visible
    const baseOpacity = isDark ? 0.15 : 0.12;

    // Performance: Render at lower resolution. Smoke is blurry, so we don't need 1:1 pixels.
    // 0.6 is a good balance between perf and quality for background effects.
    const quality = 0.6;

    // 1. Create a pre-rendered offscreen canvas for the smoke puff
    // This is the biggest performance boost vs drawing gradients every frame
    const createSmokePuff = () => {
      const size = 256; // Standard size for the texture
      const offCanvas = document.createElement('canvas');
      offCanvas.width = size;
      offCanvas.height = size;
      const offCtx = offCanvas.getContext('2d');

      const gradient = offCtx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      gradient.addColorStop(0, `rgba(${particleColor}, 1)`); // Solid center (alpha handled by globalAlpha)
      gradient.addColorStop(1, `rgba(${particleColor}, 0)`);

      offCtx.fillStyle = gradient;
      offCtx.beginPath();
      offCtx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      offCtx.fill();
      return offCanvas;
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      // Set canvas internal resolution lower than screen size for performance
      canvas.width = width * quality;
      canvas.height = height * quality;

      // Re-generate cache when color changes (theme)
      smokeImage = createSmokePuff();

      initParticles();
    };

    const createParticle = (reset = false) => {
      // Sizes are relative to logical screen pixels, we scale when drawing
      const size = Math.random() * 300 + 200;
      return {
        x: Math.random() * width,
        y: reset ? Math.random() * height : height + size,
        size: size,
        vx: (Math.random() - 0.5) * 0.5, // gentle drift
        vy: -(Math.random() * 0.4 + 0.1), // gentle rise
        life: Math.random() * 100,
        maxLife: 300 + Math.random() * 300,
        alpha: Math.random() * baseOpacity
      };
    };

    const initParticles = () => {
      // Moderate particle count - sufficient for coverage without killing CPU
      const particleCount = 20;
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(createParticle(true));
      }
    };

    const update = () => {
      // Scaling logic: We draw on a smaller canvas, but want coordinates to match screen space
      // So we clear the whole smaller canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Save context to apply global scaling for resolution
      ctx.save();
      ctx.scale(quality, quality);

      if (smokeImage) {
        particles.forEach((p, index) => {
          p.x += p.vx;
          p.y += p.vy;

          // Wrap/Reset logic
          if (p.x < -p.size) p.x = width + p.size;
          if (p.x > width + p.size) p.x = -p.size;

          if (p.y < -p.size) {
            particles[index] = createParticle(false);
            particles[index].y = height + p.size;
          }

          // Use globalAlpha for fading, much faster than regenerating gradients
          ctx.globalAlpha = p.alpha;
          // Draw cached image. 
          // Centered drawing: image is 256x256, we draw it at p.size
          ctx.drawImage(smokeImage, p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        });
      }
      ctx.restore();

      animationFrameId = requestAnimationFrame(update);
    };

    window.addEventListener('resize', resize);
    resize();
    update();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDark]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 block w-full h-full pointer-events-none"
      // Ensure it stretches to fill the container regardless of internal resolution
      style={{ width: '100%', height: '100%' }}
    />
  );
};

export default Smoke;

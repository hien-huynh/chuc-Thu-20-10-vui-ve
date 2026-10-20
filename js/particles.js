/**
 * ==========================================================================
 * PARTICLES & STARFIELD BACKGROUND (js/particles.js)
 * High-performance Canvas 2D romantic starfield, champagne twinkles,
 * and parallax depth effects.
 * ==========================================================================
 */

const ParticlesEngine = (function () {
  'use strict';

  let canvas = null;
  let ctx = null;
  let width = 0;
  let height = 0;
  let animationId = null;
  let isRunning = false;

  // Particle layers
  const stars = [];
  const champagneStars = [];
  const glowingDust = [];

  // Parallax state
  let targetMouseX = 0;
  let targetMouseY = 0;
  let currentMouseX = 0;
  let currentMouseY = 0;

  /**
   * Star Constructor
   */
  function Star(depthLayer) {
    this.reset(true, depthLayer);
  }

  Star.prototype.reset = function (initial, depthLayer) {
    this.x = Math.random() * (width || window.innerWidth);
    this.y = initial ? Math.random() * (height || window.innerHeight) : -10;
    this.depth = depthLayer || (Math.random() * 0.8 + 0.2); // 0.2 to 1.0
    this.baseRadius = Math.random() * 1.3 + 0.5;
    this.radius = this.baseRadius * this.depth;
    this.alpha = Math.random() * 0.6 + 0.3;
    this.twinkleSpeed = Math.random() * 0.03 + 0.01;
    this.twinklePhase = Math.random() * Math.PI * 2;
    this.vy = (Math.random() * 0.15 + 0.05) * this.depth;
    this.vx = (Math.random() * 0.08 - 0.04) * this.depth;

    // Palette: white, soft pink pastel, champagne gold
    const rand = Math.random();
    if (rand < 0.65) {
      this.color = '255, 250, 247'; // White
    } else if (rand < 0.85) {
      this.color = '243, 223, 191'; // Champagne
    } else {
      this.color = '246, 191, 208'; // Pastel pink
    }
  };

  Star.prototype.update = function (deltaX, deltaY) {
    this.twinklePhase += this.twinkleSpeed;
    this.currentAlpha = this.alpha * (0.6 + 0.4 * Math.sin(this.twinklePhase));

    this.y += this.vy;
    this.x += this.vx;

    // Parallax shift
    this.drawX = this.x + deltaX * this.depth * 35;
    this.drawY = this.y + deltaY * this.depth * 35;

    // Boundary wrap
    if (this.y > height + 20) this.y = -10;
    if (this.x < -20) this.x = width + 10;
    if (this.x > width + 20) this.x = -10;
  };

  Star.prototype.draw = function (context) {
    context.beginPath();
    context.arc(this.drawX, this.drawY, this.radius, 0, Math.PI * 2);
    context.fillStyle = `rgba(${this.color}, ${this.currentAlpha})`;
    context.fill();

    // Occasional gentle glow for larger stars
    if (this.radius > 1.2 && this.currentAlpha > 0.6) {
      context.beginPath();
      context.arc(this.drawX, this.drawY, this.radius * 2.8, 0, Math.PI * 2);
      context.fillStyle = `rgba(${this.color}, ${this.currentAlpha * 0.15})`;
      context.fill();
    }
  };

  /**
   * Champagne Floating Glow Orb
   */
  function GlowingOrb() {
    this.x = Math.random() * (width || window.innerWidth);
    this.y = Math.random() * (height || window.innerHeight);
    this.radius = Math.random() * 18 + 8;
    this.alpha = Math.random() * 0.12 + 0.04;
    this.vx = (Math.random() - 0.5) * 0.2;
    this.vy = -(Math.random() * 0.2 + 0.05);
    this.color = Math.random() > 0.5 ? '243, 223, 191' : '255, 117, 200';
  }

  GlowingOrb.prototype.update = function (deltaX, deltaY) {
    this.x += this.vx;
    this.y += this.vy;

    this.drawX = this.x + deltaX * 18;
    this.drawY = this.y + deltaY * 18;

    if (this.y < -30) {
      this.y = height + 30;
      this.x = Math.random() * width;
    }
  };

  GlowingOrb.prototype.draw = function (context) {
    const grad = context.createRadialGradient(
      this.drawX, this.drawY, 0,
      this.drawX, this.drawY, this.radius
    );
    grad.addColorStop(0, `rgba(${this.color}, ${this.alpha})`);
    grad.addColorStop(1, `rgba(${this.color}, 0)`);

    context.beginPath();
    context.arc(this.drawX, this.drawY, this.radius, 0, Math.PI * 2);
    context.fillStyle = grad;
    context.fill();
  };

  /**
   * Setup & Resize
   */
  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    if (canvas) {
      canvas.width = width;
      canvas.height = height;
    }
  }

  function init() {
    canvas = document.getElementById('star-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');

    resize();
    window.addEventListener('resize', resize);

    // Populate particles based on screen size
    const isMobile = window.innerWidth < 768;
    const starCount = isMobile ? 120 : 260;
    const orbCount = isMobile ? 8 : 16;

    stars.length = 0;
    for (let i = 0; i < starCount; i++) {
      stars.push(new Star());
    }

    glowingDust.length = 0;
    for (let i = 0; i < orbCount; i++) {
      glowingDust.push(new GlowingOrb());
    }

    // Parallax mouse / touch listeners
    window.addEventListener('mousemove', function (e) {
      targetMouseX = (e.clientX / width - 0.5) * 2;
      targetMouseY = (e.clientY / height - 0.5) * 2;
    }, { passive: true });

    window.addEventListener('touchmove', function (e) {
      if (e.touches.length > 0) {
        targetMouseX = (e.touches[0].clientX / width - 0.5) * 2;
        targetMouseY = (e.touches[0].clientY / height - 0.5) * 2;
      }
    }, { passive: true });

    // Handle tab visibility to save battery/CPU
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        stop();
      } else {
        start();
      }
    });

    start();
  }

  /**
   * Animation Render Loop
   */
  function render() {
    if (!isRunning) return;

    // Smooth mouse damping
    currentMouseX += (targetMouseX - currentMouseX) * 0.05;
    currentMouseY += (targetMouseY - currentMouseY) * 0.05;

    ctx.clearRect(0, 0, width, height);

    // Draw glowing orbs
    for (let i = 0; i < glowingDust.length; i++) {
      glowingDust[i].update(currentMouseX, currentMouseY);
      glowingDust[i].draw(ctx);
    }

    // Draw twinkling stars
    for (let i = 0; i < stars.length; i++) {
      stars[i].update(currentMouseX, currentMouseY);
      stars[i].draw(ctx);
    }

    animationId = requestAnimationFrame(render);
  }

  function start() {
    if (!isRunning) {
      isRunning = true;
      animationId = requestAnimationFrame(render);
    }
  }

  function stop() {
    isRunning = false;
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  }

  return {
    init: init,
    start: start,
    stop: stop
  };
})();

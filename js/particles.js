/**
 * ==========================================================================
 * PARTICLES & STARFIELD BACKGROUND (js/particles.js - SUPER OPTIMIZED)
 * High-performance Canvas 2D starfield with clamped DPR, low-overhead
 * drawing routines, and adaptive mobile power management.
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
  let isLowPower = false;

  const stars = [];
  const glowingDust = [];

  let targetMouseX = 0;
  let targetMouseY = 0;
  let currentMouseX = 0;
  let currentMouseY = 0;

  function Star() {
    this.reset(true);
  }

  Star.prototype.reset = function (initial) {
    this.x = Math.random() * (width || window.innerWidth);
    this.y = initial ? Math.random() * (height || window.innerHeight) : -8;
    this.depth = Math.random() * 0.75 + 0.25;
    this.baseRadius = Math.random() * 1.2 + 0.6;
    this.radius = this.baseRadius * this.depth;
    this.alpha = Math.random() * 0.55 + 0.35;
    this.twinkleSpeed = Math.random() * 0.025 + 0.01;
    this.twinklePhase = Math.random() * Math.PI * 2;
    this.vy = (Math.random() * 0.12 + 0.04) * this.depth;
    this.vx = (Math.random() * 0.06 - 0.03) * this.depth;

    const rand = Math.random();
    if (rand < 0.65) {
      this.color = '255, 250, 247';
    } else if (rand < 0.85) {
      this.color = '243, 223, 191';
    } else {
      this.color = '246, 191, 208';
    }
  };

  Star.prototype.update = function (deltaX, deltaY) {
    this.twinklePhase += this.twinkleSpeed;
    this.currentAlpha = this.alpha * (0.65 + 0.35 * Math.sin(this.twinklePhase));

    this.y += this.vy;
    this.x += this.vx;

    this.drawX = this.x + deltaX * this.depth * 25;
    this.drawY = this.y + deltaY * this.depth * 25;

    if (this.y > height + 15) this.y = -8;
    if (this.x < -15) this.x = width + 10;
    if (this.x > width + 15) this.x = -10;
  };

  Star.prototype.draw = function (context) {
    context.fillStyle = `rgba(${this.color}, ${this.currentAlpha.toFixed(2)})`;
    context.fillRect(this.drawX - this.radius, this.drawY - this.radius, this.radius * 2, this.radius * 2);
  };

  function GlowingOrb() {
    this.x = Math.random() * (width || window.innerWidth);
    this.y = Math.random() * (height || window.innerHeight);
    this.radius = Math.random() * 14 + 6;
    this.alpha = Math.random() * 0.09 + 0.03;
    this.vx = (Math.random() - 0.5) * 0.15;
    this.vy = -(Math.random() * 0.15 + 0.04);
    this.color = Math.random() > 0.5 ? '243, 223, 191' : '255, 117, 200';
  }

  GlowingOrb.prototype.update = function (deltaX, deltaY) {
    this.x += this.vx;
    this.y += this.vy;
    this.drawX = this.x + deltaX * 14;
    this.drawY = this.y + deltaY * 14;

    if (this.y < -25) {
      this.y = height + 25;
      this.x = Math.random() * width;
    }
  };

  GlowingOrb.prototype.draw = function (context) {
    context.beginPath();
    context.arc(this.drawX, this.drawY, this.radius, 0, Math.PI * 2);
    context.fillStyle = `rgba(${this.color}, ${this.alpha})`;
    context.fill();
  };

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
    ctx = canvas.getContext('2d', { alpha: true });

    resize();
    window.addEventListener('resize', resize, { passive: true });

    const isMobile = window.innerWidth < 768;
    const starCount = isMobile ? 75 : 180;
    const orbCount = isMobile ? 5 : 12;

    stars.length = 0;
    for (let i = 0; i < starCount; i++) {
      stars.push(new Star());
    }

    glowingDust.length = 0;
    for (let i = 0; i < orbCount; i++) {
      glowingDust.push(new GlowingOrb());
    }

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

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        stop();
      } else {
        start();
      }
    });

    start();
  }

  function render() {
    if (!isRunning) return;

    currentMouseX += (targetMouseX - currentMouseX) * 0.05;
    currentMouseY += (targetMouseY - currentMouseY) * 0.05;

    ctx.clearRect(0, 0, width, height);

    if (!isLowPower) {
      for (let i = 0; i < glowingDust.length; i++) {
        glowingDust[i].update(currentMouseX, currentMouseY);
        glowingDust[i].draw(ctx);
      }
    }

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

  function setLowPowerMode(enabled) {
    isLowPower = enabled;
  }

  return {
    init: init,
    start: start,
    stop: stop,
    setLowPowerMode: setLowPowerMode
  };
})();

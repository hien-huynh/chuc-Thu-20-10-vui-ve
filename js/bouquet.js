/**
 * ==========================================================================
 * BOUQUET CONTROLLER (js/bouquet.js)
 * Manages Stage 1 interactions, first-touch audio trigger,
 * 800ms long-press gesture with SVG progress feedback, and cinematic zoom transition.
 * ==========================================================================
 */

const BouquetController = (function () {
  'use strict';

  // Constants
  const LONG_PRESS_DURATION = 800; // ms
  const MOVE_THRESHOLD = 14; // px

  // DOM Elements
  let stageBouquet = null;
  let bouquetWrapper = null;
  let stageHint = null;
  let progressRing = null;

  // State
  let currentStage = 1; // 1: Initial, 2: Bloomed, 3: Universe
  let pressTimer = null;
  let pressStartTime = 0;
  let touchStartX = 0;
  let touchStartY = 0;
  let isPressing = false;
  let hasTriggeredStage3 = false;
  let onStage3Callback = null;

  /**
   * Initialize bouquet events
   */
  function init(options) {
    if (options && typeof options.onStage3 === 'function') {
      onStage3Callback = options.onStage3;
    }

    stageBouquet = document.getElementById('stage-bouquet');
    bouquetWrapper = document.getElementById('bouquet-wrapper');
    stageHint = document.getElementById('stage-hint');
    progressRing = document.getElementById('hold-progress-ring');

    if (!bouquetWrapper) return;

    // Prevent default context menu & text selection on long-press (critical for mobile iOS/Android)
    bouquetWrapper.addEventListener('contextmenu', e => e.preventDefault());
    window.addEventListener('contextmenu', e => {
      if (isPressing) e.preventDefault();
    });

    // Primary Click / Tap Event
    bouquetWrapper.addEventListener('click', handleBouquetClick);

    // Mouse Press Events
    bouquetWrapper.addEventListener('mousedown', handlePressStart);
    window.addEventListener('mouseup', handlePressEnd);
    window.addEventListener('mousemove', handleMouseMove);

    // Touch Press Events
    bouquetWrapper.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchend', handlePressEnd);
    window.addEventListener('touchcancel', handlePressEnd);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
  }

  /**
   * Handle Click / Tap for Stage 1 -> Stage 2
   */
  function handleBouquetClick(e) {
    if (currentStage !== 1) return;

    // 1. Play audio immediately on first user gesture
    AudioManager.startPlayback();

    // 2. Advance to Stage 2
    currentStage = 2;

    // 3. Update hint text during bloom
    if (stageHint) {
      stageHint.style.opacity = '0';
      setTimeout(() => {
        stageHint.textContent = 'Những kỷ niệm ngọt ngào...';
        stageHint.style.opacity = '1';
      }, 300);
    }

    // 4. Bloom photos from bouquet
    GalleryManager.bloom().then(() => {
      // Once blooming finishes, prompt user to long-press
      if (stageHint && currentStage === 2) {
        stageHint.style.opacity = '0';
        setTimeout(() => {
          stageHint.innerHTML = 'Hic hông chứa hết được tất cả chị em, đại diện thoi nha <br>Nhấn giữ để khám phá điều đặc biệt ♡';
          stageHint.classList.add('glow-mode');
          stageHint.style.opacity = '1';
        }, 400);
      }
    });
  }

  /**
   * Press Start (Mouse)
   */
  function handlePressStart(e) {
    if (e.button !== 0) return; // Left click only
    startLongPress(e.clientX, e.clientY);
  }

  /**
   * Press Start (Touch)
   */
  function handleTouchStart(e) {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    startLongPress(touch.clientX, touch.clientY);
  }

  /**
   * Shared Long-Press Initiator
   */
  function startLongPress(clientX, clientY) {
    // Long-press is only active once in Stage 2 (or if user tries to hold in stage 1, we bloom first)
    if (currentStage === 1) {
      handleBouquetClick();
      return;
    }

    if (currentStage !== 2 || hasTriggeredStage3) return;

    isPressing = true;
    touchStartX = clientX;
    touchStartY = clientY;
    pressStartTime = Date.now();

    // Visual feedback
    if (bouquetWrapper) bouquetWrapper.classList.add('holding');
    if (progressRing) {
      progressRing.classList.add('visible', 'active');
    }

    // Start 800ms countdown
    if (pressTimer) clearTimeout(pressTimer);
    pressTimer = setTimeout(() => {
      if (isPressing && !hasTriggeredStage3) {
        triggerStage3Transition();
      }
    }, LONG_PRESS_DURATION);
  }

  /**
   * Press End (Release / Cancel)
   */
  function handlePressEnd() {
    if (!isPressing) return;
    cancelLongPress();
  }

  /**
   * Mouse Move check
   */
  function handleMouseMove(e) {
    if (!isPressing) return;
    const dist = Math.hypot(e.clientX - touchStartX, e.clientY - touchStartY);
    if (dist > MOVE_THRESHOLD) {
      cancelLongPress();
    }
  }

  /**
   * Touch Move check
   */
  function handleTouchMove(e) {
    if (!isPressing || e.touches.length === 0) return;
    const touch = e.touches[0];
    const dist = Math.hypot(touch.clientX - touchStartX, touch.clientY - touchStartY);
    if (dist > MOVE_THRESHOLD) {
      cancelLongPress();
    }
  }

  /**
   * Cancel Long-Press
   */
  function cancelLongPress() {
    isPressing = false;
    if (pressTimer) {
      clearTimeout(pressTimer);
      pressTimer = null;
    }

    // Reset visual feedback
    if (bouquetWrapper) bouquetWrapper.classList.remove('holding');
    if (progressRing) {
      progressRing.classList.remove('active');
      setTimeout(() => {
        if (!isPressing && progressRing) {
          progressRing.classList.remove('visible');
        }
      }, 200);
    }
  }

  /**
   * Trigger Stage 2 -> Stage 3 Cinematic Transition
   */
  function triggerStage3Transition() {
    hasTriggeredStage3 = true;
    isPressing = false;
    currentStage = 3;

    if (pressTimer) clearTimeout(pressTimer);

    // Ensure audio keeps playing
    if (!AudioManager.isPlaying()) {
      AudioManager.startPlayback();
    }

    // Animate zoom-in through bouquet
    if (stageBouquet) {
      stageBouquet.classList.add('cinematic-zoom-out');
    }

    // Invoke Stage 3 callback
    if (typeof onStage3Callback === 'function') {
      setTimeout(() => {
        onStage3Callback();
      }, 500); // Begin universe fade-in halfway through zoom-out
    }

    // Hide Stage 1 & 2 container once zoom animation finishes
    setTimeout(() => {
      if (stageBouquet) {
        stageBouquet.style.display = 'none';
        stageBouquet.classList.remove('active');
      }
    }, 1250);
  }

  return {
    init: init,
    getCurrentStage: function () {
      return currentStage;
    }
  };
})();

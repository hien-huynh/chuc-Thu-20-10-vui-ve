/**
 * ==========================================================================
 * 3D UNIVERSE OF WISHES (js/universe.js)
 * TILTED 3D RIVER OF LIGHT & MEMORIES (Góc nhìn nghiêng 3D & trôi từ trên xuống)
 * Continuous downward flow with parallax depth, lane-based spacing,
 * and stable tilted perspective.
 * ==========================================================================
 */

const UniverseController = (function () {
  'use strict';

  // Configuration
  const CONFIG = {
    // Counts
    desktopWishesCount: 32,
    mobileWishesCount: 18,
    desktopPhotosCount: 8,
    mobilePhotosCount: 4,
    desktopHeartsCount: 22,
    mobileHeartsCount: 10,

    // Tilted Stream Geometry (Desktop)
    desktopBaseYaw: -20,    // rotateY(-20deg)
    desktopBasePitch: 8,    // rotateX(8deg)
    desktopBaseRoll: -1,    // rotateZ(-1deg)
    desktopStreamWidth: 1350,
    desktopTopLimit: -850,
    desktopBottomLimit: 950,

    // Tilted Stream Geometry (Mobile)
    mobileBaseYaw: -12,     // rotateY(-12deg)
    mobileBasePitch: 6,     // rotateX(6deg)
    mobileBaseRoll: 0,
    mobileStreamWidth: 680,
    mobileTopLimit: -650,
    mobileBottomLimit: 750,

    // Depth bounds (Brought closer to prevent text from shrinking too small)
    farZ: -560,
    nearZ: -30,

    // Flow speed (pixels per frame at 60fps)
    baseSpeed: 1.15
  };

  let stageUniverse = null;
  let universeWorld = null;

  const items = [];

  // Parallax offsets
  let parallaxYaw = 0;
  let parallaxPitch = 0;
  let targetParallaxYaw = 0;
  let targetParallaxPitch = 0;
  let targetCamX = 0;
  let targetCamY = 0;
  let currentCamX = 0;
  let currentCamY = 0;

  let isRunning = false;
  let animationFrameId = null;
  let lastTime = 0;

  // Touch state
  let touchLastX = 0;
  let touchLastY = 0;
  let isTouching = false;

  const SVG_HEART_PATH = 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z';

  function init() {
    stageUniverse = document.getElementById('stage-universe');
    universeWorld = document.getElementById('universe-world');
  }

  function start() {
    if (isRunning) return;
    isRunning = true;

    if (!stageUniverse || !universeWorld) {
      init();
    }

    // Set canvas particles to low-power mode
    if (typeof ParticlesEngine !== 'undefined' && ParticlesEngine.setLowPowerMode) {
      ParticlesEngine.setLowPowerMode(true);
    }

    stageUniverse.classList.add('active', 'universe-fade-in');
    universeWorld.innerHTML = '';
    items.length = 0;

    const isMobile = window.innerWidth < 768;
    const wishesCount = isMobile ? CONFIG.mobileWishesCount : CONFIG.desktopWishesCount;
    const photosCount = isMobile ? CONFIG.mobilePhotosCount : CONFIG.desktopPhotosCount;
    const heartsCount = isMobile ? CONFIG.mobileHeartsCount : CONFIG.desktopHeartsCount;

    const streamWidth = isMobile ? CONFIG.mobileStreamWidth : CONFIG.desktopStreamWidth;
    const topLimit = isMobile ? CONFIG.mobileTopLimit : CONFIG.desktopTopLimit;
    const bottomLimit = isMobile ? CONFIG.mobileBottomLimit : CONFIG.desktopBottomLimit;
    const totalHeight = bottomLimit - topLimit;

    // Lane division to distribute items evenly across width
    const numLanes = isMobile ? 4 : 7;
    const laneWidth = streamWidth / numLanes;

    // 1. Prepare Wishes
    const wishStrings = WishesManager.generateWishPool(wishesCount);
    wishStrings.forEach((text, i) => {
      const lane = i % numLanes;
      const initialY = topLimit + (i / wishesCount) * totalHeight + (Math.random() - 0.5) * 80;
      createWishItem(text, lane, numLanes, laneWidth, initialY, isMobile);
    });

    // 2. Prepare Photos
    const photos = GalleryManager.getPhotosList();
    if (photos && photos.length > 0) {
      for (let i = 0; i < photosCount; i++) {
        const photoName = photos[i % photos.length];
        const lane = (i * 2 + 1) % numLanes;
        const initialY = topLimit + ((i + 0.5) / photosCount) * totalHeight + (Math.random() - 0.5) * 60;
        createPhotoItem(photoName, lane, numLanes, laneWidth, initialY, isMobile);
      }
    }

    // 3. Prepare Hearts
    for (let i = 0; i < heartsCount; i++) {
      const lane = (i * 3) % numLanes;
      const initialY = topLimit + Math.random() * totalHeight;
      createHeartItem(i, lane, numLanes, laneWidth, initialY, isMobile);
    }

    setupControls();

    lastTime = performance.now();
    render(lastTime);
  }

  /**
   * Helper to compute X coordinate within a designated lane
   */
  function computeLaneX(laneIndex, numLanes, laneWidth) {
    const leftEdge = -(numLanes * laneWidth) / 2;
    const laneCenter = leftEdge + (laneIndex + 0.5) * laneWidth;
    const jitter = (Math.random() - 0.5) * (laneWidth * 0.45);
    return laneCenter + jitter;
  }

  /**
   * Helper to compute Z depth layer and parallax speed
   */
  function computeDepthAndSpeed() {
    const z = CONFIG.farZ + Math.random() * (CONFIG.nearZ - CONFIG.farZ);
    const depthRatio = (z - CONFIG.farZ) / (CONFIG.nearZ - CONFIG.farZ);
    const speed = CONFIG.baseSpeed * (0.8 + depthRatio * 0.55);
    const opacity = 0.62 + depthRatio * 0.38;

    return { z, speed, opacity };
  }

  /**
   * Create Wish Item with randomized prominence
   */
  function createWishItem(text, lane, numLanes, laneWidth, initialY, isMobile) {
    const el = document.createElement('div');
    el.className = 'universe-wish';
    el.textContent = text;

    // Randomly feature ~25% as large highlight wishes, ~20% as accent white glow
    const randType = Math.random();
    if (randType < 0.25) {
      el.classList.add('wish-large');
    } else if (randType < 0.45) {
      el.classList.add('wish-accent');
    }

    const { z, speed, opacity } = computeDepthAndSpeed();
    const x = computeLaneX(lane, numLanes, laneWidth);
    const rotZ = (Math.random() - 0.5) * 5;

    const item = {
      el: el,
      type: 'wish',
      x: x,
      y: initialY,
      z: z,
      rotZ: rotZ,
      speed: speed,
      opacity: opacity,
      lane: lane,
      numLanes: numLanes,
      laneWidth: laneWidth
    };

    updateItemTransform(item);
    universeWorld.appendChild(el);
    items.push(item);
  }

  /**
   * Create Photo Item
   */
  function createPhotoItem(photoName, lane, numLanes, laneWidth, initialY, isMobile) {
    const el = document.createElement('div');
    el.className = 'universe-photo-card';

    const img = document.createElement('img');
    img.className = 'universe-photo-img';
    img.src = `assets/photos/${photoName}`;
    img.alt = 'Kỷ niệm yêu thương';
    img.loading = 'lazy';
    img.draggable = false;
    el.appendChild(img);

    const { z, speed, opacity } = computeDepthAndSpeed();
    const x = computeLaneX(lane, numLanes, laneWidth);
    const rotZ = (Math.random() - 0.5) * 6;

    const item = {
      el: el,
      type: 'photo',
      x: x,
      y: initialY,
      z: z,
      rotZ: rotZ,
      speed: speed,
      opacity: Math.min(1.0, opacity + 0.1),
      lane: lane,
      numLanes: numLanes,
      laneWidth: laneWidth
    };

    updateItemTransform(item);
    universeWorld.appendChild(el);
    items.push(item);
  }

  /**
   * Create Heart Item
   */
  function createHeartItem(index, lane, numLanes, laneWidth, initialY, isMobile) {
    const el = document.createElement('div');
    el.className = 'universe-heart';

    const rand = Math.random();
    if (rand < 0.45) {
      // heart-red
    } else if (rand < 0.75) {
      el.classList.add('pink-heart');
    } else {
      el.classList.add('champagne-heart');
    }

    el.innerHTML = `<svg viewBox="0 0 24 24"><path d="${SVG_HEART_PATH}"/></svg>`;

    const { z, speed, opacity } = computeDepthAndSpeed();
    const x = computeLaneX(lane, numLanes, laneWidth);

    const item = {
      el: el,
      type: 'heart',
      x: x,
      y: initialY,
      z: z,
      rotZ: (Math.random() - 0.5) * 8,
      speed: speed * 1.05,
      opacity: opacity,
      lane: lane,
      numLanes: numLanes,
      laneWidth: laneWidth
    };

    updateItemTransform(item);
    universeWorld.appendChild(el);
    items.push(item);
  }

  /**
   * Apply 3D position and depth opacity
   */
  function updateItemTransform(item) {
    item.el.style.transform = `translate3d(${item.x.toFixed(1)}px, ${item.y.toFixed(1)}px, ${item.z.toFixed(1)}px) rotateZ(${item.rotZ.toFixed(1)}deg)`;
    item.el.style.opacity = item.opacity.toFixed(2);
  }

  /**
   * Seamless wrap-around when item flows below screen
   */
  function recycleItemToTop(item, isMobile) {
    const topLimit = isMobile ? CONFIG.mobileTopLimit : CONFIG.desktopTopLimit;
    item.y = topLimit - (Math.random() * 120);

    item.lane = (item.lane + Math.floor(Math.random() * 3) - 1 + item.numLanes) % item.numLanes;
    item.x = computeLaneX(item.lane, item.numLanes, item.laneWidth);

    // Re-roll highlight variety dynamically for wishes
    if (item.type === 'wish') {
      item.el.classList.remove('wish-large', 'wish-accent');
      const randType = Math.random();
      if (randType < 0.25) {
        item.el.classList.add('wish-large');
      } else if (randType < 0.45) {
        item.el.classList.add('wish-accent');
      }
    }

    const { z, speed, opacity } = computeDepthAndSpeed();
    item.z = z;
    item.speed = speed;
    item.opacity = item.type === 'photo' ? Math.min(1.0, opacity + 0.1) : opacity;

    updateItemTransform(item);
  }

  /**
   * Controls & Subtle Parallax
   */
  function setupControls() {
    window.addEventListener('mousemove', function (e) {
      if (!isRunning) return;
      const normX = (e.clientX / window.innerWidth - 0.5) * 2;
      const normY = (e.clientY / window.innerHeight - 0.5) * 2;

      // Subtle parallax angle shifts (±3deg yaw, ±2deg pitch)
      targetParallaxYaw = normX * 3.5;
      targetParallaxPitch = -normY * 2.5;
      targetCamX = -normX * 40;
      targetCamY = -normY * 25;
    }, { passive: true });

    window.addEventListener('touchstart', function (e) {
      if (!isRunning || e.touches.length === 0) return;
      isTouching = true;
      touchLastX = e.touches[0].clientX;
      touchLastY = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchmove', function (e) {
      if (!isRunning || !isTouching || e.touches.length === 0) return;
      const diffX = e.touches[0].clientX - touchLastX;
      const diffY = e.touches[0].clientY - touchLastY;

      targetParallaxYaw += diffX * 0.04;
      targetParallaxPitch -= diffY * 0.03;

      targetParallaxYaw = Math.max(-5, Math.min(5, targetParallaxYaw));
      targetParallaxPitch = Math.max(-4, Math.min(4, targetParallaxPitch));

      touchLastX = e.touches[0].clientX;
      touchLastY = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchend', function () {
      isTouching = false;
    }, { passive: true });
  }

  /**
   * Continuous Downward Flow Animation Loop
   */
  function render(timestamp) {
    if (!isRunning) return;

    // Delta time normalization (60fps benchmark = 16.66ms)
    const delta = Math.min((timestamp - lastTime) / 16.666, 2.0);
    lastTime = timestamp;

    const isMobile = window.innerWidth < 768;
    const baseYaw = isMobile ? CONFIG.mobileBaseYaw : CONFIG.desktopBaseYaw;
    const basePitch = isMobile ? CONFIG.mobileBasePitch : CONFIG.desktopBasePitch;
    const baseRoll = isMobile ? CONFIG.mobileBaseRoll : CONFIG.desktopBaseRoll;
    const bottomLimit = isMobile ? CONFIG.mobileBottomLimit : CONFIG.desktopBottomLimit;

    // Smooth parallax damping
    parallaxYaw += (targetParallaxYaw - parallaxYaw) * 0.05;
    parallaxPitch += (targetParallaxPitch - parallaxPitch) * 0.05;
    currentCamX += (targetCamX - currentCamX) * 0.05;
    currentCamY += (targetCamY - currentCamY) * 0.05;

    // Apply stable 3D Tilted Perspective to World Container
    const finalYaw = baseYaw + parallaxYaw;
    const finalPitch = basePitch + parallaxPitch;

    if (universeWorld) {
      universeWorld.style.transform = `translate3d(${currentCamX.toFixed(1)}px, ${currentCamY.toFixed(1)}px, 0) rotateY(${finalYaw.toFixed(2)}deg) rotateX(${finalPitch.toFixed(2)}deg) rotateZ(${baseRoll}deg)`;
    }

    // Move every item downwards from top to bottom
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      item.y += item.speed * delta;

      // Wrap back to top when passing bottom edge
      if (item.y > bottomLimit) {
        recycleItemToTop(item, isMobile);
      } else {
        updateItemTransform(item);
      }
    }

    animationFrameId = requestAnimationFrame(render);
  }

  function stop() {
    isRunning = false;
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  }

  return {
    init: init,
    start: start,
    stop: stop
  };
})();

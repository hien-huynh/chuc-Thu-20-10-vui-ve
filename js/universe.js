/**
 * ==========================================================================
 * 3D UNIVERSE OF WISHES (js/universe.js)
 * High-performance 3D space with CSS 3D Transforms, continuous infinite
 * camera flight, floating neon wishes, polaroid photos, and glowing hearts.
 * ==========================================================================
 */

const UniverseController = (function () {
  'use strict';

  // Configuration
  const CONFIG = {
    desktopWishesCount: 55,
    mobileWishesCount: 32,
    desktopHeartsCount: 38,
    mobileHeartsCount: 20,
    depthRange: 3200,      // Max initial Z depth
    nearRecycleZ: 220,     // Pass camera threshold
    recycleFarZ: -3100,    // Where recycled objects spawn
    baseFlightSpeed: 1.15, // Forward speed per frame
    wheelBoostFactor: 1.8,
    spreadX: 1800,         // Horizontal dispersion
    spreadY: 1300          // Vertical dispersion
  };

  // DOM Elements
  let stageUniverse = null;
  let universeWorld = null;

  // Active 3D objects
  const items = [];

  // Camera & Flight State
  let cameraZ = 0;
  let flightSpeed = CONFIG.baseFlightSpeed;
  let targetFlightSpeed = CONFIG.baseFlightSpeed;

  let targetPitch = 0; // rotateX
  let targetYaw = 0;   // rotateY
  let currentPitch = 0;
  let currentYaw = 0;

  let targetCamX = 0;
  let targetCamY = 0;
  let currentCamX = 0;
  let currentCamY = 0;

  let touchLastX = 0;
  let touchLastY = 0;
  let isTouching = false;

  let isRunning = false;
  let animationFrameId = null;

  /**
   * SVG Heart Path
   */
  const SVG_HEART_PATH = 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z';

  /**
   * Initialize 3D Universe Stage
   */
  function init() {
    stageUniverse = document.getElementById('stage-universe');
    universeWorld = document.getElementById('universe-world');
  }

  /**
   * Activate Universe Stage and populate 3D objects
   */
  function start() {
    if (isRunning) return;
    isRunning = true;

    if (!stageUniverse || !universeWorld) {
      init();
    }

    stageUniverse.classList.add('active', 'universe-fade-in');
    universeWorld.innerHTML = '';
    items.length = 0;

    const isMobile = window.innerWidth < 768;
    const wishesCount = isMobile ? CONFIG.mobileWishesCount : CONFIG.desktopWishesCount;
    const heartsCount = isMobile ? CONFIG.mobileHeartsCount : CONFIG.desktopHeartsCount;

    // 1. Generate Wishes
    const wishStrings = WishesManager.generateWishPool(wishesCount);
    wishStrings.forEach((text, i) => {
      createWishObject(text, i, wishesCount);
    });

    // 2. Generate Floating Photos
    const photos = GalleryManager.getPhotosList();
    if (photos && photos.length > 0) {
      // Create 12-16 photo instances across space
      const photoInstances = isMobile ? 8 : 14;
      for (let i = 0; i < photoInstances; i++) {
        const photoName = photos[i % photos.length];
        createPhotoObject(photoName, i, photoInstances);
      }
    }

    // 3. Generate Glowing 3D Hearts
    for (let i = 0; i < heartsCount; i++) {
      createHeartObject(i, heartsCount);
    }

    // Setup Interaction Listeners
    setupControls();

    // Start Render Loop
    cameraZ = 0;
    render();
  }

  /**
   * Create a Floating Wish Object in 3D
   */
  function createWishObject(text, index, total) {
    const el = document.createElement('div');
    el.className = 'universe-wish';
    el.textContent = text;

    // Distribute with depth
    const zStep = CONFIG.depthRange / total;
    const z = -200 - (index * zStep) - (Math.random() * 80);

    // Keep center corridor slightly clearer
    let x = (Math.random() - 0.5) * CONFIG.spreadX;
    let y = (Math.random() - 0.5) * CONFIG.spreadY;
    if (Math.abs(x) < 180) {
      x += (x >= 0 ? 180 : -180);
    }

    const rotZ = (Math.random() - 0.5) * 14; // slight tilt

    const item = {
      el: el,
      type: 'wish',
      x: x,
      y: y,
      z: z,
      rotZ: rotZ,
      baseOpacity: Math.random() * 0.3 + 0.7
    };

    updateItemTransform(item);
    universeWorld.appendChild(el);
    items.push(item);
  }

  /**
   * Create a Floating Photo Object in 3D
   */
  function createPhotoObject(photoName, index, total) {
    const el = document.createElement('div');
    el.className = 'universe-photo-card';

    const img = document.createElement('img');
    img.className = 'universe-photo-img';
    img.src = `assets/photos/${photoName}`;
    img.alt = 'Kỷ niệm yêu thương';
    img.loading = 'lazy';
    img.draggable = false;
    el.appendChild(img);

    const zStep = CONFIG.depthRange / total;
    const z = -350 - (index * zStep) - (Math.random() * 120);
    let x = (Math.random() - 0.5) * (CONFIG.spreadX * 0.9);
    let y = (Math.random() - 0.5) * (CONFIG.spreadY * 0.85);

    if (Math.abs(x) < 220) {
      x += (x >= 0 ? 220 : -220);
    }

    const rotY = (Math.random() - 0.5) * 20;
    const rotZ = (Math.random() - 0.5) * 12;

    const item = {
      el: el,
      type: 'photo',
      x: x,
      y: y,
      z: z,
      rotY: rotY,
      rotZ: rotZ,
      baseOpacity: 0.95
    };

    updateItemTransform(item);
    universeWorld.appendChild(el);
    items.push(item);
  }

  /**
   * Create a Floating Glowing Heart in 3D
   */
  function createHeartObject(index, total) {
    const el = document.createElement('div');
    el.className = 'universe-heart';

    // Random heart color theme
    const rand = Math.random();
    if (rand < 0.45) {
      // Neon heart red
    } else if (rand < 0.75) {
      el.classList.add('pink-heart');
    } else {
      el.classList.add('champagne-heart');
    }

    el.innerHTML = `<svg viewBox="0 0 24 24"><path d="${SVG_HEART_PATH}"/></svg>`;

    const z = -100 - (Math.random() * CONFIG.depthRange);
    const x = (Math.random() - 0.5) * CONFIG.spreadX;
    const y = (Math.random() - 0.5) * CONFIG.spreadY;
    const scale = Math.random() * 0.7 + 0.7;

    const item = {
      el: el,
      type: 'heart',
      x: x,
      y: y,
      z: z,
      scale: scale,
      baseOpacity: Math.random() * 0.4 + 0.6
    };

    updateItemTransform(item);
    universeWorld.appendChild(el);
    items.push(item);
  }

  /**
   * Update item's 3D CSS transform property
   */
  function updateItemTransform(item) {
    let transformStr = `translate3d(${item.x.toFixed(1)}px, ${item.y.toFixed(1)}px, ${item.z.toFixed(1)}px)`;

    if (item.rotY) {
      transformStr += ` rotateY(${item.rotY.toFixed(1)}deg)`;
    }
    if (item.rotZ) {
      transformStr += ` rotateZ(${item.rotZ.toFixed(1)}deg)`;
    }
    if (item.scale) {
      transformStr += ` scale(${item.scale.toFixed(2)})`;
    }

    item.el.style.transform = transformStr;
  }

  /**
   * Recycle item to the far distance when camera flies past it
   */
  function recycleItem(item) {
    item.z = -cameraZ + CONFIG.recycleFarZ - (Math.random() * 400);

    // New randomized position
    let x = (Math.random() - 0.5) * CONFIG.spreadX;
    let y = (Math.random() - 0.5) * CONFIG.spreadY;
    if (Math.abs(x) < 180) {
      x += (x >= 0 ? 180 : -180);
    }
    item.x = x;
    item.y = y;

    updateItemTransform(item);
  }

  /**
   * Setup Desktop and Mobile Event Controls
   */
  function setupControls() {
    // Desktop Mouse Parallax
    window.addEventListener('mousemove', function (e) {
      if (!isRunning) return;
      const normX = (e.clientX / window.innerWidth - 0.5) * 2;
      const normY = (e.clientY / window.innerHeight - 0.5) * 2;

      targetYaw = normX * 10;       // max 10 deg yaw
      targetPitch = -normY * 8;     // max 8 deg pitch
      targetCamX = -normX * 80;
      targetCamY = -normY * 60;
    }, { passive: true });

    // Desktop Mouse Wheel Flight Boost
    window.addEventListener('wheel', function (e) {
      if (!isRunning) return;
      // Scroll down flies forward faster, scroll up slows down
      const delta = e.deltaY > 0 ? 1 : -0.7;
      targetFlightSpeed = Math.max(0.4, Math.min(4.5, targetFlightSpeed + delta * 0.4));
    }, { passive: true });

    // Mobile Touch Gesture
    window.addEventListener('touchstart', function (e) {
      if (!isRunning || e.touches.length === 0) return;
      isTouching = true;
      touchLastX = e.touches[0].clientX;
      touchLastY = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchmove', function (e) {
      if (!isRunning || !isTouching || e.touches.length === 0) return;
      const touchX = e.touches[0].clientX;
      const touchY = e.touches[0].clientY;

      const diffX = touchX - touchLastX;
      const diffY = touchY - touchLastY;

      targetYaw += diffX * 0.08;
      targetPitch -= diffY * 0.06;

      // Clamp angles
      targetYaw = Math.max(-18, Math.min(18, targetYaw));
      targetPitch = Math.max(-14, Math.min(14, targetPitch));

      touchLastX = touchX;
      touchLastY = touchY;
    }, { passive: true });

    window.addEventListener('touchend', function () {
      isTouching = false;
    }, { passive: true });
  }

  /**
   * 3D Render Loop
   */
  function render() {
    if (!isRunning) return;

    // Smooth speed interpolation
    flightSpeed += (targetFlightSpeed - flightSpeed) * 0.06;
    // Decay flight speed back towards base speed
    targetFlightSpeed += (CONFIG.baseFlightSpeed - targetFlightSpeed) * 0.02;

    // Advance camera forward
    cameraZ += flightSpeed;

    // Damped camera rotation and position
    currentPitch += (targetPitch - currentPitch) * 0.05;
    currentYaw += (targetYaw - currentYaw) * 0.05;
    currentCamX += (targetCamX - currentCamX) * 0.05;
    currentCamY += (targetCamY - currentCamY) * 0.05;

    // Update 3D World container transform
    if (universeWorld) {
      universeWorld.style.transform = `translate3d(${currentCamX.toFixed(1)}px, ${currentCamY.toFixed(1)}px, ${cameraZ.toFixed(1)}px) rotateX(${currentPitch.toFixed(2)}deg) rotateY(${currentYaw.toFixed(2)}deg)`;
    }

    // Check objects for recycling
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const relZ = it.z + cameraZ;

      // Object has passed behind the camera
      if (relZ > CONFIG.nearRecycleZ) {
        recycleItem(it);
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

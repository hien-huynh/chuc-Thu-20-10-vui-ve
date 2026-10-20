/**
 * ==========================================================================
 * 3D UNIVERSE OF WISHES (js/universe.js - HIGH PERFORMANCE 60 FPS)
 * GPU-accelerated CSS 3D Transforms, delta-time flight smoothing,
 * calibrated density for mobile, and 1.5x enhanced text & photo sizing.
 * ==========================================================================
 */

const UniverseController = (function () {
  'use strict';

  // Configuration
  const CONFIG = {
    desktopWishesCount: 42,
    mobileWishesCount: 22,
    desktopHeartsCount: 24,
    mobileHeartsCount: 12,
    depthRange: 2800,
    nearRecycleZ: 240,
    recycleFarZ: -2700,
    baseFlightSpeed: 1.1,
    spreadX: 1600,
    spreadY: 1200
  };

  let stageUniverse = null;
  let universeWorld = null;

  const items = [];

  let cameraZ = 0;
  let flightSpeed = CONFIG.baseFlightSpeed;
  let targetFlightSpeed = CONFIG.baseFlightSpeed;

  let targetPitch = 0;
  let targetYaw = 0;
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
  let lastTime = 0;

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

    // Set particles engine to low power mode to free 100% GPU for 3D Universe
    if (typeof ParticlesEngine !== 'undefined' && ParticlesEngine.setLowPowerMode) {
      ParticlesEngine.setLowPowerMode(true);
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
      createWishObject(text, i, wishesCount, isMobile);
    });

    // 2. Generate Floating Photos
    const photos = GalleryManager.getPhotosList();
    if (photos && photos.length > 0) {
      const photoInstances = isMobile ? 6 : 10;
      for (let i = 0; i < photoInstances; i++) {
        const photoName = photos[i % photos.length];
        createPhotoObject(photoName, i, photoInstances, isMobile);
      }
    }

    // 3. Generate Glowing 3D Hearts
    for (let i = 0; i < heartsCount; i++) {
      createHeartObject(i, heartsCount);
    }

    setupControls();

    cameraZ = 0;
    lastTime = performance.now();
    render(lastTime);
  }

  function createWishObject(text, index, total, isMobile) {
    const el = document.createElement('div');
    el.className = 'universe-wish';
    el.textContent = text;

    const zStep = CONFIG.depthRange / total;
    const z = -200 - (index * zStep) - (Math.random() * 80);

    const spreadFactor = isMobile ? 0.75 : 1.0;
    let x = (Math.random() - 0.5) * CONFIG.spreadX * spreadFactor;
    let y = (Math.random() - 0.5) * CONFIG.spreadY * spreadFactor;

    const corridor = isMobile ? 140 : 200;
    if (Math.abs(x) < corridor) {
      x += (x >= 0 ? corridor : -corridor);
    }

    const rotZ = (Math.random() - 0.5) * 12;

    const item = {
      el: el,
      type: 'wish',
      x: x,
      y: y,
      z: z,
      rotZ: rotZ
    };

    updateItemTransform(item);
    universeWorld.appendChild(el);
    items.push(item);
  }

  function createPhotoObject(photoName, index, total, isMobile) {
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
    const z = -300 - (index * zStep) - (Math.random() * 100);

    const spreadFactor = isMobile ? 0.75 : 0.9;
    let x = (Math.random() - 0.5) * (CONFIG.spreadX * spreadFactor);
    let y = (Math.random() - 0.5) * (CONFIG.spreadY * spreadFactor);

    const corridor = isMobile ? 160 : 230;
    if (Math.abs(x) < corridor) {
      x += (x >= 0 ? corridor : -corridor);
    }

    const rotY = (Math.random() - 0.5) * 18;
    const rotZ = (Math.random() - 0.5) * 10;

    const item = {
      el: el,
      type: 'photo',
      x: x,
      y: y,
      z: z,
      rotY: rotY,
      rotZ: rotZ
    };

    updateItemTransform(item);
    universeWorld.appendChild(el);
    items.push(item);
  }

  function createHeartObject(index, total) {
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

    const z = -100 - (Math.random() * CONFIG.depthRange);
    const x = (Math.random() - 0.5) * CONFIG.spreadX;
    const y = (Math.random() - 0.5) * CONFIG.spreadY;
    const scale = Math.random() * 0.6 + 0.8;

    const item = {
      el: el,
      type: 'heart',
      x: x,
      y: y,
      z: z,
      scale: scale
    };

    updateItemTransform(item);
    universeWorld.appendChild(el);
    items.push(item);
  }

  function updateItemTransform(item) {
    let transformStr = `translate3d(${item.x.toFixed(0)}px, ${item.y.toFixed(0)}px, ${item.z.toFixed(0)}px)`;

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

  function recycleItem(item) {
    item.z = -cameraZ + CONFIG.recycleFarZ - (Math.random() * 300);

    const isMobile = window.innerWidth < 768;
    const spreadFactor = isMobile ? 0.75 : 1.0;
    let x = (Math.random() - 0.5) * CONFIG.spreadX * spreadFactor;
    let y = (Math.random() - 0.5) * CONFIG.spreadY * spreadFactor;

    const corridor = isMobile ? 140 : 200;
    if (Math.abs(x) < corridor) {
      x += (x >= 0 ? corridor : -corridor);
    }
    item.x = x;
    item.y = y;

    updateItemTransform(item);
  }

  function setupControls() {
    window.addEventListener('mousemove', function (e) {
      if (!isRunning) return;
      const normX = (e.clientX / window.innerWidth - 0.5) * 2;
      const normY = (e.clientY / window.innerHeight - 0.5) * 2;

      targetYaw = normX * 8;
      targetPitch = -normY * 6;
      targetCamX = -normX * 65;
      targetCamY = -normY * 45;
    }, { passive: true });

    window.addEventListener('wheel', function (e) {
      if (!isRunning) return;
      const delta = e.deltaY > 0 ? 0.8 : -0.6;
      targetFlightSpeed = Math.max(0.4, Math.min(3.8, targetFlightSpeed + delta * 0.35));
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

      targetYaw += diffX * 0.06;
      targetPitch -= diffY * 0.05;

      targetYaw = Math.max(-14, Math.min(14, targetYaw));
      targetPitch = Math.max(-10, Math.min(10, targetPitch));

      touchLastX = e.touches[0].clientX;
      touchLastY = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchend', function () {
      isTouching = false;
    }, { passive: true });
  }

  function render(timestamp) {
    if (!isRunning) return;

    const delta = Math.min((timestamp - lastTime) / 16.666, 2.0); // normalize around 60fps
    lastTime = timestamp;

    flightSpeed += (targetFlightSpeed - flightSpeed) * 0.06;
    targetFlightSpeed += (CONFIG.baseFlightSpeed - targetFlightSpeed) * 0.02;

    cameraZ += flightSpeed * delta;

    currentPitch += (targetPitch - currentPitch) * 0.06;
    currentYaw += (targetYaw - currentYaw) * 0.06;
    currentCamX += (targetCamX - currentCamX) * 0.06;
    currentCamY += (targetCamY - currentCamY) * 0.06;

    if (universeWorld) {
      universeWorld.style.transform = `translate3d(${currentCamX.toFixed(1)}px, ${currentCamY.toFixed(1)}px, ${cameraZ.toFixed(1)}px) rotateX(${currentPitch.toFixed(2)}deg) rotateY(${currentYaw.toFixed(2)}deg)`;
    }

    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (it.z + cameraZ > CONFIG.nearRecycleZ) {
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

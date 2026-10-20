/**
 * ==========================================================================
 * GALLERY MANAGER (js/gallery.js - OPTIMIZED)
 * Loads photos from data/photos.json, manages Polaroid creation,
 * staggered blooming animation from bouquet with 1.5x larger dimensions.
 * ==========================================================================
 */

const GalleryManager = (function () {
  'use strict';

  const PHOTOS_JSON_FILE = 'data/photos.json';
  const PHOTOS_BASE_PATH = 'assets/photos/';

  const FALLBACK_PHOTOS = [
    'photo-01.jpg',
    'photo-02.jpg',
    'photo-03.jpg',
    'photo-04.jpg',
    'photo-05.jpg',
    'photo-06.jpg'
  ];

  let photosList = [];
  let polaroidElements = [];
  let galleryContainer = null;
  let isBloomed = false;

  /**
   * Harmonious offsets calibrated for 1.5x enlarged Polaroids
   * (Values in percent relative to bouquet center)
   */
  const POLAROID_SLOTS = [
    { id: 'top-center', xPercent: 0,   yPercent: -45, rot: 1,   zIndex: 12 },
    { id: 'top-left',   xPercent: -33, yPercent: -38, rot: -9,  zIndex: 11 },
    { id: 'top-right',  xPercent: 33,  yPercent: -38, rot: 8,   zIndex: 11 },
    { id: 'mid-left',   xPercent: -36, yPercent: -14, rot: -11, zIndex: 14 },
    { id: 'mid-center', xPercent: 0,   yPercent: -12, rot: 2,   zIndex: 15 },
    { id: 'mid-right',  xPercent: 36,  yPercent: -14, rot: 10,  zIndex: 14 }
  ];

  /**
   * Fetch photos list from data/photos.json
   */
  async function loadPhotos() {
    try {
      const response = await fetch(PHOTOS_JSON_FILE);
      if (!response.ok) throw new Error(`HTTP status ${response.status}`);
      const data = await response.json();
      if (data && Array.isArray(data.photos) && data.photos.length > 0) {
        photosList = data.photos;
        console.log(`Loaded ${photosList.length} photos from ${PHOTOS_JSON_FILE}`);
      } else {
        photosList = [...FALLBACK_PHOTOS];
      }
    } catch (e) {
      console.warn('Could not load photos.json, using default photos list:', e);
      photosList = [...FALLBACK_PHOTOS];
    }
    return photosList;
  }

  /**
   * Initialize gallery DOM
   */
  function init() {
    galleryContainer = document.getElementById('polaroid-gallery');
    if (!galleryContainer) return;
    galleryContainer.innerHTML = '';
    polaroidElements = [];

    // Select up to 6 photos for bouquet arrangement
    const displayPhotos = photosList.slice(0, 6);

    displayPhotos.forEach((photoName, index) => {
      const slot = POLAROID_SLOTS[index % POLAROID_SLOTS.length];

      const item = document.createElement('div');
      item.className = 'polaroid-item';
      item.id = `polaroid-${index + 1}`;
      item.style.zIndex = slot.zIndex;

      // Random subtle rotation jitter
      const jitter = (Math.random() - 0.5) * 3;
      const finalRot = Math.round(slot.rot + jitter);

      item.dataset.xPercent = slot.xPercent;
      item.dataset.yPercent = slot.yPercent;
      item.dataset.rotation = finalRot;

      const img = document.createElement('img');
      img.className = 'polaroid-photo';
      img.src = `${PHOTOS_BASE_PATH}${photoName}`;
      img.alt = `Kỷ niệm ${index + 1}`;
      img.draggable = false;
      img.loading = 'eager';

      item.appendChild(img);
      galleryContainer.appendChild(item);
      polaroidElements.push(item);
    });

    updatePolaroidPositions();
    window.addEventListener('resize', updatePolaroidPositions, { passive: true });
  }

  /**
   * Update calculated target pixel coordinates based on current bouquet size
   */
  function updatePolaroidPositions() {
    if (!galleryContainer) return;
    const rect = galleryContainer.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    polaroidElements.forEach(item => {
      const xPct = parseFloat(item.dataset.xPercent) || 0;
      const yPct = parseFloat(item.dataset.yPercent) || 0;
      const rot = parseFloat(item.dataset.rotation) || 0;

      const targetX = (xPct / 100) * width;
      const targetY = (yPct / 100) * height;

      item.style.setProperty('--target-x', `${targetX}px`);
      item.style.setProperty('--target-y', `${targetY}px`);

      if (item.classList.contains('bloomed')) {
        item.style.transform = `translate(calc(-50% + ${targetX}px), calc(-50% + ${targetY}px)) scale(1) rotate(${rot}deg)`;
      }
    });
  }

  /**
   * Trigger staggered blooming animation of Polaroids
   */
  function bloom() {
    if (isBloomed) return Promise.resolve();
    isBloomed = true;

    return new Promise(resolve => {
      const delayBetweenPhotos = 180; // ms
      const animationDuration = 650; // ms

      polaroidElements.forEach((item, idx) => {
        const rot = parseFloat(item.dataset.rotation) || 0;

        setTimeout(() => {
          item.classList.add('visible', 'bloomed');
          item.style.transition = `transform ${animationDuration}ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity ${animationDuration * 0.6}ms ease-out`;

          const targetX = item.style.getPropertyValue('--target-x');
          const targetY = item.style.getPropertyValue('--target-y');
          item.style.transform = `translate(calc(-50% + ${targetX}), calc(-50% + ${targetY})) scale(1) rotate(${rot}deg)`;

          if (idx === polaroidElements.length - 1) {
            setTimeout(resolve, animationDuration);
          }
        }, idx * delayBetweenPhotos);
      });

      if (polaroidElements.length === 0) {
        resolve();
      }
    });
  }

  function getPhotosList() {
    return photosList;
  }

  function getIsBloomed() {
    return isBloomed;
  }

  return {
    loadPhotos: loadPhotos,
    init: init,
    bloom: bloom,
    getPhotosList: getPhotosList,
    getIsBloomed: getIsBloomed
  };
})();

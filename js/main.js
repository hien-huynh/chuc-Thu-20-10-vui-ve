/**
 * ==========================================================================
 * MAIN APPLICATION ENTRY POINT (js/main.js)
 * Orchestrates modules, data loading, stage transitions, and lifecycle events.
 * ==========================================================================
 */

(function () {
  'use strict';

  /**
   * Application Bootstrapper
   */
  async function initApp() {
    console.log('%c🌸 Chúc mừng ngày Phụ nữ Việt Nam 20/10 🌸', 'color: #ff75c8; font-size: 16px; font-weight: bold;');

    try {
      // 1. Initialize Audio Engine
      AudioManager.init();

      // 2. Initialize Canvas Particle System (Twinkling stars & ambient glow)
      ParticlesEngine.init();

      // 3. Load Data Assets Asynchronously
      const [photos, wishes] = await Promise.all([
        GalleryManager.loadPhotos(),
        WishesManager.loadWishes()
      ]);

      console.log(`Loaded ${photos.length} photos and ${wishes.length} wishes.`);

      // 4. Initialize Gallery (Polaroids)
      GalleryManager.init();

      // 5. Initialize 3D Universe
      UniverseController.init();

      // 6. Initialize Bouquet Controller & connect Stage 3 callback
      BouquetController.init({
        onStage3: function () {
          console.log('Entering Stage 3: 3D Universe of Wishes ✨');
          UniverseController.start();
        }
      });

    } catch (error) {
      console.error('Error during application initialization:', error);
    }
  }

  // Ensure DOM is fully loaded before executing
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();

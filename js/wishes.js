/**
 * ==========================================================================
 * WISHES MANAGER (js/wishes.js)
 * Loads Vietnamese wishes from data/wishes.txt, handles UTF-8,
 * whitespace filtering, fallback protection, and repetition generation.
 * ==========================================================================
 */

const WishesManager = (function () {
  'use strict';

  const WISHES_FILE = 'data/wishes.txt';

  // Fallback wishes in case fetch fails
  const FALLBACK_WISHES = [
    'Chúc mừng ngày phụ nữ Việt Nam 20/10',
    'Mong những điều Thu ước sẽ sớm thành hiện thực',
    'Chúc Thu 20/10 thật vui vẻ và rạng rỡ',
    'Mong Thu luôn xinh đẹp và rạng rỡ mỗi ngày',
    'Lúc nào cũng cười thật tươi nhé Thu',
    'Mong những điều dịu dàng sẽ đến với Thu nha',
    'Chúc Thu luôn gặp nhiều may mắn',
    'Hy vọng Thu sẽ luôn có lý do để mỉm cười',
    'Chúc Thu luôn bình an và hạnh phúc',
    'Mong Thu luôn được yêu thương và trân trọng',
    'Stress quá thì nhắn mình nhé',
    'Đừng quên chăm sóc bản thân thật tốt nhé',
    'Thu luôn là điều tuyệt vời nhất'
  ];

  let loadedWishes = [];

  /**
   * Fetch and parse wishes.txt
   */
  async function loadWishes() {
    try {
      const response = await fetch(WISHES_FILE);
      if (!response.ok) {
        throw new Error(`HTTP status ${response.status}`);
      }
      const text = await response.text();
      const lines = text
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line.length > 0);

      if (lines.length > 0) {
        loadedWishes = lines;
        console.log(`Loaded ${lines.length} wishes from ${WISHES_FILE}`);
      } else {
        loadedWishes = [...FALLBACK_WISHES];
      }
    } catch (err) {
      console.warn('Could not load wishes.txt, using fallback wishes:', err);
      loadedWishes = [...FALLBACK_WISHES];
    }
    return loadedWishes;
  }

  /**
   * Get raw list of wishes
   */
  function getWishes() {
    return loadedWishes.length > 0 ? loadedWishes : FALLBACK_WISHES;
  }

  /**
   * Generate an expanded pool of wishes (e.g. 50-70 items) by cycling
   * and shuffling the base wishes for the 3D Universe.
   */
  function generateWishPool(count) {
    const base = getWishes();
    const result = [];
    let pool = [];

    for (let i = 0; i < count; i++) {
      if (pool.length === 0) {
        // Shuffle base
        pool = [...base].sort(() => Math.random() - 0.5);
      }
      result.push(pool.pop());
    }
    return result;
  }

  return {
    loadWishes: loadWishes,
    getWishes: getWishes,
    generateWishPool: generateWishPool
  };
})();

/**
 * ==========================================================================
 * AUDIO CONTROLLER (js/audio.js)
 * Manages background music playback, seamless cross-stage continuity,
 * fade-in, user toggles, and resilient fallbacks.
 * ==========================================================================
 */

const AudioManager = (function () {
  'use strict';

  // Configuration
  const CONFIG = {
    audioPath: 'assets/music/background.mp3',
    targetVolume: 0.6,
    fadeInDuration: 1800, // 1.8 seconds fade-in
    fadeInSteps: 30
  };

  // State
  let audioElement = null;
  let isPlaying = false;
  let userMuted = false;
  let hasInitiated = false;
  let fadeInterval = null;
  let webAudioFallbackActive = false;
  let webAudioCtx = null;
  let synthTimer = null;

  // DOM Elements
  let musicBtn = null;
  let iconSoundOn = null;
  let iconSoundOff = null;

  /**
   * Initialize audio element and controls
   */
  function init() {
    audioElement = document.getElementById('bg-audio');
    musicBtn = document.getElementById('music-toggle');
    iconSoundOn = document.getElementById('icon-sound-on');
    iconSoundOff = document.getElementById('icon-sound-off');

    if (!audioElement) {
      audioElement = new Audio();
      audioElement.id = 'bg-audio';
      document.body.appendChild(audioElement);
    }

    // Configure single audio instance
    audioElement.src = CONFIG.audioPath;
    audioElement.loop = true;
    audioElement.volume = 0;
    audioElement.preload = 'auto';

    // Handle audio error (file missing or network issue)
    audioElement.addEventListener('error', function (e) {
      console.warn('Audio file error or missing, fallback to Web Audio synthesizer:', e);
      // We will use synthesized romantic melody if file fails
    });

    // Setup toggle button click
    if (musicBtn) {
      musicBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        togglePlayPause();
      });
    }

    // Handle tab visibility change
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        if (isPlaying && !userMuted) {
          if (audioElement && !audioElement.paused) {
            audioElement.pause();
          }
          if (webAudioFallbackActive && webAudioCtx && webAudioCtx.state === 'running') {
            webAudioCtx.suspend();
          }
        }
      } else {
        if (isPlaying && !userMuted) {
          if (audioElement && audioElement.paused && !webAudioFallbackActive) {
            audioElement.play().catch(function () {});
          }
          if (webAudioFallbackActive && webAudioCtx && webAudioCtx.state === 'suspended') {
            webAudioCtx.resume();
          }
        }
      }
    });

    updateUI();
  }

  /**
   * Start music immediately upon user interaction
   * Must be called directly from click/touch handler (no setTimeout)
   */
  function startPlayback() {
    if (hasInitiated) return;
    hasInitiated = true;

    if (!audioElement) return;

    // Reset volume to 0 for smooth fade-in
    audioElement.volume = 0;

    const playPromise = audioElement.play();

    if (playPromise !== undefined) {
      playPromise
        .then(function () {
          isPlaying = true;
          userMuted = false;
          fadeIn(CONFIG.targetVolume, CONFIG.fadeInDuration);
          updateUI();
        })
        .catch(function (error) {
          console.warn('Audio play request blocked or failed:', error);
          // Try Web Audio API fallback synthesized melody
          startWebAudioFallback();
        });
    } else {
      isPlaying = true;
      fadeIn(CONFIG.targetVolume, CONFIG.fadeInDuration);
      updateUI();
    }
  }

  /**
   * Smooth volume fade-in
   */
  function fadeIn(targetVol, duration) {
    if (fadeInterval) clearInterval(fadeInterval);

    const stepTime = duration / CONFIG.fadeInSteps;
    const volStep = targetVol / CONFIG.fadeInSteps;
    let currentVol = 0;

    audioElement.volume = 0;

    fadeInterval = setInterval(function () {
      currentVol += volStep;
      if (currentVol >= targetVol) {
        currentVol = targetVol;
        clearInterval(fadeInterval);
        fadeInterval = null;
      }
      try {
        audioElement.volume = currentVol;
      } catch (err) {
        clearInterval(fadeInterval);
      }
    }, stepTime);
  }

  /**
   * Toggle between Play and Pause (does NOT reset to beginning)
   */
  function togglePlayPause() {
    if (!hasInitiated) {
      // First interaction via button
      startPlayback();
      return;
    }

    if (isPlaying) {
      // Pause
      pause();
      userMuted = true;
    } else {
      // Resume
      resume();
      userMuted = false;
    }
  }

  function pause() {
    if (audioElement && !audioElement.paused) {
      audioElement.pause();
    }
    if (webAudioFallbackActive && webAudioCtx && webAudioCtx.state === 'running') {
      webAudioCtx.suspend();
    }
    isPlaying = false;
    updateUI();
  }

  function resume() {
    if (webAudioFallbackActive) {
      if (webAudioCtx && webAudioCtx.state === 'suspended') {
        webAudioCtx.resume();
      }
      isPlaying = true;
      updateUI();
      return;
    }

    if (audioElement) {
      audioElement.volume = CONFIG.targetVolume;
      const playPromise = audioElement.play();
      if (playPromise !== undefined) {
        playPromise
          .then(function () {
            isPlaying = true;
            updateUI();
          })
          .catch(function (err) {
            console.warn('Resume error:', err);
          });
      } else {
        isPlaying = true;
        updateUI();
      }
    }
  }

  /**
   * Update Music Button UI states
   */
  function updateUI() {
    if (!musicBtn) return;

    if (isPlaying) {
      musicBtn.classList.add('playing');
      musicBtn.setAttribute('title', 'Tắt nhạc');
      if (iconSoundOn) iconSoundOn.classList.remove('hidden');
      if (iconSoundOff) iconSoundOff.classList.add('hidden');
    } else {
      musicBtn.classList.remove('playing');
      musicBtn.setAttribute('title', 'Bật nhạc');
      if (iconSoundOn) iconSoundOn.classList.add('hidden');
      if (iconSoundOff) iconSoundOff.classList.remove('hidden');
    }
  }

  /**
   * Resilient Web Audio Romantic Music Box Synthesizer
   * Only used if background.mp3 is unavailable or cannot play
   */
  function startWebAudioFallback() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      webAudioCtx = new AudioCtx();
      webAudioFallbackActive = true;
      isPlaying = true;
      userMuted = false;
      updateUI();

      // Romantic chord progression frequencies: Cmaj7 - Am7 - Fmaj7 - G7
      const notes = [
        261.63, 329.63, 392.00, 493.88, 523.25, // C E G B C
        220.00, 261.63, 329.63, 392.00, 440.00, // A C E G A
        174.61, 220.00, 261.63, 349.23, 440.00, // F A C F A
        196.00, 246.94, 293.66, 392.00, 493.88  // G B D G B
      ];

      let noteIdx = 0;
      function playTone() {
        if (!isPlaying || userMuted) return;
        const freq = notes[noteIdx % notes.length];
        noteIdx++;

        const osc = webAudioCtx.createOscillator();
        const gain = webAudioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, webAudioCtx.currentTime);

        gain.gain.setValueAtTime(0.001, webAudioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.08, webAudioCtx.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.0001, webAudioCtx.currentTime + 1.8);

        osc.connect(gain);
        gain.connect(webAudioCtx.destination);

        osc.start();
        osc.stop(webAudioCtx.currentTime + 2.0);
      }

      synthTimer = setInterval(playTone, 450);
      playTone();
    } catch (e) {
      console.warn('Web Audio Fallback also failed:', e);
    }
  }

  return {
    init: init,
    startPlayback: startPlayback,
    togglePlayPause: togglePlayPause,
    isPlaying: function () {
      return isPlaying;
    }
  };
})();

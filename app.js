// Niken's Birthday Scrapbook Web Application
// Fully interactive, responsive, audio-driven Y2K aesthetic experience

document.addEventListener('DOMContentLoaded', () => {
  // --- Audio State & Elements ---
  const audio = document.getElementById('bg-music');
  const mainPlayBtn = document.getElementById('main-play-btn');
  const mainPlayIcon = document.getElementById('main-play-icon');
  const miniPlayBtn = document.getElementById('mini-play-btn');
  const miniPlayIcon = document.getElementById('mini-play-icon');
  const miniVinyl = document.getElementById('mini-vinyl');
  const mainVinyl = document.getElementById('main-vinyl');
  const progressBar = document.getElementById('music-progress');
  const progressFilled = document.getElementById('progress-filled');
  const timeCurrent = document.getElementById('time-current');
  const timeTotal = document.getElementById('time-total');
  const volumeSlider = document.getElementById('volume-slider');
  const muteBtn = document.getElementById('mute-btn');
  const visualizerBars = document.querySelectorAll('.visualizer-bar');
  const floatingPlayer = document.getElementById('floating-player');

  let isPlaying = false;
  let audioContext = null;

  // Sound Synthesizer via Web Audio API (No external sound files required)
  function playSynthSound(type) {
    try {
      if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      const now = audioContext.currentTime;

      if (type === 'pop') {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.start(now);
        osc.stop(now + 0.13);
      } else if (type === 'chime') {
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
          const osc = audioContext.createOscillator();
          const gain = audioContext.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + i * 0.08);
          gain.gain.setValueAtTime(0.2, now + i * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.4);
          osc.connect(gain);
          gain.connect(audioContext.destination);
          osc.start(now + i * 0.08);
          osc.stop(now + i * 0.08 + 0.45);
        });
      } else if (type === 'sparkle') {
        [659.25, 783.99, 987.77, 1318.51, 1567.98].forEach((freq, i) => {
          const osc = audioContext.createOscillator();
          const gain = audioContext.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.07);
          gain.gain.setValueAtTime(0.25, now + i * 0.07);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.35);
          osc.connect(gain);
          gain.connect(audioContext.destination);
          osc.start(now + i * 0.07);
          osc.stop(now + i * 0.07 + 0.4);
        });
      } else if (type === 'stamp') {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.start(now);
        osc.stop(now + 0.16);
      }
    } catch (e) {
      console.warn('Web Audio error:', e);
    }
  }

  // Audio Playback Handler
  function updatePlayerUI(playing) {
    isPlaying = playing;
    const playSvg = `<svg class="w-6 h-6 text-pink-600" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`;
    const pauseSvg = `<svg class="w-6 h-6 text-pink-600" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;
    const miniPlaySvg = `<svg class="w-4 h-4 text-pink-600" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`;
    const miniPauseSvg = `<svg class="w-4 h-4 text-pink-600" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;

    if (mainPlayIcon) mainPlayIcon.innerHTML = playing ? pauseSvg : playSvg;
    if (miniPlayIcon) miniPlayIcon.innerHTML = playing ? miniPauseSvg : miniPlaySvg;

    if (mainVinyl) {
      if (playing) mainVinyl.classList.remove('paused');
      else mainVinyl.classList.add('paused');
    }
    if (miniVinyl) {
      if (playing) miniVinyl.classList.remove('paused');
      else miniVinyl.classList.add('paused');
    }

    visualizerBars.forEach(bar => {
      if (playing) bar.classList.remove('paused');
      else bar.classList.add('paused');
    });
  }

  function togglePlay() {
    if (!audio) return;
    if (audio.paused) {
      audio.play().then(() => {
        updatePlayerUI(true);
      }).catch(err => {
        console.warn('Autoplay prevented:', err);
      });
    } else {
      audio.pause();
      updatePlayerUI(false);
    }
  }

  if (mainPlayBtn) mainPlayBtn.addEventListener('click', () => { playSynthSound('pop'); togglePlay(); });
  if (miniPlayBtn) miniPlayBtn.addEventListener('click', () => { playSynthSound('pop'); togglePlay(); });

  // Audio Timeline
  function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  if (audio) {
    audio.addEventListener('timeupdate', () => {
      if (!audio.duration) return;
      const progress = (audio.currentTime / audio.duration) * 100;
      if (progressFilled) progressFilled.style.width = `${progress}%`;
      if (timeCurrent) timeCurrent.textContent = formatTime(audio.currentTime);
      if (timeTotal) timeTotal.textContent = formatTime(audio.duration);
    });

    audio.addEventListener('loadedmetadata', () => {
      if (timeTotal) timeTotal.textContent = formatTime(audio.duration);
    });

    audio.addEventListener('ended', () => {
      audio.currentTime = 0;
      audio.play();
    });
  }

  // Progress Bar click seeking
  if (progressBar) {
    progressBar.addEventListener('click', (e) => {
      if (!audio || !audio.duration) return;
      const rect = progressBar.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const pct = clickX / rect.width;
      audio.currentTime = pct * audio.duration;
      playSynthSound('pop');
    });
  }

  // Volume & Mute
  if (volumeSlider && audio) {
    volumeSlider.addEventListener('input', (e) => {
      audio.volume = e.target.value;
    });
  }

  if (muteBtn && audio) {
    muteBtn.addEventListener('click', () => {
      playSynthSound('pop');
      audio.muted = !audio.muted;
      muteBtn.innerHTML = audio.muted ? '🔇' : '🔊';
    });
  }

  // --- Screen Navigation Engine ---
  const screens = {
    cover: document.getElementById('screen-cover'),
    q1: document.getElementById('screen-q1'),
    q2: document.getElementById('screen-q2'),
    q3: document.getElementById('screen-q3'),
    q4: document.getElementById('screen-q4'),
    cupcake: document.getElementById('screen-cupcake'),
    hub: document.getElementById('screen-hub'),
    letter: document.getElementById('screen-letter'),
    coupons: document.getElementById('screen-coupons'),
    music: document.getElementById('screen-music')
  };

  function switchScreen(screenKey) {
    playSynthSound('pop');
    Object.keys(screens).forEach(key => {
      const el = screens[key];
      if (el) {
        el.classList.remove('active');
        el.style.display = 'none';
      }
    });

    const target = screens[screenKey];
    if (target) {
      target.style.display = 'block';
      setTimeout(() => {
        target.classList.add('active');
      }, 20);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Show floating player once user enters cupcake or hub
    if (['cupcake', 'hub', 'letter', 'coupons', 'music'].includes(screenKey)) {
      if (floatingPlayer) floatingPlayer.style.display = 'flex';
    }
  }

  // Setup Screen Navigation Triggers
  document.querySelectorAll('[data-goto]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetScreen = btn.getAttribute('data-goto');
      if (targetScreen) {
        switchScreen(targetScreen);
      }
    });
  });

  // --- Q&A Feedback Toasts & Progression ---
  const qaOptions = document.querySelectorAll('.qa-choice-btn');
  qaOptions.forEach(btn => {
    btn.addEventListener('click', () => {
      playSynthSound('chime');
      createConfetti({ particleCount: 30, spread: 60 });
      const next = btn.getAttribute('data-next');
      if (next) {
        setTimeout(() => switchScreen(next), 400);
      }
    });
  });

  // --- Cupcake Gateway Interaction ---
  const cupcakeTrigger = document.getElementById('cupcake-trigger');
  const candleFlame = document.getElementById('candle-flame');
  let cupcakeBlown = false;

  if (cupcakeTrigger) {
    cupcakeTrigger.addEventListener('click', () => {
      if (cupcakeBlown) return;
      cupcakeBlown = true;

      playSynthSound('sparkle');

      // Extinguish candle flame
      if (candleFlame) {
        candleFlame.style.transition = 'all 0.6s ease';
        candleFlame.style.transform = 'scale(0) translateY(-20px)';
        candleFlame.style.opacity = '0';
      }

      // Burst confetti
      triggerCelebrationConfetti();

      // Start music automatically
      if (audio && audio.paused) {
        audio.play().then(() => {
          updatePlayerUI(true);
        }).catch(err => console.log('Autoplay audio:', err));
      }

      // Transition to Hub
      setTimeout(() => {
        switchScreen('hub');
      }, 1500);
    });
  }

  // --- Main Hub Envelopes ---
  document.querySelectorAll('.hub-envelope-card').forEach(card => {
    card.addEventListener('click', () => {
      const dest = card.getAttribute('data-dest');
      if (dest) {
        playSynthSound('chime');
        // Visual flap opening effect
        card.style.transform = 'translateY(-12px) scale(1.05)';
        setTimeout(() => {
          card.style.transform = '';
          switchScreen(dest);
        }, 400);
      }
    });
  });

  // --- Coupon Claiming Mechanism ---
  const couponButtons = document.querySelectorAll('.claim-coupon-btn');
  couponButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      playSynthSound('stamp');
      triggerMiniConfetti();

      const couponId = btn.getAttribute('data-coupon-id');
      const couponTitle = btn.getAttribute('data-coupon-title');
      const stampEl = document.getElementById(`stamp-${couponId}`);

      if (stampEl) {
        stampEl.classList.remove('hidden');
        stampEl.classList.add('animate-bounce');
        setTimeout(() => stampEl.classList.remove('animate-bounce'), 800);
      }

      btn.disabled = true;
      btn.classList.remove('bg-pink-500', 'hover:bg-pink-600', 'text-white');
      btn.classList.add('bg-pink-100', 'text-pink-400', 'cursor-not-allowed');
      btn.innerHTML = '✨ Kupon Terklaim!';

      // Open sweet alert modal with option to WhatsApp Wildan
      showCouponModal(couponTitle);
    });
  });

  function showCouponModal(title) {
    const modal = document.getElementById('coupon-modal');
    const modalTitle = document.getElementById('modal-coupon-title');
    const waLink = document.getElementById('modal-wa-link');

    if (modal && modalTitle && waLink) {
      modalTitle.textContent = title;
      const message = encodeURIComponent(`Halo sayang! ❤️ Aku baru aja klaim kupon: "${title}" di website ultah dari kamu! Diturutin yaa 🥰✨`);
      waLink.href = `https://wa.me/?text=${message}`;
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  }

  const closeCouponModalBtn = document.getElementById('close-coupon-modal');
  if (closeCouponModalBtn) {
    closeCouponModalBtn.addEventListener('click', () => {
      playSynthSound('pop');
      const modal = document.getElementById('coupon-modal');
      if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      }
    });
  }

  // --- Virtual Hug & Love Reaction in Letter ---
  const sendHugBtn = document.getElementById('send-hug-btn');
  const hugCountEl = document.getElementById('hug-count');
  let hugCount = 99;

  if (sendHugBtn) {
    sendHugBtn.addEventListener('click', () => {
      hugCount++;
      if (hugCountEl) hugCountEl.textContent = hugCount;
      playSynthSound('sparkle');
      triggerMiniConfetti();

      // Spawn 15 floating hearts
      for (let i = 0; i < 15; i++) {
        setTimeout(() => {
          createTapParticle(
            window.innerWidth / 2 + (Math.random() * 200 - 100),
            window.innerHeight * 0.6 + (Math.random() * 100 - 50)
          );
        }, i * 60);
      }
    });
  }

  // --- Photo Lightbox Modal ---
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const closeLightboxBtn = document.getElementById('close-lightbox');

  document.querySelectorAll('.zoomable-photo').forEach(img => {
    img.addEventListener('click', () => {
      playSynthSound('pop');
      if (lightboxModal && lightboxImg) {
        lightboxImg.src = img.src;
        if (lightboxCaption) {
          lightboxCaption.textContent = img.getAttribute('alt') || 'Momen Indah Niken & Kenangan Manis';
        }
        lightboxModal.classList.remove('hidden');
        lightboxModal.classList.add('flex');
      }
    });
  });

  if (closeLightboxBtn && lightboxModal) {
    closeLightboxBtn.addEventListener('click', () => {
      playSynthSound('pop');
      lightboxModal.classList.add('hidden');
      lightboxModal.classList.remove('flex');
    });
  }

  if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) {
        lightboxModal.classList.add('hidden');
        lightboxModal.classList.remove('flex');
      }
    });
  }

  // --- Confetti Functions ---
  function createConfetti(opts = {}) {
    if (typeof confetti === 'function') {
      confetti({
        particleCount: opts.particleCount || 40,
        spread: opts.spread || 70,
        origin: opts.origin || { y: 0.6 },
        colors: ['#ff6b8b', '#ff8da1', '#ffc0cb', '#ffd1dc', '#ffffff', '#ffd700']
      });
    }
  }

  function triggerMiniConfetti() {
    createConfetti({ particleCount: 35, spread: 60 });
  }

  function triggerCelebrationConfetti() {
    if (typeof confetti !== 'function') return;
    const end = Date.now() + 2.5 * 1000;
    const colors = ['#ff4d79', '#ff85a2', '#ffc2d1', '#fff', '#fcd34d'];

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }

  // --- Tap Sparks & Hearts Engine ---
  const heartIcons = ['💖', '💕', '🌸', '✨', '💐', '🍓', '🎀', '💌'];
  function createTapParticle(x, y) {
    const heart = document.createElement('div');
    heart.className = 'tap-heart';
    heart.textContent = heartIcons[Math.floor(Math.random() * heartIcons.length)];
    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;

    const dx = (Math.random() - 0.5) * 80;
    const rot = (Math.random() - 0.5) * 60;
    heart.style.setProperty('--dx', `${dx}px`);
    heart.style.setProperty('--rot', `${rot}deg`);

    document.body.appendChild(heart);

    setTimeout(() => {
      heart.remove();
    }, 950);
  }

  window.addEventListener('click', (e) => {
    // Avoid double spawning when tapping buttons rapidly
    createTapParticle(e.clientX, e.clientY);
  });

  // Background Ambient Canvas Floating Hearts
  const canvas = document.getElementById('bg-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const particleCount = window.innerWidth < 768 ? 18 : 35;

    class FloatingHeart {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * width;
        this.y = height + Math.random() * 100;
        this.size = Math.random() * 12 + 8;
        this.speedY = Math.random() * 0.8 + 0.3;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.4 + 0.15;
        this.color = Math.random() > 0.5 ? 'rgba(255, 130, 160, ' : 'rgba(255, 180, 200, ';
        this.rotation = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.02;
      }
      update() {
        this.y -= this.speedY;
        this.x += this.speedX;
        this.rotation += this.rotSpeed;
        if (this.y < -50) {
          this.reset();
        }
      }
      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.fillStyle = this.color + this.opacity + ')';
        ctx.beginPath();
        const topCurveHeight = this.size * 0.3;
        ctx.moveTo(0, topCurveHeight);
        // top left curve
        ctx.bezierCurveTo(
          -this.size / 2, -topCurveHeight,
          -this.size, topCurveHeight / 3,
          0, this.size
        );
        // top right curve
        ctx.bezierCurveTo(
          this.size, topCurveHeight / 3,
          this.size / 2, -topCurveHeight,
          0, topCurveHeight
        );
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      const p = new FloatingHeart();
      p.y = Math.random() * height; // initial distribution
      particles.push(p);
    }

    function animateBg() {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      requestAnimationFrame(animateBg);
    }
    animateBg();
  }
});

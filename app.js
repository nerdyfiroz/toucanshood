/* ==========================================================================
   TOUCANSHOOD — Interactive Application Script
   ========================================================================== */

// GTD Wallet Allowlist loaded from wallets/gtd.csv
let gtdWallets = new Set(["0x6d2fa7f71971259f8cbd9d4118e491039a476172"]);

async function loadGTDCSV() {
  try {
    const res = await fetch('wallets/gtd.csv');
    if (!res.ok) return;
    const text = await res.text();
    text.split(/\r?\n/).forEach(line => {
      const addr = line.trim();
      if (addr && addr.startsWith('0x')) {
        gtdWallets.add(addr.toLowerCase());
      }
    });
  } catch (e) {
    console.warn('Could not fetch wallets/gtd.csv:', e);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadGTDCSV();

  // DOM Elements
  const galleryGrid = document.getElementById('gallery-grid');
  const searchInput = document.getElementById('search-input');
  const filterHeadwear = document.getElementById('filter-headwear');
  const filterOutfit = document.getElementById('filter-outfit');
  const filterTier = document.getElementById('filter-tier');
  const sortSelect = document.getElementById('sort-select');
  const countDisplay = document.getElementById('item-count');

  // Modal Elements
  const modalOverlay = document.getElementById('modal-overlay');
  const modalClose = document.getElementById('modal-close');
  const modalImg = document.getElementById('modal-img');
  const modalTitle = document.getElementById('modal-title');
  const modalSubtitle = document.getElementById('modal-subtitle');
  const modalDesc = document.getElementById('modal-desc');
  const modalTraitsGrid = document.getElementById('modal-traits-grid');
  const modalDownloadBtn = document.getElementById('modal-download-btn');

  // Wallet Checker Elements
  const walletInput = document.getElementById('wallet-input');
  const checkWalletBtn = document.getElementById('check-wallet-btn');
  const checkerResultBox = document.getElementById('checker-result-box');
  const sampleBtns = document.querySelectorAll('.sample-btn');

  // Randomizer Elements
  const randomizeBtn = document.getElementById('randomize-btn');
  const randomImg = document.getElementById('random-img');
  const randomName = document.getElementById('random-name');

  // Sound & Theme Toggle
  const audioToggle = document.getElementById('audio-toggle');
  const themeToggle = document.getElementById('theme-toggle');

  // State
  let soundEnabled = true;

  // Initialize Background Canvas
  initBackgroundParticles();

  // Populate Filter Dropdowns
  populateFilterOptions();

  // Initial Render
  renderGallery();

  // Event Listeners
  if (searchInput) searchInput.addEventListener('input', renderGallery);
  if (filterHeadwear) filterHeadwear.addEventListener('change', renderGallery);
  if (filterOutfit) filterOutfit.addEventListener('change', renderGallery);
  if (filterTier) filterTier.addEventListener('change', renderGallery);
  if (sortSelect) sortSelect.addEventListener('change', renderGallery);

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }

  // Audio Toggle
  if (audioToggle) {
    audioToggle.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      audioToggle.innerHTML = soundEnabled ? '🔊' : '🔇';
      showToast(soundEnabled ? 'Audio Effects Enabled' : 'Audio Effects Muted');
      if (soundEnabled) playSound(600, 'sine', 0.1);
    });
  }

  // Theme Toggle
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('light-mode');
      const isLight = document.body.classList.contains('light-mode');
      themeToggle.innerHTML = isLight ? '🌙' : '☀️';
      showToast(isLight ? 'Switched to Light Mode' : 'Switched to Dark Mode');
      playSound(440, 'triangle', 0.1);
    });
  }

  // Randomizer Widget
  if (randomizeBtn) {
    randomizeBtn.addEventListener('click', () => {
      const randomIndex = Math.floor(Math.random() * toucansData.length);
      const toucan = toucansData[randomIndex];
      randomImg.src = toucan.file;
      randomName.textContent = 'Toucanshood #000';
      playSound(520, 'square', 0.12);
      showToast('Selected Toucanshood #000');
    });
  }

  // Wallet Checker Logic
  if (checkWalletBtn && walletInput && checkerResultBox) {
    checkWalletBtn.addEventListener('click', checkWalletEligibility);
    walletInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') checkWalletEligibility();
    });
  }

  // Sample Wallet Buttons
  sampleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const addr = btn.getAttribute('data-address');
      if (walletInput) {
        walletInput.value = addr;
        checkWalletEligibility();
      }
    });
  });

  function checkWalletEligibility() {
    const rawAddr = walletInput ? walletInput.value.trim() : '';

    if (!rawAddr || rawAddr.length < 10) {
      playSound(300, 'sawtooth', 0.15);
      showToast('Please enter a valid wallet address!');
      checkerResultBox.innerHTML = `
        <div class="result-placeholder" style="color: var(--neon-orange);">
          <span style="font-size: 1.8rem;">⚠️</span>
          <p>Invalid Address. Please enter a valid 0x EVM or Robinhood wallet address.</p>
        </div>
      `;
      return;
    }

    playSound(750, 'triangle', 0.2);

    // Shortened Address Display
    const shortAddr = rawAddr.length > 14 
      ? `${rawAddr.substring(0, 6)}...${rawAddr.substring(rawAddr.length - 4)}`
      : rawAddr;

    // Check GTD_ALLOWLIST (from wallets/gtd-list.js — works on file:// and server)
    const lowerAddr = rawAddr.toLowerCase();
    const isGTD = gtdWallets.has(lowerAddr);

    if (isGTD) {
      checkerResultBox.innerHTML = `
        <div class="result-success">
          <div class="result-badge" style="color: var(--neon-green);">
            🎉 WALLET REGISTERED FOR GTD FREE MINT
          </div>
          <div style="font-size: 0.9rem; color: var(--text-main); margin-bottom: 12px;">
            Address: <strong style="color: var(--neon-green);">${shortAddr}</strong>
          </div>
          <div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; font-size: 0.85rem;">
            <span style="background: rgba(0,245,160,0.15); border: 1px solid var(--neon-green); padding: 4px 12px; border-radius: 20px; color: var(--neon-green);">
              • Tier: GTD FREE MINT
            </span>
            <span style="background: rgba(0,245,160,0.15); border: 1px solid var(--neon-green); padding: 4px 12px; border-radius: 20px; color: var(--neon-green);">
              • Price: FREE
            </span>
            <span style="background: rgba(0,245,160,0.15); border: 1px solid var(--neon-green); padding: 4px 12px; border-radius: 20px; color: var(--neon-green);">
              • Limit: 1 Per Wallet
            </span>
            <span style="background: rgba(0, 245, 160, 0.15); border: 1px solid var(--neon-green); padding: 4px 12px; border-radius: 20px; color: var(--neon-green);">
              • Chain: Robinhood Chain
            </span>
          </div>
          <div style="margin-top: 14px; font-size: 0.8rem; color: var(--text-muted);">
            Ready for OpenSea Mint on 06.08.26 🚀
          </div>
        </div>
      `;
      showToast('🎉 Wallet is GTD FREE MINT Eligible!');
    } else {
      // Not in GTD list
      checkerResultBox.innerHTML = `
        <div class="result-not-eligible">
          <div class="result-badge" style="color: var(--neon-orange, #ff6b35);">
            ❌ NOT ELIGIBLE FOR GTD SLOT
          </div>
          <div style="font-size: 0.9rem; color: var(--text-main); margin-bottom: 12px;">
            Address: <strong style="color: var(--neon-orange, #ff6b35);">${shortAddr}</strong>
          </div>
          <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 8px;">
            This wallet is <strong style="color: var(--neon-orange, #ff6b35);">not registered</strong> for the GTD Free Mint slot.
          </div>
        </div>
      `;
      showToast('❌ Not eligible for GTD slot');
    }
  }

  /* ==========================================================================
     POPULATE FILTER DROPDOWNS
     ========================================================================== */
  function populateFilterOptions() {
    if (!filterHeadwear || !filterOutfit) return;

    const headwearSet = new Set();
    const outfitSet = new Set();

    toucansData.forEach(t => {
      if (t.headwear) headwearSet.add(t.headwear);
      if (t.outwear) outfitSet.add(t.outwear);
    });

    headwearSet.forEach(h => {
      const opt = document.createElement('option');
      opt.value = h;
      opt.textContent = h;
      filterHeadwear.appendChild(opt);
    });

    outfitSet.forEach(o => {
      const opt = document.createElement('option');
      opt.value = o;
      opt.textContent = o;
      filterOutfit.appendChild(opt);
    });
  }

  /* ==========================================================================
     RENDER GALLERY GRID
     ========================================================================== */
  function renderGallery() {
    if (!galleryGrid) return;

    // Pick 6 visually distinct items from across the dataset
    const pickIds = [1, 2, 7, 8, 9, 14];
    const display = toucansData.filter(item => pickIds.includes(item.id));

    // Update Counter
    if (countDisplay) {
      countDisplay.textContent = `Showing 6 preview artworks (2,222 total collection supply)`;
    }

    // Render Cards HTML
    galleryGrid.innerHTML = display.map(item => `
      <div class="toucan-card" data-id="${item.id}">
        <div class="card-img-wrap">
          <img class="card-img pixelated" src="${item.file}" alt="Toucanshood #000" loading="lazy">
        </div>
        <div class="card-content">
          <div class="card-header">
            <h4 class="card-title">Toucanshood #000</h4>
          </div>
        </div>
      </div>
    `).join('');

    // Attach click listeners to cards
    document.querySelectorAll('.toucan-card').forEach(card => {
      card.addEventListener('mouseenter', () => {
        playSound(400, 'sine', 0.03);
      });
      card.addEventListener('click', () => {
        const id = parseInt(card.getAttribute('data-id'), 10);
        openModal(id);
      });
    });
  }

  /* ==========================================================================
     MODAL INSPECTOR
     ========================================================================== */
  function openModal(id) {
    const toucan = toucansData.find(t => t.id === id);
    if (!toucan) return;

    playSound(580, 'triangle', 0.15);

    modalImg.src = toucan.file;
    modalTitle.textContent = 'Toucanshood #000';
    if (modalSubtitle) modalSubtitle.textContent = '';
    if (modalDesc) modalDesc.textContent = '';
    if (modalTraitsGrid) modalTraitsGrid.innerHTML = '';


    if (modalDownloadBtn) {
      modalDownloadBtn.href = toucan.file;
      modalDownloadBtn.download = 'Toucanshood_000.png';
    }

    modalOverlay.classList.add('active');
  }

  function closeModal() {
    playSound(320, 'sine', 0.1);
    modalOverlay.classList.remove('active');
  }

  /* ==========================================================================
     SYNTHESIZED SOUND EFFECTS ENGINE (Web Audio API)
     ========================================================================== */
  function playSound(freq, type = 'sine', duration = 0.1) {
    if (!soundEnabled) return;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Audio context policy fallback
    }
  }

  /* ==========================================================================
     TOAST NOTIFICATIONS
     ========================================================================== */
  function showToast(message) {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>🦜</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  /* ==========================================================================
     BACKGROUND CANVAS PARTICLES
     ========================================================================== */
  function initBackgroundParticles() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const count = 35;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 4 + 2,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: (Math.random() - 0.5) * 0.4,
        color: i % 2 === 0 ? '#00f5a0' : '#00d2ff',
        alpha: Math.random() * 0.5 + 0.2
      });
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
      });

      requestAnimationFrame(animate);
    }

    animate();
  }
});

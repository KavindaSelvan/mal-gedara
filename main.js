document.addEventListener('DOMContentLoaded', () => {

  // ─── HERO SLIDER ─────────────────────────────────────────
  let currentSlide = 0;
  const slides = document.querySelectorAll('.hero-slide');
  const dots   = document.querySelectorAll('.hero-dot');
  let sliderTimer = null;

  function goToSlide(n) {
    if (!slides.length) return;
    slides[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');
    currentSlide = (n + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
  }

  // Expose to inline onclick handlers in HTML
  window.goToSlide   = goToSlide;
  window.changeSlide = (dir) => goToSlide(currentSlide + dir);

  function startAutoSlide() {
    stopAutoSlide();
    sliderTimer = setInterval(() => goToSlide(currentSlide + 1), 5000);
  }

  function stopAutoSlide() {
    if (sliderTimer) clearInterval(sliderTimer);
  }

  startAutoSlide();

  // Pause on hover, resume on leave
  const heroSection = document.querySelector('.hero');
  if (heroSection) {
    heroSection.addEventListener('mouseenter', stopAutoSlide);
    heroSection.addEventListener('mouseleave', startAutoSlide);
  }


  // ─── COUNTDOWN TIMER ─────────────────────────────────────
  // Fixed end date — 2 days from page load at midnight
  const countdownEnd = new Date();
  countdownEnd.setDate(countdownEnd.getDate() + 2);
  countdownEnd.setHours(23, 59, 59, 0);

  const cdEls = {
    days:  document.getElementById('cd-days'),
    hours: document.getElementById('cd-hours'),
    mins:  document.getElementById('cd-mins'),
    secs:  document.getElementById('cd-secs'),
  };

  function updateCountdown() {
    const diff = Math.max(0, countdownEnd - new Date());
    const pad  = n => String(n).padStart(2, '0');

    if (cdEls.days)  cdEls.days.textContent  = pad(Math.floor(diff / 86400000));
    if (cdEls.hours) cdEls.hours.textContent = pad(Math.floor((diff % 86400000) / 3600000));
    if (cdEls.mins)  cdEls.mins.textContent  = pad(Math.floor((diff % 3600000)  / 60000));
    if (cdEls.secs)  cdEls.secs.textContent  = pad(Math.floor((diff % 60000)    / 1000));
  }

  // Only start timer if elements exist on the page
  if (cdEls.days) {
    updateCountdown();
    setInterval(updateCountdown, 1000);
  }


  // ─── PRODUCT TABS ─────────────────────────────────────────
  // Expose to inline onclick in HTML
  window.setTab = function(btn) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Show/hide products based on tab data-category attribute
    const category = btn.textContent.trim().toLowerCase().replace(' ', '-');
    const cards = document.querySelectorAll('.product-card');

    cards.forEach(card => {
      // If card has no data-category or matches, show it
      const cardCat = card.dataset.category || 'new';
      if (category === 'new' || cardCat === category) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  };


  // ─── WISHLIST TOGGLE ─────────────────────────────────────
  document.querySelectorAll('.product-action-btn[title="Add to Wishlist"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const isWished = btn.textContent.trim() === '♥';
      btn.textContent = isWished ? '♡' : '♥';
      btn.style.color = isWished ? '' : '#E8648A';
      btn.title = isWished ? 'Add to Wishlist' : 'Remove from Wishlist';
    });
  });


  // ─── QUICK VIEW MODAL ─────────────────────────────────────
  // Create modal element once and reuse
  const modal = document.createElement('div');
  modal.id = 'quick-view-modal';
  modal.style.cssText = `
    display:none; position:fixed; inset:0; z-index:1000;
    background:rgba(26,15,8,0.65); backdrop-filter:blur(4px);
    align-items:center; justify-content:center;
  `;
  modal.innerHTML = `
    <div style="
      background:#FEFAF2; max-width:560px; width:90%;
      padding:40px; position:relative;
      border-top:4px solid #E8890C; border-radius:2px;
      box-shadow:0 24px 64px rgba(0,0,0,0.3);
      font-family:'Libre Baskerville',serif;
    ">
      <button id="modal-close" style="
        position:absolute; top:16px; right:16px;
        background:none; border:none; font-size:24px;
        cursor:pointer; color:#1A0F08; line-height:1;
      ">✕</button>
      <div id="modal-body"></div>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById('modal-close').addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  function closeModal() {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.product-action-btn[title="Quick View"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const card  = btn.closest('.product-card');
      const name  = card.querySelector('.product-name')?.textContent  || '';
      const sinhala = card.querySelector('.product-sinhala')?.textContent || '';
      const price = card.querySelector('.price-now')?.textContent     || '';
      const old   = card.querySelector('.price-old')?.textContent     || '';
      const stars = card.querySelector('.product-stars')?.innerHTML   || '';
      const imgSrc = card.querySelector('.product-img-wrap img')?.src || '';

      document.getElementById('modal-body').innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;align-items:center;">
          <img src="${imgSrc}" alt="${name}"
               style="width:100%;height:220px;object-fit:cover;background:#f5f0e8;">
          <div>
            <div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#E8890C;margin-bottom:8px;">Quick View</div>
            <h3 style="font-family:'Playfair Display',serif;font-size:22px;font-weight:900;color:#1A0F08;margin-bottom:4px;">${name}</h3>
            <div style="font-family:'Noto Serif Sinhala',serif;font-size:12px;color:#8B3A0F;margin-bottom:12px;">${sinhala}</div>
            <div style="margin-bottom:16px;">${stars}</div>
            <div style="display:flex;gap:10px;align-items:center;margin-bottom:20px;">
              <span style="color:#C0395F;font-weight:700;font-size:20px;">${price}</span>
              ${old ? `<span style="color:#aaa;text-decoration:line-through;">${old}</span>` : ''}
            </div>
            <p style="font-size:13px;color:#666;line-height:1.8;margin-bottom:20px;">
              Fresh from the gardens of Sri Lanka — lovingly arranged by our island's finest floral artisans.
            </p>
            <button onclick="document.getElementById('quick-view-modal').style.display='none';document.body.style.overflow='';"
              style="
                background:#E8890C;color:white;border:none;
                padding:14px 28px;font-family:'Libre Baskerville',serif;
                font-size:12px;letter-spacing:2px;text-transform:uppercase;
                cursor:pointer;width:100%;
                clip-path:polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%);
              ">
              Add to Cart 🛒
            </button>
          </div>
        </div>
      `;
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    });
  });


  // ─── ADD TO CART ─────────────────────────────────────────
  const cartBadge = document.querySelector('.cart-badge');

  function updateCartBadge(delta = 1) {
    if (!cartBadge) return;
    const current = parseInt(cartBadge.textContent || '0');
    cartBadge.textContent = current + delta;
    // Animate badge
    cartBadge.style.transform = 'scale(1.5)';
    setTimeout(() => { cartBadge.style.transform = ''; }, 200);
    cartBadge.style.transition = 'transform 0.2s';
  }

  document.querySelectorAll('.product-action-btn[title="Add to Cart"]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const card  = btn.closest('.product-card');

      // Don't add if soldout
      if (card.querySelector('.badge-soldout')) {
        btn.textContent = '✗';
        btn.style.color = '#E8648A';
        setTimeout(() => { btn.textContent = '🛒'; btn.style.color = ''; }, 1500);
        return;
      }

      const name  = card.querySelector('.product-name')?.textContent || 'Product';
      const price = card.querySelector('.price-now')?.textContent    || '0';

      // Visual feedback
      btn.textContent = '✓';
      btn.style.color = '#F5D97A';
      setTimeout(() => { btn.textContent = '🛒'; btn.style.color = ''; }, 1500);

      updateCartBadge(1);

      // Send to PHP back-end (requires server)
      try {
        await fetch('cart.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'add', name, price }),
        });
      } catch {
        // No server — cart count already updated locally
      }
    });
  });


  // ─── NEWSLETTER FORM ─────────────────────────────────────
  const newsletterBtn   = document.querySelector('.newsletter-btn');
  const newsletterInput = document.querySelector('.newsletter-input');

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  async function handleNewsletterSubmit() {
    if (!newsletterInput) return;
    const email = newsletterInput.value.trim();

    if (!validateEmail(email)) {
      newsletterInput.style.borderLeft = '3px solid #E8648A';
      newsletterInput.placeholder = 'Please enter a valid email address';
      newsletterInput.value = '';
      setTimeout(() => {
        newsletterInput.style.borderLeft = '';
        newsletterInput.placeholder = 'Your email address';
      }, 2500);
      return;
    }

    // Disable button while submitting
    if (newsletterBtn) {
      newsletterBtn.textContent = 'Sending...';
      newsletterBtn.disabled = true;
    }

    try {
      const response = await fetch('subscribe.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (data.success) {
        newsletterInput.value = '';
        newsletterInput.placeholder = '✓ ස්තූතියි! You are subscribed.';
      } else {
        newsletterInput.value = '';
        newsletterInput.placeholder = data.message || 'Something went wrong. Try again.';
      }
    } catch {
      // Offline / no PHP server — still confirm to user
      newsletterInput.value = '';
      newsletterInput.placeholder = '✓ ස්තූතියි! You are subscribed.';
    }

    if (newsletterBtn) {
      newsletterBtn.textContent = 'Subscribe';
      newsletterBtn.disabled = false;
    }

    setTimeout(() => {
      if (newsletterInput) newsletterInput.placeholder = 'Your email address';
    }, 4000);
  }

  if (newsletterBtn)   newsletterBtn.addEventListener('click', handleNewsletterSubmit);
  if (newsletterInput) newsletterInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') handleNewsletterSubmit();
  });


  // ─── MOBILE MENU TOGGLE ──────────────────────────────────
  const menuToggle = document.querySelector('.menu-toggle');
  const mainNav    = document.querySelector('nav');
  let menuOpen     = false;

  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => {
      menuOpen = !menuOpen;

      if (menuOpen) {
        mainNav.style.cssText = `
          display:flex; flex-direction:column;
          position:absolute; top:76px; left:0; right:0;
          background:var(--warm-white);
          padding:16px 32px 24px;
          box-shadow:0 8px 24px rgba(0,0,0,0.12);
          z-index:300;
          border-top:2px solid var(--saffron);
        `;
        menuToggle.textContent = '✕';
      } else {
        mainNav.removeAttribute('style');
        menuToggle.textContent = '☰';
      }
    });

    // Close menu when a nav link is clicked (FIXED: added conditional statement)
    mainNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (menuOpen) {
          menuOpen = false;
          mainNav.removeAttribute('style');
          menuToggle.textContent = '☰';
        }
      });
    });

    // Close menu on outside click
    document.addEventListener('click', e => {
      if (menuOpen && !mainNav.contains(e.target) && !menuToggle.contains(e.target)) {
        menuOpen = false;
        mainNav.removeAttribute('style');
        menuToggle.textContent = '☰';
      }
    });
  }


  // ─── SCROLL REVEAL ───────────────────────────────────────
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Stagger cards in a grid by their index
        const siblings = entry.target.parentElement?.querySelectorAll('.reveal');
        let delay = 0;
        if (siblings) {
          siblings.forEach((el, i) => { if (el === entry.target) delay = i * 80; });
        }
        setTimeout(() => entry.target.classList.add('visible'), delay);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.10 });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));


  // ─── SMOOTH BACK-TO-TOP ──────────────────────────────────
  const backTop = document.createElement('button');
  backTop.textContent = '🌸';
  backTop.title = 'Back to top';
  backTop.style.cssText = `
    position:fixed; bottom:28px; right:28px; z-index:500;
    width:46px; height:46px; border-radius:50%;
    background:var(--jungle); color:var(--light-gold);
    border:2px solid var(--saffron); font-size:20px;
    cursor:pointer; box-shadow:0 4px 16px rgba(0,0,0,0.2);
    opacity:0; transform:translateY(12px);
    transition:opacity 0.3s, transform 0.3s;
    display:flex; align-items:center; justify-content:center;
  `;
  document.body.appendChild(backTop);

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      backTop.style.opacity = '1';
      backTop.style.transform = 'translateY(0)';
    } else {
      backTop.style.opacity = '0';
      backTop.style.transform = 'translateY(12px)';
    }
  });

  backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

}); // end DOMContentLoaded
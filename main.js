// ── Glow Co. — Cart, Wishlist & Shared Logic ────────────────────────────────

// ── CART ─────────────────────────────────────────────────────────────────────
function getCart() {
  try { return JSON.parse(localStorage.getItem('glowco_cart')) || []; }
  catch (e) { return []; }
}

function saveCart(cart) {
  localStorage.setItem('glowco_cart', JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const cart = getCart();
  document.querySelectorAll('#cartCount').forEach(el => {
    el.textContent = cart.length;
    el.style.display = cart.length > 0 ? 'flex' : 'none';
  });
}

function addToCart(item) {
  const cart = getCart();
  const alreadyIn = cart.some(c => c.name === item.name);
  if (alreadyIn) {
    showConfirm(
      '🛍️ Already in your cart',
      '"' + item.name + '" is already in your cart. Add another one?',
      'Yes, add again', 'No thanks',
      () => {
        const c = getCart();
        c.push({ name: item.name, price: Number(item.price), image: item.image || '' });
        saveCart(c);
        showToast('✓ Another ' + item.name + ' added');
      }
    );
    return;
  }
  cart.push({ name: item.name, price: Number(item.price), image: item.image || '' });
  saveCart(cart);
  showToast('✓ ' + item.name + ' added to cart');
}

// ── WISHLIST ──────────────────────────────────────────────────────────────────
function getWishlist() {
  try { return JSON.parse(localStorage.getItem('glowco_wishlist')) || []; }
  catch (e) { return []; }
}

function saveWishlist(list) {
  localStorage.setItem('glowco_wishlist', JSON.stringify(list));
  updateWishlistCount();
}

function updateWishlistCount() {
  const list = getWishlist();
  document.querySelectorAll('#wishlistCount').forEach(el => {
    el.textContent = list.length;
    el.style.display = list.length > 0 ? 'flex' : 'none';
  });
}

function toggleWishlist(item) {
  let list = getWishlist();
  const idx = list.findIndex(w => w.name === item.name);
  if (idx > -1) {
    list.splice(idx, 1);
    saveWishlist(list);
    showToast('💔 Removed from wishlist');
    return false;
  } else {
    list.push({ name: item.name, price: Number(item.price), image: item.image || '' });
    saveWishlist(list);
    showToast('❤️ Saved to wishlist');
    return true;
  }
}

function isWishlisted(name) {
  return getWishlist().some(w => w.name === name);
}

function updateHeartButtons() {
  document.querySelectorAll('.wish-btn').forEach(btn => {
    const wished = isWishlisted(btn.dataset.name);
    btn.classList.toggle('wished', wished);
    btn.title = wished ? 'Remove from wishlist' : 'Save to wishlist';
  });
}

// ── REVIEWS ───────────────────────────────────────────────────────────────────
function getReviews() {
  try { return JSON.parse(localStorage.getItem('glowco_reviews')) || {}; }
  catch (e) { return {}; }
}

function saveReview(productName, review) {
  const all = getReviews();
  if (!all[productName]) all[productName] = [];
  all[productName].unshift(review);
  localStorage.setItem('glowco_reviews', JSON.stringify(all));
}

function getProductRating(productName) {
  const all = getReviews();
  const list = all[productName] || [];
  if (!list.length) return { avg: 0, count: 0 };
  const avg = list.reduce((s, r) => s + r.stars, 0) / list.length;
  return { avg: Math.round(avg * 10) / 10, count: list.length };
}

function renderStars(rating, interactive, onSelect) {
  let html = '<span class="stars-row">';
  for (let i = 1; i <= 5; i++) {
    const filled = i <= Math.round(rating);
    if (interactive) {
      html += `<span class="star-btn${filled ? ' on' : ''}" data-val="${i}" role="button" aria-label="${i} stars">★</span>`;
    } else {
      html += `<span class="star-display${filled ? ' on' : ''}">★</span>`;
    }
  }
  html += '</span>';
  return html;
}

// ── CONFIRM POP-UP ────────────────────────────────────────────────────────────
function showConfirm(title, message, confirmLabel, cancelLabel, onConfirm) {
  const existing = document.getElementById('glowConfirm');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'glowConfirm';
  overlay.style.cssText = `
    position:fixed;inset:0;z-index:8000;
    display:flex;align-items:center;justify-content:center;padding:20px;
    background:rgba(44,26,46,0.45);backdrop-filter:blur(4px);
    animation:gcFadeIn 0.2s ease;
  `;
  overlay.innerHTML = `
    <div style="background:#fff;border-radius:20px;padding:32px 28px 24px;max-width:360px;width:100%;
      box-shadow:0 24px 64px rgba(44,26,46,0.22);text-align:center;animation:gcSlideUp 0.25s cubic-bezier(0.4,0,0.2,1);">
      <div style="font-size:2.2rem;margin-bottom:12px;">${title.split(' ')[0]}</div>
      <h3 style="font-family:'Cormorant Garamond',Georgia,serif;font-size:1.25rem;font-weight:600;
        color:#2C1A2E;margin-bottom:10px;line-height:1.3;">${title.replace(title.split(' ')[0], '').trim()}</h3>
      <p style="font-size:0.88rem;color:#8A607A;line-height:1.6;margin-bottom:24px;">${message}</p>
      <div style="display:flex;gap:10px;">
        <button id="gcCancel" style="flex:1;padding:12px;border-radius:50px;border:1.5px solid #FFE8EF;
          background:transparent;color:#8A607A;font-size:0.85rem;font-weight:500;cursor:pointer;
          transition:all 0.2s;font-family:inherit;">${cancelLabel}</button>
        <button id="gcConfirm" style="flex:1;padding:12px;border-radius:50px;border:none;
          background:linear-gradient(135deg,#2C1A2E,#E8809E);color:#fff;font-size:0.85rem;font-weight:600;
          cursor:pointer;transition:all 0.2s;font-family:inherit;letter-spacing:0.03em;">${confirmLabel}</button>
      </div>
    </div>`;

  if (!document.getElementById('gcStyles')) {
    const style = document.createElement('style');
    style.id = 'gcStyles';
    style.textContent = `
      @keyframes gcFadeIn  { from{opacity:0} to{opacity:1} }
      @keyframes gcSlideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
      .star-btn,.star-display{color:#ddd;font-size:1.4rem;cursor:pointer;transition:color 0.15s;user-select:none;}
      .star-btn.on,.star-display.on{color:#E8809E;}
      .star-btn:hover,.star-btn:hover~.star-btn{color:#E8809E;}
      .stars-row{display:inline-flex;gap:2px;}
      .wish-btn{background:none;border:none;font-size:1.3rem;cursor:pointer;line-height:1;
        color:#ccc;transition:color 0.2s,transform 0.2s;padding:4px;}
      .wish-btn.wished{color:#E8809E;}
      .wish-btn:hover{transform:scale(1.2);}
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(overlay);
  const close = () => overlay.remove();
  document.getElementById('gcConfirm').addEventListener('click', () => { onConfirm(); close(); });
  document.getElementById('gcCancel').addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
}

// ── TOAST ─────────────────────────────────────────────────────────────────────
function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 3000);
}

function formatPrice(num) {
  return '₦' + Number(num).toLocaleString('en-NG');
}

// ── MOBILE NAV ────────────────────────────────────────────────────────────────
function initMobileNav() {
  const header = document.getElementById('header');
  if (!header) return;
  const inner = header.querySelector('.header-inner');
  if (!inner || document.getElementById('mobileMenuBtn')) return;

  const btn = document.createElement('button');
  btn.id = 'mobileMenuBtn';
  btn.setAttribute('aria-label', 'Open menu');
  btn.innerHTML = '<span></span><span></span><span></span>';
  inner.appendChild(btn);

  const nav = header.querySelector('nav');
  btn.addEventListener('click', () => {
    const open = nav.classList.toggle('mobile-open');
    btn.classList.toggle('open', open);
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });

  document.addEventListener('click', e => {
    if (!header.contains(e.target)) {
      nav.classList.remove('mobile-open');
      btn.classList.remove('open');
    }
  });
}

// ── BOOTSTRAP ON LOAD ─────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
  updateWishlistCount();
  initMobileNav();

  document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', () => addToCart({
      name: btn.dataset.name, price: btn.dataset.price, image: btn.dataset.image || ''
    }));
  });

  document.querySelectorAll('.quick-add').forEach(btn => {
    btn.addEventListener('click', () => addToCart({
      name: btn.dataset.name, price: btn.dataset.price, image: btn.dataset.image || ''
    }));
  });

  document.querySelectorAll('.wish-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const active = toggleWishlist({ name: btn.dataset.name, price: btn.dataset.price, image: btn.dataset.image || '' });
      btn.classList.toggle('wished', active);
    });
  });

  updateHeartButtons();
});
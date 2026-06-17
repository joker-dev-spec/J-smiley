// ── Glow Co. — Cart & Shared Logic ──────────────────────────────────────────

function getCart() {
  return JSON.parse(localStorage.getItem('glowco_cart')) || [];
}

function saveCart(cart) {
  localStorage.setItem('glowco_cart', JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const cart = getCart();
  const countEls = document.querySelectorAll('#cartCount');
  countEls.forEach(el => {
    el.textContent = cart.length;
    el.style.display = cart.length > 0 ? 'flex' : 'none';
  });
}

function addToCart(item) {
  const cart = getCart();
  cart.push({ name: item.name, price: Number(item.price), image: item.image });
  saveCart(cart);
  showToast(`✓ ${item.name} added to cart`);
}

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

// Wire up all .add-to-cart buttons
document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();

  document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', () => {
      addToCart({
        name:  btn.dataset.name,
        price: btn.dataset.price,
        image: btn.dataset.image,
      });
    });
  });
});

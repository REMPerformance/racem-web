// RACEM CART SYSTEM (localStorage based)

const CART_KEY = "racem_cart";

// načítanie košíka
function getCart() {
  return JSON.parse(localStorage.getItem(CART_KEY)) || [];
}

// uloženie košíka
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}

// pridanie do košíka
function addToCart(product) {
  let cart = getCart();

  const existing = cart.find(
    item => item.variantId === product.variantId
  );

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      variantId: product.variantId,
      title: product.title,
      variantName: product.variantName,
      price: product.price,
      image: product.image,
      qty: 1
    });
  }

  saveCart(cart);
  alert("Pridané do košíka");
}

// odstránenie položky
function removeFromCart(variantId) {
  let cart = getCart().filter(item => item.variantId !== variantId);
  saveCart(cart);
  renderCart();
}

// zmena množstva
function changeQty(variantId, qty) {
  let cart = getCart();

  cart = cart.map(item => {
    if (item.variantId === variantId) {
      item.qty = Math.max(1, qty);
    }
    return item;
  });

  saveCart(cart);
  renderCart();
}

// počet položiek v ikone
function updateCartCount() {
  const cart = getCart();
  const count = cart.reduce((sum, item) => sum + item.qty, 0);

  const el = document.getElementById("cart-count");
  if (el) el.textContent = count;
}

// render košíka (cart.html)
function renderCart() {
  const container = document.getElementById("cart-items");
  if (!container) return;

  const cart = getCart();

  if (cart.length === 0) {
    container.innerHTML = "<p>Košík je prázdny</p>";
    return;
  }

  let total = 0;

  container.innerHTML = cart.map(item => {
    total += item.price * item.qty;

    return `
      <div class="cart-item">
        <img src="${item.image}" />
        <div>
          <strong>${item.title}</strong><br>
          ${item.variantName}<br>
          ${item.price} €
        </div>
        <div>
          <button onclick="changeQty('${item.variantId}', ${item.qty - 1})">-</button>
          ${item.qty}
          <button onclick="changeQty('${item.variantId}', ${item.qty + 1})">+</button>
        </div>
        <button onclick="removeFromCart('${item.variantId}')">X</button>
      </div>
    `;
  }).join("");

  const totalEl = document.getElementById("cart-total");
  if (totalEl) totalEl.textContent = total + " €";
}

// checkout → Shopify
function goToCheckout() {
  const cart = getCart();

  if (cart.length === 0) {
    alert("Košík je prázdny");
    return;
  }

  const items = cart.map(item => `${item.variantId}:${item.qty}`).join(",");

  const url = `https://shop.racem.sk/cart/${items}`;
  window.location.href = url;
}

// init
document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  renderCart();
});
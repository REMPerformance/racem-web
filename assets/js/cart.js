// RACEM CART SYSTEM

const RACEMCart = {
  KEY: "racem_cart",

  get() {
    return JSON.parse(localStorage.getItem(this.KEY) || "[]");
  },

  save(cart) {
    localStorage.setItem(this.KEY, JSON.stringify(cart));
    this.updateBadge();
  },

  add(item) {
    const cart = this.get();

    const existing = cart.find(
      (i) => i.variantId === item.variantId
    );

    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({
        ...item,
        qty: 1,
      });
    }

    this.save(cart);
    this.animateAdd();
  },

  remove(variantId) {
    let cart = this.get();
    cart = cart.filter((i) => i.variantId !== variantId);
    this.save(cart);
    location.reload();
  },

  setQty(variantId, qty) {
    const cart = this.get();

    const item = cart.find((i) => i.variantId === variantId);
    if (!item) return;

    item.qty = Math.max(1, qty);
    this.save(cart);
    location.reload();
  },

  clear() {
    localStorage.removeItem(this.KEY);
    this.updateBadge();
    location.reload();
  },

  count() {
    return this.get().reduce((sum, i) => sum + i.qty, 0);
  },

  total() {
    return this.get().reduce((sum, i) => sum + i.price * i.qty, 0);
  },

  updateBadge() {
    const el = document.querySelector(".cart-count");
    if (!el) return;
    el.textContent = this.count();
  },

  animateAdd() {
    const btn = document.querySelector(".add-to-cart-btn");
    if (!btn) return;

    btn.classList.add("added");
    btn.innerText = "Pridané ✓";

    setTimeout(() => {
      btn.classList.remove("added");
      btn.innerText = "Pridať do košíka";
    }, 1200);
  },

  checkout() {
    const cart = this.get();

    if (!cart.length) return;

    let url = "https://shop.racem.sk/cart/";

    const items = cart.map((i) => `${i.variantId}:${i.qty}`).join(",");

    window.location.href = url + items;
  },
};

// INIT
document.addEventListener("DOMContentLoaded", () => {
  RACEMCart.updateBadge();
});

// GLOBAL HANDLERS
function addToCart(data) {
  RACEMCart.add(data);
}

function removeFromCart(id) {
  RACEMCart.remove(id);
}

function changeQty(id, qty) {
  RACEMCart.setQty(id, qty);
}

function checkoutCart() {
  RACEMCart.checkout();
}

const RACEMCart = {
  KEY: "racem_cart",

  get() {
    try {
      return JSON.parse(localStorage.getItem(this.KEY) || "[]");
    } catch (e) {
      return [];
    }
  },

  save(cart) {
    localStorage.setItem(this.KEY, JSON.stringify(cart));
    this.updateBadge();
  },

  add(item) {
    const cart = this.get();

    const variantKey =
      item.variantId ||
      item.shopifyVariantId ||
      item.id ||
      item.title;

    const existing = cart.find(
      (i) =>
        (i.variantId || i.shopifyVariantId || i.id || i.title) === variantKey
    );

    if (existing) {
      existing.qty = (existing.qty || 1) + (item.qty || 1);
    } else {
      cart.push({
        ...item,
        variantId: item.variantId || item.shopifyVariantId || item.id || "",
        shopifyVariantId: item.shopifyVariantId || item.variantId || item.id || "",
        price: Number(item.price || item.priceEUR || item.priceValue || 0),
        qty: item.qty || 1
      });
    }

    this.save(cart);
  },

  remove(variantId) {
    let cart = this.get();
    cart = cart.filter(
      (i) =>
        (i.variantId || i.shopifyVariantId || i.id || i.title) !== variantId
    );
    this.save(cart);
  },

  setQty(variantId, qty) {
    const cart = this.get();
    const item = cart.find(
      (i) =>
        (i.variantId || i.shopifyVariantId || i.id || i.title) === variantId
    );

    if (!item) return;

    item.qty = Math.max(1, Number(qty) || 1);
    this.save(cart);
  },

  clear() {
    localStorage.removeItem(this.KEY);
    this.updateBadge();
  },

  count() {
    return this.get().reduce((sum, i) => sum + (Number(i.qty) || 0), 0);
  },

  total() {
    return this.get().reduce(
      (sum, i) => sum + (Number(i.price) || 0) * (Number(i.qty) || 0),
      0
    );
  },

  updateBadge() {
    const els = document.querySelectorAll(".cart-count");
    const count = this.count();

    els.forEach((el) => {
      el.textContent = count;
      el.style.display = count > 0 ? "inline-flex" : "none";
    });
  },

  checkout() {
    const cart = this.get();
    if (!cart.length) return;

    const items = cart
      .filter((i) => i.shopifyVariantId || i.variantId)
      .map((i) => `${i.shopifyVariantId || i.variantId}:${i.qty}`)
      .join(",");

    if (!items) {
      alert("V košíku nie sú platné Shopify varianty.");
      return;
    }

    window.location.href = `https://shop.racem.sk/cart/${items}`;
  }
};

window.RACEMCart = RACEMCart;

window.addToCart = function (data) {
  window.RACEMCart.add(data);
};

window.removeFromCart = function (id) {
  window.RACEMCart.remove(id);
};

window.changeQty = function (id, qty) {
  window.RACEMCart.setQty(id, qty);
};

window.checkoutCart = function () {
  window.RACEMCart.checkout();
};

document.addEventListener("DOMContentLoaded", () => {
  window.RACEMCart.updateBadge();
});

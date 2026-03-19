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
    window.dispatchEvent(new CustomEvent("racem:cart-updated", { detail: { cart } }));
  },

  add(item) {
    const cart = this.get();

    const variantKey =
      item.shopifyVariantId ||
      item.variantId ||
      item.key ||
      item.productId ||
      item.title;

    const existing = cart.find((i) => {
      const existingKey =
        i.shopifyVariantId ||
        i.variantId ||
        i.key ||
        i.productId ||
        i.title;
      return existingKey === variantKey;
    });

    if (existing) {
      existing.qty = Number(existing.qty || 1) + Number(item.qty || 1);
    } else {
      cart.push({
        key: item.key || variantKey,
        productId: item.productId || "",
        title: item.title || "Produkt",
        short: item.short || "",
        variantName: item.variantName || "Variant",
        shopifyVariantId: item.shopifyVariantId || item.variantId || "",
        variantId: item.variantId || item.shopifyVariantId || "",
        price: Number(item.price ?? item.priceEUR ?? item.priceValue ?? 0),
        image: item.image || "",
        qty: Number(item.qty || 1),
        url: item.url || ""
      });
    }

    this.save(cart);
  },

  remove(variantId) {
    const cart = this.get().filter((i) => {
      const key =
        i.shopifyVariantId ||
        i.variantId ||
        i.key ||
        i.productId ||
        i.title;
      return key !== variantId;
    });
    this.save(cart);
  },

  setQty(variantId, qty) {
    const cart = this.get();
    const item = cart.find((i) => {
      const key =
        i.shopifyVariantId ||
        i.variantId ||
        i.key ||
        i.productId ||
        i.title;
      return key === variantId;
    });

    if (!item) return;

    item.qty = Math.max(1, Number(qty) || 1);
    this.save(cart);
  },

  clear() {
    localStorage.removeItem(this.KEY);
    this.updateBadge();
    window.dispatchEvent(new CustomEvent("racem:cart-updated", { detail: { cart: [] } }));
  },

  count() {
    return this.get().reduce((sum, i) => sum + Number(i.qty || 0), 0);
  },

  total() {
    return this.get().reduce((sum, i) => {
      return sum + Number(i.price || 0) * Number(i.qty || 0);
    }, 0);
  },

  updateBadge() {
    const count = this.count();
    document.querySelectorAll(".cart-count").forEach((el) => {
      el.textContent = String(count);
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

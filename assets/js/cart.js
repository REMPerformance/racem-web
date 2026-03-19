const RACEMCart = {
  KEY: "racem_cart",

  get() {
    try {
      const cart = JSON.parse(localStorage.getItem(this.KEY) || "[]");
      return Array.isArray(cart) ? cart.map((item) => this.normalizeItem(item)) : [];
    } catch (e) {
      return [];
    }
  },

  save(cart) {
    const normalized = Array.isArray(cart)
      ? cart.map((item) => this.normalizeItem(item))
      : [];
    localStorage.setItem(this.KEY, JSON.stringify(normalized));
    this.updateBadge();
    window.dispatchEvent(new CustomEvent("racem:cart-updated", { detail: { cart: normalized } }));
  },

  normalizePrice(item) {
    const raw =
      item?.price ??
      item?.priceEUR ??
      item?.priceValue ??
      item?.finalPrice ??
      item?.amount ??
      0;

    const num = Number(raw);
    return Number.isFinite(num) ? num : 0;
  },

  normalizeItem(item) {
    const normalizedPrice = this.normalizePrice(item);

    return {
      ...item,
      key:
        item?.key ||
        item?.shopifyVariantId ||
        item?.variantId ||
        item?.productId ||
        item?.title ||
        "",
      productId: item?.productId || "",
      title: item?.title || "Produkt",
      short: item?.short || "",
      variantName: item?.variantName || item?.name || "Variant",
      shopifyVariantId: item?.shopifyVariantId || item?.variantId || "",
      variantId: item?.variantId || item?.shopifyVariantId || "",
      price: normalizedPrice,
      priceEUR: normalizedPrice,
      image: item?.image || "",
      qty: Math.max(1, Number(item?.qty || 1)),
      url: item?.url || ""
    };
  },

  add(item) {
    const cart = this.get();
    const normalizedItem = this.normalizeItem(item);

    const variantKey =
      normalizedItem.shopifyVariantId ||
      normalizedItem.variantId ||
      normalizedItem.key ||
      normalizedItem.productId ||
      normalizedItem.title;

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
      existing.qty = Number(existing.qty || 1) + Number(normalizedItem.qty || 1);

      if ((!existing.price || Number(existing.price) === 0) && normalizedItem.price > 0) {
        existing.price = normalizedItem.price;
      }
      if ((!existing.priceEUR || Number(existing.priceEUR) === 0) && normalizedItem.priceEUR > 0) {
        existing.priceEUR = normalizedItem.priceEUR;
      }
      if ((!existing.image || existing.image === "") && normalizedItem.image) {
        existing.image = normalizedItem.image;
      }
      if ((!existing.url || existing.url === "") && normalizedItem.url) {
        existing.url = normalizedItem.url;
      }
    } else {
      cart.push(normalizedItem);
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
      return sum + this.normalizePrice(i) * Number(i.qty || 0);
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
  const cart = window.RACEMCart.get();
  window.RACEMCart.save(cart);
});

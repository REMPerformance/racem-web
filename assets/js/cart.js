(function () {
  const STORAGE_KEY = "racem_cart";

  function readCart() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function writeCart(cart) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    updateBadges();
    window.dispatchEvent(new CustomEvent("racem:cart-updated", { detail: { cart } }));
  }

  function totalCount(cart) {
    return cart.reduce((sum, item) => sum + Math.max(1, Number(item.qty || 1)), 0);
  }

  function updateBadges() {
    const count = totalCount(readCart());
    document.querySelectorAll("[data-cart-count]").forEach(el => {
      el.textContent = String(count);
    });
  }

  // 🔥 TOAST
  function ensureToast() {
    let toast = document.getElementById("racem-cart-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "racem-cart-toast";
      toast.innerHTML = '<span class="toast-check">✓</span><span>Produkt bol pridaný do košíka</span>';
      document.body.appendChild(toast);
    }
    return toast;
  }

  function showCartToast(message = "Produkt bol pridaný do košíka") {
    const toast = ensureToast();
    toast.querySelector("span:last-child").textContent = message;
    toast.classList.remove("show");
    void toast.offsetWidth;
    toast.classList.add("show");

    clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(() => {
      toast.classList.remove("show");
    }, 2200);
  }

  // 🔥 ICON BUMP
  function bumpCartIcons() {
    document.querySelectorAll("[data-cart-icon]").forEach(el => {
      el.classList.remove("cart-bump");
      void el.offsetWidth;
      el.classList.add("cart-bump");
    });
  }

  function add(item) {
    if (!item || !item.shopifyVariantId) return false;

    const cart = readCart();
    const key = item.key || `${item.productId || "product"}__${item.shopifyVariantId}`;
    const existing = cart.find(x => String(x.key) === String(key));

    if (existing) {
      existing.qty = Math.max(1, Number(existing.qty || 1)) + 1;
    } else {
      cart.push({
        key,
        productId: item.productId || "",
        title: item.title || "Produkt",
        variantName: item.variantName || "Variant",
        shopifyVariantId: String(item.shopifyVariantId),
        priceEUR: Number(item.priceEUR || 0),
        image: item.image || "/assets/placeholder.webp",
        url: item.url || window.location.pathname,
        qty: 1
      });
    }

    writeCart(cart);

    // 🔥 ANIMÁCIA
    showCartToast();
    bumpCartIcons();

    return true;
  }

  function remove(key) {
    const cart = readCart().filter(item => String(item.key) !== String(key));
    writeCart(cart);
  }

  function setQty(key, qty) {
    const amount = Math.max(1, Number(qty || 1));
    const cart = readCart().map(item => {
      if (String(item.key) === String(key)) item.qty = amount;
      return item;
    });
    writeCart(cart);
  }

  function clear() {
    writeCart([]);
  }

  function checkout() {
    const cart = readCart();

    if (!cart.length) {
      alert("Košík je prázdny.");
      return;
    }

    const parts = cart.map(item =>
      `${item.shopifyVariantId}:${Math.max(1, Number(item.qty || 1))}`
    );

    window.location.href = `https://shop.racem.sk/cart/${parts.join(",")}`;
  }

  window.RACEMCart = {
    get: readCart,
    add,
    remove,
    setQty,
    clear,
    checkout,
    updateBadges
  };

  document.addEventListener("DOMContentLoaded", updateBadges);
})();

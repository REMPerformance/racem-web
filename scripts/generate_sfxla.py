import json
import os
from pathlib import Path
from html import escape

# --- cesty ---
ROOT = Path(__file__).resolve().parent.parent
JSON_FILE = ROOT / "sfxla-products.json"
TEMPLATE_FILE = ROOT / "products" / "template.html"
OUTPUT_DIR = ROOT / "products" / "generated"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# --- načítaj template ---
template = TEMPLATE_FILE.read_text(encoding="utf-8")

# --- načítaj JSON ---
data = json.loads(JSON_FILE.read_text(encoding="utf-8"))
products = data.get("products", [])

def fmt_shipping(value):
    if isinstance(value, (int, float)) and value > 0:
        return f"{value} €"
    return "upresníme po objednávke"

def fmt_stock(status):
    if status == "in_stock":
        return "Skladom"
    if status == "out_of_stock":
        return "Vypredané"
    return "Na objednávku"

def build_gallery(images):
    if not images:
        return '<img src="/assets/placeholder.webp" alt="Produkt">'
    return "\n".join(
        f'<img src="/{escape(img)}" alt="Produktový obrázok">'
        for img in images
    )

def build_variants(variants):
    if not variants:
        return '<div class="variant">Cena na dopyt</div>'

    out = []
    for v in variants:
        name = escape(str(v.get("name", "Variant")))
        price = v.get("priceEUR")
        shopify_variant_id = v.get("shopifyVariantId")

        if isinstance(price, (int, float)):
            price_text = f"{price} €"
        else:
            price_text = "cena na dopyt"

        line = f"<div class='variant'><strong>{name}</strong> — {price_text}"

        if shopify_variant_id:
            line += f"<br><small>Variant ID: {shopify_variant_id}</small>"

        line += "</div>"
        out.append(line)

    return "\n".join(out)

def first_shopify_variant_url(variants):
    for v in variants:
        variant_id = v.get("shopifyVariantId")
        if variant_id:
            return f"https://shop.racem.sk/cart/{variant_id}:1"
    return "https://shop.racem.sk/"

for p in products:
    slug = p.get("id", "produkt")
    title = p.get("title", "Produkt")
    short = p.get("short", "")
    description = p.get("description", "")
    category = p.get("category", "Nezaradené")
    delivery = p.get("delivery", "Upresníme po objednávke")
    shipping = fmt_shipping(p.get("shippingEUR"))
    stock = fmt_stock(p.get("stockStatus"))
    images = p.get("images", [])
    variants = p.get("variants", [])

    html = template
    html = html.replace("{{SLUG}}", escape(slug))
    html = html.replace("{{TITLE}}", escape(title))
    html = html.replace("{{SHORT}}", escape(short))
    html = html.replace("{{CATEGORY}}", escape(category))
    html = html.replace("{{DELIVERY}}", escape(delivery))
    html = html.replace("{{SHIPPING}}", escape(shipping))
    html = html.replace("{{STOCK}}", escape(stock))
    html = html.replace("{{DESCRIPTION}}", escape(description))
    html = html.replace("{{GALLERY}}", build_gallery(images))
    html = html.replace("{{VARIANTS}}", build_variants(variants))
    html = html.replace("{{SHOPIFY_URL}}", first_shopify_variant_url(variants))

    out_file = OUTPUT_DIR / f"{slug}.html"
    out_file.write_text(html, encoding="utf-8")

print(f"Hotovo. Vygenerovaných stránok: {len(products)}")
print(f"Nájdeš ich tu: {OUTPUT_DIR}")

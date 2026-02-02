const fs = require('fs');
const path = require('path');

const inputFolder = './'; 
const outputFolder = './spracovane_jsony/';

if (!fs.existsSync(outputFolder)) fs.mkdirSync(outputFolder);

const files = fs.readdirSync(inputFolder).filter(f => f.endsWith('.json'));

files.forEach(file => {
    let rawData;
    try {
        rawData = JSON.parse(fs.readFileSync(path.join(inputFolder, file), 'utf8'));
    } catch (e) {
        console.error(`❌ Chyba pri čítaní súboru ${file}:`, e.message);
        return;
    }

    const grouped = {};

    rawData.forEach((item, index) => {
        // OCHRANA: Ak chýba SKU alebo Model, vypíšeme chybu a preskočíme produkt
        if (!item.sku || !item.model) {
            console.warn(`⚠️  V súbore ${file} na pozícii ${index} chýba SKU alebo Model. Preskakujem...`);
            return; 
        }

        const lastDashIndex = item.sku.lastIndexOf('-');
        const baseSku = lastDashIndex !== -1 ? item.sku.substring(0, lastDashIndex) : item.sku;
        
        if (!grouped[baseSku]) {
            grouped[baseSku] = {
                manufacturer: item.manufacturer || "Neznámy",
                // Bezpečné ošetrenie rozdelenia mena
                model_base: item.model.includes('-') ? item.model.split('-')[0].trim() : item.model,
                base_sku: baseSku,
                description: item.description || "",
                variants: []
            };
        }

        grouped[baseSku].variants.push({
            sku: item.sku,
            price: item.priceEUR,
            gtin: item.gtin,
            title: item.title,
            images: item.images || []
        });
    });

    fs.writeFileSync(
        path.join(outputFolder, file), 
        JSON.stringify(Object.values(grouped), null, 2), 
        'utf8'
    );
    console.log(`✅ Súbor ${file} úspešne spracovaný.`);
});

console.log('\n🚀 Hotovo! Skontroluj priečinok "spracovane_jsony".');
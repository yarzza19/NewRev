const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function scrapeAll() {
    try {
        console.log("Cargando web de car.info...");
        const res = await axios.get('https://www.car.info/en-se/brands', {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36' }
        });
        const $ = cheerio.load(res.data);

        const allBrands = [];

        // Select all the car links in the grid.
        $('a.b-item').each((i, el) => {
            const url = $(el).attr('href');
            // The brand name is usually within a span with class "logo-text"
            let name = $(el).find('span.logo-text').first().text().trim();
            if (!name) {
                // fallback just in case
                name = $(el).children().last().text().trim();
            }
            if (!name) name = url.split('/').pop().toUpperCase();

            if (url && url.startsWith('/en-se/')) {
                if (name.length > 0) {
                    allBrands.push({ brand: name, url: 'https://www.car.info' + url });
                }
            }
        });

        // Ensure there's no duplicates and no garbage
        const unique = [];
        const seen = new Set();
        for (const b of allBrands) {
            if (!seen.has(b.brand) && !b.url.includes('/info/') && !b.url.includes('/news/')) {
                seen.add(b.brand);
                // Push the base objects. For the UI demonstration without crushing APIs, 
                // we'll populate models dynamically ONLY if they have them, but for now we'll 
                // insert standard blank arrays knowing we've added thousands of brands.
                unique.push({ brand: b.brand, models: [] });
            }
        }

        console.log(`Encontradas: ${unique.length} marcas exactas!`);
        fs.writeFileSync('coches.json', JSON.stringify(unique, null, 2));
        console.log("¡Sobreescrito coches.json con TODAS las marcas!");

    } catch (e) {
        console.error("Error", e);
    }
}

scrapeAll();

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function run() {
    try {
        console.log("Fetching brands page...");
        const res = await axios.get('https://www.car.info/en-se/brands', {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36' }
        });
        const $ = cheerio.load(res.data);
        const brands = [];

        $('a').each((i, el) => {
            const href = $(el).attr('href');
            if (href && href.startsWith('/en-se/') && href.split('/').length === 3) {
                const text = $(el).text().trim().replace(/\n/g, '').replace(/\s+/g, ' ');
                if (text && !['News', 'About us', 'Terms of use', 'Privacy policy', 'Car statistics', 'Products and services'].includes(text)) {
                    if (!brands.find(b => b.name === text || b.url === href)) {
                        brands.push({ name: text, url: `https://www.car.info${href}` });
                    }
                }
            }
        });

        console.log(`Found ${brands.length} brand links.`);
        const validBrands = brands.filter(b => b.name.length >= 2 && !b.url.includes('/info/') && !b.url.includes('/news/'));
        console.log(`Found ${validBrands.length} valid brands. We will fetch the first 30 for the demonstration to avoid blocks or massive wait times.`);

        const toFetch = validBrands.slice(0, 30);
        const cochesData = [];

        for (let i = 0; i < toFetch.length; i++) {
            const brand = toFetch[i];
            console.log(`[${i + 1}/${toFetch.length}] Fetching models for: ${brand.name}`);
            try {
                const bRes = await axios.get(brand.url, {
                    headers: { 'User-Agent': 'Mozilla/5.0' }
                });
                const $b = cheerio.load(bRes.data);
                const models = new Set();

                $b('a').each((i, el) => {
                    const href = $b(el).attr('href');
                    if (href && href.startsWith(brand.url.replace('https://www.car.info', '')) && href.split('/').length === 4) {
                        const mText = $b(el).text().trim().replace(/\n/g, '').replace(/\s+/g, ' ');
                        if (mText && mText.length > 1 && !mText.includes('Generation') && !mText.includes('Facelift')) {
                            models.add(mText);
                        }
                    }
                });

                // Also get the logo if possible
                let logoUrl = '';
                const logoImg = $b('img.logo, img[src*="logo"]').first();
                if (logoImg.length > 0) logoUrl = logoImg.attr('src');

                cochesData.push({
                    brand: brand.name,
                    logo: logoUrl,
                    models: Array.from(models).slice(0, 15) // limit to 15 models per brand so UI doesn't blow up too much
                });
            } catch (err) {
                console.error(`Failed to fetch ${brand.name}: ${err.message}`);
            }

            await new Promise(r => setTimeout(r, 100)); // Rate limit 100ms
        }

        fs.writeFileSync('coches.json', JSON.stringify(cochesData, null, 2));
        console.log("Saved to coches.json!");

    } catch (error) {
        console.error("Error global:", error.message);
    }
}

run();

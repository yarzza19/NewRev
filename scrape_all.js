const https = require('https');
const fs = require('fs');
const cheerio = require('cheerio');

async function getPage(page) {
    return new Promise((resolve, reject) => {
        const url = page === 0 ? 'https://www.car.info/en-se/brands' : `https://www.car.info/en-se/brands?page=${page}`;
        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        };

        if (page > 0) {
            options.headers['X-Requested-With'] = 'XMLHttpRequest';
        }

        https.get(url, options, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', err => reject(err));
    });
}

async function scrapeReal() {
    let page = 0;
    let keepGoing = true;
    let allBrands = [];

    while (keepGoing) {
        try {
            console.log(`Fetching page ${page}...`);
            const html = await getPage(page);
            const $ = cheerio.load(html);
            let count = 0;

            $('a.brand_name').each((i, el) => {
                const url = $(el).attr('href');
                const brand = $(el).text().trim();

                if (url && brand) {
                    allBrands.push({
                        brand: brand,
                        url: url,
                        models: []
                    });
                    count++;
                }
            });

            console.log(`Página ${page}: ${count} marcas extraídas.`);

            if (count === 0) {
                // To debug, dump HTML of the last failed page if it's page 0
                if (page === 0) {
                    fs.writeFileSync('failed_page0.html', html);
                }
                keepGoing = false;
            } else {
                page++;
                // be nice, sleep 500ms
                await new Promise(r => setTimeout(r, 500));
            }
        } catch (e) {
            console.error(e.message);
            keepGoing = false;
        }
    }

    // Remove duplicates based on brand name
    const unique = [];
    const seen = new Set();
    for (const b of allBrands) {
        if (!seen.has(b.brand) && b.brand.length > 0) {
            seen.add(b.brand);
            unique.push(b);
        }
    }

    console.log(`Completado. Total de marcas únicas: ${unique.length}`);
    fs.writeFileSync('coches.json', JSON.stringify(unique, null, 2));
}

scrapeReal();

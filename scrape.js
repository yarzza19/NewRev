const https = require('https');
const fs = require('fs');

function fetchData(url) {
    return new Promise((resolve, reject) => {
        https.get('https://www.car.info' + url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'Accept': 'text/html'
            }
        }, (res) => {
            if (res.statusCode === 301 || res.statusCode === 302) {
                return fetchData(res.headers.location.replace('https://www.car.info', '')).then(resolve).catch(reject);
            }
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

async function scrape() {
    console.log("Fetching brands page...");
    const html = await fetchData('/en-se/brands');
    console.log("Fetched " + html.length + " bytes");

    // Find brand links, e.g. <a class="logo-text" href="/en-se/volvo">Volvo</a>
    // Or from the list under "a.b-item"
    const brands = [];
    const regex = /<a[^>]+href="(\/en-se\/[^"]+)"[^>]*>\s*<span[^>]*>([^<]+)<\/span>\s*<\/a>|<a[^>]+href="(\/en-se\/[^"]+)"[^>]*>([^<]+)<\/a>/g;
    let match;
    while ((match = regex.exec(html)) !== null) {
        const url = match[1] || match[3];
        const name = (match[2] || match[4]).trim();
        if (url && name && url.split('/').length === 3 && !brands.find(b => b.name === name) && !url.includes('/info/') && !url.includes('/news/')) {
            // Check if it's a valid brand page link and not a top menu link
            if (name !== 'About us' && name !== 'News' && name !== 'Products and services' && name !== 'Search car registry' && !name.includes('car')) {
                brands.push({ name, url });
            }
        }
    }

    console.log(`Found ${brands.length} brands. Getting models for top 10 as an example...`);
    const results = [];
    const limit = Math.min(brands.length, 10); // LIMIT FOR NOW TO TEST
    for (let i = 0; i < limit; i++) {
        const b = brands[i];
        console.log(`Fetching models for ${b.name}...`);
        try {
            const bHtml = await fetchData(b.url);
            const models = new Set();
            const bRegex = /<a[^>]+href="(\/en-se\/[a-z0-9-]+\/[a-z0-9-]+)"[^>]*>([^<]+)<\/a>/g;
            let mMatch;
            while ((mMatch = bRegex.exec(bHtml)) !== null) {
                if (mMatch[1].startsWith(b.url) && mMatch[2].trim().length > 0) {
                    models.add(mMatch[2].trim());
                }
            }
            results.push({ name: b.name, url: b.url, models: Array.from(models) });
        } catch (e) { console.error("Error fetching", b.name); }
    }

    fs.writeFileSync('coches.json', JSON.stringify(results, null, 2));
    console.log("DONE!");
}

scrape();

const axios = require('axios');
const fs = require('fs');

async function getRedClioUrl() {
    try {
        const res = await axios.get('https://html.duckduckgo.com/html/?q=renault+clio+1+6376+YP+92');
        let html = res.data;
        let match = html.match(/src="\/\/([^"]+)"/);
        if (match) {
            let imgUrl = 'https://' + match[1];

            // update JSON
            let data = JSON.parse(fs.readFileSync('coches.json', 'utf8'));
            let ren = data.find(c => c.brand.toLowerCase() === 'renault');
            if (ren) {
                ren.models[0].submodels[0].submodels[0].image = imgUrl; // Gasolina
                ren.models[0].submodels[0].submodels[1].image = imgUrl; // Diesel
                fs.writeFileSync('coches.json', JSON.stringify(data, null, 2));
                console.log('Updated JSON with image: ' + imgUrl);
            }
        } else {
            console.log('No image found');
        }
    } catch (e) {
        console.log(e);
    }
}
getRedClioUrl();

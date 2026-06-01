const fs = require('fs');
const https = require('https');

const url = 'https://upload.wikimedia.org/wikipedia/commons/2/23/Renault_Clio_1.4_RN_1992.jpg';
const dest = 'assets/img/clio-red.jpg';

const file = fs.createWriteStream(dest);
https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, function (response) {
    response.pipe(file);
    file.on('finish', function () {
        file.close();
        console.log("Downloaded image successfully");

        // update coches.json
        let data = JSON.parse(fs.readFileSync('coches.json', 'utf8'));
        let ren = data.find(c => c.brand.toLowerCase() === 'renault');
        if (ren) {
            ren.models[0].submodels[0].submodels[0].image = '/assets/img/clio-red.jpg';
            ren.models[0].submodels[0].submodels[1].image = '/assets/img/clio-red.jpg';
            fs.writeFileSync('coches.json', JSON.stringify(data, null, 2));
            console.log("Updated config to use local image.");
        }
    });
}).on('error', function (err) {
    fs.unlink(dest, () => console.log("Error downloading:", err.message));
});

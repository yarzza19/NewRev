import path from 'path';
import fs from 'fs';

/**
 * 🛠️ PANEL DE CONTROL DE ADMINISTRADOR (NewRev)
 * 
 * Este archivo contiene las funciones que TÚ usas para acceder 
 * a la Bóveda Privada desde el backend.
 */

// Localización de la Bóveda Local
const VAULT_PATH = path.join(process.cwd(), 'boveda_segura_newrev');

/**
 * Lista todos los archivos originales disponibles para fabricar
 */
export const listModelsInVault = (req, res) => {
    // En producción, aquí verificarías: if(!req.user.isAdmin) ...

    fs.readdir(VAULT_PATH, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'No se pudo leer la bóveda.' });
        }
        // Filtramos para ver solo archivos de diseño
        const models = files.filter(file =>
            file.endsWith('.stl') || file.endsWith('.step') || file.endsWith('.stp')
        );
        res.json({ models });
    });
};

/**
 * Descarga el archivo original para meterlo a la impresora 3D
 */
export const downloadOriginal = (req, res) => {
    const fileName = req.params.fileName;
    const filePath = path.join(VAULT_PATH, fileName);

    if (fs.existsSync(filePath)) {
        console.log(`📦 Enviando archivo a fabricación: ${fileName}`);
        res.download(filePath);
    } else {
        res.status(404).json({ error: 'El archivo no existe en la bóveda segura.' });
    }
};

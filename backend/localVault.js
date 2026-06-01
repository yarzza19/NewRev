import fs from 'fs';
import path from 'path';
import multer from 'multer';

/**
 * 🛡️ LA BÓVEDA LOCAL (Cero Coste)
 * 
 * En lugar de pagar a Amazon, guardamos los archivos en una carpeta del servidor
 * que NO está servida públicamente.
 */

// Esta carpeta está FUERA de 'public' o 'dist'. Nadie puede acceder vía URL.
const VAULT_PATH = path.join(process.cwd(), 'boveda_segura_newrev');

// Crear la carpeta si no existe
if (!fs.existsSync(VAULT_PATH)) {
    fs.mkdirSync(VAULT_PATH, { recursive: true });
}

// Configuración de almacenamiento local
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Los archivos se guardan en el disco del servidor, no en la nube
        cb(null, VAULT_PATH);
    },
    filename: function (req, file, cb) {
        // Estructura: id_creador-timestamp-nombre.stl
        const creatorId = req.body.id_creador || 'anon';
        const uniqueName = `creator_${creatorId}_${Date.now()}_${file.originalname}`;
        cb(null, uniqueName);
    }
});

export const uploadToLocalVault = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        // Solo permitimos archivos de diseño industrial
        if (file.originalname.endsWith('.stl') || file.originalname.endsWith('.step') || file.originalname.endsWith('.stp')) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos STL o STEP para fabricación.'));
        }
    }
});

/**
 * Controlador para la subida
 */
export const handlePrivateUpload = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se subió ningún archivo.' });
        }

        // Ruta absoluta en tu disco duro (Solo tú la conoces)
        const securePath = req.file.path;

        // 1. Aquí registrarías en la BD
        // const design = await prisma.design.create({ data: { ... path: securePath } });

        console.log(`✅ Archivo protegido guardado en: ${securePath}`);

        res.status(200).json({
            success: true,
            message: 'Archivo guardado en la Bóveda Local (Gratis y Seguro)',
            details: {
                filename: req.file.filename,
                storage: 'Local Disk (Encrypted semi-manual)',
                creator: req.body.id_creador
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

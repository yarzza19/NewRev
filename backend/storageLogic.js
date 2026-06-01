import AWS from 'aws-sdk';
import multer from 'multer';
import multerS3 from 'multer-s3';

// 1. Configurar AWS S3 (o Google Cloud Storage)
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

// Este bucket NO permite acceso público. Solo el backend con las credenciales puede leerlo.
const PRIVATE_BUCKET = process.env.AWS_PRIVATE_BUCKET_NAME;

// 2. Configuración de Multer para subir el archivo directamente al Bóveda Privada
export const uploadOriginalModel = multer({
    storage: multerS3({
        s3: s3,
        bucket: PRIVATE_BUCKET,
        // La ACL 'private' asegura que nadie externo tenga acceso a este objeto.
        acl: 'private',
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            // Guardamos el archivo organizado por el id_creador
            // Ej: originals/user-uuid/123456789-pieza.stl
            const creatorId = req.user.id;
            cb(null, `originals/${creatorId}/${Date.now().toString()}-${file.originalname}`);
        }
    })
});

/**
 * Ejemplo de un controlador de Express.js para manejar la subida del creador
 */
export const handleModelUpload = async (req, res) => {
    try {
        // 1. En este punto de la ejecución, uploadOriginalModel ya subió el archivo al S3 Privado
        const originalS3Key = req.file.key;

        // Aquí llamarías a un microservicio (Ej. Blender headless o servidor Python) 
        // que toma el STL original de S3, reduce la malla (decimate) un 80% y lo convierte en un .GLB
        // const publicGlbS3Key = await processModelForWeb(originalS3Key);

        // 2. Guardar el registro en la base de datos asociándolo al 'id_creador'
        const newDesign = await prisma.design.create({
            data: {
                title: req.body.title,
                creatorId: req.user.id, // El id del creador
                originalFilePath: originalS3Key,
                // viewableFilePath: publicGlbS3Key, // Opcional: el archivo web-safe
                price: parseFloat(req.body.price),
            }
        });

        res.status(200).json({ success: true, design: newDesign });

    } catch (error) {
        res.status(500).json({ error: 'Error al asegurar el modelo en la bóveda.' });
    }
};

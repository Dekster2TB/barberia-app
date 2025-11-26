const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configuración de la cuenta de Cloudinary
// Estas variables deben estar en tu archivo .env
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configuración del almacenamiento
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'barberia_uploads', // Nombre de la carpeta en tu cuenta de Cloudinary
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'], // Formatos permitidos
        // transformation: [{ width: 500, height: 500, crop: 'limit' }] // Opcional: Redimensionar
    },
});

const upload = multer({ storage: storage });

module.exports = { upload, cloudinary };
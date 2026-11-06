import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

// SPRINT 1: opciones de multer para la foto de perfil.
// Sin "storage", multer deja el archivo en memoria (file.buffer),
// que es lo que necesitamos para subirlo a Cloudinary.
export const imageUploadOptions: MulterOptions = {
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB máximo

  fileFilter: (req, file, cb) => {
    const esImagen = /^image\/(jpeg|png|gif|webp)$/.test(file.mimetype);
    if (!esImagen) {
      // 400 Bad Request si no es una imagen válida
      return cb(
        new BadRequestException('Solo se permiten imágenes (jpg, png, gif o webp)'),
        false,
      );
    }
    cb(null, true);
  },
};
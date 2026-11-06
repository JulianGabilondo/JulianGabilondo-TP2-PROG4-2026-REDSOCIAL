import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  // SPRINT 1: configura Cloudinary con las claves del .env
  constructor(config: ConfigService) {
    cloudinary.config({
      cloud_name: config.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: config.get<string>('CLOUDINARY_API_KEY'),
      api_secret: config.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  // Sube una imagen (que está en memoria) a la carpeta indicada de Cloudinary
  // y devuelve la URL pública, que es lo que se guarda en la base de datos.
  uploadImage(file: Express.Multer.File, folder: string): Promise<string> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder }, (error, result) => {
          if (error || !result) {
            // Muestra en la terminal del back el motivo real (clave inválida, cloud name incorrecto, etc.)
            this.logger.error(`Cloudinary rechazó la subida: ${error?.message ?? 'sin resultado'}`);
            return reject(new InternalServerErrorException('No se pudo subir la imagen'));
          }
          resolve(result.secure_url);
        })
        .end(file.buffer);
    });
  }
}
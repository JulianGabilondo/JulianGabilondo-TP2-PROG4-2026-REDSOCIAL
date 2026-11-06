import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { PublicationsController } from './publications.controller';
import { PublicationsService } from './publications.service';
import { Publication, PublicationSchema } from './schemas/publication.schema';

// SPRINT 2: el módulo ahora tiene esquema, servicio y controller
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Publication.name, schema: PublicationSchema }]),
    CloudinaryModule,
  ],
  controllers: [PublicationsController],
  providers: [PublicationsService],
})
export class PublicationsModule {}
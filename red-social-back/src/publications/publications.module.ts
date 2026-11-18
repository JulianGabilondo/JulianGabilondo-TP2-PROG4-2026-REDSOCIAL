import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { PublicationsController } from './publications.controller';
import { PublicationsService } from './publications.service';
import { Comentario, ComentarioSchema } from './schemas/comentario.schema';
import { Publication, PublicationSchema } from './schemas/publication.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Publication.name, schema: PublicationSchema },
      // SPRINT 3: se registra el esquema de comentarios
      { name: Comentario.name, schema: ComentarioSchema },
    ]),
    CloudinaryModule,
  ],
  // SPRINT 3: se agrega el controller de comentarios
  controllers: [PublicationsController, CommentsController],
  providers: [PublicationsService, CommentsService],
})
export class PublicationsModule {}
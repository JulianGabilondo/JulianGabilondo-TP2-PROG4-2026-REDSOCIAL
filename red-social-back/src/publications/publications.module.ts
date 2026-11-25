import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { PublicationsController } from './publications.controller';
import { PublicationsService } from './publications.service';
import { Comentario, ComentarioSchema } from './schemas/comentario.schema';
import { Publication, PublicationSchema } from './schemas/publication.schema';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Publication.name, schema: PublicationSchema },
      { name: Comentario.name, schema: ComentarioSchema },
    ]),
    CloudinaryModule,
  ],
  // SPRINT 4: se agrega el controller de estadísticas
  controllers: [PublicationsController, CommentsController, StatsController],
  providers: [PublicationsService, CommentsService, StatsService],
})
export class PublicationsModule {}
import { IsMongoId } from 'class-validator';

// SPRINT 3: ids de la URL /publications/:id/comments/:commentId
export class CommentParamsDto {
  @IsMongoId({ message: 'El id de la publicación no tiene un formato válido' })
  id: string;

  @IsMongoId({ message: 'El id del comentario no tiene un formato válido' })
  commentId: string;
}
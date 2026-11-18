import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

// SPRINT 3: cuerpo para crear o editar un comentario
export class CreateCommentDto {
  @IsNotEmpty({ message: 'El comentario no puede estar vacío' })
  @IsString()
  @Matches(/\S/, { message: 'El comentario no puede estar vacío' })
  @MaxLength(500, { message: 'El comentario no puede superar los 500 caracteres' })
  mensaje: string;
}
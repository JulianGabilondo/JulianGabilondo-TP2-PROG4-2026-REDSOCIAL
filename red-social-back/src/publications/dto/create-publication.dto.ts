import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

// SPRINT 2: título y mensaje. La imagen es opcional y viaja como archivo ("imagen").
export class CreatePublicationDto {
  @IsNotEmpty({ message: 'El título es obligatorio' })
  @IsString()
  @Matches(/\S/, { message: 'El título no puede estar vacío' })
  @MaxLength(100, { message: 'El título no puede superar los 100 caracteres' })
  titulo: string;

  @IsNotEmpty({ message: 'El mensaje es obligatorio' })
  @IsString()
  @Matches(/\S/, { message: 'El mensaje no puede estar vacío' })
  @MaxLength(1000, { message: 'El mensaje no puede superar los 1000 caracteres' })
  mensaje: string;
}
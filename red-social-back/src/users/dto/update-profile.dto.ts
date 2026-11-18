import { IsDateString, IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

// SPRINT 2: datos que se pueden editar del perfil. Todos son opcionales.
// No incluye "perfil" (rol) ni "password": como el ValidationPipe tiene forbidNonWhitelisted,
// si alguien los manda el back responde 400.
export class UpdateProfileDto {
  @IsOptional()
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsNotEmpty({ message: 'El apellido no puede estar vacío' })
  @IsString()
  apellido?: string;

  @IsOptional()
  @IsEmail({}, { message: 'El correo no es válido' })
  correo?: string;

  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'El nombre de usuario debe tener al menos 3 caracteres' })
  nombreUsuario?: string;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha de nacimiento no es válida' })
  fechaNacimiento?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'La descripción no puede superar los 200 caracteres' })
  descripcion?: string;
}
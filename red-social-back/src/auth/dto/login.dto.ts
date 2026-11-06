import { IsNotEmpty, IsString } from 'class-validator';

// SPRINT 1: datos del login. Puede ser correo O nombre de usuario.
export class LoginDto {
  @IsNotEmpty({ message: 'Ingresá tu correo o nombre de usuario' })
  @IsString()
  emailOrUsername: string;

  @IsNotEmpty({ message: 'Ingresá tu contraseña' })
  @IsString()
  password: string;
}
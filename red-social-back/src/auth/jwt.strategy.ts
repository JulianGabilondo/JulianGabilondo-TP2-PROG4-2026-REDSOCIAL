import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';

// Lo que viaja dentro del token (lo arma AuthService)
interface JwtPayload {
  sub: string;
  email: string;
  username: string;
  role: string;
}

// Lo que queda disponible como req.user en los controllers
export interface JwtUser {
  userId: string;
  email: string;
  username: string;
  role: string; // "usuario" o "administrador"
}

// Se ejecuta en cada ruta protegida: lee el header "Authorization: Bearer <token>",
// verifica la firma y que no esté vencido (si falla, responde 401 automáticamente)
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  // SPRINT 4: además de validar el token, se comprueba que el usuario siga existiendo y habilitado.
  // Así, un usuario deshabilitado pierde el acceso enseguida (401), aunque su token no haya vencido.
  // El rol se toma de la base de datos, para que un cambio de perfil se aplique de inmediato.
  async validate(payload: JwtPayload): Promise<JwtUser> {
    const user = await this.usersService.findById(payload.sub);
    if (!user || user.activo === false) {
      throw new UnauthorizedException('Tu usuario no está autorizado a usar la aplicación');
    }
    return {
      userId: payload.sub,
      email: user.correo,
      username: user.nombreUsuario,
      role: user.perfil,
    };
  }
}
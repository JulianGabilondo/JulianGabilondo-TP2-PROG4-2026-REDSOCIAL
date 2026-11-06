import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

// SPRINT 2: lo que viaja dentro del token (lo arma AuthService.generateToken)
interface JwtPayload {
  sub: string;
  email: string;
  username: string;
  role: string;
}

// SPRINT 2: lo que queda disponible como req.user en los controllers
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
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  validate(payload: JwtPayload): JwtUser {
    return {
      userId: payload.sub,
      email: payload.email,
      username: payload.username,
      role: payload.role,
    };
  }
}
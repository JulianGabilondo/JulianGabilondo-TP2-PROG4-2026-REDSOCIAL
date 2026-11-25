import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import type { JwtUser } from './jwt.strategy';

// SPRINT 4: exige que el usuario del token sea administrador.
// Se usa SIEMPRE después de JwtAuthGuard: @UseGuards(JwtAuthGuard, AdminGuard)
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<{ user?: JwtUser }>();
    if (req.user?.role !== 'administrador') {
      // 403 Forbidden: tiene sesión pero no permisos de administrador
      throw new ForbiddenException('Solo un administrador puede realizar esta acción');
    }
    return true;
  }
}
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// SPRINT 2: guard reutilizable. @UseGuards(JwtAuthGuard) exige un token válido (401 si no).
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
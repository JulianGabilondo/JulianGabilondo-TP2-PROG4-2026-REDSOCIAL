import { Controller, Get, HttpCode, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { QueryStatsDto } from './dto/query-stats.dto';
import { StatsService } from './stats.service';

// SPRINT 4: estadísticas para los gráficos. Todas las rutas exigen un token de administrador
// (401 si no hay token válido, 403 si el usuario no es administrador).
@Controller('stats')
@UseGuards(JwtAuthGuard, AdminGuard)
export class StatsController {
  constructor(private statsService: StatsService) {}

  // GET /api/stats/publications-by-user?from=2026-11-01&to=2026-11-15
  @Get('publications-by-user')
  @HttpCode(HttpStatus.OK)
  publicacionesPorUsuario(@Query() query: QueryStatsDto) {
    return this.statsService.publicacionesPorUsuario(query);
  }

  // GET /api/stats/comments-by-day?from=2026-11-01&to=2026-11-15
  @Get('comments-by-day')
  @HttpCode(HttpStatus.OK)
  comentariosPorDia(@Query() query: QueryStatsDto) {
    return this.statsService.comentariosPorDia(query);
  }

  // GET /api/stats/comments-by-publication?from=2026-11-01&to=2026-11-15
  @Get('comments-by-publication')
  @HttpCode(HttpStatus.OK)
  comentariosPorPublicacion(@Query() query: QueryStatsDto) {
    return this.statsService.comentariosPorPublicacion(query);
  }
}
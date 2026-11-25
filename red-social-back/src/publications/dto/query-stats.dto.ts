import { IsDateString, IsOptional } from 'class-validator';

// SPRINT 4: lapso de tiempo elegido para una estadística (fechas "YYYY-MM-DD", ambas incluidas).
// Si no se envían, se usan los últimos 7 días.
export class QueryStatsDto {
  @IsOptional()
  @IsDateString({}, { message: 'La fecha "from" no es válida (formato YYYY-MM-DD)' })
  from?: string;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha "to" no es válida (formato YYYY-MM-DD)' })
  to?: string;
}
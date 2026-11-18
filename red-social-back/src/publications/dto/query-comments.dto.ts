import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

// SPRINT 3: parámetros de paginación del GET de comentarios
export class QueryCommentsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit: number = 5;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset: number = 0;
}
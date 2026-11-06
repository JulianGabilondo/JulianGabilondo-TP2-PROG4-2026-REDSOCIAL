import { Type } from 'class-transformer';
import { IsIn, IsInt, IsMongoId, IsOptional, Max, Min } from 'class-validator';

// SPRINT 2: parámetros del GET /publications (todos opcionales)
export class QueryPublicationsDto {
  // Cantidad de publicaciones por página
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit: number = 10;

  // Cuántas publicaciones saltear (para paginar)
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset: number = 0;

  // Ordenamiento: por fecha (default) o por cantidad de me gusta
  @IsOptional()
  @IsIn(['fecha', 'meGusta'], { message: 'sort debe ser "fecha" o "meGusta"' })
  sort: 'fecha' | 'meGusta' = 'fecha';

  // Filtra las publicaciones de un usuario en particular
  @IsOptional()
  @IsMongoId({ message: 'userId no tiene un formato válido' })
  userId?: string;
}
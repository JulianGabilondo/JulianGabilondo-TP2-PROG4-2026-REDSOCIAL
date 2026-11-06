import { IsMongoId } from 'class-validator';

// SPRINT 2: valida que el :id de la URL sea un ObjectId de Mongo válido.
// Sin esto, un id inválido rompería con 500 en vez de responder 400.
export class IdParamDto {
  @IsMongoId({ message: 'El id no tiene un formato válido' })
  id: string;
}
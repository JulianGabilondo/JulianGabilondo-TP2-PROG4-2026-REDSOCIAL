import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ComentarioDocument = HydratedDocument<Comentario>;

// SPRINT 3: esquema de comentario
@Schema({ timestamps: true }) // createdAt = fecha del comentario
export class Comentario {
  // Publicación a la que pertenece
  @Prop({ type: Types.ObjectId, ref: 'Publication', required: true, index: true })
  publicacion: Types.ObjectId;

  // Usuario que escribió el comentario
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  usuario: Types.ObjectId;

  @Prop({ required: true, trim: true })
  mensaje: string;

  // true si el comentario fue editado (el front lo anuncia)
  @Prop({ default: false })
  modificado: boolean;

  // Baja lógica (se usa a partir del Sprint 4)
  @Prop({ default: true })
  activo: boolean;
}

export const ComentarioSchema = SchemaFactory.createForClass(Comentario);
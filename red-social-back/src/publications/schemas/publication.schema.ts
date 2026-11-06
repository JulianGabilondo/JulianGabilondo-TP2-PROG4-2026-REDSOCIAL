import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PublicationDocument = HydratedDocument<Publication>;

// SPRINT 2: esquema de publicación
@Schema({ timestamps: true }) // agrega createdAt (fecha de publicación) y updatedAt
export class Publication {
  @Prop({ required: true, trim: true })
  titulo: string;

  @Prop({ required: true, trim: true })
  mensaje: string;

  // URL de la imagen en Cloudinary (vacía si no tiene)
  @Prop({ default: '' })
  imagen: string;

  // Autor de la publicación
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  usuario: Types.ObjectId;

  // Ids de los usuarios que dieron "me gusta" (un usuario no puede repetirse)
  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  meGusta: Types.ObjectId[];

  // Baja lógica: false = eliminada (no se borra de la base, solo se oculta)
  @Prop({ default: true })
  activo: boolean;
}

export const PublicationSchema = SchemaFactory.createForClass(Publication);
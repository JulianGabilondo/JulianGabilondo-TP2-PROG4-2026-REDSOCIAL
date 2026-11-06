import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

// SPRINT 1: esquema de usuario
@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true })
  nombre: string;

  @Prop({ required: true, trim: true })
  apellido: string;

  // Único en la base de datos (se usa para login)
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  correo: string;

  // Único en la base de datos (se usa para login)
  @Prop({ required: true, unique: true, trim: true })
  nombreUsuario: string;

  // Guardada encriptada con bcrypt. "select: false" hace que NO se devuelva
  // en las consultas salvo que se pida con .select('+password')
  @Prop({ required: true, select: false })
  password: string;

  @Prop({ required: true })
  fechaNacimiento: Date;

  @Prop({ default: '' })
  descripcion: string;

  // URL de la imagen en Cloudinary
  @Prop({ default: '' })
  fotoPerfil: string;

  // Por defecto "usuario"; puede ser "administrador"
  @Prop({ default: 'usuario', enum: ['usuario', 'administrador'] })
  perfil: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
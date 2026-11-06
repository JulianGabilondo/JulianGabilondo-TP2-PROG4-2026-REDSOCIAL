import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  // SPRINT 1: verifica que correo y nombre de usuario no existan todavía.
  // Se llama ANTES de subir la imagen para no dejar fotos huérfanas en Cloudinary.
  async ensureUnique(correo: string, nombreUsuario: string): Promise<void> {
    const existente = await this.userModel.findOne({
      $or: [{ correo: correo.toLowerCase() }, { nombreUsuario }],
    });
    if (existente) {
      // 409 Conflict: el recurso ya existe
      throw new ConflictException('El correo o el nombre de usuario ya están registrados');
    }
  }

  // SPRINT 1: crea el usuario con la contraseña encriptada
  async create(dto: CreateUserDto, fotoPerfil = ''): Promise<UserDocument> {
    // bcrypt genera el hash con 10 rondas de salt; la contraseña real nunca se guarda
    const hash = await bcrypt.hash(dto.password, 10);

    try {
      return await new this.userModel({
        ...dto,
        password: hash,
        perfil: dto.perfil ?? 'usuario',
        fotoPerfil,
      }).save();
    } catch (error: any) {
      // Código 11000 = violó un índice único (por si dos registros llegan a la vez)
      if (error?.code === 11000) {
        throw new ConflictException('El correo o el nombre de usuario ya están registrados');
      }
      throw error;
    }
  }

  // SPRINT 1: busca por correo O por nombre de usuario (el login acepta cualquiera).
  // Trae también la contraseña (hash) porque el login necesita compararla.
  findByEmailOrUsername(valor: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ $or: [{ correo: valor.toLowerCase() }, { nombreUsuario: valor }] })
      .select('+password')
      .exec();
  }

  // Convierte el documento a un objeto "seguro" para devolver al front (sin password ni __v)
  toResponse(user: UserDocument) {
    const { password, __v, ...datos } = user.toObject();
    return datos;
  }
}
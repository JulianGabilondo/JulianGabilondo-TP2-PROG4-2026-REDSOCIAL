import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    // Se usa para subir la foto de perfil (edición de perfil y alta de usuarios por un administrador)
    private cloudinaryService: CloudinaryService,
  ) {}

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

  // Busca un usuario por id
  findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  // Edición del perfil del usuario logueado
  async updateProfile(
    id: string,
    dto: UpdateProfileDto,
    file?: Express.Multer.File,
  ): Promise<UserDocument> {
    // 1) Si cambia el correo o el nombre de usuario, no pueden pertenecer a OTRO usuario
    const condiciones: Record<string, string>[] = [];
    if (dto.correo) condiciones.push({ correo: dto.correo.toLowerCase() });
    if (dto.nombreUsuario) condiciones.push({ nombreUsuario: dto.nombreUsuario });

    if (condiciones.length) {
      const existente = await this.userModel.findOne({ _id: { $ne: id }, $or: condiciones });
      if (existente) {
        throw new ConflictException('El correo o el nombre de usuario ya están registrados');
      }
    }

    // 2) Arma los cambios; si vino una foto nueva, se sube a Cloudinary y se guarda la URL
    const cambios: Record<string, unknown> = { ...dto };
    if (dto.correo) cambios.correo = dto.correo.toLowerCase();
    if (file) {
      cambios.fotoPerfil = await this.cloudinaryService.uploadImage(file, 'red-social/perfiles');
    }

    // 3) Actualiza y devuelve el usuario ya modificado
    try {
      const user = await this.userModel.findByIdAndUpdate(
        id,
        { $set: cambios },
        { returnDocument: 'after', runValidators: true },
      );
      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }
      return user;
    } catch (error: any) {
      if (error?.code === 11000) {
        throw new ConflictException('El correo o el nombre de usuario ya están registrados');
      }
      throw error;
    }
  }

  // SPRINT 4: listado de todos los usuarios (para el dashboard de administración).
  // La contraseña no se devuelve porque el esquema la excluye por defecto (select: false).
  async findAll() {
    const usuarios = await this.userModel.find().sort({ createdAt: -1 }).select('-__v').lean();
    // Los usuarios anteriores al Sprint 4 no tienen "activo": se informan como habilitados
    return usuarios.map((u) => ({ ...u, activo: u.activo !== false }));
  }

  // SPRINT 4: alta de un usuario por un administrador (puede elegir su perfil)
  async createByAdmin(dto: CreateUserDto, file?: Express.Multer.File): Promise<UserDocument> {
    await this.ensureUnique(dto.correo, dto.nombreUsuario);

    let fotoPerfil = '';
    if (file) {
      fotoPerfil = await this.cloudinaryService.uploadImage(file, 'red-social/perfiles');
    }
    return this.create(dto, fotoPerfil);
  }

  // SPRINT 4: baja lógica (activo = false) y alta lógica (activo = true) de un usuario
  async setActive(id: string, activo: boolean, adminId: string): Promise<UserDocument> {
    // Un administrador no puede deshabilitarse a sí mismo (se quedaría sin acceso)
    if (!activo && id === adminId) {
      throw new BadRequestException('No podés deshabilitar tu propia cuenta');
    }

    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    user.activo = activo;
    await user.save();
    return user;
  }

  // Convierte el documento a un objeto "seguro" para devolver al front (sin password ni __v)
  toResponse(user: UserDocument) {
    const { password, __v, ...datos } = user.toObject();
    return datos;
  }
}
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { UserDocument } from '../users/schemas/user.schema';
import type { JwtUser } from './jwt.strategy';

// Datos que viajan dentro del token
interface TokenPayload {
  sub: string;
  email: string;
  username: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private cloudinaryService: CloudinaryService,
    private jwtService: JwtService,
  ) {}

  // SPRINT 1: registro
  async register(dto: CreateUserDto, file?: Express.Multer.File) {
    // 1) Verificar duplicados antes de subir la imagen
    await this.usersService.ensureUnique(dto.correo, dto.nombreUsuario);

    // 2) Si vino imagen de perfil, subirla y quedarnos con la URL
    let fotoPerfil = '';
    if (file) {
      fotoPerfil = await this.cloudinaryService.uploadImage(file, 'red-social/perfiles');
    }

    // 3) Crear el usuario (la contraseña se encripta en UsersService)
    const user = await this.usersService.create(dto, fotoPerfil);

    return {
      message: 'Usuario registrado exitosamente',
      user: this.usersService.toResponse(user),
      token: this.generateToken(user),
    };
  }

  // SPRINT 1: login
  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmailOrUsername(dto.emailOrUsername);

    // bcrypt.compare encripta la contraseña recibida con el mismo "salt" del hash
    // guardado y compara ambos resultados: así se confirma el login sin desencriptar nada.
    // Mismo mensaje para usuario inexistente y contraseña incorrecta (no da pistas).
    const passwordOk = user ? await bcrypt.compare(dto.password, user.password) : false;
    if (!user || !passwordOk) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return {
      message: 'Login exitoso',
      user: this.usersService.toResponse(user), // todos los datos del usuario
      token: this.generateToken(user),
    };
  }

  // SPRINT 3: autorizar. El guard ya validó que el token sea válido y no esté vencido
  // (si no, respondió 401). Acá se devuelven los datos del usuario.
  async authorize(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
    return { message: 'Token válido', user: this.usersService.toResponse(user) };
  }

  // SPRINT 3: refrescar. Devuelve un token nuevo con la MISMA payload y 15 minutos de vencimiento.
  refresh(user: JwtUser) {
    const token = this.sign({
      sub: user.userId,
      email: user.email,
      username: user.username,
      role: user.role,
    });
    return { message: 'Token renovado', token };
  }

  // Genera el JWT al registrarse o iniciar sesión
  private generateToken(user: UserDocument): string {
    return this.sign({
      sub: user._id.toString(), // id del usuario (estándar JWT)
      email: user.correo,
      username: user.nombreUsuario,
      role: user.perfil, // "usuario" o "administrador"
    });
  }

  // Firma el token (vence a los 15 minutos, configurado en AuthModule)
  private sign(payload: TokenPayload): string {
    return this.jwtService.sign(payload);
  }
}
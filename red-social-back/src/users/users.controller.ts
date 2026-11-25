import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminGuard } from '../auth/admin.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { JwtUser } from '../auth/jwt.strategy';
import { IdParamDto } from '../common/dto/id-param.dto';
import { imageUploadOptions } from '../common/image-upload.options';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';

// Todas las rutas de usuarios exigen token válido (401 si no). Las de administración
// (SPRINT 4) exigen además que el token sea de un administrador (403 si no).
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  // GET /api/users/me: datos actuales del usuario logueado
  @Get('me')
  @HttpCode(HttpStatus.OK)
  async me(@Req() req: { user: JwtUser }) {
    const user = await this.usersService.findById(req.user.userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return this.usersService.toResponse(user);
  }

  // PATCH /api/users/me  (multipart/form-data, foto opcional en el campo "fotoPerfil")
  @Patch('me')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('fotoPerfil', imageUploadOptions))
  async updateMe(
    @Body() dto: UpdateProfileDto,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Req() req: { user: JwtUser },
  ) {
    const user = await this.usersService.updateProfile(req.user.userId, dto, file);
    return { message: 'Perfil actualizado correctamente', user: this.usersService.toResponse(user) };
  }

  // SPRINT 4: GET /api/users  (listado de usuarios, solo administrador)
  @Get()
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.usersService.findAll();
  }

  // SPRINT 4: POST /api/users  (alta de un usuario con el perfil elegido, solo administrador)
  // multipart/form-data: mismos campos que el registro, más "perfil" y la foto en "fotoPerfil"
  @Post()
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('fotoPerfil', imageUploadOptions))
  async create(@Body() dto: CreateUserDto, @UploadedFile() file: Express.Multer.File | undefined) {
    const user = await this.usersService.createByAdmin(dto, file);
    return { message: 'Usuario creado correctamente', user: this.usersService.toResponse(user) };
  }

  // SPRINT 4: DELETE /api/users/:id  (baja lógica: deshabilita al usuario, solo administrador)
  @Delete(':id')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.OK)
  async disable(@Param() { id }: IdParamDto, @Req() req: { user: JwtUser }) {
    const user = await this.usersService.setActive(id, false, req.user.userId);
    return { message: 'Usuario deshabilitado correctamente', user: this.usersService.toResponse(user) };
  }

  // SPRINT 4: POST /api/users/:id/enable  (alta lógica: rehabilita al usuario, solo administrador)
  @Post(':id/enable')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.OK)
  async enable(@Param() { id }: IdParamDto, @Req() req: { user: JwtUser }) {
    const user = await this.usersService.setActive(id, true, req.user.userId);
    return { message: 'Usuario habilitado correctamente', user: this.usersService.toResponse(user) };
  }
}
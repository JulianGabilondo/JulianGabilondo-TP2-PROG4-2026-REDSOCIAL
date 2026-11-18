import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Patch,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { JwtUser } from '../auth/jwt.strategy';
import { imageUploadOptions } from '../common/image-upload.options';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';

// SPRINT 2: rutas del usuario logueado (todas exigen token válido)
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
}
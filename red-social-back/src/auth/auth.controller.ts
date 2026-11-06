import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { imageUploadOptions } from '../common/image-upload.options';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // SPRINT 1: POST /api/auth/register  (multipart/form-data)
  // El archivo viaja en el campo "fotoPerfil" (opcional)
  @Post('register')
  @HttpCode(HttpStatus.CREATED) // 201
  @UseInterceptors(FileInterceptor('fotoPerfil', imageUploadOptions))
  register(
    @Body() dto: CreateUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.authService.register(dto, file);
  }

  // SPRINT 1: POST /api/auth/login
  @Post('login')
  @HttpCode(HttpStatus.OK) // 200 (en un POST Nest devuelve 201 por defecto, acá no corresponde)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
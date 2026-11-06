import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { JwtUser } from '../auth/jwt.strategy';
import { IdParamDto } from '../common/dto/id-param.dto';
import { imageUploadOptions } from '../common/image-upload.options';
import { CreatePublicationDto } from './dto/create-publication.dto';
import { QueryPublicationsDto } from './dto/query-publications.dto';
import { PublicationsService } from './publications.service';

// SPRINT 2: todas las rutas de publicaciones exigen estar logueado (401 si no hay token válido)
@Controller('publications')
@UseGuards(JwtAuthGuard)
export class PublicationsController {
  constructor(private publicationsService: PublicationsService) {}

  // POST /api/publications  (multipart/form-data, imagen opcional en el campo "imagen")
  @Post()
  @HttpCode(HttpStatus.CREATED) // 201
  @UseInterceptors(FileInterceptor('imagen', imageUploadOptions))
  create(
    @Body() dto: CreatePublicationDto,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Req() req: { user: JwtUser },
  ) {
    return this.publicationsService.create(dto, file, req.user.userId);
  }

  // GET /api/publications?sort=fecha|meGusta&limit=10&offset=0&userId=<id>
  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(@Query() query: QueryPublicationsDto) {
    return this.publicationsService.findAll(query);
  }

  // DELETE /api/publications/:id  (baja lógica, solo el autor o un administrador)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param() { id }: IdParamDto, @Req() req: { user: JwtUser }) {
    return this.publicationsService.remove(id, req.user.userId, req.user.role);
  }

  // POST /api/publications/:id/likes  (dar me gusta)
  @Post(':id/likes')
  @HttpCode(HttpStatus.CREATED) // 201
  addLike(@Param() { id }: IdParamDto, @Req() req: { user: JwtUser }) {
    return this.publicationsService.addLike(id, req.user.userId);
  }

  // DELETE /api/publications/:id/likes  (quitar me gusta)
  @Delete(':id/likes')
  @HttpCode(HttpStatus.OK)
  removeLike(@Param() { id }: IdParamDto, @Req() req: { user: JwtUser }) {
    return this.publicationsService.removeLike(id, req.user.userId);
  }
}
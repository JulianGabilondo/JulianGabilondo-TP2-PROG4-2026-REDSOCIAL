import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { JwtUser } from '../auth/jwt.strategy';
import { IdParamDto } from '../common/dto/id-param.dto';
import { CommentsService } from './comments.service';
import { CommentParamsDto } from './dto/comment-params.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { QueryCommentsDto } from './dto/query-comments.dto';

// SPRINT 3: comentarios de una publicación. Todas las rutas exigen token válido.
@Controller('publications/:id/comments')
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  // GET /api/publications/:id/comments?limit=5&offset=0
  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(@Param() { id }: IdParamDto, @Query() query: QueryCommentsDto) {
    return this.commentsService.findByPublication(id, query);
  }

  // POST /api/publications/:id/comments   body: { "mensaje": "..." }
  @Post()
  @HttpCode(HttpStatus.CREATED) // 201
  create(
    @Param() { id }: IdParamDto,
    @Body() dto: CreateCommentDto,
    @Req() req: { user: JwtUser },
  ) {
    return this.commentsService.create(id, dto, req.user.userId);
  }

  // PUT /api/publications/:id/comments/:commentId   body: { "mensaje": "..." }
  @Put(':commentId')
  @HttpCode(HttpStatus.OK)
  update(
    @Param() { id, commentId }: CommentParamsDto,
    @Body() dto: CreateCommentDto,
    @Req() req: { user: JwtUser },
  ) {
    return this.commentsService.update(id, commentId, dto, req.user.userId);
  }
}
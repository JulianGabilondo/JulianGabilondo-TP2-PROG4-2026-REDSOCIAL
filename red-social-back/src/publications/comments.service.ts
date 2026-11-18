import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateCommentDto } from './dto/create-comment.dto';
import { QueryCommentsDto } from './dto/query-comments.dto';
import { Comentario, ComentarioDocument } from './schemas/comentario.schema';
import { Publication, PublicationDocument } from './schemas/publication.schema';

// Datos públicos del autor que se devuelven junto a cada comentario
const CAMPOS_AUTOR = 'nombre apellido nombreUsuario fotoPerfil';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comentario.name) private comentarioModel: Model<ComentarioDocument>,
    @InjectModel(Publication.name) private publicationModel: Model<PublicationDocument>,
  ) {}

  // SPRINT 3: GET. Comentarios de una publicación, paginados, los más recientes primero.
  async findByPublication(publicationId: string, { limit, offset }: QueryCommentsDto) {
    await this.ensurePublicationActive(publicationId);

    const filtro = { publicacion: new Types.ObjectId(publicationId), activo: true };
    const [data, total] = await Promise.all([
      this.comentarioModel
        .find(filtro)
        .sort({ createdAt: -1, _id: -1 }) // más recientes primero (el _id desempata)
        .skip(offset)
        .limit(limit)
        .populate('usuario', CAMPOS_AUTOR)
        .lean(),
      this.comentarioModel.countDocuments(filtro),
    ]);

    return { data, total, limit, offset };
  }

  // SPRINT 3: POST. Agrega un comentario junto con el usuario que lo hizo y la fecha (createdAt).
  async create(publicationId: string, dto: CreateCommentDto, userId: string) {
    await this.ensurePublicationActive(publicationId);

    const comentario = await this.comentarioModel.create({
      publicacion: new Types.ObjectId(publicationId),
      usuario: new Types.ObjectId(userId),
      mensaje: dto.mensaje,
    });

    return comentario.populate('usuario', CAMPOS_AUTOR);
  }

  // SPRINT 3: PUT. Modifica el mensaje y marca modificado: true. Solo su autor.
  async update(publicationId: string, commentId: string, dto: CreateCommentDto, userId: string) {
    await this.ensurePublicationActive(publicationId);

    const comentario = await this.comentarioModel.findOne({
      _id: commentId,
      publicacion: publicationId,
      activo: true,
    });
    if (!comentario) {
      throw new NotFoundException('Comentario no encontrado');
    }
    if (comentario.usuario.toString() !== userId) {
      // 403: está logueado pero el comentario es de otro usuario
      throw new ForbiddenException('Solo podés editar tus propios comentarios');
    }

    comentario.mensaje = dto.mensaje;
    comentario.modificado = true;
    await comentario.save();

    return comentario.populate('usuario', CAMPOS_AUTOR);
  }

  // Lanza 404 si la publicación no existe o fue dada de baja
  private async ensurePublicationActive(publicationId: string): Promise<void> {
    const existe = await this.publicationModel.exists({ _id: publicationId, activo: true });
    if (!existe) {
      throw new NotFoundException('Publicación no encontrada');
    }
  }
}
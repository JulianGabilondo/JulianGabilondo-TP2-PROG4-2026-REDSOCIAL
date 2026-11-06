import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreatePublicationDto } from './dto/create-publication.dto';
import { QueryPublicationsDto } from './dto/query-publications.dto';
import { Publication, PublicationDocument } from './schemas/publication.schema';

@Injectable()
export class PublicationsService {
  constructor(
    @InjectModel(Publication.name) private publicationModel: Model<PublicationDocument>,
    private cloudinaryService: CloudinaryService,
  ) {}

  // SPRINT 2: alta de publicación relacionada al usuario del token
  async create(dto: CreatePublicationDto, file: Express.Multer.File | undefined, userId: string) {
    // La imagen es opcional: si vino, se sube a Cloudinary y se guarda la URL
    let imagen = '';
    if (file) {
      imagen = await this.cloudinaryService.uploadImage(file, 'red-social/publicaciones');
    }

    const publication = await this.publicationModel.create({
      titulo: dto.titulo,
      mensaje: dto.mensaje,
      imagen,
      usuario: new Types.ObjectId(userId),
    });

    // Devuelve la publicación con los datos básicos del autor
    return publication.populate('usuario', 'nombre apellido nombreUsuario fotoPerfil');
  }

  // SPRINT 2: listado con orden, filtro por usuario y paginación (offset/limit)
  async findAll({ limit, offset, sort, userId }: QueryPublicationsDto) {
    // Solo publicaciones activas (las dadas de baja no se muestran)
    const filtro: Record<string, unknown> = { activo: true };
    if (userId) {
      filtro.usuario = new Types.ObjectId(userId);
    }

    // Para ordenar por "me gusta" se calcula el tamaño del array con $size,
    // porque la cantidad no existe como campo guardado en Mongo.
    // En empate, desempata la más reciente.
    const orden: Record<string, 1 | -1> =
      sort === 'meGusta' ? { cantidadMeGusta: -1, createdAt: -1 } : { createdAt: -1 };

    const [data, total] = await Promise.all([
      this.publicationModel.aggregate([
        { $match: filtro },
        { $addFields: { cantidadMeGusta: { $size: { $ifNull: ['$meGusta', []] } } } },
        { $sort: orden },
        { $skip: offset },
        { $limit: limit },
        // Trae al autor y se queda solo con los datos públicos (nunca el password)
        { $lookup: { from: 'users', localField: 'usuario', foreignField: '_id', as: 'usuario' } },
        { $unwind: '$usuario' },
        {
          $addFields: {
            usuario: {
              _id: '$usuario._id',
              nombre: '$usuario.nombre',
              apellido: '$usuario.apellido',
              nombreUsuario: '$usuario.nombreUsuario',
              fotoPerfil: '$usuario.fotoPerfil',
            },
          },
        },
      ]),
      this.publicationModel.countDocuments(filtro),
    ]);

    // "total" le sirve al front para calcular cuántas páginas hay
    return { data, total, limit, offset };
  }

  // SPRINT 2: baja lógica. Solo el autor o un administrador.
  async remove(id: string, userId: string, role: string) {
    const publication = await this.findActiveOrFail(id);

    if (publication.usuario.toString() !== userId && role !== 'administrador') {
      // 403 Forbidden: está logueado pero no tiene permiso
      throw new ForbiddenException('Solo podés eliminar tus propias publicaciones');
    }

    publication.activo = false;
    await publication.save();
    return { message: 'Publicación eliminada correctamente' };
  }

  // SPRINT 2: dar "me gusta" (un solo me gusta por usuario y publicación)
  async addLike(id: string, userId: string) {
    const userObjectId = new Types.ObjectId(userId);

    // Operación atómica: solo agrega si el usuario todavía NO está en meGusta
    const updated = await this.publicationModel.findOneAndUpdate(
      { _id: id, activo: true, meGusta: { $ne: userObjectId } },
      { $addToSet: { meGusta: userObjectId } },
      { returnDocument: 'after' },
    );

    if (!updated) {
      await this.findActiveOrFail(id); // si no existe, lanza 404
      throw new ConflictException('Ya le diste me gusta a esta publicación'); // 409
    }

    return { message: 'Me gusta agregado', cantidadMeGusta: updated.meGusta.length };
  }

  // SPRINT 2: quitar "me gusta", solo si el usuario lo había dado antes
  async removeLike(id: string, userId: string) {
    const userObjectId = new Types.ObjectId(userId);

    const updated = await this.publicationModel.findOneAndUpdate(
      { _id: id, activo: true, meGusta: userObjectId },
      { $pull: { meGusta: userObjectId } },
      { returnDocument: 'after' },
    );

    if (!updated) {
      await this.findActiveOrFail(id); // si no existe, lanza 404
      throw new BadRequestException('No habías dado me gusta a esta publicación'); // 400
    }

    return { message: 'Me gusta quitado', cantidadMeGusta: updated.meGusta.length };
  }

  // Busca una publicación activa o lanza 404
  private async findActiveOrFail(id: string): Promise<PublicationDocument> {
    const publication = await this.publicationModel.findOne({ _id: id, activo: true });
    if (!publication) {
      throw new NotFoundException('Publicación no encontrada');
    }
    return publication;
  }
}
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { QueryStatsDto } from './dto/query-stats.dto';
import { Comentario, ComentarioDocument } from './schemas/comentario.schema';
import { Publication, PublicationDocument } from './schemas/publication.schema';

// Los días se calculan con la hora de Argentina (UTC-3, sin horario de verano),
// así una publicación hecha a las 22:00 se cuenta en el día correcto aunque el servidor use UTC.
const ZONA_HORARIA = 'America/Argentina/Buenos_Aires';
const DESFASE = '-03:00';
const DIA = 24 * 60 * 60 * 1000;
const MAX_DIAS = 366;

@Injectable()
export class StatsService {
  constructor(
    @InjectModel(Publication.name) private publicationModel: Model<PublicationDocument>,
    @InjectModel(Comentario.name) private comentarioModel: Model<ComentarioDocument>,
  ) {}

  // SPRINT 4: cantidad de publicaciones realizadas por cada usuario en un lapso de tiempo
  // (solo se cuentan las publicaciones activas, las dadas de baja no)
  async publicacionesPorUsuario(query: QueryStatsDto) {
    const { desde, hasta } = this.rango(query);

    const data = await this.publicationModel.aggregate([
      { $match: { activo: true, createdAt: { $gte: desde, $lte: hasta } } },
      { $group: { _id: '$usuario', cantidad: { $sum: 1 } } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'usuario' } },
      { $unwind: '$usuario' },
      {
        $project: {
          _id: 0,
          usuarioId: '$_id',
          nombreUsuario: '$usuario.nombreUsuario',
          nombre: '$usuario.nombre',
          apellido: '$usuario.apellido',
          cantidad: 1,
        },
      },
      { $sort: { cantidad: -1, nombreUsuario: 1 } },
    ]);

    return { desde, hasta, data };
  }

  // SPRINT 4: cantidad de comentarios realizados en un lapso de tiempo, día por día.
  // Solo cuentan los comentarios de publicaciones que siguen activas.
  async comentariosPorDia(query: QueryStatsDto) {
    const { desde, hasta } = this.rango(query);

    const resultado: { fecha: string; cantidad: number }[] = await this.comentarioModel.aggregate([
      { $match: { activo: true, createdAt: { $gte: desde, $lte: hasta } } },
      { $lookup: { from: 'publications', localField: 'publicacion', foreignField: '_id', as: 'pub' } },
      { $match: { 'pub.activo': true } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: DESFASE } },
          cantidad: { $sum: 1 },
        },
      },
      { $project: { _id: 0, fecha: '$_id', cantidad: 1 } },
    ]);

    // Se completan con 0 los días sin comentarios, para que el gráfico de líneas no tenga saltos
    const porFecha = new Map(resultado.map((r) => [r.fecha, r.cantidad]));
    const formato = (d: Date) => d.toLocaleDateString('en-CA', { timeZone: ZONA_HORARIA }); // YYYY-MM-DD
    const data: { fecha: string; cantidad: number }[] = [];
    for (let t = desde.getTime(); t <= hasta.getTime(); t += DIA) {
      const fecha = formato(new Date(t));
      data.push({ fecha, cantidad: porFecha.get(fecha) ?? 0 });
    }

    const total = data.reduce((suma, d) => suma + d.cantidad, 0);
    return { desde, hasta, total, data };
  }

  // SPRINT 4: cantidad de comentarios en cada publicación en un lapso de tiempo
  // (las 10 publicaciones con más comentarios)
  async comentariosPorPublicacion(query: QueryStatsDto) {
    const { desde, hasta } = this.rango(query);

    const data = await this.comentarioModel.aggregate([
      { $match: { activo: true, createdAt: { $gte: desde, $lte: hasta } } },
      { $group: { _id: '$publicacion', cantidad: { $sum: 1 } } },
      { $lookup: { from: 'publications', localField: '_id', foreignField: '_id', as: 'pub' } },
      { $unwind: '$pub' },
      { $match: { 'pub.activo': true } },
      { $sort: { cantidad: -1, 'pub.createdAt': -1 } },
      { $limit: 10 },
      { $project: { _id: 0, publicacionId: '$_id', titulo: '$pub.titulo', cantidad: 1 } },
    ]);

    return { desde, hasta, data };
  }

  // Convierte las fechas "from" y "to" (YYYY-MM-DD) en el inicio del primer día y el fin del último,
  // en hora argentina. Por defecto: los últimos 7 días.
  private rango({ from, to }: QueryStatsDto): { desde: Date; hasta: Date } {
    const hasta = to ? new Date(`${to.slice(0, 10)}T23:59:59.999${DESFASE}`) : new Date();
    const desde = from
      ? new Date(`${from.slice(0, 10)}T00:00:00.000${DESFASE}`)
      : new Date(hasta.getTime() - 6 * DIA);

    if (desde > hasta) {
      throw new BadRequestException('La fecha "desde" no puede ser posterior a la fecha "hasta"');
    }
    if (hasta.getTime() - desde.getTime() > MAX_DIAS * DIA) {
      throw new BadRequestException('El lapso de tiempo no puede superar 1 año');
    }
    return { desde, hasta };
  }
}
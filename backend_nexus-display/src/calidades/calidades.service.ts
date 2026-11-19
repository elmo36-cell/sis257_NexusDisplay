import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCalidadDto } from './dto/create-calidad.dto';
import { UpdateCalidadDto } from './dto/update-calidad.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Calidad } from './entities/calidad.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CalidadesService {
  constructor(
    @InjectRepository(Calidad) private repositorioCalidades: Repository<Calidad>,
  ) {}

  async crear(datosCalidad: CreateCalidadDto): Promise<Calidad> {
    let calidad = await this.repositorioCalidades.findOneBy({
      nombre: datosCalidad.nombre,
    });
    if (calidad) throw new ConflictException('La calidad ya existe');

    calidad = new Calidad();
    Object.assign(calidad, datosCalidad);
    return this.repositorioCalidades.save(calidad);
  }

  async listar(): Promise<Calidad[]> {
    return this.repositorioCalidades.find();
  }

  async obtenerPorId(id: number): Promise<Calidad> {
    const calidad = await this.repositorioCalidades.findOneBy({ id });
    if (!calidad) throw new NotFoundException('La calidad no existe');
    return calidad;
  }

  async actualizar(
    id: number,
    datosCalidad: UpdateCalidadDto,
  ): Promise<Calidad> {
    const calidad = await this.obtenerPorId(id);
    Object.assign(calidad, datosCalidad);
    return this.repositorioCalidades.save(calidad);
  }

  async eliminar(id: number): Promise<Calidad> {
    const calidad = await this.obtenerPorId(id);
    return this.repositorioCalidades.softRemove(calidad);
  }
}

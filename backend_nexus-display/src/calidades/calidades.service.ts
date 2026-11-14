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
    @InjectRepository(Calidad) private calidadesRepository: Repository<Calidad>,
  ) {}

  async create(createCalidadDto: CreateCalidadDto): Promise<Calidad> {
    let calidad = await this.calidadesRepository.findOneBy({
      nombre: createCalidadDto.nombre,
    });
    if (calidad) throw new ConflictException('La calidad ya existe');

    calidad = new Calidad();
    Object.assign(calidad, createCalidadDto);
    return this.calidadesRepository.save(calidad);
  }

  async findAll(): Promise<Calidad[]> {
    return this.calidadesRepository.find();
  }

  async findOne(id: number): Promise<Calidad> {
    const calidad = await this.calidadesRepository.findOneBy({ id });
    if (!calidad) throw new NotFoundException('La calidad no existe');
    return calidad;
  }

  async update(
    id: number,
    updateCalidadDto: UpdateCalidadDto,
  ): Promise<Calidad> {
    const calidad = await this.findOne(id);
    Object.assign(calidad, updateCalidadDto);
    return this.calidadesRepository.save(calidad);
  }

  async remove(id: number): Promise<Calidad> {
    const calidad = await this.findOne(id);
    return this.calidadesRepository.softRemove(calidad);
  }
}

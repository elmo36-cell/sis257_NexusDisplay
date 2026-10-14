import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSesionDto } from './dto/create-sesion.dto';
import { UpdateSesionDto } from './dto/update-sesion.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sesion } from './entities/sesion.entity';

@Injectable()
export class SesionesService {
  constructor(
    @InjectRepository(Sesion)
    private sesionesRepository: Repository<Sesion>,
  ) {}

  async create(createSesionDto: CreateSesionDto): Promise<Sesion> {
    const sesion = this.sesionesRepository.create({
      ...createSesionDto,
      fechaExpiracion: new Date(createSesionDto.fechaExpiracion),
    });
    return this.sesionesRepository.save(sesion);
  }

  async findAll(): Promise<Sesion[]> {
    return this.sesionesRepository.find({ relations: {'usuario': true} });
  }

  async findOne(id: number): Promise<Sesion> {
    const sesion = await this.sesionesRepository.findOne({
      where: { id },
      relations: {'usuario': true},
    });
    if (!sesion) throw new NotFoundException('La sesión no existe');
    return sesion;
  }

  async update(id: number, updateSesionDto: UpdateSesionDto): Promise<Sesion> {
    const sesion = await this.findOne(id);
    if (updateSesionDto.fechaExpiracion) {
      (updateSesionDto as any).fechaExpiracion = new Date(updateSesionDto.fechaExpiracion);
    }
    Object.assign(sesion, updateSesionDto);
    return this.sesionesRepository.save(sesion);
  }

  async remove(id: number): Promise<void> {
    const sesion = await this.findOne(id);
    await this.sesionesRepository.remove(sesion);
  }
}

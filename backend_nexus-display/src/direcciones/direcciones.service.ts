import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDireccionDto } from './dto/create-direccion.dto';
import { UpdateDireccionDto } from './dto/update-direccion.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Direccion } from './entities/direccion.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DireccionesService {
  constructor(
    @InjectRepository(Direccion)
    private direccionesRepository: Repository<Direccion>,
  ) {}

  async create(
    createDireccionDto: CreateDireccionDto,
  ): Promise<Direccion> {
    const direccion = this.direccionesRepository.create(createDireccionDto);
    return this.direccionesRepository.save(direccion);
  }

  async findAll(): Promise<Direccion[]> {
    return this.direccionesRepository.find({ relations: {'usuario': true} });
  }

  async findOne(id: number): Promise<Direccion> {
    const direccion = await this.direccionesRepository.findOne({
      where: { id },
      relations: {'usuario': true},
    });
    if (!direccion) {
      throw new NotFoundException('La dirección no existe');
    }
    return direccion;
  }

  async update(
    id: number,
    updateDireccionDto: UpdateDireccionDto,
  ): Promise<Direccion> {
    const direccion = await this.findOne(id);
    Object.assign(direccion, updateDireccionDto);
    return this.direccionesRepository.save(direccion);
  }

  async remove(id: number): Promise<Direccion> {
    const direccion = await this.findOne(id);
    return this.direccionesRepository.softRemove(direccion);
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAlmacenDto } from './dto/create-almacen.dto';
import { UpdateAlmacenDto } from './dto/update-almacen.dto';
import { Almacen } from './entities/almacen.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AlmacenesService {
  constructor(
    @InjectRepository(Almacen) private almacenRepository: Repository<Almacen>,
  ) {}

  async create(createAlmacenDto: CreateAlmacenDto): Promise<Almacen> {
    const almacen = new Almacen();
    Object.assign(almacen, createAlmacenDto);
    return this.almacenRepository.save(almacen);
  }

  async findAll(): Promise<Almacen[]> {
    return this.almacenRepository.find();
  }

  async findOne(id: number): Promise<Almacen> {
    const almacen = await this.almacenRepository.findOne({ where: { id } });
    if (!almacen) throw new NotFoundException('El almacén no existe');
    return almacen;
  }

  async update(
    id: number,
    updateAlmacenDto: UpdateAlmacenDto,
  ): Promise<Almacen> {
    const almacen = await this.findOne(id);
    Object.assign(almacen, updateAlmacenDto);
    return this.almacenRepository.save(almacen);
  }

  async remove(id: number): Promise<Almacen> {
    const almacen = await this.findOne(id);
    return this.almacenRepository.softRemove(almacen);
  }
}

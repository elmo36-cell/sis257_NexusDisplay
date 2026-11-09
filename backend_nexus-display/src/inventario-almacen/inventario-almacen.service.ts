import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateInventarioAlmacenDto } from './dto/create-inventario-almacen.dto';
import { UpdateInventarioAlmacenDto } from './dto/update-inventario-almacen.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { InventarioAlmacen } from './entities/inventario-almacen.entity';
import { Repository } from 'typeorm';

@Injectable()
export class InventarioAlmacenService {
  constructor(
    @InjectRepository(InventarioAlmacen)
    private inventarioRepository: Repository<InventarioAlmacen>,
  ) {}

  async create(
    createInventarioAlmacenDto: CreateInventarioAlmacenDto,
  ): Promise<InventarioAlmacen> {
    const inventario = new InventarioAlmacen();
    Object.assign(inventario, createInventarioAlmacenDto);
    return this.inventarioRepository.save(inventario);
  }

  async findAll(): Promise<InventarioAlmacen[]> {
    return this.inventarioRepository.find({
      relations: {
        pantalla: true,
        almacen: true,
      },
    });
  }

  async findOne(id: number): Promise<InventarioAlmacen> {
    const inventario = await this.inventarioRepository.findOne({
      where: { id },
      relations: {
        pantalla: true,
        almacen: true,
      },
    });
    if (!inventario)
      throw new NotFoundException(
        'El registro de inventario en almacén no existe',
      );
    return inventario;
  }

  async update(
    id: number,
    updateInventarioAlmacenDto: UpdateInventarioAlmacenDto,
  ): Promise<InventarioAlmacen> {
    const inventario = await this.findOne(id);
    Object.assign(inventario, updateInventarioAlmacenDto);
    return this.inventarioRepository.save(inventario);
  }

  async remove(id: number): Promise<InventarioAlmacen> {
    const inventario = await this.findOne(id);
    return this.inventarioRepository.softRemove(inventario);
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDetalleCompraDto } from './dto/create-detalle-compra.dto';
import { UpdateDetalleCompraDto } from './dto/update-detalle-compra.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DetalleCompra } from './entities/detalle-compra.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DetallesCompraService {
  constructor(@InjectRepository(DetalleCompra) private detalleCompraRepository: Repository<DetalleCompra>) {}

  async create(createDetalleCompraDto: CreateDetalleCompraDto): Promise<DetalleCompra> {
    const detalle = new DetalleCompra();
    Object.assign(detalle, createDetalleCompraDto);
    return this.detalleCompraRepository.save(detalle);
  }

  async findAll(): Promise<DetalleCompra[]> {
    return this.detalleCompraRepository.find({
      relations: {
        compra: true,
        pantalla: true,
      },
    });
  }

  async findOne(id: number): Promise<DetalleCompra> {
    const detalle = await this.detalleCompraRepository.findOne({
      where: { id },
      relations: {
        compra: true,
        pantalla: true,
      },
    });
    if (!detalle) throw new NotFoundException('El detalle de compra no existe');
    return detalle;
  }

  async update(id: number, updateDetalleCompraDto: UpdateDetalleCompraDto): Promise<DetalleCompra> {
    const detalle = await this.findOne(id);
    Object.assign(detalle, updateDetalleCompraDto);
    return this.detalleCompraRepository.save(detalle);
  }

  async remove(id: number): Promise<DetalleCompra> {
    const detalle = await this.findOne(id);
    return this.detalleCompraRepository.softRemove(detalle);
  }
}

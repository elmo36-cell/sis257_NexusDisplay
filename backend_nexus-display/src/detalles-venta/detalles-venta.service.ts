import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDetalleVentaDto } from './dto/create-detalle-venta.dto';
import { UpdateDetalleVentaDto } from './dto/update-detalle-venta.dto';
import { DetalleVenta } from './entities/detalle-venta.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class DetallesVentaService {
  constructor(
    @InjectRepository(DetalleVenta)
    private detalleVentaRepository: Repository<DetalleVenta>,
  ) {}

  async create(
    createDetalleVentaDto: CreateDetalleVentaDto,
  ): Promise<DetalleVenta> {
    const detalleVenta = new DetalleVenta();
    Object.assign(detalleVenta, createDetalleVentaDto);
    return this.detalleVentaRepository.save(detalleVenta);
  }

  async findAll(): Promise<DetalleVenta[]> {
    return this.detalleVentaRepository.find({
      relations: {
        venta: true,
        pantalla: true,
      },
    });
  }

  async findOne(id: number): Promise<DetalleVenta> {
    const detalleVenta = await this.detalleVentaRepository.findOne({
      where: { id },
      relations: {
        venta: true,
        pantalla: true,
      },
    });
    if (!detalleVenta)
      throw new NotFoundException('El detalle de venta no existe');
    return detalleVenta;
  }

  async update(
    id: number,
    updateDetalleVentaDto: UpdateDetalleVentaDto,
  ): Promise<DetalleVenta> {
    const detalleVenta = await this.findOne(id);
    Object.assign(detalleVenta, updateDetalleVentaDto);
    return this.detalleVentaRepository.save(detalleVenta);
  }

  async remove(id: number): Promise<DetalleVenta> {
    const detalleVenta = await this.findOne(id);
    return this.detalleVentaRepository.softRemove(detalleVenta);
  }
}

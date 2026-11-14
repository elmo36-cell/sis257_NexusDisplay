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
    private readonly detallesVentaRepository: Repository<DetalleVenta>,
  ) {}

  async create(
    createDetalleVentaDto: CreateDetalleVentaDto,
  ): Promise<DetalleVenta> {
    const detalle = new DetalleVenta();
    Object.assign(detalle, createDetalleVentaDto);
    detalle.subtotal = Number(
      (
        Number(createDetalleVentaDto.cantidad) *
        Number(createDetalleVentaDto.precioUnitario || 0)
      ).toFixed(2),
    );
    return this.detallesVentaRepository.save(detalle);
  }

  async findAll(): Promise<DetalleVenta[]> {
    return this.detallesVentaRepository.find({
      relations: {
        venta: {
          almacen: true,
          usuario: true,
        },
        pantalla: {
          modelo: { marca: true },
          calidad: true,
        },
      },
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number): Promise<DetalleVenta> {
    const detalle = await this.detallesVentaRepository.findOne({
      where: { id },
      relations: {
        venta: true,
        pantalla: true,
      },
    });
    if (!detalle) {
      throw new NotFoundException(`El detalle de venta con ID ${id} no existe`);
    }
    return detalle;
  }

  async update(
    id: number,
    updateDetalleVentaDto: UpdateDetalleVentaDto,
  ): Promise<DetalleVenta> {
    const detalle = await this.findOne(id);
    Object.assign(detalle, updateDetalleVentaDto);
    return this.detallesVentaRepository.save(detalle);
  }

  async remove(id: number): Promise<DetalleVenta> {
    const detalle = await this.findOne(id);
    return this.detallesVentaRepository.softRemove(detalle);
  }
}

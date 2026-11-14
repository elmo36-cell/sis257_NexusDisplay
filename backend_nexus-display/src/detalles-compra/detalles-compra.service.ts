import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDetalleCompraDto } from './dto/create-detalle-compra.dto';
import { UpdateDetalleCompraDto } from './dto/update-detalle-compra.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DetalleCompra } from './entities/detalle-compra.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DetallesCompraService {
  constructor(
    @InjectRepository(DetalleCompra)
    private detallesCompraRepository: Repository<DetalleCompra>,
  ) {}

  async create(
    createDetalleCompraDto: CreateDetalleCompraDto,
  ): Promise<DetalleCompra> {
    const detalleCompra = new DetalleCompra();
    Object.assign(detalleCompra, createDetalleCompraDto);
    detalleCompra.subtotal = Number(
      (
        createDetalleCompraDto.cantidad * createDetalleCompraDto.costoUnitario
      ).toFixed(2),
    );
    return this.detallesCompraRepository.save(detalleCompra);
  }

  async findAll(): Promise<DetalleCompra[]> {
    return this.detallesCompraRepository.find({
      relations: { compra: true, pantalla: true },
    });
  }

  async findOne(id: number): Promise<DetalleCompra> {
    const detalleCompra = await this.detallesCompraRepository.findOne({
      where: { id },
      relations: { compra: true, pantalla: true },
    });
    if (!detalleCompra)
      throw new NotFoundException('El detalle de compra no existe');
    return detalleCompra;
  }

  async update(
    id: number,
    updateDetalleCompraDto: UpdateDetalleCompraDto,
  ): Promise<DetalleCompra> {
    const detalleCompra = await this.findOne(id);
    Object.assign(detalleCompra, updateDetalleCompraDto);
    detalleCompra.subtotal = Number(
      (detalleCompra.cantidad * detalleCompra.costoUnitario).toFixed(2),
    );
    return this.detallesCompraRepository.save(detalleCompra);
  }

  async remove(id: number): Promise<DetalleCompra> {
    const detalleCompra = await this.findOne(id);
    return this.detallesCompraRepository.softRemove(detalleCompra);
  }
}

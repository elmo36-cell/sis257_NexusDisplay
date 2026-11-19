import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDetalleCompraDto } from './dto/create-detalle-compra.dto';
import { UpdateDetalleCompraDto } from './dto/update-detalle-compra.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DetalleCompra } from './entities/detalle-compra.entity';
import { Compra } from '../compras/entities/compra.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DetallesCompraService {
  constructor(
    @InjectRepository(DetalleCompra)
    private repositorioDetallesCompra: Repository<DetalleCompra>,
    @InjectRepository(Compra)
    private repositorioCompras: Repository<Compra>,
  ) {}

  async crear(
    datosDetalleCompra: CreateDetalleCompraDto,
  ): Promise<DetalleCompra> {
    const detalleCompra = new DetalleCompra();
    Object.assign(detalleCompra, datosDetalleCompra);
    detalleCompra.subtotal = Number(
      (
        datosDetalleCompra.cantidad * datosDetalleCompra.costoUnitario
      ).toFixed(2),
    );
    return this.repositorioDetallesCompra.save(detalleCompra);
  }

  async listar(): Promise<DetalleCompra[]> {
    return this.repositorioDetallesCompra.find({
      relations: { compra: true, pantalla: true },
    });
  }

  async obtenerPorId(id: number): Promise<DetalleCompra> {
    const detalleCompra = await this.repositorioDetallesCompra.findOne({
      where: { id },
      relations: { compra: true, pantalla: true },
    });
    if (!detalleCompra)
      throw new NotFoundException('El detalle de compra no existe');
    return detalleCompra;
  }

  async actualizar(
    id: number,
    datosDetalleCompra: UpdateDetalleCompraDto,
  ): Promise<DetalleCompra> {
    const detalleCompra = await this.obtenerPorId(id);
    Object.assign(detalleCompra, datosDetalleCompra);
    detalleCompra.subtotal = Number(
      (detalleCompra.cantidad * detalleCompra.costoUnitario).toFixed(2),
    );
    const guardado = await this.repositorioDetallesCompra.save(detalleCompra);
    // Al corregir una línea también cambia el total de la compra, así que lo
    // vuelvo a sumar con los subtotales guardados.
    const fila = await this.repositorioDetallesCompra
      .createQueryBuilder('detalle')
      .select('COALESCE(SUM(detalle.subtotal), 0)', 'total')
      .where('detalle.idCompra = :idCompra', { idCompra: guardado.idCompra })
      .getRawOne<{ total: string }>();
    await this.repositorioCompras.update(guardado.idCompra, {
      total: Number(fila?.total ?? 0),
    });
    return guardado;
  }

  async eliminar(id: number): Promise<DetalleCompra> {
    const detalleCompra = await this.obtenerPorId(id);
    return this.repositorioDetallesCompra.softRemove(detalleCompra);
  }
}

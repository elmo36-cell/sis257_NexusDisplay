import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDetalleVentaDto } from './dto/create-detalle-venta.dto';
import { UpdateDetalleVentaDto } from './dto/update-detalle-venta.dto';
import { DetalleVenta } from './entities/detalle-venta.entity';
import { Venta } from '../ventas/entities/venta.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class DetallesVentaService {
  constructor(
    @InjectRepository(DetalleVenta)
    private readonly repositorioDetallesVenta: Repository<DetalleVenta>,
    @InjectRepository(Venta)
    private readonly repositorioVentas: Repository<Venta>,
  ) {}

  async crear(
    datosDetalleVenta: CreateDetalleVentaDto,
  ): Promise<DetalleVenta> {
    const detalle = new DetalleVenta();
    Object.assign(detalle, datosDetalleVenta);
    detalle.subtotal = Number(
      (
        Number(datosDetalleVenta.cantidad) *
        Number(datosDetalleVenta.precioUnitario || 0)
      ).toFixed(2),
    );
    return this.repositorioDetallesVenta.save(detalle);
  }

  async listar(): Promise<DetalleVenta[]> {
    return this.repositorioDetallesVenta.find({
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

  async obtenerPorId(id: number): Promise<DetalleVenta> {
    const detalle = await this.repositorioDetallesVenta.findOne({
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

  async actualizar(
    id: number,
    datosDetalleVenta: UpdateDetalleVentaDto,
  ): Promise<DetalleVenta> {
    const detalle = await this.obtenerPorId(id);
    Object.assign(detalle, datosDetalleVenta);
    // Si corrigen la cantidad o el precio, el subtotal de la línea y el total de
    // la venta tienen que cambiar con ella.
    detalle.subtotal = Number(
      (Number(detalle.cantidad) * Number(detalle.precioUnitario)).toFixed(2),
    );
    const guardado = await this.repositorioDetallesVenta.save(detalle);
    await this.recalcularTotalVenta(guardado.idVenta);
    return guardado;
  }

  private async recalcularTotalVenta(idVenta: number): Promise<void> {
    const fila = await this.repositorioDetallesVenta
      .createQueryBuilder('detalle')
      .select('COALESCE(SUM(detalle.subtotal), 0)', 'total')
      .where('detalle.idVenta = :idVenta', { idVenta })
      .getRawOne<{ total: string }>();
    await this.repositorioVentas.update(idVenta, {
      total: Number(fila?.total ?? 0),
    });
  }

  async eliminar(id: number): Promise<DetalleVenta> {
    const detalle = await this.obtenerPorId(id);
    return this.repositorioDetallesVenta.softRemove(detalle);
  }
}

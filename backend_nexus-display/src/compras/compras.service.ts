import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCompraDto } from './dto/create-compra.dto';
import { UpdateCompraDto } from './dto/update-compra.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Compra } from './entities/compra.entity';
import { DataSource, EntityManager, FindOptionsRelations, Repository } from 'typeorm';
import { DetalleCompra } from '../detalles-compra/entities/detalle-compra.entity';
import { InventarioAlmacen } from '../inventario-almacen/entities/inventario-almacen.entity';
import { Pantalla } from '../pantallas/entities/pantalla.entity';
import { Proveedor } from '../proveedores/entities/proveedor.entity';
import { Almacen } from '../almacenes/entities/almacen.entity';

/**
 * Relaciones que devuelvo siempre con una compra completa (proveedor, almacén,
 * usuario y líneas con su pantalla). La uso en el listado y en el detalle para
 * no mantener dos copias del mismo bloque.
 */
const RELACIONES_COMPRA: FindOptionsRelations<Compra> = {
  proveedor: true,
  usuario: true,
  almacen: true,
  detalles: {
    pantalla: {
      modelo: { marca: true },
      calidad: true,
    },
  },
};

@Injectable()
export class ComprasService {
  constructor(
    @InjectRepository(Compra)
    private readonly repositorioCompras: Repository<Compra>,
    private readonly fuenteDatos: DataSource,
  ) {}

  async crear(datosCompra: CreateCompraDto): Promise<Compra> {
    if (!datosCompra.detalles || datosCompra.detalles.length === 0) {
      throw new BadRequestException(
        'La compra debe incluir al menos una pantalla en el detalle',
      );
    }

    const ejecutor = this.fuenteDatos.createQueryRunner();
    await ejecutor.connect();
    await ejecutor.startTransaction();

    try {
      const proveedor = await ejecutor.manager.findOne(Proveedor, {
        where: { id: datosCompra.idProveedor },
      });
      if (!proveedor) {
        throw new NotFoundException('El proveedor seleccionado no existe');
      }

      const almacen = await ejecutor.manager.findOne(Almacen, {
        where: { id: datosCompra.idAlmacen },
      });
      if (!almacen) {
        throw new NotFoundException(
          'El almacén receptor seleccionado no existe',
        );
      }

      const compra = new Compra();
      compra.idProveedor = datosCompra.idProveedor;
      compra.idUsuario = datosCompra.idUsuario || 1;
      compra.idAlmacen = datosCompra.idAlmacen;
      compra.total = 0;

      const compraGuardada = await ejecutor.manager.save(Compra, compra);

      let totalAcumulado = 0;

      for (const item of datosCompra.detalles) {
        const pantalla = await ejecutor.manager.findOne(Pantalla, {
          where: { id: item.idPantalla },
        });
        if (!pantalla) {
          throw new NotFoundException(
            `La pantalla con ID ${item.idPantalla} no existe`,
          );
        }

        const subtotal = Number(
          (Number(item.cantidad) * Number(item.costoUnitario)).toFixed(2),
        );
        totalAcumulado += subtotal;

        const detalle = new DetalleCompra();
        detalle.idCompra = compraGuardada.id;
        detalle.idPantalla = item.idPantalla;
        detalle.cantidad = Number(item.cantidad);
        detalle.costoUnitario = Number(item.costoUnitario);
        detalle.subtotal = subtotal;

        await ejecutor.manager.save(DetalleCompra, detalle);

        // Sumo la cantidad al inventario del almacén receptor con el mismo
        // ajuste que uso al editar, así no repito la búsqueda y el alta del
        // registro de stock en los dos métodos.
        await this.ajustarStock(
          ejecutor.manager,
          item.idPantalla,
          datosCompra.idAlmacen,
          Number(item.cantidad),
        );
      }

      compraGuardada.total = Number(totalAcumulado.toFixed(2));
      await ejecutor.manager.save(Compra, compraGuardada);

      await ejecutor.commitTransaction();
      return this.obtenerPorId(compraGuardada.id);
    } catch (error) {
      await ejecutor.rollbackTransaction();
      throw error;
    } finally {
      await ejecutor.release();
    }
  }

  async listar(): Promise<Compra[]> {
    return this.repositorioCompras.find({
      relations: RELACIONES_COMPRA,
      order: { id: 'DESC' },
    });
  }

  async obtenerPorId(id: number): Promise<Compra> {
    const compra = await this.repositorioCompras.findOne({
      where: { id },
      relations: RELACIONES_COMPRA,
    });
    if (!compra) {
      throw new NotFoundException(`La compra con ID ${id} no existe`);
    }
    return compra;
  }

  /**
   * Edito una compra ya registrada (proveedor, sucursal, fecha y líneas). Para
   * que el inventario no quede descuadrado primero devuelvo al almacén anterior
   * el stock que había ingresado esta compra y después aplico lo corregido en la
   * sucursal elegida.
   */
  async actualizar(id: number, datosCompra: UpdateCompraDto): Promise<Compra> {
    const compra = await this.obtenerPorId(id);
    const idAlmacen = datosCompra.idAlmacen ?? compra.idAlmacen;

    // Si no mandan líneas, reutilizo las que ya tiene la compra con sus mismos
    // valores: así el stock se devuelve y se vuelve a sumar sin cambios.
    const lineas =
      datosCompra.detalles ??
      compra.detalles.map((detalle) => ({
        idPantalla: detalle.idPantalla,
        cantidad: Number(detalle.cantidad),
        costoUnitario: Number(detalle.costoUnitario),
      }));

    if (lineas.length === 0) {
      throw new BadRequestException(
        'La compra debe incluir al menos una pantalla en el detalle',
      );
    }

    const ejecutor = this.fuenteDatos.createQueryRunner();
    await ejecutor.connect();
    await ejecutor.startTransaction();

    try {
      if (datosCompra.idProveedor) {
        const proveedor = await ejecutor.manager.findOne(Proveedor, {
          where: { id: datosCompra.idProveedor },
        });
        if (!proveedor) {
          throw new NotFoundException('El proveedor seleccionado no existe');
        }
      }

      if (datosCompra.idAlmacen && datosCompra.idAlmacen !== compra.idAlmacen) {
        const almacen = await ejecutor.manager.findOne(Almacen, {
          where: { id: datosCompra.idAlmacen },
        });
        if (!almacen) {
          throw new NotFoundException(
            'El almacén receptor seleccionado no existe',
          );
        }
      }

      // Devuelvo el stock de las líneas anteriores antes de reemplazarlas.
      for (const anterior of compra.detalles) {
        await this.ajustarStock(
          ejecutor.manager,
          anterior.idPantalla,
          compra.idAlmacen,
          -Number(anterior.cantidad),
        );
      }
      await ejecutor.manager.remove(DetalleCompra, compra.detalles);

      let totalAcumulado = 0;

      for (const linea of lineas) {
        const pantalla = await ejecutor.manager.findOne(Pantalla, {
          where: { id: linea.idPantalla },
        });
        if (!pantalla) {
          throw new NotFoundException(
            `La pantalla con ID ${linea.idPantalla} no existe`,
          );
        }

        const subtotal = Number(
          (Number(linea.cantidad) * Number(linea.costoUnitario)).toFixed(2),
        );
        totalAcumulado += subtotal;

        const detalle = new DetalleCompra();
        detalle.idCompra = compra.id;
        detalle.idPantalla = linea.idPantalla;
        detalle.cantidad = Number(linea.cantidad);
        detalle.costoUnitario = Number(linea.costoUnitario);
        detalle.subtotal = subtotal;
        await ejecutor.manager.save(DetalleCompra, detalle);

        await this.ajustarStock(
          ejecutor.manager,
          linea.idPantalla,
          idAlmacen,
          Number(linea.cantidad),
        );
      }

      if (datosCompra.idProveedor) {
        compra.idProveedor = datosCompra.idProveedor;
      }
      compra.idAlmacen = idAlmacen;
      if (datosCompra.fecha) {
        compra.fecha = new Date(datosCompra.fecha);
      }
      compra.total = Number(totalAcumulado.toFixed(2));

      await ejecutor.manager.save(Compra, compra);
      await ejecutor.commitTransaction();
      return this.obtenerPorId(id);
    } catch (error) {
      await ejecutor.rollbackTransaction();
      throw error;
    } finally {
      await ejecutor.release();
    }
  }

  /**
   * Sumo o resto unidades al inventario de una pantalla en un almacén. Lo uso al
   * registrar y al editar una compra: nunca dejo el stock en negativo, porque el
   * descuento es solo la devolución de lo que esta misma compra había ingresado.
   */
  private async ajustarStock(
    manager: EntityManager,
    idPantalla: number,
    idAlmacen: number,
    delta: number,
  ): Promise<void> {
    const inventario = await manager.findOne(InventarioAlmacen, {
      where: { idPantalla, idAlmacen },
    });

    if (inventario) {
      inventario.cantidad = Math.max(0, Number(inventario.cantidad) + delta);
      await manager.save(InventarioAlmacen, inventario);
      return;
    }

    if (delta <= 0) return;

    const nuevoInventario = new InventarioAlmacen();
    nuevoInventario.idPantalla = idPantalla;
    nuevoInventario.idAlmacen = idAlmacen;
    nuevoInventario.cantidad = delta;
    await manager.save(InventarioAlmacen, nuevoInventario);
  }

  async eliminar(id: number): Promise<Compra> {
    const compra = await this.obtenerPorId(id);
    return this.repositorioCompras.softRemove(compra);
  }
}

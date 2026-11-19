import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateVentaDto } from './dto/create-venta.dto';
import { UpdateVentaDto } from './dto/update-venta.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Venta } from './entities/venta.entity';
import { DataSource, FindOptionsRelations, In, Repository } from 'typeorm';
import { Pantalla } from '../pantallas/entities/pantalla.entity';
import { InventarioAlmacen } from '../inventario-almacen/entities/inventario-almacen.entity';
import { DetalleVenta } from '../detalles-venta/entities/detalle-venta.entity';
import { Almacen } from '../almacenes/entities/almacen.entity';
import { TipoPago } from './enums/tipo-pago.enum';

/**
 * Relaciones que devuelvo siempre con una venta completa (usuario, almacén y
 * líneas con su pantalla). La uso en el listado y en el detalle para no
 * mantener dos copias del mismo bloque.
 */
const RELACIONES_VENTA: FindOptionsRelations<Venta> = {
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
export class VentasService {
  constructor(
    @InjectRepository(Venta)
    private readonly repositorioVentas: Repository<Venta>,
    private readonly fuenteDatos: DataSource,
  ) {}

  /**
   * Registrar una venta con todos sus detalles. Como toco varias tablas
   * (venta, detalle e inventario) lo hago dentro de una transacción: si algo
   * sale mal se deshace todo y no queda stock descontado sin venta.
   * El total lo calculo acá sumando los subtotales, no lo tomo del frontend,
   * para que no se pueda mandar un total falso.
   */
  async crear(datosVenta: CreateVentaDto): Promise<Venta> {
    if (!datosVenta.detalles || datosVenta.detalles.length === 0) {
      throw new BadRequestException(
        'La venta debe contener al menos una pantalla en el detalle',
      );
    }

    const ejecutor = this.fuenteDatos.createQueryRunner();
    await ejecutor.connect();
    await ejecutor.startTransaction();

    try {
      // 1. Verificar que el almacén exista
      const almacen = await ejecutor.manager.findOne(Almacen, {
        where: { id: datosVenta.idAlmacen },
      });
      if (!almacen) {
        throw new NotFoundException(
          `El almacén con ID ${datosVenta.idAlmacen} no existe`,
        );
      }

      // 2. Crear la cabecera de la venta
      const venta = new Venta();
      venta.idUsuario = datosVenta.idUsuario || 1;
      venta.idAlmacen = datosVenta.idAlmacen;
      venta.nombreCliente = datosVenta.nombreCliente?.trim() || 'CLIENTE S/N';
      venta.documentoCliente = datosVenta.documentoCliente?.trim() || '0';
      venta.tipoPago = datosVenta.tipoPago ?? TipoPago.EFECTIVO;
      venta.total = 0;

      const ventaGuardada = await ejecutor.manager.save(Venta, venta);

      let totalAcumulado = 0;

      // Traigo las pantallas del detalle y su inventario en este almacén con
      // una consulta cada uno, en vez de repetir la misma búsqueda por línea.
      const idsPantallas = datosVenta.detalles.map((item) => item.idPantalla);
      const pantallasPorId = new Map(
        (
          await ejecutor.manager.find(Pantalla, {
            where: { id: In(idsPantallas) },
          })
        ).map((pantalla): [number, Pantalla] => [pantalla.id, pantalla]),
      );
      const inventariosPorPantalla = new Map(
        (
          await ejecutor.manager.find(InventarioAlmacen, {
            where: {
              idPantalla: In(idsPantallas),
              idAlmacen: datosVenta.idAlmacen,
            },
          })
        ).map(
          (inventario): [number, InventarioAlmacen] => [
            inventario.idPantalla,
            inventario,
          ],
        ),
      );

      // 3. Procesar cada ítem del detalle y descontar del inventario del almacén
      for (const item of datosVenta.detalles) {
        const pantalla = pantallasPorId.get(item.idPantalla);
        if (!pantalla) {
          throw new NotFoundException(
            `La pantalla con ID ${item.idPantalla} no existe`,
          );
        }

        const inventario = inventariosPorPantalla.get(item.idPantalla);

        if (!inventario || inventario.cantidad < item.cantidad) {
          const disponible = inventario ? inventario.cantidad : 0;
          throw new BadRequestException(
            `Stock insuficiente para "${pantalla.nombre}" en el almacén "${almacen.nombre}". Disponible: ${disponible}, Solicitado: ${item.cantidad}`,
          );
        }

        // Descontar stock
        inventario.cantidad -= Number(item.cantidad);
        await ejecutor.manager.save(InventarioAlmacen, inventario);

        // Calcular precio y subtotal
        const precioAplicado =
          item.precioUnitario !== undefined && item.precioUnitario !== null
            ? Number(item.precioUnitario)
            : Number(pantalla.precioVenta);

        const subtotal = Number(( Number(item.cantidad) * precioAplicado ).toFixed(2));
        totalAcumulado += subtotal;

        // Guardar el detalle de la venta
        const detalle = new DetalleVenta();
        detalle.idVenta = ventaGuardada.id;
        detalle.idPantalla = item.idPantalla;
        detalle.cantidad = Number(item.cantidad);
        detalle.precioUnitario = precioAplicado;
        detalle.subtotal = subtotal;

        await ejecutor.manager.save(DetalleVenta, detalle);
      }

      // 4. Actualizar el total en la cabecera de la venta
      ventaGuardada.total = Number(totalAcumulado.toFixed(2));
      await ejecutor.manager.save(Venta, ventaGuardada);

      await ejecutor.commitTransaction();
      return this.obtenerPorId(ventaGuardada.id);
    } catch (error) {
      await ejecutor.rollbackTransaction();
      throw error;
    } finally {
      await ejecutor.release();
    }
  }

  /**
   * Listado de ventas según el rol: el vendedor ve solo las de su sucursal
   * (saco el idAlmacen del token) y el admin ve todas. Si el vendedor no tiene
   * sucursal asignada devuelvo vacío para no mostrarle ventas de otras tiendas.
   */
  async listar(usuario?: {
    rol?: string;
    idAlmacen?: number | null;
    id?: number;
  }): Promise<Venta[]> {
    // El VENDEDOR solo ve las ventas de su sucursal; el CLIENTE solo sus
    // propias compras y el ADMIN ve todas.
    const esVendedor = usuario?.rol === 'VENDEDOR';
    const esCliente = usuario?.rol === 'CLIENTE';
    if (esVendedor && !usuario?.idAlmacen) return [];

    const where = esVendedor
      ? { idAlmacen: Number(usuario?.idAlmacen) }
      : esCliente
        ? { idUsuario: Number(usuario?.id) }
        : {};

    return this.repositorioVentas.find({
      where,
      relations: RELACIONES_VENTA,
      order: { id: 'DESC' },
    });
  }

  async obtenerPorId(id: number): Promise<Venta> {
    const venta = await this.repositorioVentas.findOne({
      where: { id },
      relations: RELACIONES_VENTA,
    });
    if (!venta) {
      throw new NotFoundException(`La venta con ID ${id} no existe`);
    }
    return venta;
  }

  async actualizar(id: number, datosVenta: UpdateVentaDto): Promise<Venta> {
    const venta = await this.obtenerPorId(id);
    if (datosVenta.nombreCliente !== undefined) {
      venta.nombreCliente = datosVenta.nombreCliente.trim();
    }
    if (datosVenta.documentoCliente !== undefined) {
      venta.documentoCliente = datosVenta.documentoCliente.trim();
    }
    await this.repositorioVentas.save(venta);
    return this.obtenerPorId(id);
  }

  /**
   * Anular venta: la borro de forma lógica (softRemove) y devuelvo las unidades
   * al inventario del mismo almacén. También va en transacción para que no quede
   * la venta anulada pero el stock sin devolver. Si el registro de inventario no
   * existe lo creo, así el stock siempre queda bien.
   */
  async eliminar(id: number): Promise<Venta> {
    const venta = await this.obtenerPorId(id);

    const ejecutor = this.fuenteDatos.createQueryRunner();
    await ejecutor.connect();
    await ejecutor.startTransaction();

    try {
      // Devolver las pantallas al inventario del almacén antes de anular la venta
      if (venta.detalles && venta.detalles.length > 0) {
        for (const detalle of venta.detalles) {
          let inventario = await ejecutor.manager.findOne(InventarioAlmacen, {
            where: {
              idPantalla: detalle.idPantalla,
              idAlmacen: venta.idAlmacen,
            },
          });

          if (inventario) {
            inventario.cantidad += Number(detalle.cantidad);
            await ejecutor.manager.save(InventarioAlmacen, inventario);
          } else {
            inventario = new InventarioAlmacen();
            inventario.idPantalla = detalle.idPantalla;
            inventario.idAlmacen = venta.idAlmacen;
            inventario.cantidad = Number(detalle.cantidad);
            await ejecutor.manager.save(InventarioAlmacen, inventario);
          }

          await ejecutor.manager.softRemove(DetalleVenta, detalle);
        }
      }

      const ventaEliminada = await ejecutor.manager.softRemove(Venta, venta);
      await ejecutor.commitTransaction();
      return ventaEliminada;
    } catch (error) {
      await ejecutor.rollbackTransaction();
      throw error;
    } finally {
      await ejecutor.release();
    }
  }
}

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateVentaDto } from './dto/create-venta.dto';
import { UpdateVentaDto } from './dto/update-venta.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Venta } from './entities/venta.entity';
import { DataSource, Repository } from 'typeorm';
import { Pantalla } from '../pantallas/entities/pantalla.entity';
import { InventarioAlmacen } from '../inventario-almacen/entities/inventario-almacen.entity';
import { DetalleVenta } from '../detalles-venta/entities/detalle-venta.entity';
import { Almacen } from '../almacenes/entities/almacen.entity';

@Injectable()
export class VentasService {
  constructor(
    @InjectRepository(Venta)
    private readonly ventasRepository: Repository<Venta>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createVentaDto: CreateVentaDto): Promise<Venta> {
    if (!createVentaDto.detalles || createVentaDto.detalles.length === 0) {
      throw new BadRequestException(
        'La venta debe contener al menos una pantalla en el detalle',
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Verificar que el almacén exista
      const almacen = await queryRunner.manager.findOne(Almacen, {
        where: { id: createVentaDto.idAlmacen },
      });
      if (!almacen) {
        throw new NotFoundException(
          `El almacén con ID ${createVentaDto.idAlmacen} no existe`,
        );
      }

      // 2. Crear la cabecera de la venta
      const venta = new Venta();
      venta.idUsuario = createVentaDto.idUsuario || 1;
      venta.idAlmacen = createVentaDto.idAlmacen;
      venta.nombreCliente = createVentaDto.nombreCliente?.trim() || 'CLIENTE S/N';
      venta.documentoCliente = createVentaDto.documentoCliente?.trim() || '0';
      venta.total = 0;

      const ventaGuardada = await queryRunner.manager.save(Venta, venta);

      let totalAcumulado = 0;

      // 3. Procesar cada ítem del detalle y descontar del inventario del almacén
      for (const item of createVentaDto.detalles) {
        const pantalla = await queryRunner.manager.findOne(Pantalla, {
          where: { id: item.idPantalla },
        });
        if (!pantalla) {
          throw new NotFoundException(
            `La pantalla con ID ${item.idPantalla} no existe`,
          );
        }

        const inventario = await queryRunner.manager.findOne(InventarioAlmacen, {
          where: {
            idPantalla: item.idPantalla,
            idAlmacen: createVentaDto.idAlmacen,
          },
        });

        if (!inventario || inventario.cantidad < item.cantidad) {
          const disponible = inventario ? inventario.cantidad : 0;
          throw new BadRequestException(
            `Stock insuficiente para "${pantalla.nombre}" en el almacén "${almacen.nombre}". Disponible: ${disponible}, Solicitado: ${item.cantidad}`,
          );
        }

        // Descontar stock
        inventario.cantidad -= Number(item.cantidad);
        await queryRunner.manager.save(InventarioAlmacen, inventario);

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

        await queryRunner.manager.save(DetalleVenta, detalle);
      }

      // 4. Actualizar el total en la cabecera de la venta
      ventaGuardada.total = Number(totalAcumulado.toFixed(2));
      await queryRunner.manager.save(Venta, ventaGuardada);

      await queryRunner.commitTransaction();
      return this.findOne(ventaGuardada.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<Venta[]> {
    return this.ventasRepository.find({
      relations: {
        usuario: true,
        almacen: true,
        detalles: {
          pantalla: {
            modelo: { marca: true },
            calidad: true,
          },
        },
      },
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Venta> {
    const venta = await this.ventasRepository.findOne({
      where: { id },
      relations: {
        usuario: true,
        almacen: true,
        detalles: {
          pantalla: {
            modelo: { marca: true },
            calidad: true,
          },
        },
      },
    });
    if (!venta) {
      throw new NotFoundException(`La venta con ID ${id} no existe`);
    }
    return venta;
  }

  async update(id: number, updateVentaDto: UpdateVentaDto): Promise<Venta> {
    const venta = await this.findOne(id);
    if (updateVentaDto.nombreCliente !== undefined) {
      venta.nombreCliente = updateVentaDto.nombreCliente.trim();
    }
    if (updateVentaDto.documentoCliente !== undefined) {
      venta.documentoCliente = updateVentaDto.documentoCliente.trim();
    }
    await this.ventasRepository.save(venta);
    return this.findOne(id);
  }

  async remove(id: number): Promise<Venta> {
    const venta = await this.findOne(id);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Devolver las pantallas al inventario del almacén antes de anular la venta
      if (venta.detalles && venta.detalles.length > 0) {
        for (const detalle of venta.detalles) {
          let inventario = await queryRunner.manager.findOne(InventarioAlmacen, {
            where: {
              idPantalla: detalle.idPantalla,
              idAlmacen: venta.idAlmacen,
            },
          });

          if (inventario) {
            inventario.cantidad += Number(detalle.cantidad);
            await queryRunner.manager.save(InventarioAlmacen, inventario);
          } else {
            inventario = new InventarioAlmacen();
            inventario.idPantalla = detalle.idPantalla;
            inventario.idAlmacen = venta.idAlmacen;
            inventario.cantidad = Number(detalle.cantidad);
            await queryRunner.manager.save(InventarioAlmacen, inventario);
          }

          await queryRunner.manager.softRemove(DetalleVenta, detalle);
        }
      }

      const ventaEliminada = await queryRunner.manager.softRemove(Venta, venta);
      await queryRunner.commitTransaction();
      return ventaEliminada;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}

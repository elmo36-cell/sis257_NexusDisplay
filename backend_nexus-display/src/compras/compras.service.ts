import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCompraDto } from './dto/create-compra.dto';
import { UpdateCompraDto } from './dto/update-compra.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Compra } from './entities/compra.entity';
import { DataSource, Repository } from 'typeorm';
import { DetalleCompra } from '../detalles-compra/entities/detalle-compra.entity';
import { InventarioAlmacen } from '../inventario-almacen/entities/inventario-almacen.entity';
import { Pantalla } from '../pantallas/entities/pantalla.entity';
import { Proveedor } from '../proveedores/entities/proveedor.entity';
import { Almacen } from '../almacenes/entities/almacen.entity';

@Injectable()
export class ComprasService {
  constructor(
    @InjectRepository(Compra)
    private readonly comprasRepository: Repository<Compra>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createCompraDto: CreateCompraDto): Promise<Compra> {
    if (!createCompraDto.detalles || createCompraDto.detalles.length === 0) {
      throw new BadRequestException(
        'La compra debe incluir al menos una pantalla en el detalle',
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const proveedor = await queryRunner.manager.findOne(Proveedor, {
        where: { id: createCompraDto.idProveedor },
      });
      if (!proveedor) {
        throw new NotFoundException('El proveedor seleccionado no existe');
      }

      const almacen = await queryRunner.manager.findOne(Almacen, {
        where: { id: createCompraDto.idAlmacen },
      });
      if (!almacen) {
        throw new NotFoundException(
          'El almacén receptor seleccionado no existe',
        );
      }

      const compra = new Compra();
      compra.idProveedor = createCompraDto.idProveedor;
      compra.idUsuario = createCompraDto.idUsuario || 1;
      compra.idAlmacen = createCompraDto.idAlmacen;
      compra.total = 0;

      const compraGuardada = await queryRunner.manager.save(Compra, compra);

      let totalAcumulado = 0;

      for (const item of createCompraDto.detalles) {
        const pantalla = await queryRunner.manager.findOne(Pantalla, {
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

        await queryRunner.manager.save(DetalleCompra, detalle);

        // Sumar stock al inventario del almacén receptor
        let inventario = await queryRunner.manager.findOne(InventarioAlmacen, {
          where: {
            idPantalla: item.idPantalla,
            idAlmacen: createCompraDto.idAlmacen,
          },
        });

        if (inventario) {
          inventario.cantidad += Number(item.cantidad);
          await queryRunner.manager.save(InventarioAlmacen, inventario);
        } else {
          inventario = new InventarioAlmacen();
          inventario.idPantalla = item.idPantalla;
          inventario.idAlmacen = createCompraDto.idAlmacen;
          inventario.cantidad = Number(item.cantidad);
          await queryRunner.manager.save(InventarioAlmacen, inventario);
        }
      }

      compraGuardada.total = Number(totalAcumulado.toFixed(2));
      await queryRunner.manager.save(Compra, compraGuardada);

      await queryRunner.commitTransaction();
      return this.findOne(compraGuardada.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<Compra[]> {
    return this.comprasRepository.find({
      relations: {
        proveedor: true,
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

  async findOne(id: number): Promise<Compra> {
    const compra = await this.comprasRepository.findOne({
      where: { id },
      relations: {
        proveedor: true,
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
    if (!compra) {
      throw new NotFoundException(`La compra con ID ${id} no existe`);
    }
    return compra;
  }

  async update(id: number, updateCompraDto: UpdateCompraDto): Promise<Compra> {
    const compra = await this.findOne(id);
    Object.assign(compra, updateCompraDto);
    await this.comprasRepository.save(compra);
    return this.findOne(id);
  }

  async remove(id: number): Promise<Compra> {
    const compra = await this.findOne(id);
    return this.comprasRepository.softRemove(compra);
  }
}

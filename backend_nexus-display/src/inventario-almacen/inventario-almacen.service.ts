import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateInventarioAlmacenDto } from './dto/create-inventario-almacen.dto';
import { UpdateInventarioAlmacenDto } from './dto/update-inventario-almacen.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { InventarioAlmacen } from './entities/inventario-almacen.entity';
import { Repository } from 'typeorm';

@Injectable()
export class InventarioAlmacenService {
  constructor(
    @InjectRepository(InventarioAlmacen)
    private repositorioInventarioAlmacen: Repository<InventarioAlmacen>,
  ) {}

  async crear(
    datosInventarioAlmacen: CreateInventarioAlmacenDto,
  ): Promise<InventarioAlmacen> {
    let inventario = await this.repositorioInventarioAlmacen.findOneBy({
      idPantalla: datosInventarioAlmacen.idPantalla,
      idAlmacen: datosInventarioAlmacen.idAlmacen,
    });
    if (inventario) {
      throw new ConflictException(
        'El registro de inventario ya existe en este almacén',
      );
    }

    inventario = new InventarioAlmacen();
    Object.assign(inventario, datosInventarioAlmacen);
    return this.repositorioInventarioAlmacen.save(inventario);
  }

  /**
   * Listado de inventario: el ADMIN ve todas las sucursales y el VENDEDOR solo
   * el stock del almacén que tiene asignado, así no ve mercadería de tiendas que
   * no le corresponden. Si el vendedor no tiene sucursal devuelvo vacío en vez
   * de mostrarle todo el inventario de la empresa.
   */
  async listar(usuario?: {
    rol?: string;
    idAlmacen?: number | null;
  }): Promise<InventarioAlmacen[]> {
    const esVendedor = usuario?.rol === 'VENDEDOR';
    if (esVendedor && !usuario?.idAlmacen) return [];

    return this.repositorioInventarioAlmacen.find({
      where: esVendedor ? { idAlmacen: Number(usuario?.idAlmacen) } : {},
      relations: {
        pantalla: { modelo: { marca: true }, calidad: true, categoria: true },
        almacen: true,
      },
      order: { id: 'ASC' },
    });
  }

  async obtenerPorId(id: number): Promise<InventarioAlmacen> {
    const inventario = await this.repositorioInventarioAlmacen.findOne({
      where: { id },
      relations: {
        pantalla: { modelo: { marca: true }, calidad: true, categoria: true },
        almacen: true,
      },
    });
    if (!inventario)
      throw new NotFoundException('El registro de inventario no existe');
    return inventario;
  }

  async actualizar(
    id: number,
    datosInventarioAlmacen: UpdateInventarioAlmacenDto,
  ): Promise<InventarioAlmacen> {
    const inventario = await this.obtenerPorId(id);
    Object.assign(inventario, datosInventarioAlmacen);
    return this.repositorioInventarioAlmacen.save(inventario);
  }

  async eliminar(id: number): Promise<InventarioAlmacen> {
    const inventario = await this.obtenerPorId(id);
    return this.repositorioInventarioAlmacen.softRemove(inventario);
  }
}

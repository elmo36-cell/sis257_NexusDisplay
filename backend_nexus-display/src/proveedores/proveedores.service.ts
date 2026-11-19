import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Proveedor } from './entities/proveedor.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProveedoresService {
  constructor(@InjectRepository(Proveedor) private repositorioProveedores: Repository<Proveedor>) {}

  async crear(datosProveedor: CreateProveedorDto): Promise<Proveedor> {
    let proveedor = await this.repositorioProveedores.findOneBy({
      nit: datosProveedor.nit,
    });
    if (proveedor) throw new ConflictException('El proveedor ya existe');

    proveedor = new Proveedor();
    Object.assign(proveedor, datosProveedor);
    return this.repositorioProveedores.save(proveedor);
  }

  async listar(): Promise<Proveedor[]> {
    return this.repositorioProveedores.find();
  }

  async obtenerPorId(id: number): Promise<Proveedor> {
    const proveedor = await this.repositorioProveedores.findOneBy({ id });
    if (!proveedor) throw new NotFoundException('El proveedor no existe');
    return proveedor;
  }

  async actualizar(id: number, datosProveedor: UpdateProveedorDto): Promise<Proveedor> {
    const proveedor = await this.obtenerPorId(id);
    Object.assign(proveedor, datosProveedor);
    return this.repositorioProveedores.save(proveedor);
  }

  async eliminar(id: number): Promise<Proveedor> {
    const proveedor = await this.obtenerPorId(id);
    return this.repositorioProveedores.softRemove(proveedor);
  }
}

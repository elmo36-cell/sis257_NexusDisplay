import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAlmacenDto } from './dto/create-almacen.dto';
import { UpdateAlmacenDto } from './dto/update-almacen.dto';
import { Almacen } from './entities/almacen.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AlmacenesService {
  constructor(
    @InjectRepository(Almacen) private repositorioAlmacenes: Repository<Almacen>,
  ) {}

  async crear(datosAlmacen: CreateAlmacenDto): Promise<Almacen> {
    let almacen = await this.repositorioAlmacenes.findOneBy({
      nombre: datosAlmacen.nombre,
    });
    if (almacen) throw new ConflictException('El almacén ya existe');

    almacen = new Almacen();
    Object.assign(almacen, datosAlmacen);
    return this.repositorioAlmacenes.save(almacen);
  }

  async listar(): Promise<Almacen[]> {
    return this.repositorioAlmacenes.find();
  }

  async obtenerPorId(id: number): Promise<Almacen> {
    const almacen = await this.repositorioAlmacenes.findOneBy({ id });
    if (!almacen) throw new NotFoundException('El almacén no existe');
    return almacen;
  }

  async actualizar(
    id: number,
    datosAlmacen: UpdateAlmacenDto,
  ): Promise<Almacen> {
    const almacen = await this.obtenerPorId(id);
    Object.assign(almacen, datosAlmacen);
    return this.repositorioAlmacenes.save(almacen);
  }

  async eliminar(id: number): Promise<Almacen> {
    const almacen = await this.obtenerPorId(id);
    return this.repositorioAlmacenes.softRemove(almacen);
  }
}

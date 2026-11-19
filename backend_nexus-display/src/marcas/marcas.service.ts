import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMarcaDto } from './dto/create-marca.dto';
import { UpdateMarcaDto } from './dto/update-marca.dto';
import { Marca } from './entities/marca.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class MarcasService {
  constructor(@InjectRepository(Marca) private repositorioMarcas: Repository<Marca>) {}

  async crear(datosMarca: CreateMarcaDto): Promise<Marca> {
    let marca = await this.repositorioMarcas.findOneBy({
      nombre: datosMarca.nombre,
    });
    if (marca) throw new ConflictException('La marca ya existe');

    marca = new Marca();
    Object.assign(marca, datosMarca);
    return this.repositorioMarcas.save(marca);
  }

  async listar(): Promise<Marca[]> {
    return this.repositorioMarcas.find();
  }

  async obtenerPorId(id: number): Promise<Marca> {
    const marca = await this.repositorioMarcas.findOneBy({ id });
    if (!marca) throw new NotFoundException('La marca no existe');
    return marca;
  }

  async actualizar(id: number, datosMarca: UpdateMarcaDto): Promise<Marca> {
    const marca = await this.obtenerPorId(id);
    Object.assign(marca, datosMarca);
    return this.repositorioMarcas.save(marca);
  }

  async eliminar(id: number): Promise<Marca> {
    const marca = await this.obtenerPorId(id);
    return this.repositorioMarcas.softRemove(marca);
  }
}

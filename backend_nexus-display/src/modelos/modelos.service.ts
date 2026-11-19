import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateModeloDto } from './dto/create-modelo.dto';
import { UpdateModeloDto } from './dto/update-modelo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Modelo } from './entities/modelo.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ModelosService {
  constructor(@InjectRepository(Modelo) private repositorioModelos: Repository<Modelo>) {}

  async crear(datosModelo: CreateModeloDto): Promise<Modelo> {
    let modelo = await this.repositorioModelos.findOneBy({
      idMarca: datosModelo.idMarca,
      nombre: datosModelo.nombre,
    });
    if (modelo) throw new ConflictException('El modelo ya existe');

    modelo = new Modelo();
    Object.assign(modelo, datosModelo);
    return this.repositorioModelos.save(modelo);
  }

  async listar(): Promise<Modelo[]> {
    return this.repositorioModelos.find({ relations: { marca: true } });
  }

  async obtenerPorId(id: number): Promise<Modelo> {
    const modelo = await this.repositorioModelos.findOne({
      where: { id },
      relations: { marca: true },
    });
    if (!modelo) throw new NotFoundException('El modelo no existe');
    return modelo;
  }

  async actualizar(id: number, datosModelo: UpdateModeloDto): Promise<Modelo> {
    const modelo = await this.obtenerPorId(id);
    Object.assign(modelo, datosModelo);
    return this.repositorioModelos.save(modelo);
  }

  async eliminar(id: number): Promise<Modelo> {
    const modelo = await this.obtenerPorId(id);
    return this.repositorioModelos.softRemove(modelo);
  }
}

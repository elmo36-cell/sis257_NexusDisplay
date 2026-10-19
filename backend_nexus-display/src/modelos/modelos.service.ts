import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateModeloDto } from './dto/create-modelo.dto';
import { UpdateModeloDto } from './dto/update-modelo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Modelo } from './entities/modelo.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ModelosService {
  constructor(@InjectRepository(Modelo) private modelosRepository: Repository<Modelo>) {}

  async create(createModeloDto: CreateModeloDto): Promise<Modelo> {
    const modeloExistente = await this.modelosRepository.findOneBy({
      nombre: createModeloDto.nombre,
      idMarca: createModeloDto.idMarca,
    });
    if (modeloExistente) throw new ConflictException('El modelo ya existe para esta marca');

    const modelo = new Modelo();
    Object.assign(modelo, createModeloDto);
    return this.modelosRepository.save(modelo);
  }

  async findAll(): Promise<Modelo[]> {
    return this.modelosRepository.find({ relations: {'marca':true} });
  }

  async findOne(id: number): Promise<Modelo> {
    const modelo = await this.modelosRepository.findOne({
      where: { id },
      relations: {'marca':true},
    });
    if (!modelo) throw new NotFoundException('El modelo no existe');
    return modelo;
  }

  async update(id: number, updateModeloDto: UpdateModeloDto): Promise<Modelo> {
    const modelo = await this.findOne(id);
    Object.assign(modelo, updateModeloDto);
    return this.modelosRepository.save(modelo);
  }

  async remove(id: number): Promise<Modelo> {
    const modelo = await this.findOne(id);
    return this.modelosRepository.softRemove(modelo);
  }
}

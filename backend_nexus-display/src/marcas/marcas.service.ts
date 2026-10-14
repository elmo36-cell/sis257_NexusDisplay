import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateMarcaDto } from './dto/create-marca.dto';
import { UpdateMarcaDto } from './dto/update-marca.dto';
import { Marca } from './entities/marca.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class MarcasService {
 constructor(
    @InjectRepository(Marca) private marcasRepository: Repository<Marca>,
  ) {}

  async create(createMarcaDto: CreateMarcaDto): Promise<Marca> {
    const marcaExistente = await this.marcasRepository.findOneBy({
      nombre: createMarcaDto.nombre,
    });
    if (marcaExistente) throw new ConflictException('La marca ya existe');

    const marca = new Marca();
    Object.assign(marca, createMarcaDto);
    return this.marcasRepository.save(marca);
  }

  async findAll(): Promise<Marca[]> {
    return this.marcasRepository.find();
  }

  async findOne(id: number): Promise<Marca> {
    const marca = await this.marcasRepository.findOneBy({ id });
    if (!marca) throw new NotFoundException('La marca no existe');
    return marca;
  }

  async update(id: number, updateMarcaDto: UpdateMarcaDto): Promise<Marca> {
    const marca = await this.findOne(id);
    Object.assign(marca, updateMarcaDto);
    return this.marcasRepository.save(marca);
  }

  async remove(id: number): Promise<Marca> {
    const marca = await this.findOne(id);
    return this.marcasRepository.softRemove(marca);
  }
}
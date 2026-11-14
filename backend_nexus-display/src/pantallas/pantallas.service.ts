import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pantalla } from './entities/pantalla.entity';
import { CreatePantallaDto } from './dto/create-pantalla.dto';
import { UpdatePantallaDto } from './dto/update-pantalla.dto';

@Injectable()
export class PantallasService {
  constructor(
    @InjectRepository(Pantalla)
    private pantallasRepository: Repository<Pantalla>,
  ) {}

  async create(createPantallaDto: CreatePantallaDto): Promise<Pantalla> {
    let pantalla = await this.pantallasRepository.findOneBy({
      codigo: createPantallaDto.codigo,
    });
    if (pantalla) throw new ConflictException('La pantalla ya existe');

    pantalla = new Pantalla();
    Object.assign(pantalla, createPantallaDto);
    return this.pantallasRepository.save(pantalla);
  }

  async findAll(): Promise<Pantalla[]> {
    return this.pantallasRepository.find({
      relations: {
        modelo: { marca: true },
        calidad: true,
        categoria: true,
        inventarios: { almacen: true },
      },
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Pantalla> {
    const pantalla = await this.pantallasRepository.findOne({
      where: { id },
      relations: {
        modelo: { marca: true },
        calidad: true,
        categoria: true,
        inventarios: { almacen: true },
      },
    });
    if (!pantalla) throw new NotFoundException('La pantalla no existe');
    return pantalla;
  }

  async update(
    id: number,
    updatePantallaDto: UpdatePantallaDto,
  ): Promise<Pantalla> {
    const pantalla = await this.findOne(id);
    Object.assign(pantalla, updatePantallaDto);
    return this.pantallasRepository.save(pantalla);
  }

  async remove(id: number): Promise<Pantalla> {
    const pantalla = await this.findOne(id);
    return this.pantallasRepository.softRemove(pantalla);
  }
}

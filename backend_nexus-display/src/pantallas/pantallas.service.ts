import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePantallaDto } from './dto/create-pantalla.dto';
import { UpdatePantallaDto } from './dto/update-pantalla.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Pantalla } from './entities/pantalla.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PantallasService {
  constructor(
    @InjectRepository(Pantalla)
    private pantallasRepository: Repository<Pantalla>,
  ) {}

  async create(createPantallaDto: CreatePantallaDto): Promise<Pantalla> {
    const pantallaExistente = await this.pantallasRepository.findOneBy({
      sku: createPantallaDto.sku,
    });
    if (pantallaExistente)
      throw new ConflictException(
        'Ya existe una pantalla registrada con ese SKU',
      );

    const pantalla = new Pantalla();
    Object.assign(pantalla, createPantallaDto);
    return this.pantallasRepository.save(pantalla);
  }

  async findAll(): Promise<Pantalla[]> {
    return this.pantallasRepository.find({
      relations: {'modelo':true, 'categoria':true, 'calidad':true},
    });
  }

  async findOne(id: number): Promise<Pantalla> {
    const pantalla = await this.pantallasRepository.findOne({
      where: { id },
      relations: {'modelo':true, 'categoria':true, 'calidad':true},
    });
    if (!pantalla) throw new NotFoundException('La pantalla no existe');
    return pantalla;
  }

  async update(
    id: number,
    updatePantallaDto: UpdatePantallaDto,
  ): Promise<Pantalla> {
    const pantalla = await this.findOne(id);
    if (updatePantallaDto.sku && updatePantallaDto.sku !== pantalla.sku) {
      const skuExistente = await this.pantallasRepository.findOneBy({
        sku: updatePantallaDto.sku,
      });
      if (skuExistente)
        throw new ConflictException('Ya existe otra pantalla con ese SKU');
    }
    Object.assign(pantalla, updatePantallaDto);
    return this.pantallasRepository.save(pantalla);
  }

  async remove(id: number): Promise<Pantalla> {
    const pantalla = await this.findOne(id);
    return this.pantallasRepository.softRemove(pantalla);
  }
}

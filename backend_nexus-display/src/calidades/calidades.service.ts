<<<<<<< HEAD
import { Injectable } from '@nestjs/common';
import { CreateCalidadeDto } from './dto/create-calidade.dto';
import { UpdateCalidadeDto } from './dto/update-calidade.dto';

@Injectable()
export class CalidadesService {
  create(createCalidadeDto: CreateCalidadeDto) {
    return 'This action adds a new calidade';
  }

  findAll() {
    return `This action returns all calidades`;
  }

  findOne(id: number) {
    return `This action returns a #${id} calidade`;
  }

  update(id: number, updateCalidadeDto: UpdateCalidadeDto) {
    return `This action updates a #${id} calidade`;
  }

  remove(id: number) {
    return `This action removes a #${id} calidade`;
=======
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCalidadDto } from './dto/create-calidad.dto';
import { UpdateCalidadDto } from './dto/update-calidad.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Calidad } from './entities/calidad.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CalidadesService {
  constructor(
    @InjectRepository(Calidad) private calidadesRepository: Repository<Calidad>,
  ) {}

  async create(createCalidadDto: CreateCalidadDto): Promise<Calidad> {
    const calidadExistente = await this.calidadesRepository.findOneBy({
      nombre: createCalidadDto.nombre,
    });
    if (calidadExistente) throw new ConflictException('La calidad ya existe');

    const calidad = new Calidad();
    Object.assign(calidad, createCalidadDto);
    return this.calidadesRepository.save(calidad);
  }

  async findAll(): Promise<Calidad[]> {
    return this.calidadesRepository.find();
  }

  async findOne(id: number): Promise<Calidad> {
    const calidad = await this.calidadesRepository.findOneBy({ id });
    if (!calidad) throw new NotFoundException('La calidad no existe');
    return calidad;
  }

  async update(
    id: number,
    updateCalidadDto: UpdateCalidadDto,
  ): Promise<Calidad> {
    const calidad = await this.findOne(id);
    if (updateCalidadDto.nombre && updateCalidadDto.nombre !== calidad.nombre) {
      const calidadExistente = await this.calidadesRepository.findOneBy({
        nombre: updateCalidadDto.nombre,
      });
      if (calidadExistente)
        throw new ConflictException('Ya existe otra calidad con ese nombre');
    }
    Object.assign(calidad, updateCalidadDto);
    return this.calidadesRepository.save(calidad);
  }

  async remove(id: number): Promise<Calidad> {
    const calidad = await this.findOne(id);
    return this.calidadesRepository.softRemove(calidad);
>>>>>>> 58ab75d (feat: Se corrigio y elimino tablas sin uso.Se creo tablas, catálogo, proveedores, compras y detalles_compra.)
  }
}

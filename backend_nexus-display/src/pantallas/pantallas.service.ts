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
    private repositorioPantallas: Repository<Pantalla>,
  ) {}

  async crear(datosPantalla: CreatePantallaDto): Promise<Pantalla> {
    let pantalla = await this.repositorioPantallas.findOneBy({
      codigo: datosPantalla.codigo,
    });
    if (pantalla) throw new ConflictException('La pantalla ya existe');

    pantalla = new Pantalla();
    Object.assign(pantalla, datosPantalla);
    return this.repositorioPantallas.save(pantalla);
  }

  async listar(): Promise<Pantalla[]> {
    return this.repositorioPantallas.find({
      relations: {
        modelo: { marca: true },
        calidad: true,
        categoria: true,
        inventarios: { almacen: true },
      },
      order: { id: 'DESC' },
    });
  }

  async obtenerPorId(id: number): Promise<Pantalla> {
    const pantalla = await this.repositorioPantallas.findOne({
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

  async actualizar(
    id: number,
    datosPantalla: UpdatePantallaDto,
  ): Promise<Pantalla> {
    const pantalla = await this.obtenerPorId(id);
    Object.assign(pantalla, datosPantalla);
    return this.repositorioPantallas.save(pantalla);
  }

  async eliminar(id: number): Promise<Pantalla> {
    const pantalla = await this.obtenerPorId(id);
    return this.repositorioPantallas.softRemove(pantalla);
  }
}

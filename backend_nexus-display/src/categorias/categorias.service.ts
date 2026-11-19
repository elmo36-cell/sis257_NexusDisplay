import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categoria } from './entities/categoria.entity';

@Injectable()
export class CategoriasService {
  constructor(
    @InjectRepository(Categoria)
    private repositorioCategorias: Repository<Categoria>,
  ) {}

  async crear(datosCategoria: CreateCategoriaDto): Promise<Categoria> {
    let categoria = await this.repositorioCategorias.findOneBy({
      nombre: datosCategoria.nombre,
    });
    if (categoria) throw new ConflictException('La categoría ya existe');

    categoria = new Categoria();
    Object.assign(categoria, datosCategoria);
    return this.repositorioCategorias.save(categoria);
  }

  async listar(): Promise<Categoria[]> {
    return this.repositorioCategorias.find();
  }

  async obtenerPorId(id: number): Promise<Categoria> {
    const categoria = await this.repositorioCategorias.findOneBy({ id });
    if (!categoria) throw new NotFoundException('La categoría no existe');
    return categoria;
  }

  async actualizar(
    id: number,
    datosCategoria: UpdateCategoriaDto,
  ): Promise<Categoria> {
    const categoria = await this.obtenerPorId(id);
    Object.assign(categoria, datosCategoria);
    return this.repositorioCategorias.save(categoria);
  }

  async eliminar(id: number): Promise<Categoria> {
    const categoria = await this.obtenerPorId(id);
    return this.repositorioCategorias.softRemove(categoria);
  }
}

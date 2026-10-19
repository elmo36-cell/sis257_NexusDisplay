import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Proveedor } from './entities/proveedor.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProveedoresService {
  constructor(
    @InjectRepository(Proveedor)
    private proveedoresRepository: Repository<Proveedor>,
  ) {}

  async create(createProveedorDto: CreateProveedorDto): Promise<Proveedor> {
    const proveedorExistente = await this.proveedoresRepository.findOneBy({
      email: createProveedorDto.email,
    });
    if (proveedorExistente)
      throw new ConflictException(
        'Ya existe un proveedor registrado con ese correo electrónico',
      );

    const proveedor = new Proveedor();
    Object.assign(proveedor, createProveedorDto);
    return this.proveedoresRepository.save(proveedor);
  }

  async findAll(): Promise<Proveedor[]> {
    return this.proveedoresRepository.find();
  }

  async findOne(id: number): Promise<Proveedor> {
    const proveedor = await this.proveedoresRepository.findOneBy({ id });
    if (!proveedor) throw new NotFoundException('El proveedor no existe');
    return proveedor;
  }

  async update(
    id: number,
    updateProveedorDto: UpdateProveedorDto,
  ): Promise<Proveedor> {
    const proveedor = await this.findOne(id);
    if (
      updateProveedorDto.email &&
      updateProveedorDto.email !== proveedor.email
    ) {
      const emailExistente = await this.proveedoresRepository.findOneBy({
        email: updateProveedorDto.email,
      });
      if (emailExistente)
        throw new ConflictException(
          'El correo electrónico ya está en uso por otro proveedor',
        );
    }
    Object.assign(proveedor, updateProveedorDto);
    return this.proveedoresRepository.save(proveedor);
  }

  async remove(id: number): Promise<Proveedor> {
    const proveedor = await this.findOne(id);
    return this.proveedoresRepository.softRemove(proveedor);
  }
}

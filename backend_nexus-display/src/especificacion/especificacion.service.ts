import { Injectable } from '@nestjs/common';
import { CreateEspecificacionDto } from './dto/create-especificacion.dto';
import { UpdateEspecificacionDto } from './dto/update-especificacion.dto';

@Injectable()
export class EspecificacionService {
  create(createEspecificacionDto: CreateEspecificacionDto) {
    return 'This action adds a new especificacion';
  }

  findAll() {
    return `This action returns all especificacion`;
  }

  findOne(id: number) {
    return `This action returns a #${id} especificacion`;
  }

  update(id: number, updateEspecificacionDto: UpdateEspecificacionDto) {
    return `This action updates a #${id} especificacion`;
  }

  remove(id: number) {
    return `This action removes a #${id} especificacion`;
  }
}

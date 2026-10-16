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
  }
}

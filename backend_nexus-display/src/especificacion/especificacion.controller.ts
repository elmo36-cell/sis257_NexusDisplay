import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EspecificacionService } from './especificacion.service';
import { CreateEspecificacionDto } from './dto/create-especificacion.dto';
import { UpdateEspecificacionDto } from './dto/update-especificacion.dto';

@Controller('especificacion')
export class EspecificacionController {
  constructor(private readonly especificacionService: EspecificacionService) {}

  @Post()
  create(@Body() createEspecificacionDto: CreateEspecificacionDto) {
    return this.especificacionService.create(createEspecificacionDto);
  }

  @Get()
  findAll() {
    return this.especificacionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.especificacionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEspecificacionDto: UpdateEspecificacionDto) {
    return this.especificacionService.update(+id, updateEspecificacionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.especificacionService.remove(+id);
  }
}

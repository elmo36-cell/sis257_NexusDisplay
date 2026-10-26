import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CalidadesService } from './calidades.service';
import { CreateCalidadDto } from './dto/create-calidad.dto';
import { UpdateCalidadDto } from './dto/update-calidad.dto';

@Controller('calidades')
export class CalidadesController {
  constructor(private readonly calidadesService: CalidadesService) {}

  @Post()
  create(@Body() createCalidadDto: CreateCalidadDto) {
    return this.calidadesService.create(createCalidadDto);
  }

  @Get()
  findAll() {
    return this.calidadesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.calidadesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCalidadDto: UpdateCalidadDto) {
    return this.calidadesService.update(+id, updateCalidadDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.calidadesService.remove(+id);
  }
}

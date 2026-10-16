import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CalidadesService } from './calidades.service';
import { CreateCalidadeDto } from './dto/create-calidade.dto';
import { UpdateCalidadeDto } from './dto/update-calidade.dto';

@Controller('calidades')
export class CalidadesController {
  constructor(private readonly calidadesService: CalidadesService) {}

  @Post()
  create(@Body() createCalidadeDto: CreateCalidadeDto) {
    return this.calidadesService.create(createCalidadeDto);
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
  update(@Param('id') id: string, @Body() updateCalidadeDto: UpdateCalidadeDto) {
    return this.calidadesService.update(+id, updateCalidadeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.calidadesService.remove(+id);
  }
}

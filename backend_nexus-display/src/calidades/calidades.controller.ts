import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CalidadesService } from './calidades.service';
<<<<<<< HEAD
import { CreateCalidadeDto } from './dto/create-calidade.dto';
import { UpdateCalidadeDto } from './dto/update-calidade.dto';
=======
import { CreateCalidadDto } from './dto/create-calidad.dto';
import { UpdateCalidadDto } from './dto/update-calidad.dto';
>>>>>>> 58ab75d (feat: Se corrigio y elimino tablas sin uso.Se creo tablas, catálogo, proveedores, compras y detalles_compra.)

@Controller('calidades')
export class CalidadesController {
  constructor(private readonly calidadesService: CalidadesService) {}

  @Post()
<<<<<<< HEAD
  create(@Body() createCalidadeDto: CreateCalidadeDto) {
    return this.calidadesService.create(createCalidadeDto);
=======
  create(@Body() createCalidadDto: CreateCalidadDto) {
    return this.calidadesService.create(createCalidadDto);
>>>>>>> 58ab75d (feat: Se corrigio y elimino tablas sin uso.Se creo tablas, catálogo, proveedores, compras y detalles_compra.)
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
<<<<<<< HEAD
  update(@Param('id') id: string, @Body() updateCalidadeDto: UpdateCalidadeDto) {
    return this.calidadesService.update(+id, updateCalidadeDto);
=======
  update(@Param('id') id: string, @Body() updateCalidadDto: UpdateCalidadDto) {
    return this.calidadesService.update(+id, updateCalidadDto);
>>>>>>> 58ab75d (feat: Se corrigio y elimino tablas sin uso.Se creo tablas, catálogo, proveedores, compras y detalles_compra.)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.calidadesService.remove(+id);
  }
}

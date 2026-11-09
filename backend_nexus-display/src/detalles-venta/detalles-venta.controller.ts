import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DetallesVentaService } from './detalles-venta.service';
import { CreateDetalleVentaDto } from './dto/create-detalle-venta.dto';
import { UpdateDetalleVentaDto } from './dto/update-detalle-venta.dto';

@Controller('detalles-venta')
export class DetallesVentaController {
  constructor(private readonly detallesVentaService: DetallesVentaService) {}

  @Post()
  create(@Body() createDetalleVentaDto: CreateDetalleVentaDto) {
    return this.detallesVentaService.create(createDetalleVentaDto);
  }

  @Get()
  findAll() {
    return this.detallesVentaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.detallesVentaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDetalleVentaDto: UpdateDetalleVentaDto) {
    return this.detallesVentaService.update(+id, updateDetalleVentaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.detallesVentaService.remove(+id);
  }
}

import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DetallesCompraService } from './detalles-compra.service';
import { CreateDetalleCompraDto } from './dto/create-detalle-compra.dto';
import { UpdateDetalleCompraDto } from './dto/update-detalle-compra.dto';

@Controller('detalles-compra')
export class DetallesCompraController {
  constructor(private readonly detallesCompraService: DetallesCompraService) {}

  @Post()
  create(@Body() createDetalleCompraDto: CreateDetalleCompraDto) {
    return this.detallesCompraService.create(createDetalleCompraDto);
  }

  @Get()
  findAll() {
    return this.detallesCompraService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.detallesCompraService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDetalleCompraDto: UpdateDetalleCompraDto) {
    return this.detallesCompraService.update(+id, updateDetalleCompraDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.detallesCompraService.remove(+id);
  }
}

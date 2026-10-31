import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { InventarioAlmacenService } from './inventario-almacen.service';
import { CreateInventarioAlmacenDto } from './dto/create-inventario-almacen.dto';
import { UpdateInventarioAlmacenDto } from './dto/update-inventario-almacen.dto';

@Controller('inventario-almacen')
export class InventarioAlmacenController {
  constructor(private readonly inventarioAlmacenService: InventarioAlmacenService) {}

  @Post()
  create(@Body() createInventarioAlmacenDto: CreateInventarioAlmacenDto) {
    return this.inventarioAlmacenService.create(createInventarioAlmacenDto);
  }

  @Get()
  findAll() {
    return this.inventarioAlmacenService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inventarioAlmacenService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInventarioAlmacenDto: UpdateInventarioAlmacenDto) {
    return this.inventarioAlmacenService.update(+id, updateInventarioAlmacenDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.inventarioAlmacenService.remove(+id);
  }
}

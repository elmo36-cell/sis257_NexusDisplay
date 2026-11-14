import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { InventarioAlmacenService } from './inventario-almacen.service';
import { CreateInventarioAlmacenDto } from './dto/create-inventario-almacen.dto';
import { UpdateInventarioAlmacenDto } from './dto/update-inventario-almacen.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RolNombre } from '../usuarios/enums/rol-nombre.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthPublic } from '../auth/decorators/auth-public.decorator';

@ApiTags('inventario-almacen')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('inventario-almacen')
export class InventarioAlmacenController {
  constructor(private readonly inventarioAlmacenService: InventarioAlmacenService) {}

  @ApiBearerAuth()
  @Roles(RolNombre.ADMIN)
  @Post()
  create(@Body() createInventarioAlmacenDto: CreateInventarioAlmacenDto) {
    return this.inventarioAlmacenService.create(createInventarioAlmacenDto);
  }

  @AuthPublic()
  @Get()
  findAll() {
    return this.inventarioAlmacenService.findAll();
  }

  @AuthPublic()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.inventarioAlmacenService.findOne(id);
  }

  @ApiBearerAuth()
  @Roles(RolNombre.ADMIN)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateInventarioAlmacenDto: UpdateInventarioAlmacenDto,
  ) {
    return this.inventarioAlmacenService.update(id, updateInventarioAlmacenDto);
  }

  @ApiBearerAuth()
  @Roles(RolNombre.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.inventarioAlmacenService.remove(id);
  }
}

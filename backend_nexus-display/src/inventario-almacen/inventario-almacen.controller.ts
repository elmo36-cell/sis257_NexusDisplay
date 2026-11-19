import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, Req } from '@nestjs/common';
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
  crear(@Body() datosInventarioAlmacen: CreateInventarioAlmacenDto) {
    return this.inventarioAlmacenService.crear(datosInventarioAlmacen);
  }

  // Antes esta ruta era pública; ahora el vendedor entra con su token para que
  // el backend le devuelva solo el inventario de su sucursal.
  @ApiBearerAuth()
  @Roles(RolNombre.ADMIN, RolNombre.VENDEDOR)
  @Get()
  listar(@Req() req: any) {
    return this.inventarioAlmacenService.listar(req.user);
  }

  @AuthPublic()
  @Get(':id')
  obtenerPorId(@Param('id', ParseIntPipe) id: number) {
    return this.inventarioAlmacenService.obtenerPorId(id);
  }

  @ApiBearerAuth()
  @Roles(RolNombre.ADMIN)
  @Patch(':id')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() datosInventarioAlmacen: UpdateInventarioAlmacenDto,
  ) {
    return this.inventarioAlmacenService.actualizar(id, datosInventarioAlmacen);
  }

  @ApiBearerAuth()
  @Roles(RolNombre.ADMIN)
  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.inventarioAlmacenService.eliminar(id);
  }
}

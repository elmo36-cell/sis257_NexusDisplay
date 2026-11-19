import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { DetallesVentaService } from './detalles-venta.service';
import { CreateDetalleVentaDto } from './dto/create-detalle-venta.dto';
import { UpdateDetalleVentaDto } from './dto/update-detalle-venta.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolNombre } from '../usuarios/enums/rol-nombre.enum';

@ApiTags('detalles-venta')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('detalles-venta')
export class DetallesVentaController {
  constructor(private readonly detallesVentaService: DetallesVentaService) {}

  @Roles(RolNombre.ADMIN, RolNombre.VENDEDOR)
  @Post()
  crear(@Body() datosDetalleVenta: CreateDetalleVentaDto) {
    return this.detallesVentaService.crear(datosDetalleVenta);
  }

  @Roles(RolNombre.ADMIN, RolNombre.VENDEDOR)
  @Get()
  listar() {
    return this.detallesVentaService.listar();
  }

  @Roles(RolNombre.ADMIN, RolNombre.VENDEDOR)
  @Get(':id')
  obtenerPorId(@Param('id', ParseIntPipe) id: number) {
    return this.detallesVentaService.obtenerPorId(id);
  }

  @Roles(RolNombre.ADMIN)
  @Patch(':id')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() datosDetalleVenta: UpdateDetalleVentaDto,
  ) {
    return this.detallesVentaService.actualizar(id, datosDetalleVenta);
  }

  @Roles(RolNombre.ADMIN)
  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.detallesVentaService.eliminar(id);
  }
}

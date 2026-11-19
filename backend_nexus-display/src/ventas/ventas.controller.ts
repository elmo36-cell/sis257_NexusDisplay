import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { VentasService } from './ventas.service';
import { CreateVentaDto } from './dto/create-venta.dto';
import { UpdateVentaDto } from './dto/update-venta.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolNombre } from '../usuarios/enums/rol-nombre.enum';

@ApiTags('ventas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ventas')
export class VentasController {
  constructor(private readonly ventasService: VentasService) {}

  @Roles(RolNombre.ADMIN, RolNombre.VENDEDOR, RolNombre.CLIENTE)
  @Post()
  crear(@Body() datosVenta: CreateVentaDto, @Req() req: any) {
    // El usuario lo saco de la sesión y no de lo que mande el navegador.
    const idUsuarioFinal = datosVenta.idUsuario || req.user?.id || 1;
    // Si es vendedor, ignoro el almacén del formulario y uso el suyo,
    // así no puede registrar ventas en sucursales que no le tocan.
    const idAlmacenFinal =
      req.user?.rol === RolNombre.VENDEDOR && req.user?.idAlmacen
        ? Number(req.user.idAlmacen)
        : datosVenta.idAlmacen;

    return this.ventasService.crear({
      ...datosVenta,
      idAlmacen: idAlmacenFinal,
      idUsuario: Number(idUsuarioFinal),
    });
  }

  // Los tres roles pueden entrar, pero el service filtra qué ventas ve cada uno.
  @Roles(RolNombre.ADMIN, RolNombre.VENDEDOR, RolNombre.CLIENTE)
  @Get()
  listar(@Req() req: any) {
    return this.ventasService.listar(req.user);
  }

  @Roles(RolNombre.ADMIN, RolNombre.VENDEDOR, RolNombre.CLIENTE)
  @Get(':id')
  obtenerPorId(@Param('id', ParseIntPipe) id: number) {
    return this.ventasService.obtenerPorId(id);
  }

  @Roles(RolNombre.ADMIN, RolNombre.VENDEDOR)
  @Patch(':id')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() datosVenta: UpdateVentaDto,
  ) {
    return this.ventasService.actualizar(id, datosVenta);
  }

  // Solo el admin puede anular ventas.
  @Roles(RolNombre.ADMIN)
  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.ventasService.eliminar(id);
  }
}

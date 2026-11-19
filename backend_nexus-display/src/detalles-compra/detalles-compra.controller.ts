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
import { DetallesCompraService } from './detalles-compra.service';
import { CreateDetalleCompraDto } from './dto/create-detalle-compra.dto';
import { UpdateDetalleCompraDto } from './dto/update-detalle-compra.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolNombre } from '../usuarios/enums/rol-nombre.enum';

@ApiTags('detalles-compra')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('detalles-compra')
export class DetallesCompraController {
  constructor(private readonly detallesCompraService: DetallesCompraService) {}

  @Roles(RolNombre.ADMIN)
  @Post()
  crear(@Body() datosDetalleCompra: CreateDetalleCompraDto) {
    return this.detallesCompraService.crear(datosDetalleCompra);
  }

  @Roles(RolNombre.ADMIN)
  @Get()
  listar() {
    return this.detallesCompraService.listar();
  }

  @Roles(RolNombre.ADMIN)
  @Get(':id')
  obtenerPorId(@Param('id', ParseIntPipe) id: number) {
    return this.detallesCompraService.obtenerPorId(id);
  }

  @Roles(RolNombre.ADMIN)
  @Patch(':id')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() datosDetalleCompra: UpdateDetalleCompraDto,
  ) {
    return this.detallesCompraService.actualizar(id, datosDetalleCompra);
  }

  @Roles(RolNombre.ADMIN)
  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.detallesCompraService.eliminar(id);
  }
}

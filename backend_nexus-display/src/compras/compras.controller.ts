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
import { ComprasService } from './compras.service';
import { CreateCompraDto } from './dto/create-compra.dto';
import { UpdateCompraDto } from './dto/update-compra.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolNombre } from '../usuarios/enums/rol-nombre.enum';

@ApiTags('compras')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('compras')
export class ComprasController {
  constructor(private readonly comprasService: ComprasService) {}

  @Roles(RolNombre.ADMIN)
  @Post()
  crear(@Body() datosCompra: CreateCompraDto) {
    return this.comprasService.crear(datosCompra);
  }

  @Roles(RolNombre.ADMIN)
  @Get()
  listar() {
    return this.comprasService.listar();
  }

  @Roles(RolNombre.ADMIN)
  @Get(':id')
  obtenerPorId(@Param('id', ParseIntPipe) id: number) {
    return this.comprasService.obtenerPorId(id);
  }

  @Roles(RolNombre.ADMIN)
  @Patch(':id')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() datosCompra: UpdateCompraDto,
  ) {
    return this.comprasService.actualizar(id, datosCompra);
  }

  @Roles(RolNombre.ADMIN)
  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.comprasService.eliminar(id);
  }
}

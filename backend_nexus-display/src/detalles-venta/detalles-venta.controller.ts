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
  create(@Body() createDetalleVentaDto: CreateDetalleVentaDto) {
    return this.detallesVentaService.create(createDetalleVentaDto);
  }

  @Roles(RolNombre.ADMIN, RolNombre.VENDEDOR)
  @Get()
  findAll() {
    return this.detallesVentaService.findAll();
  }

  @Roles(RolNombre.ADMIN, RolNombre.VENDEDOR)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.detallesVentaService.findOne(id);
  }

  @Roles(RolNombre.ADMIN)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDetalleVentaDto: UpdateDetalleVentaDto,
  ) {
    return this.detallesVentaService.update(id, updateDetalleVentaDto);
  }

  @Roles(RolNombre.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.detallesVentaService.remove(id);
  }
}

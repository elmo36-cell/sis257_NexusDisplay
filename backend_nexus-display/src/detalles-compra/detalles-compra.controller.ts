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
  create(@Body() createDetalleCompraDto: CreateDetalleCompraDto) {
    return this.detallesCompraService.create(createDetalleCompraDto);
  }

  @Roles(RolNombre.ADMIN)
  @Get()
  findAll() {
    return this.detallesCompraService.findAll();
  }

  @Roles(RolNombre.ADMIN)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.detallesCompraService.findOne(id);
  }

  @Roles(RolNombre.ADMIN)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDetalleCompraDto: UpdateDetalleCompraDto,
  ) {
    return this.detallesCompraService.update(id, updateDetalleCompraDto);
  }

  @Roles(RolNombre.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.detallesCompraService.remove(id);
  }
}

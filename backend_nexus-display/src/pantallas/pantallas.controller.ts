import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { PantallasService } from './pantallas.service';
import { CreatePantallaDto } from './dto/create-pantalla.dto';
import { UpdatePantallaDto } from './dto/update-pantalla.dto';
import { AuthPublic } from '../auth/decorators/auth-public.decorator';
import { RolNombre } from '../usuarios/enums/rol-nombre.enum';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('pantallas')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('pantallas')
export class PantallasController {
  constructor(private readonly pantallasService: PantallasService) {}

  @ApiBearerAuth()
  @Roles(RolNombre.ADMIN)
  @Post()
  crear(@Body() datosPantalla: CreatePantallaDto) {
    return this.pantallasService.crear(datosPantalla);
  }

  @AuthPublic()
  @Get()
  listar() {
    return this.pantallasService.listar();
  }

  @AuthPublic()
  @Get(':id')
  obtenerPorId(@Param('id', ParseIntPipe) id: number) {
    return this.pantallasService.obtenerPorId(id);
  }

  @ApiBearerAuth()
  @Roles(RolNombre.ADMIN)
  @Patch(':id')
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() datosPantalla: UpdatePantallaDto) {
    return this.pantallasService.actualizar(id, datosPantalla);
  }

  @ApiBearerAuth()
  @Roles(RolNombre.ADMIN)
  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.pantallasService.eliminar(id);
  }
}
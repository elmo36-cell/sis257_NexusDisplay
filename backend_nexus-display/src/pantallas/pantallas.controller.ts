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
  create(@Body() createPantallaDto: CreatePantallaDto) {
    return this.pantallasService.create(createPantallaDto);
  }

  @AuthPublic()
  @Get()
  findAll() {
    return this.pantallasService.findAll();
  }

  @AuthPublic()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.pantallasService.findOne(id);
  }

  @ApiBearerAuth()
  @Roles(RolNombre.ADMIN)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updatePantallaDto: UpdatePantallaDto) {
    return this.pantallasService.update(id, updatePantallaDto);
  }

  @ApiBearerAuth()
  @Roles(RolNombre.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.pantallasService.remove(id);
  }
}
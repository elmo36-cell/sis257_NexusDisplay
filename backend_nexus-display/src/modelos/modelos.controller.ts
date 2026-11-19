import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ModelosService } from './modelos.service';
import { CreateModeloDto } from './dto/create-modelo.dto';
import { UpdateModeloDto } from './dto/update-modelo.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RolNombre } from '../usuarios/enums/rol-nombre.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthPublic } from '../auth/decorators/auth-public.decorator';

@ApiTags('modelos')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('modelos')
export class ModelosController {
  constructor(private readonly modelosService: ModelosService) {}

  @ApiBearerAuth()
  @Roles(RolNombre.ADMIN)
  @Post()
  crear(@Body() datosModelo: CreateModeloDto) {
    return this.modelosService.crear(datosModelo);
  }

  @AuthPublic()
  @Get()
  listar() {
    return this.modelosService.listar();
  }

  @AuthPublic()
  @Get(':id')
  obtenerPorId(@Param('id', ParseIntPipe) id: number) {
    return this.modelosService.obtenerPorId(id);
  }

  @ApiBearerAuth()
  @Roles(RolNombre.ADMIN)
  @Patch(':id')
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() datosModelo: UpdateModeloDto) {
    return this.modelosService.actualizar(id, datosModelo);
  }

  @ApiBearerAuth()
  @Roles(RolNombre.ADMIN)
  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.modelosService.eliminar(id);
  }
}

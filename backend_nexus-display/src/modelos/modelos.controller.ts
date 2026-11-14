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
  create(@Body() createModeloDto: CreateModeloDto) {
    return this.modelosService.create(createModeloDto);
  }

  @AuthPublic()
  @Get()
  findAll() {
    return this.modelosService.findAll();
  }

  @AuthPublic()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.modelosService.findOne(id);
  }

  @ApiBearerAuth()
  @Roles(RolNombre.ADMIN)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateModeloDto: UpdateModeloDto) {
    return this.modelosService.update(id, updateModeloDto);
  }

  @ApiBearerAuth()
  @Roles(RolNombre.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.modelosService.remove(id);
  }
}

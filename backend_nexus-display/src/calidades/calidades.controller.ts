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
import { CalidadesService } from './calidades.service';
import { CreateCalidadDto } from './dto/create-calidad.dto';
import { UpdateCalidadDto } from './dto/update-calidad.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolNombre } from '../usuarios/enums/rol-nombre.enum';
import { AuthPublic } from '../auth/decorators/auth-public.decorator';

@ApiTags('calidades')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('calidades')
export class CalidadesController {
  constructor(private readonly calidadesService: CalidadesService) {}

  @ApiBearerAuth()
  @Roles(RolNombre.ADMIN)
  @Post()
  create(@Body() createCalidadDto: CreateCalidadDto) {
    return this.calidadesService.create(createCalidadDto);
  }

  @AuthPublic()
  @Get()
  findAll() {
    return this.calidadesService.findAll();
  }

  @AuthPublic()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.calidadesService.findOne(id);
  }

  @ApiBearerAuth()
  @Roles(RolNombre.ADMIN)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCalidadDto: UpdateCalidadDto,
  ) {
    return this.calidadesService.update(id, updateCalidadDto);
  }

  @ApiBearerAuth()
  @Roles(RolNombre.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.calidadesService.remove(id);
  }
}

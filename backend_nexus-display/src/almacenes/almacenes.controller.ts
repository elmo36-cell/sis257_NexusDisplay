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
import { AlmacenesService } from './almacenes.service';
import { CreateAlmacenDto } from './dto/create-almacen.dto';
import { UpdateAlmacenDto } from './dto/update-almacen.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolNombre } from '../usuarios/enums/rol-nombre.enum';
import { AuthPublic } from '../auth/decorators/auth-public.decorator';

@ApiTags('almacenes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('almacenes')
export class AlmacenesController {
  constructor(private readonly almacenesService: AlmacenesService) {}

  @ApiBearerAuth()
  @Roles(RolNombre.ADMIN)
  @Post()
  crear(@Body() datosAlmacen: CreateAlmacenDto) {
    return this.almacenesService.crear(datosAlmacen);
  }

  @AuthPublic()
  @Get()
  listar() {
    return this.almacenesService.listar();
  }

  @AuthPublic()
  @Get(':id')
  obtenerPorId(@Param('id', ParseIntPipe) id: number) {
    return this.almacenesService.obtenerPorId(id);
  }

  @ApiBearerAuth()
  @Roles(RolNombre.ADMIN)
  @Patch(':id')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() datosAlmacen: UpdateAlmacenDto,
  ) {
    return this.almacenesService.actualizar(id, datosAlmacen);
  }

  @ApiBearerAuth()
  @Roles(RolNombre.ADMIN)
  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.almacenesService.eliminar(id);
  }
}

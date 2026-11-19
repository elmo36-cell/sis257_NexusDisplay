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
import { ProveedoresService } from './proveedores.service';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolNombre } from '../usuarios/enums/rol-nombre.enum';

@ApiTags('proveedores')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('proveedores')
export class ProveedoresController {
  constructor(private readonly proveedoresService: ProveedoresService) {}

  @Roles(RolNombre.ADMIN)
  @Post()
  crear(@Body() datosProveedor: CreateProveedorDto) {
    return this.proveedoresService.crear(datosProveedor);
  }

  @Roles(RolNombre.ADMIN)
  @Get()
  listar() {
    return this.proveedoresService.listar();
  }

  @Roles(RolNombre.ADMIN)
  @Get(':id')
  obtenerPorId(@Param('id', ParseIntPipe) id: number) {
    return this.proveedoresService.obtenerPorId(id);
  }

  @Roles(RolNombre.ADMIN)
  @Patch(':id')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() datosProveedor: UpdateProveedorDto,
  ) {
    return this.proveedoresService.actualizar(id, datosProveedor);
  }

  @Roles(RolNombre.ADMIN)
  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.proveedoresService.eliminar(id);
  }
}

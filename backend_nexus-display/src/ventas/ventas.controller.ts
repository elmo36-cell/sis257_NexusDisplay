import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { VentasService } from './ventas.service';
import { CreateVentaDto } from './dto/create-venta.dto';
import { UpdateVentaDto } from './dto/update-venta.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolNombre } from '../usuarios/enums/rol-nombre.enum';

@ApiTags('ventas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ventas')
export class VentasController {
  constructor(private readonly ventasService: VentasService) {}

  @Roles(RolNombre.ADMIN, RolNombre.VENDEDOR, RolNombre.CLIENTE)
  @Post()
  create(@Body() createVentaDto: CreateVentaDto, @Req() req: any) {
    const idUsuarioFinal = createVentaDto.idUsuario || req.user?.id || 1;
    return this.ventasService.create({
      ...createVentaDto,
      idUsuario: Number(idUsuarioFinal),
    });
  }

  @Roles(RolNombre.ADMIN, RolNombre.VENDEDOR, RolNombre.CLIENTE)
  @Get()
  findAll() {
    return this.ventasService.findAll();
  }

  @Roles(RolNombre.ADMIN, RolNombre.VENDEDOR, RolNombre.CLIENTE)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ventasService.findOne(id);
  }

  @Roles(RolNombre.ADMIN, RolNombre.VENDEDOR)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVentaDto: UpdateVentaDto,
  ) {
    return this.ventasService.update(id, updateVentaDto);
  }

  @Roles(RolNombre.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ventasService.remove(id);
  }
}

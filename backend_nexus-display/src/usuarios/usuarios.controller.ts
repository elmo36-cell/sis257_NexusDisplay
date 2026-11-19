import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolNombre } from './enums/rol-nombre.enum';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthPublic } from '../auth/decorators/auth-public.decorator';

@ApiTags('usuarios')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @AuthPublic()
  @Get('contactos-vendedores')
  obtenerContactosVendedores() {
    return this.usuariosService.obtenerContactosVendedores();
  }

  @ApiBearerAuth()
  @Roles(RolNombre.ADMIN, RolNombre.VENDEDOR)
  @Post()
  crear(@Body() datosUsuario: CreateUsuarioDto, @Req() req: any) {
    return this.usuariosService.crear(
      datosUsuario,
      req.user?.rol,
      req.user?.idAlmacen ?? null,
    );
  }

  @ApiBearerAuth()
  @Roles(RolNombre.ADMIN, RolNombre.VENDEDOR)
  @Get()
  listar(@Req() req: any) {
    return this.usuariosService.listar(req.user?.rol);
  }

  @ApiBearerAuth()
  @Roles(RolNombre.ADMIN, RolNombre.VENDEDOR)
  @Get(':id')
  obtenerPorId(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.obtenerPorId(id);
  }

  @ApiBearerAuth()
  @Roles(RolNombre.ADMIN)
  @Patch(':id')
  actualizar(@Param('id', ParseIntPipe) id: number, @Body() datosUsuario: UpdateUsuarioDto) {
    return this.usuariosService.actualizar(id, datosUsuario);
  }

  @ApiBearerAuth()
  @Roles(RolNombre.ADMIN)
  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.eliminar(id);
  }
}

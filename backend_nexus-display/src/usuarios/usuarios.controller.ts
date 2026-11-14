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
  findVendedoresContacto() {
    return this.usuariosService.findVendedoresContacto();
  }

  @ApiBearerAuth()
  @Roles(RolNombre.ADMIN, RolNombre.VENDEDOR)
  @Post()
  create(@Body() createUsuarioDto: CreateUsuarioDto, @Req() req: any) {
    return this.usuariosService.create(createUsuarioDto, req.user?.rol);
  }

  @ApiBearerAuth()
  @Roles(RolNombre.ADMIN, RolNombre.VENDEDOR)
  @Get()
  findAll(@Req() req: any) {
    return this.usuariosService.findAll(req.user?.rol);
  }

  @ApiBearerAuth()
  @Roles(RolNombre.ADMIN, RolNombre.VENDEDOR)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.findOne(id);
  }

  @ApiBearerAuth()
  @Roles(RolNombre.ADMIN)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    return this.usuariosService.update(id, updateUsuarioDto);
  }

  @ApiBearerAuth()
  @Roles(RolNombre.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.remove(id);
  }
}

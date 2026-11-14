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
  create(@Body() createAlmacenDto: CreateAlmacenDto) {
    return this.almacenesService.create(createAlmacenDto);
  }

  @AuthPublic()
  @Get()
  findAll() {
    return this.almacenesService.findAll();
  }

  @AuthPublic()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.almacenesService.findOne(id);
  }

  @ApiBearerAuth()
  @Roles(RolNombre.ADMIN)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAlmacenDto: UpdateAlmacenDto,
  ) {
    return this.almacenesService.update(id, updateAlmacenDto);
  }

  @ApiBearerAuth()
  @Roles(RolNombre.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.almacenesService.remove(id);
  }
}

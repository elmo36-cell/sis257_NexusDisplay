import { PartialType } from '@nestjs/mapped-types';
import { CreateInventarioAlmacenDto } from './create-inventario-almacen.dto';

export class UpdateInventarioAlmacenDto extends PartialType(CreateInventarioAlmacenDto) {}

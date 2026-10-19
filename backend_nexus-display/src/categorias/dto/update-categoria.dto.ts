<<<<<<< HEAD
import { PartialType } from '@nestjs/swagger';
=======
import { PartialType } from '@nestjs/mapped-types';
>>>>>>> 58ab75d (feat: Se corrigio y elimino tablas sin uso.Se creo tablas, catálogo, proveedores, compras y detalles_compra.)
import { CreateCategoriaDto } from './create-categoria.dto';

export class UpdateCategoriaDto extends PartialType(CreateCategoriaDto) {}

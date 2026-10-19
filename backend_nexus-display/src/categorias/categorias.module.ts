import { Module } from '@nestjs/common';
import { CategoriasService } from './categorias.service';
import { CategoriasController } from './categorias.controller';
<<<<<<< HEAD

@Module({
  controllers: [CategoriasController],
  providers: [CategoriasService],
=======
import { TypeOrmModule } from '@nestjs/typeorm';
import { Categoria } from './entities/categoria.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Categoria])],
  controllers: [CategoriasController],
  providers: [CategoriasService],
  exports: [CategoriasService],
>>>>>>> 58ab75d (feat: Se corrigio y elimino tablas sin uso.Se creo tablas, catálogo, proveedores, compras y detalles_compra.)
})
export class CategoriasModule {}

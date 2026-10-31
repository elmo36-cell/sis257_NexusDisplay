import { Module } from '@nestjs/common';
import { InventarioAlmacenService } from './inventario-almacen.service';
import { InventarioAlmacenController } from './inventario-almacen.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventarioAlmacen } from './entities/inventario-almacen.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InventarioAlmacen])],
  controllers: [InventarioAlmacenController],
  providers: [InventarioAlmacenService],
  exports: [InventarioAlmacenService],
})
export class InventarioAlmacenModule {}

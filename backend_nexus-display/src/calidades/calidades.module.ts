import { Module } from '@nestjs/common';
import { CalidadesService } from './calidades.service';
import { CalidadesController } from './calidades.controller';
<<<<<<< HEAD

@Module({
  controllers: [CalidadesController],
  providers: [CalidadesService],
=======
import { TypeOrmModule } from '@nestjs/typeorm';
import { Calidad } from './entities/calidad.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Calidad])],
  controllers: [CalidadesController],
  providers: [CalidadesService],
  exports: [CalidadesService],
>>>>>>> 58ab75d (feat: Se corrigio y elimino tablas sin uso.Se creo tablas, catálogo, proveedores, compras y detalles_compra.)
})
export class CalidadesModule {}

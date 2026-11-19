import { Module } from '@nestjs/common';
import { DetallesVentaService } from './detalles-venta.service';
import { DetallesVentaController } from './detalles-venta.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DetalleVenta } from './entities/detalle-venta.entity';
import { Venta } from '../ventas/entities/venta.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DetalleVenta, Venta])],
  controllers: [DetallesVentaController],
  providers: [DetallesVentaService],
  exports: [DetallesVentaService, TypeOrmModule],
})
export class DetallesVentaModule {}

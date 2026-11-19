import { Module } from '@nestjs/common';
import { DetallesCompraService } from './detalles-compra.service';
import { DetallesCompraController } from './detalles-compra.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DetalleCompra } from './entities/detalle-compra.entity';
import { Compra } from '../compras/entities/compra.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DetalleCompra, Compra])],
  controllers: [DetallesCompraController],
  providers: [DetallesCompraService],
  exports: [DetallesCompraService, TypeOrmModule],
})
export class DetallesCompraModule {}

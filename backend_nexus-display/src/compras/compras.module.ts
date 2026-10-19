import { Module } from '@nestjs/common';
import { ComprasService } from './compras.service';
import { ComprasController } from './compras.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Compra } from './entities/compra.entity';
import { DetalleCompra } from '../detalles-compra/entities/detalle-compra.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Compra, DetalleCompra])],
  controllers: [ComprasController],
  providers: [ComprasService],
  exports: [ComprasService],
})
export class ComprasModule {}

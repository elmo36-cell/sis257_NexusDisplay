import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PantallasService } from './pantallas.service';
import { PantallasController } from './pantallas.controller';
import { Pantalla } from './entities/pantalla.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pantalla])],
  controllers: [PantallasController],
  providers: [PantallasService],
  exports: [PantallasService, TypeOrmModule],
})
export class PantallasModule {}
import { Module } from '@nestjs/common';
import { PantallasService } from './pantallas.service';
import { PantallasController } from './pantallas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pantalla } from './entities/pantalla.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pantalla])],
  controllers: [PantallasController],
  providers: [PantallasService],
  exports: [PantallasService],
})
export class PantallasModule {}

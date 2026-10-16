import { Module } from '@nestjs/common';
import { EspecificacionService } from './especificacion.service';
import { EspecificacionController } from './especificacion.controller';

@Module({
  controllers: [EspecificacionController],
  providers: [EspecificacionService],
})
export class EspecificacionModule {}

import { Module } from '@nestjs/common';
import { CalidadesService } from './calidades.service';
import { CalidadesController } from './calidades.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Calidad } from './entities/calidad.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Calidad])],
  controllers: [CalidadesController],
  providers: [CalidadesService],
  exports: [CalidadesService],
})
export class CalidadesModule {}

import { TypeOrmModule } from '@nestjs/typeorm';
import { Calidad } from './entities/calidad.entity';
import { CalidadesController } from './calidades.controller';
import { CalidadesService } from './calidades.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [TypeOrmModule.forFeature([Calidad])],
  controllers: [CalidadesController],
  providers: [CalidadesService],
  exports: [CalidadesService],
})
export class CalidadesModule {}

import { Module } from '@nestjs/common';
import { CalidadesService } from './calidades.service';
import { CalidadesController } from './calidades.controller';

@Module({
  controllers: [CalidadesController],
  providers: [CalidadesService],
})
export class CalidadesModule {}

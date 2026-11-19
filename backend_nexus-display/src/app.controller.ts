import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthPublic } from './auth/decorators/auth-public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @AuthPublic()
  @Get()
  obtenerMensajeBienvenida(): string {
    return this.appService.obtenerMensajeBienvenida();
  }
}

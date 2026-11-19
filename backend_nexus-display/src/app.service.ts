import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  obtenerMensajeBienvenida(): string {
    return 'API Rest Nexus Display - SIS257 funcionando correctamente';
  }
}

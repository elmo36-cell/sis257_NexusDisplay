import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthLoginDto } from './dto/auth-login.dto';
import { RegistroClienteDto } from '../usuarios/dto/registro-cliente.dto';
import { AuthPublic } from './decorators/auth-public.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /** Login del sistema: recibe usuario y clave y devuelve el token. */
  @AuthPublic()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  iniciarSesion(@Body() datosLogin: AuthLoginDto) {
    return this.authService.iniciarSesion(datosLogin);
  }

  /**
   * Registro público, no hace falta estar logueado.
   * El rol no lo tomo del formulario: se lo pongo como CLIENTE en el service,
   * así nadie puede registrarse como admin cambiando lo que manda.
   */
  @AuthPublic()
  @Post('registro')
  @HttpCode(HttpStatus.CREATED)
  registro(@Body() registroClienteDto: RegistroClienteDto) {
    return this.authService.registro(registroClienteDto);
  }
}
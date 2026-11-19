import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { CargaJwt } from '../interfaces/carga-jwt.interface';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_TOKEN ?? '',
    });
  }

  /**
   * Esto corre después de que passport revisa que el token sea válido.
   * Busco al usuario de nuevo y me fijo que siga activo; lo que devuelvo acá
   * queda en req.user y es lo que usan los controllers para saber el rol
   * y el almacén del que está logueado.
   */
  async validate(cargaUtil: CargaJwt) {
    const usuario = await this.authService.verificarCargaUtil(cargaUtil);
    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException('Usuario inactivo o no autorizado');
    }
    return {
      id: usuario.id,
      nombreUsuario: usuario.nombreUsuario,
      rol: usuario.rol,
      idAlmacen: usuario.idAlmacen ?? null,
    };
  }
}

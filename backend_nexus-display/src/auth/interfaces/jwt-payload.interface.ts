import { RolNombre } from '../../usuarios/enums/rol-nombre.enum';

export interface JwtPayload {
  sub: number;
  nombreUsuario: string;
  rol: RolNombre;
}
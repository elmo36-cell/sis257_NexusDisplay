import { RolNombre } from '../../usuarios/enums/rol-nombre.enum';

export interface CargaJwt {
  sub: number;
  nombreUsuario: string;
  rol: RolNombre;
  idAlmacen?: number | null;
}
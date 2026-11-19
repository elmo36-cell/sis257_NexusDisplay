import { RolNombre } from './rol-nombre.enum';

/** IDs de rol usados en la columna `id_rol` de la tabla usuarios. */
export const ID_ROL_POR_NOMBRE: Record<RolNombre, number> = {
  [RolNombre.ADMIN]: 1,
  [RolNombre.VENDEDOR]: 2,
  [RolNombre.CLIENTE]: 3,
};

import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { RolNombre } from '../../usuarios/enums/rol-nombre.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  /**
   * Revisa si el usuario puede entrar a la ruta según los roles que pide el
   * decorador @Roles. Si la ruta no pide roles, deja pasar a cualquiera que ya
   * tenga token. Al admin lo dejo pasar siempre porque es el que más permisos
   * tiene, y si el rol no está en la lista devuelvo un error 403.
   */
  canActivate(context: ExecutionContext): boolean {
    const rolesRequeridos = this.reflector.getAllAndOverride<RolNombre[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!rolesRequeridos || rolesRequeridos.length === 0) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user || !user.rol) {
      throw new ForbiddenException('No se pudo identificar el rol del usuario');
    }

    // El ADMIN tiene la jerarquía máxima (acceso total a todo el sistema)
    if (user.rol === RolNombre.ADMIN) {
      return true;
    }

    if (!rolesRequeridos.includes(user.rol)) {
      throw new ForbiddenException(
        `Tu rol actual (${user.rol}) no tiene permisos para realizar esta acción. Se requiere: ${rolesRequeridos.join(' o ')}`,
      );
    }

    return true;
  }
}

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsuariosService } from '../usuarios/usuarios.service';
import { AuthLoginDto } from './dto/auth-login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { Usuario } from '../usuarios/entities/usuario.entity';

@Injectable()
export class AuthService {
  constructor(
    private usuariosService: UsuariosService,
    private jwtService: JwtService,
  ) {}

  async login(authLoginDto: AuthLoginDto): Promise<any> {
    const { nombreUsuario, clave } = authLoginDto;
    const usuario = await this.usuariosService.validateUser(nombreUsuario);

    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException('Usuario o clave incorrectos');
    }

    const claveOk = await bcrypt.compare(clave, usuario.clave);
    if (!claveOk) {
      throw new UnauthorizedException('Usuario o clave incorrectos');
    }

    const payload: JwtPayload = {
      sub: usuario.id,
      nombreUsuario: usuario.nombreUsuario,
      rol: usuario.rol,
    };

    return {
      access_token: await this.getToken(payload),
      usuario: {
        id: usuario.id,
        nombreUsuario: usuario.nombreUsuario,
        correo: usuario.correo,
        rol: usuario.rol,
      },
    };
  }

  async getToken(payload: JwtPayload): Promise<string> {
    const token = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_TOKEN,
      expiresIn: (process.env.JWT_TOKEN_EXPIRATION || '2h') as any,
    });
    return token;
  }

  async verifyPayload(payload: JwtPayload): Promise<Usuario> {
    let usuario: Usuario;
    try {
      usuario = await this.usuariosService.findOne(payload.sub);
    } catch {
      throw new UnauthorizedException(`Usuario inválido: ${payload.sub}`);
    }
    return usuario;
  }
}

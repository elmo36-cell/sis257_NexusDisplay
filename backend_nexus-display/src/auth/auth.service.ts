import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsuariosService } from '../usuarios/usuarios.service';
import { AuthLoginDto } from './dto/auth-login.dto';
import { RegistroClienteDto } from '../usuarios/dto/registro-cliente.dto';
import { CargaJwt } from './interfaces/carga-jwt.interface';
import { Usuario } from '../usuarios/entities/usuario.entity';

@Injectable()
export class AuthService {
  constructor(
    private usuariosService: UsuariosService,
    private jwtService: JwtService,
  ) {}

  /**
   * Login: busco al usuario por su nombre de usuario, comparo la clave que
   * escribe con el hash que hay guardado (bcrypt) y, si todo está bien,
   * le devuelvo su sesión con el token.
   * Uso el mismo mensaje de error para usuario y para clave porque si no,
   * alguien podría averiguar qué nombres de usuario existen.
   */
  async iniciarSesion(datosLogin: AuthLoginDto): Promise<any> {
    const { nombreUsuario, clave } = datosLogin;
    const usuario = await this.usuariosService.validarUsuario(nombreUsuario);

    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException('Usuario o clave incorrectos');
    }

    const claveOk = await bcrypt.compare(clave, usuario.clave);
    if (!claveOk) {
      throw new UnauthorizedException('Usuario o clave incorrectos');
    }

    return this.crearSesion(usuario);
  }

  /**
   * Registro público: lo usa un visitante que quiere crearse su cuenta de
   * cliente. Creo el usuario con el service de usuarios y le devuelvo la
   * sesión ya iniciada, así no tiene que volver a loguearse para pagar.
   */
  async registro(registroClienteDto: RegistroClienteDto): Promise<any> {
    const usuario = await this.usuariosService.registrarCliente(
      registroClienteDto,
    );
    return this.crearSesion(usuario);
  }

  /**
   * Arma la respuesta del login: firma el token con los datos básicos
   * (id, usuario, rol y almacén) y devuelve el usuario sin la clave.
   * El rol va dentro del token porque los guards lo usan para dejar entrar
   * a unas rutas u otras.
   */
  private async crearSesion(usuario: Usuario): Promise<any> {
    const cargaUtil: CargaJwt = {
      sub: usuario.id,
      nombreUsuario: usuario.nombreUsuario,
      rol: usuario.rol,
      idAlmacen: usuario.idAlmacen ?? null,
    };

    return {
      access_token: await this.generarToken(cargaUtil),
      usuario: {
        id: usuario.id,
        nombreUsuario: usuario.nombreUsuario,
        nombre: usuario.nombre ?? null,
        primerApellido: usuario.primerApellido ?? null,
        segundoApellido: usuario.segundoApellido ?? null,
        correo: usuario.correo,
        rol: usuario.rol,
        idAlmacen: usuario.idAlmacen ?? null,
      },
    };
  }

  /** Firma el token con el secreto y el tiempo de expiración del .env. */
  async generarToken(cargaUtil: CargaJwt): Promise<string> {
    const token = await this.jwtService.signAsync(cargaUtil, {
      secret: process.env.JWT_TOKEN,
      expiresIn: (process.env.JWT_TOKEN_EXPIRATION || '2h') as any,
    });
    return token;
  }

  /**
   * Vuelvo a buscar el usuario en cada petición para que, si lo eliminan o lo
   * desactivan, su token deje de funcionar aunque todavía no haya caducado.
   */
  async verificarCargaUtil(cargaUtil: CargaJwt): Promise<Usuario> {
    let usuario: Usuario;
    try {
      usuario = await this.usuariosService.obtenerPorId(cargaUtil.sub);
    } catch {
      throw new UnauthorizedException(`Usuario inválido: ${cargaUtil.sub}`);
    }
    return usuario;
  }
}

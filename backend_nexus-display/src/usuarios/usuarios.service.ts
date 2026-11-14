import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Usuario } from './entities/usuario.entity';
import { RolNombre } from './enums/rol-nombre.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UsuariosService implements OnModuleInit {
  constructor(
    @InjectRepository(Usuario) private usuariosRepository: Repository<Usuario>,
  ) {}

  async onModuleInit() {
    const usuariosBase = [
      {
        nombreUsuario: 'admin',
        correo: 'admin@nexusdisplay.com',
        telefono: '70011122',
        clave: process.env.DEFAULT_PASSWORD || '123456',
        rol: RolNombre.ADMIN,
        activo: true,
      },
      {
        nombreUsuario: 'vendedor',
        correo: 'vendedor@nexusdisplay.com',
        telefono: '70033344',
        clave: process.env.DEFAULT_PASSWORD || '123456',
        rol: RolNombre.VENDEDOR,
        activo: true,
      },
      {
        nombreUsuario: 'cliente',
        correo: 'cliente@nexusdisplay.com',
        telefono: '70055566',
        clave: process.env.DEFAULT_PASSWORD || '123456',
        rol: RolNombre.CLIENTE,
        activo: true,
      },
    ];

    for (const item of usuariosBase) {
      const existente = await this.usuariosRepository.findOneBy({
        nombreUsuario: item.nombreUsuario,
      });

      if (!existente) {
        const nuevo = new Usuario();
        Object.assign(nuevo, item);
        await this.usuariosRepository.save(nuevo);
      } else {
        let modificado = false;
        if (existente.rol !== item.rol) {
          existente.rol = item.rol;
          modificado = true;
        }
        if (!existente.telefono) {
          existente.telefono = item.telefono;
          modificado = true;
        }
        if (modificado) {
          await this.usuariosRepository.save(existente);
        }
      }
    }
  }

  async create(createUsuarioDto: CreateUsuarioDto, rolCreador?: RolNombre): Promise<Usuario> {
    if (rolCreador === RolNombre.CLIENTE) {
      throw new ForbiddenException('Los clientes no tienen permiso para registrar usuarios.');
    }

    const rolSolicitado = createUsuarioDto.rol || RolNombre.CLIENTE;

    // Si quien crea es VENDEDOR, solo puede registrar usuarios con rol CLIENTE
    if (rolCreador === RolNombre.VENDEDOR && rolSolicitado !== RolNombre.CLIENTE) {
      throw new ForbiddenException(
        'Como VENDEDOR solo tienes permiso para añadir nuevos clientes.',
      );
    }

    const existe = await this.usuariosRepository.findOne({
      where: [
        { nombreUsuario: createUsuarioDto.nombreUsuario },
        { correo: createUsuarioDto.correo },
      ],
    });
    if (existe) throw new ConflictException('El usuario o correo ya existe');

    const usuario = new Usuario();
    Object.assign(usuario, createUsuarioDto);
    usuario.rol = rolCreador === RolNombre.ADMIN ? rolSolicitado : RolNombre.CLIENTE;

    const guardado = await this.usuariosRepository.save(usuario);
    delete (guardado as any).clave;
    return guardado;
  }

  async findAll(rolSolicitante?: RolNombre): Promise<Usuario[]> {
    // El VENDEDOR solo ve la lista de CLIENTES; el ADMIN ve todos
    if (rolSolicitante === RolNombre.VENDEDOR) {
      return this.usuariosRepository.find({
        where: { rol: RolNombre.CLIENTE },
        order: { id: 'ASC' },
      });
    }
    return this.usuariosRepository.find({ order: { id: 'ASC' } });
  }

  async findVendedoresContacto() {
    const usuarios = await this.usuariosRepository.find({
      where: { activo: true },
      order: { id: 'ASC' },
    });
    return usuarios
      .filter((u) => u.rol === RolNombre.VENDEDOR || u.rol === RolNombre.ADMIN)
      .map((u) => ({
        id: u.id,
        nombreUsuario: u.nombreUsuario,
        correo: u.correo,
        telefono: u.telefono || 'Sin número registrado',
        rol: u.rol,
      }));
  }

  async findOne(id: number): Promise<Usuario> {
    const usuario = await this.usuariosRepository.findOneBy({ id });
    if (!usuario) throw new NotFoundException('El usuario no existe');
    return usuario;
  }

  async validateUser(nombreUsuario: string): Promise<Usuario | null> {
    return this.usuariosRepository
      .createQueryBuilder('usuario')
      .select([
        'usuario.id',
        'usuario.nombreUsuario',
        'usuario.correo',
        'usuario.telefono',
        'usuario.rol',
        'usuario.activo',
      ])
      .addSelect('usuario.clave')
      .where('usuario.nombreUsuario = :nombreUsuario', { nombreUsuario: nombreUsuario.trim() })
      .getOne();
  }

  async update(id: number, updateUsuarioDto: UpdateUsuarioDto): Promise<Usuario> {
    const usuario = await this.findOne(id);
    Object.assign(usuario, updateUsuarioDto);
    const actualizado = await this.usuariosRepository.save(usuario);
    delete (actualizado as any).clave;
    return actualizado;
  }

  async remove(id: number): Promise<Usuario> {
    const usuario = await this.findOne(id);
    return this.usuariosRepository.softRemove(usuario);
  }
}
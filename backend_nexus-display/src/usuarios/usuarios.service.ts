import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { RegistroClienteDto } from './dto/registro-cliente.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Usuario } from './entities/usuario.entity';
import { RolNombre } from './enums/rol-nombre.enum';
import { ID_ROL_POR_NOMBRE } from './enums/rol-id.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UsuariosService implements OnModuleInit {
  constructor(
    @InjectRepository(Usuario) private repositorioUsuarios: Repository<Usuario>,
  ) {}

  /**
   * Al arrancar la API me aseguro de que existan los usuarios de prueba
   * (admin, vendedor y cliente). Si ya existen no los piso: solo les completo
   * los datos que estén vacíos, así no se pierden las claves ya cambiadas.
   */
  async onModuleInit() {
    const usuariosBase = [
      {
        nombreUsuario: 'admin',
        nombre: 'Carlos',
        primerApellido: 'Mendoza',
        segundoApellido: 'Rojas',
        correo: 'admin@nexusdisplay.com',
        telefono: '70011122',
        clave: process.env.DEFAULT_PASSWORD || '123456',
        rol: RolNombre.ADMIN,
        activo: true,
      },
      {
        nombreUsuario: 'vendedor',
        nombre: 'Lucía',
        primerApellido: 'Fernández',
        segundoApellido: 'Vargas',
        correo: 'vendedor@nexusdisplay.com',
        telefono: '70033344',
        clave: process.env.DEFAULT_PASSWORD || '123456',
        rol: RolNombre.VENDEDOR,
        activo: true,
      },
      {
        nombreUsuario: 'cliente',
        nombre: 'Diego',
        primerApellido: 'Ramírez',
        segundoApellido: 'Soto',
        correo: 'cliente@nexusdisplay.com',
        telefono: '70055566',
        clave: process.env.DEFAULT_PASSWORD || '123456',
        rol: RolNombre.CLIENTE,
        activo: true,
      },
    ];

    for (const item of usuariosBase) {
      const existente = await this.repositorioUsuarios.findOneBy({
        nombreUsuario: item.nombreUsuario,
      });

      if (!existente) {
        const nuevo = new Usuario();
        Object.assign(nuevo, item);
        // La columna id_rol es obligatoria en la tabla, así que la lleno con
        // el id que corresponde al nombre del rol (1=ADMIN, 2=VENDEDOR,
        // 3=CLIENTE). Antes no la ponía y el INSERT fallaba al arrancar.
        nuevo.idRol = ID_ROL_POR_NOMBRE[item.rol];
        await this.repositorioUsuarios.save(nuevo);
      } else {
        let modificado = false;
        if (existente.rol !== item.rol) {
          existente.rol = item.rol;
          modificado = true;
        }
        // Si algún usuario viejo quedó con id_rol en null (por eso no
        // arrancaba la API), se lo completo acá con el id de su rol.
        if (!existente.idRol) {
          existente.idRol = ID_ROL_POR_NOMBRE[item.rol];
          modificado = true;
        }
        if (!existente.telefono) {
          existente.telefono = item.telefono;
          modificado = true;
        }
        if (!existente.nombre) {
          existente.nombre = item.nombre;
          modificado = true;
        }
        if (!existente.primerApellido) {
          existente.primerApellido = item.primerApellido;
          modificado = true;
        }
        if (!existente.segundoApellido) {
          existente.segundoApellido = item.segundoApellido;
          modificado = true;
        }
        if (modificado) {
          await this.repositorioUsuarios.save(existente);
        }
      }
    }
  }

  /**
   * Crear usuario desde el panel.
   * - Un cliente no puede crear usuarios.
   * - Un vendedor solo puede dar de alta clientes.
   * - El admin puede crear cualquier rol.
   * El rol final lo decido acá en el backend, no uso el que venga del
   * formulario, y también reviso que no se repita el usuario ni el correo.
   */
  async crear(
    datosUsuario: CreateUsuarioDto,
    rolCreador?: RolNombre,
    idAlmacenCreador?: number | null,
  ): Promise<Usuario> {
    if (rolCreador === RolNombre.CLIENTE) {
      throw new ForbiddenException('Los clientes no tienen permiso para registrar usuarios.');
    }

    const rolSolicitado = datosUsuario.rol || RolNombre.CLIENTE;

    // Si quien crea es VENDEDOR, solo puede registrar usuarios con rol CLIENTE
    if (rolCreador === RolNombre.VENDEDOR && rolSolicitado !== RolNombre.CLIENTE) {
      throw new ForbiddenException(
        'Como VENDEDOR solo tienes permiso para añadir nuevos clientes.',
      );
    }

    const existe = await this.repositorioUsuarios.findOne({
      where: [
        { nombreUsuario: datosUsuario.nombreUsuario },
        { correo: datosUsuario.correo },
      ],
    });
    if (existe) throw new ConflictException('El usuario o correo ya existe');

    const usuario = new Usuario();
    Object.assign(usuario, datosUsuario);
    usuario.rol = rolCreador === RolNombre.ADMIN ? rolSolicitado : RolNombre.CLIENTE;
    usuario.idRol = datosUsuario.idRol ?? ID_ROL_POR_NOMBRE[usuario.rol];

    // Si el que registra es VENDEDOR, el cliente nuevo queda en la sucursal del
    // vendedor: así ve el stock de esa tienda en el catálogo y en la tabla de
    // usuarios se lo encuentra filtrando por sucursal.
    if (rolCreador === RolNombre.VENDEDOR) {
      usuario.idAlmacen = idAlmacenCreador ?? null;
    }

    const guardado = await this.repositorioUsuarios.save(usuario);
    delete (guardado as any).clave;
    return guardado;
  }

  /**
   * Registro de un cliente nuevo desde la web (sin sesión).
   * Primero reviso si ya existe el usuario o el correo y devuelvo un 409.
   * El rol siempre es CLIENTE y el id_rol lo saco del enum; la clave la
   * encripta sola la entidad antes de guardar.
   * El catch del código 23505 es por si dos personas se registran al mismo
   * tiempo con el mismo usuario: ahí responde la restricción UNIQUE de Postgres.
   */
  async registrarCliente(dto: RegistroClienteDto): Promise<Usuario> {
    const existe = await this.repositorioUsuarios.findOne({
      where: [{ nombreUsuario: dto.nombreUsuario }, { correo: dto.correo }],
      withDeleted: true,
    });
    if (existe) {
      throw new ConflictException(
        'El nombre de usuario o el correo ya están registrados. Inicia sesión.',
      );
    }

    const usuario = new Usuario();
    Object.assign(usuario, dto);
    usuario.nombre = dto.nombre;
    usuario.primerApellido = dto.primerApellido;
    usuario.segundoApellido = dto.segundoApellido || null;
    usuario.rol = RolNombre.CLIENTE;
    usuario.idRol = ID_ROL_POR_NOMBRE[RolNombre.CLIENTE];
    usuario.activo = true;

    try {
      const guardado = await this.repositorioUsuarios.save(usuario);
      delete (guardado as any).clave;
      return guardado;
    } catch (error) {
      // Carrera con otro registro simultáneo del mismo usuario o correo.
      if ((error as { code?: string })?.code === '23505') {
        throw new ConflictException(
          'El nombre de usuario o el correo ya están registrados. Inicia sesión.',
        );
      }
      throw error;
    }
  }

  async listar(rolSolicitante?: RolNombre): Promise<Usuario[]> {
    // El VENDEDOR solo ve la lista de CLIENTES; el ADMIN ve todos
    if (rolSolicitante === RolNombre.VENDEDOR) {
      return this.repositorioUsuarios.find({
        where: { rol: RolNombre.CLIENTE },
        order: { id: 'ASC' },
      });
    }
    return this.repositorioUsuarios.find({ order: { id: 'ASC' } });
  }

  /**
   * Devuelvo solo los vendedores y admins activos con su contacto, para
   * mostrarlos en el catálogo. No mando la clave ni datos de más.
   */
  async obtenerContactosVendedores() {
    const usuarios = await this.repositorioUsuarios.find({
      where: { activo: true },
      order: { id: 'ASC' },
    });
    return usuarios
      .filter((u) => u.rol === RolNombre.VENDEDOR || u.rol === RolNombre.ADMIN)
      .map((u) => ({
        id: u.id,
        nombreUsuario: u.nombreUsuario,
        nombreCompleto: [u.nombre, u.primerApellido, u.segundoApellido]
          .filter(Boolean)
          .join(' '),
        correo: u.correo,
        telefono: u.telefono || 'Sin número registrado',
        rol: u.rol,
      }));
  }

  async obtenerPorId(id: number): Promise<Usuario> {
    const usuario = await this.repositorioUsuarios.findOneBy({ id });
    if (!usuario) throw new NotFoundException('El usuario no existe');
    return usuario;
  }

  /**
   * Traigo el usuario para el login. Pido la clave a mano porque en la entidad
   * está con select:false, o sea que no viene en las consultas normales.
   */
  async validarUsuario(nombreUsuario: string): Promise<Usuario | null> {
    return this.repositorioUsuarios
      .createQueryBuilder('usuario')
      .select([
        'usuario.id',
        'usuario.nombreUsuario',
        'usuario.nombre',
        'usuario.primerApellido',
        'usuario.segundoApellido',
        'usuario.correo',
        'usuario.telefono',
        'usuario.rol',
        'usuario.activo',
        'usuario.idAlmacen',
      ])
      .addSelect('usuario.clave')
      .where('usuario.nombreUsuario = :nombreUsuario', { nombreUsuario: nombreUsuario.trim() })
      .getOne();
  }

  async actualizar(id: number, datosUsuario: UpdateUsuarioDto): Promise<Usuario> {
    const usuario = await this.obtenerPorId(id);
    Object.assign(usuario, datosUsuario);
    const actualizado = await this.repositorioUsuarios.save(usuario);
    delete (actualizado as any).clave;
    return actualizado;
  }

  async eliminar(id: number): Promise<Usuario> {
    const usuario = await this.obtenerPorId(id);
    return this.repositorioUsuarios.softRemove(usuario);
  }
}
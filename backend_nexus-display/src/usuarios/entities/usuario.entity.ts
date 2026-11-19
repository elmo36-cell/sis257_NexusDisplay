import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Compra } from '../../compras/entities/compra.entity';
import { Venta } from '../../ventas/entities/venta.entity';
import * as bcrypt from 'bcrypt';
import { RolNombre } from '../enums/rol-nombre.enum';
import { ID_ROL_POR_NOMBRE } from '../enums/rol-id.enum';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn('identity')
  id: number;

  // Id del rol en la tabla (1=ADMIN, 2=VENDEDOR, 3=CLIENTE). Lo mantengo
  // junto con el nombre del rol porque así está hecho el esquema de la BD.
  @Column('int', { name: 'id_rol' })
  idRol: number;

  @Column('varchar', { length: 100, unique: true, name: 'nombre_usuario' })
  nombreUsuario: string;

  // Datos personales separados: nombre y los dos apellidos.
  // En la tabla son opcionales para no romper los usuarios que ya existían,
  // pero en el registro sí pido el nombre y el primer apellido.
  @Column('varchar', { length: 100, nullable: true })
  nombre: string | null;

  @Column('varchar', { name: 'primer_apellido', length: 100, nullable: true })
  primerApellido: string | null;

  @Column('varchar', { name: 'segundo_apellido', length: 100, nullable: true })
  segundoApellido: string | null;

  @Column('varchar',{ length: 100, unique: true })
  correo: string;

  @Column('varchar', { length: 30, nullable: true })
  telefono: string;

  // NIT / CI del cliente: lo guardo para encontrarlo rápido al vender y para
  // emitir la factura con el documento que corresponde.
  @Column('varchar', { length: 30, nullable: true })
  documento: string | null;

  @Column('varchar',{ length: 255, select: false })
  clave: string;

  @Column('varchar', { length: 20, default: RolNombre.CLIENTE })
  rol: RolNombre;

  @Column('int', { name: 'id_almacen', nullable: true })
  idAlmacen: number | null;

  @Column('boolean',{ default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion' })
  fechaModificacion: Date;

  @DeleteDateColumn({ name: 'fecha_eliminacion' })
  fechaEliminacion: Date;

  @OneToMany(() => Compra, compras => compras.usuario)
  compras: Compra[];

  @OneToMany(() => Venta, ventas => ventas.usuario)
  ventas: Venta[];

  /**
   * id_rol es NOT NULL en la tabla, pero hay código que solo setea el nombre
   * del rol (por ejemplo la carga inicial de usuarios de prueba). Para no repetir el
   * mapeo en cada lado, acá, justo antes de guardar, completo el id_rol a
   * partir del rol si es que no vino.
   */
  @BeforeInsert()
  @BeforeUpdate()
  asegurarIdRol() {
    if (!this.idRol && this.rol) {
      this.idRol = ID_ROL_POR_NOMBRE[this.rol];
    }
  }

  /**
   * Antes de insertar o actualizar: si la clave está en texto plano la encripto
   * con bcrypt (10 rondas). Si ya viene encriptada (empieza con $2b$) la dejo
   * igual, para no volver a encriptarla cada vez que se guarda el usuario.
   */
  @BeforeInsert()
  @BeforeUpdate()
  async encriptarClave() {
    if (this.clave && !this.clave.startsWith('$2b$')) {
      const salt = await bcrypt.genSalt(10);
      this.clave = await bcrypt.hash(this.clave, salt);
    }
  }
}

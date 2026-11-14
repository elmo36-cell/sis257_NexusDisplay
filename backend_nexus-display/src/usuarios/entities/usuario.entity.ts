import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Compra } from '../../compras/entities/compra.entity';
import { Venta } from '../../ventas/entities/venta.entity';
import * as bcrypt from 'bcrypt';
import { RolNombre } from '../enums/rol-nombre.enum';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column('int', { name: 'id_rol' })
  idRol: number;

  @Column('varchar', { length: 100, unique: true, name: 'nombre_usuario' })
  nombreUsuario: string;

  @Column('varchar',{ length: 100, unique: true })
  correo: string;

  @Column('varchar', { length: 30, nullable: true })
  telefono: string;

  @Column('varchar',{ length: 255, select: false })
  clave: string;

  @Column('varchar', { length: 20, default: RolNombre.CLIENTE })
  rol: RolNombre;

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

  @BeforeInsert()
  @BeforeUpdate()
  async encriptarClave() {
    if (this.clave && !this.clave.startsWith('$2b$')) {
      const salt = await bcrypt.genSalt(10);
      this.clave = await bcrypt.hash(this.clave, salt);
    }
  }
}

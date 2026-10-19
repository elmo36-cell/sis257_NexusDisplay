import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Rol } from '../../roles/entities/rol.entity';
import { Compra } from '../../compras/entities/compra.entity';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column('int', { name: 'id_rol' })
  idRol: number;

  @ManyToOne(() => Rol, rol => rol.usuarios, { onDelete: 'RESTRICT', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'id_rol' })
  rol: Rol;

  @Column('varchar', { length: 100 })
  nombre: string;

  @Column('varchar', { length: 100, unique: true })
  email: string;

  @Column('varchar', { length: 255 })
  password: string;

  @Column('varchar', { length: 20, nullable: true })
  telefono: string;

  @Column('boolean', { default: true })
  estado: boolean;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion' })
  fechaModificacion: Date;

  @DeleteDateColumn({ name: 'fecha_eliminacion' })
  fechaEliminacion: Date;

  @OneToMany(() => Compra, compra => compra.usuario)
  compras: Compra[];

  @OneToMany(() => Venta, venta => venta.usuario)
  ventas: Venta[];
}

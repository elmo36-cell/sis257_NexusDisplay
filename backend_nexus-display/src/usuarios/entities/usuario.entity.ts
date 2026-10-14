import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Rol } from '../../roles/entities/rol.entity';
import { Direccion } from '../../direcciones/entities/direccion.entity';
import { Sesion } from '../../sesiones/entities/sesion.entity';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column({ name: 'id_rol' })
  idRol: number;

  @ManyToOne(() => Rol, (rol) => rol.usuarios, {
    eager: true,
    onDelete: 'RESTRICT',
  })
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

  @Column('boolean', { default: false, name: 'es_mayorista' })
  esMayorista: boolean;

  @OneToMany(() => Direccion, (direccion) => direccion.usuario)
  direcciones: Direccion[];

  @OneToMany(() => Sesion, (sesion) => sesion.usuario)
  sesiones: Sesion[];

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @CreateDateColumn({ name: 'fecha_modificacion' })
  fechaModificacion: Date;

  @DeleteDateColumn({ name: 'fecha_eliminacion' })
  fechaEliminacion: Date;
}

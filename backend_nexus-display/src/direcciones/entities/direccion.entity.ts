import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Entity('direcciones')
export class Direccion {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column({ name: 'id_usuario' })
  idUsuario: number;

  @ManyToOne(() => Usuario, (usuario) => usuario.direcciones, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;

  @Column('varchar', { length: 150 })
  calle: string;

  @Column('varchar', { length: 50 })
  ciudad: string;

  @Column('varchar', { length: 20, nullable: true, name: 'codigo_postal' })
  codigoPostal: string;

  @Column('boolean', { default: false, name: 'es_principal' })
  esPrincipal: boolean;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @CreateDateColumn({ name: 'fecha_modificacion' })
  fechaModificacion: Date;

  @DeleteDateColumn({ name: 'fecha_eliminacion' })
  fechaEliminacion: Date;
}

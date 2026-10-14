import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Entity('sesiones_usuario')
export class Sesion {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column({ name: 'id_usuario' })
  idUsuario: number;

  @ManyToOne(() => Usuario, (usuario) => usuario.sesiones, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;

  @Column('varchar', { length: 500 })
  token: string;

  @Column('timestamp', { name: 'fecha_expiracion' })
  fechaExpiracion: Date;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;
}

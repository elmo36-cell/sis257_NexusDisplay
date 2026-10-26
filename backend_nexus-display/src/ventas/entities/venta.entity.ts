import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Entity('ventas')
export class Venta {

  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column('int', {name: 'id_usuario'})
  idUsuario: number;

  @Column('varchar',{ length:50})
  fechaVenta: string;

  @Column('varchar', { length:20 })
  tipoVenta: string;

  @Column('varchar', { length:99 })
  total: number;

  @Column('varchar', { length:30 })
  estado: string;

  @Column('varchar', {length:50 })
  observaciones: string;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion' })
  fechaModificacion: Date;

  @DeleteDateColumn({ name: 'fecha_eliminacion' })
  fechaEliminacion: Date;

  @ManyToOne(() => Usuario, (usuario) => usuario.compras, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({name:'id_usuario'})
  usuario:Usuario
}

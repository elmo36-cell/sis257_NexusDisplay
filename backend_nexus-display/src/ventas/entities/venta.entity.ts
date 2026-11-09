import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Usuario } from "../../usuarios/entities/usuario.entity";
import { DetalleVenta } from "../../detalles-venta/entities/detalle-venta.entity";

@Entity('ventas')
export class Venta {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column('int', { name: 'id_usuario' })
  idUsuario: number;

  @ManyToOne(() => Usuario, (usuario) => usuario.ventas, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;

  @CreateDateColumn({ name: 'fecha_venta' })
  fechaVenta: Date;

  @Column('varchar', { length: 20, name: 'tipo_venta' })
  tipoVenta: string;

  @Column('decimal', { precision: 12, scale: 2 })
  total: number;

  @Column('varchar', { length: 30 })
  estado: string;

  @Column('text', { nullable: true })
  observaciones: string;

  @UpdateDateColumn({ name: 'fecha_modificacion' })
  fechaModificacion: Date;

  @DeleteDateColumn({ name: 'fecha_eliminacion' })
  fechaEliminacion: Date;

  @OneToMany(() => DetalleVenta, (detalleVenta) => detalleVenta.venta)
  detallesVenta: DetalleVenta[];
}

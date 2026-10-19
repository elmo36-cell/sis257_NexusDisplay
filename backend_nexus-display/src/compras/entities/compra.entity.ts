import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Proveedor } from "../../proveedores/entities/proveedor.entity";
import { Usuario } from "../../usuarios/entities/usuario.entity";
import { DetalleCompra } from "../../detalles-compra/entities/detalle-compra.entity";

@Entity('compras')
export class Compra {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column('int', { name: 'id_proveedor' })
  idProveedor: number;

  @ManyToOne(() => Proveedor, (proveedor) => proveedor.compras, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'id_proveedor' })
  proveedor: Proveedor;

  @Column('int', { name: 'id_usuario' })
  idUsuario: number;

  @ManyToOne(() => Usuario, (usuario) => usuario.compras, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;

  @CreateDateColumn({ name: 'fecha_compra' })
  fechaCompra: Date;

  @Column('varchar', { length: 50, name: 'numero_documento' })
  numeroDocumento: string;

  @Column('decimal', { precision: 12, scale: 2 })
  total: number;

  @Column('varchar', { length: 30, default: 'PENDIENTE' })
  estado: string;

  @Column('text', { nullable: true })
  observaciones: string;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion' })
  fechaModificacion: Date;

  @DeleteDateColumn({ name: 'fecha_eliminacion' })
  fechaEliminacion: Date;

  @OneToMany(() => DetalleCompra, (detalleCompra) => detalleCompra.compra, {
    cascade: true,
  })
  detallesCompra: DetalleCompra[];
}

import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Proveedor } from "../../proveedores/entities/proveedor.entity";
import { Usuario } from "../../usuarios/entities/usuario.entity";
import { DetalleCompra } from "../../detalles-compra/entities/detalle-compra.entity";
import { Almacen } from "../../almacenes/entities/almacen.entity";

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

  @Column('int', { name: 'id_usuario' })
  idUsuario: number;

  @Column('integer', { name: 'id_almacen' })
  idAlmacen: number;

  @CreateDateColumn()
  fecha: Date;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    default: 0,
    transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) },
  })
  total: number;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion' })
  fechaModificacion: Date;

  @DeleteDateColumn({ name: 'fecha_eliminacion' })
  fechaEliminacion: Date;

  @ManyToOne(() => Proveedor, proveedor => proveedor.compras)
  @JoinColumn({ name: 'id_proveedor', referencedColumnName: 'id' })
  proveedor: Proveedor;

  @ManyToOne(() => Usuario, usuario => usuario.compras)
  @JoinColumn({ name: 'id_usuario', referencedColumnName: 'id' })
  usuario: Usuario;

  @ManyToOne(() => Almacen, almacen => almacen.compras)
  @JoinColumn({ name: 'id_almacen', referencedColumnName: 'id' })
  almacen: Almacen;

  @OneToMany(() => DetalleCompra, detalles => detalles.compra)
  detalles: DetalleCompra[];
}

import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Venta } from "../../ventas/entities/venta.entity";
import { Pantalla } from "../../pantallas/entities/pantalla.entity";

@Entity('detalle_venta')
export class DetalleVenta {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column('int', { name: 'id_venta' })
  idVenta: number;

  @ManyToOne(() => Venta, (venta) => venta.detallesVenta, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'id_venta' })
  venta: Venta;

  @Column('int', { name: 'id_pantalla' })
  idPantalla: number;

  @ManyToOne(() => Pantalla, (pantalla) => pantalla.detallesVenta, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'id_pantalla' })
  pantalla: Pantalla;

  @Column('int')
  cantidad: number;

  @Column('decimal', { precision: 12, scale: 2, name: 'precio_unitario' })
  precioUnitario: number;

  @Column('decimal', { precision: 12, scale: 2 })
  subtotal: number;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion' })
  fechaModificacion: Date;

  @DeleteDateColumn({ name: 'fecha_eliminacion' })
  fechaEliminacion: Date;
}

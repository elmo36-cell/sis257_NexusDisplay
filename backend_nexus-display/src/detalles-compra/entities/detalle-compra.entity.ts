import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Compra } from "../../compras/entities/compra.entity";
import { Pantalla } from "../../pantallas/entities/pantalla.entity";

@Entity('detalle_compra')
export class DetalleCompra {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column('int', { name: 'id_compra' })
  idCompra: number;

  @ManyToOne(() => Compra, (compra) => compra.detallesCompra, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'id_compra' })
  compra: Compra;

  @Column('int', { name: 'id_pantalla' })
  idPantalla: number;

  @ManyToOne(() => Pantalla, (pantalla) => pantalla.detallesCompra, {
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

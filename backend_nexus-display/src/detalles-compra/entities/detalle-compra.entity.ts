import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Compra } from "../../compras/entities/compra.entity";
import { Pantalla } from "../../pantallas/entities/pantalla.entity";

@Entity('detalle_compra')
export class DetalleCompra {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column('int', { name: 'id_compra' })
  idCompra: number;

  @Column('int', { name: 'id_pantalla' })
  idPantalla: number;

  @Column('int')
  cantidad: number;

  @Column('decimal', {
    name: 'costo_unitario',
    precision: 10,
    scale: 2,
    transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) },
  })
  costoUnitario: number;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) },
  })
  subtotal: number;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion' })
  fechaModificacion: Date;

  @DeleteDateColumn({ name: 'fecha_eliminacion' })
  fechaEliminacion: Date;

  @ManyToOne(() => Compra, compra => compra.detalles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_compra', referencedColumnName: 'id' })
  compra: Compra;

  @ManyToOne(() => Pantalla, pantalla => pantalla.detallesCompra)
  @JoinColumn({ name: 'id_pantalla', referencedColumnName: 'id' })
  pantalla: Pantalla;
}

import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Venta } from '../../ventas/entities/venta.entity';
import { Pantalla } from '../../pantallas/entities/pantalla.entity';

@Entity('detalle_venta')
export class DetalleVenta {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column('int', { name: 'id_venta' })
  idVenta: number;

  @Column('int', { name: 'id_pantalla' })
  idPantalla: number;

  @Column('decimal', {
    name: 'precio_unitario',
    precision: 10,
    scale: 2,
    transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) },
  })
  precioUnitario: number;

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

  @ManyToOne(() => Venta, (venta) => venta.detalles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_venta', referencedColumnName: 'id' })
  venta: Venta;

  @ManyToOne(() => Pantalla, (pantalla) => pantalla.detallesVenta)
  @JoinColumn({ name: 'id_pantalla', referencedColumnName: 'id' })
  pantalla: Pantalla;
  cantidad: number;
}

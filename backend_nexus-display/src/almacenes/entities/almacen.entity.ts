import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { InventarioAlmacen } from '../../inventario-almacen/entities/inventario-almacen.entity';
import { Venta } from '../../ventas/entities/venta.entity';
import { Compra } from '../../compras/entities/compra.entity';

@Entity('almacenes')
export class Almacen {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column('varchar', { length: 100, unique: true })
  nombre: string;

  @Column('varchar', { length: 200 })
  direccion: string;

  @Column('varchar', { length: 30, nullable: true })
  telefono: string;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion' })
  fechaModificacion: Date;

  @DeleteDateColumn({ name: 'fecha_eliminacion' })
  fechaEliminacion: Date;

  @OneToMany(() => InventarioAlmacen, inventarios => inventarios.almacen)
  inventarios: InventarioAlmacen[];

  @OneToMany(() => Venta, ventas => ventas.almacen)
  ventas: Venta[];

  @OneToMany(() => Compra, compras => compras.almacen)
  compras: Compra[];
}

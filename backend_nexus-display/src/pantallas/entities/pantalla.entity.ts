import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Modelo } from '../../modelos/entities/modelo.entity';
import { Calidad } from '../../calidades/entities/calidad.entity';
import { Categoria } from '../../categorias/entities/categoria.entity';
import { InventarioAlmacen } from '../../inventario-almacen/entities/inventario-almacen.entity';
import { DetalleCompra } from '../../detalles-compra/entities/detalle-compra.entity';
import { DetalleVenta } from '../../detalles-venta/entities/detalle-venta.entity';

@Entity('pantallas')
export class Pantalla {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column({ name: 'id_modelo' })
  idModelo: number;

  @Column({ name: 'id_calidad' })
  idCalidad: number;

  @Column({ name: 'id_categoria' })
  idCategoria: number;

  @Column({ type: 'varchar', length: 150 })
  nombre: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  codigo: string;

  @Column({ type: 'varchar', length: 40, default: 'Negro' })
  color: string;

  @Column({ name: 'con_marco', type: 'boolean', default: false })
  conMarco: boolean;

  @Column('text')
  fotografia: string;

  @Column({
    name: 'precio_venta',
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) },
  })
  precioVenta: number;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion' })
  fechaModificacion: Date;

  @DeleteDateColumn({ name: 'fecha_eliminacion', select: false })
  fechaEliminacion: Date;

  @ManyToOne(() => Modelo, (modelo) => modelo.pantallas)
  @JoinColumn({ name: 'id_modelo', referencedColumnName: 'id' })
  modelo: Modelo;

  @ManyToOne(() => Calidad, (calidad) => calidad.pantallas)
  @JoinColumn({ name: 'id_calidad', referencedColumnName: 'id' })
  calidad: Calidad;

  @ManyToOne(() => Categoria, (categoria) => categoria.pantallas)
  @JoinColumn({ name: 'id_categoria', referencedColumnName: 'id' })
  categoria: Categoria;

  @OneToMany(() => InventarioAlmacen, (inv) => inv.pantalla)
  inventarios: InventarioAlmacen[];

  @OneToMany(() => DetalleCompra, (dc) => dc.pantalla)
  detallesCompra: DetalleCompra[];

  @OneToMany(() => DetalleVenta, (dv) => dv.pantalla)
  detallesVenta: DetalleVenta[];
}
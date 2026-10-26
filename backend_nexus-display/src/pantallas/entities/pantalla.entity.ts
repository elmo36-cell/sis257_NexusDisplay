import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Modelo } from "../../modelos/entities/modelo.entity";
import { Categoria } from "../../categorias/entities/categoria.entity";
import { Calidad } from "../../calidades/entities/calidad.entity";
import { DetalleCompra } from "../../detalles-compra/entities/detalle-compra.entity";

@Entity('pantallas')
export class Pantalla {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column('int', { name: 'id_modelo' })
  idModelo: number;

  @ManyToOne(() => Modelo, (modelo) => modelo.pantallas, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'id_modelo' })
  modelo: Modelo;

  @Column('int', { name: 'id_categoria' })
  idCategoria: number;

  @ManyToOne(() => Categoria, (categoria) => categoria.pantallas, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'id_categoria' })
  categoria: Categoria;

  @Column('int', { name: 'id_calidad' })
  idCalidad: number;

  @ManyToOne(() => Calidad, (calidad) => calidad.pantallas, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'id_calidad' })
  calidad: Calidad;

  @Column('varchar', { length: 50, unique: true })
  sku: string;

  @Column('varchar', { length: 120 })
  nombre: string;

  @Column('varchar', { length: 255 })
  descripcion: string;

  @Column('decimal', { precision: 12, scale: 2, name: 'precio_compra' })
  precioCompra: number;

  @Column('decimal', { precision: 12, scale: 2, name: 'precio_minorista' })
  precioMinorista: number;

  @Column('decimal', { precision: 12, scale: 2, name: 'precio_mayorista' })
  precioMayorista: number;

  @Column('varchar', { length: 500 })
  imagen: string;

  @Column('boolean', { default: true })
  estado: boolean;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion' })
  fechaModificacion: Date;

  @DeleteDateColumn({ name: 'fecha_eliminacion' })
  fechaEliminacion: Date;

  @OneToMany(() => DetalleCompra, (detalleCompra) => detalleCompra.pantalla)
  detallesCompra: DetalleCompra[];

 /*@OneToMany(
    () => InventarioAlmacen,
    (inventarioAlmacen) => inventarioAlmacen.pantalla,
  )
  inventariosAlmacen: InventarioAlmacen[];

  @OneToMany(() => DetalleVenta, (detalleVenta) => detalleVenta.pantalla)
  detallesVenta: DetalleVenta[];
  */
}

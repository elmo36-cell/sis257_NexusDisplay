import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Pantalla } from "../../pantallas/entities/pantalla.entity";
import { Almacen } from "../../almacenes/entities/almacen.entity";

@Entity('inventario_almacen')
export class InventarioAlmacen {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column('int', { name: 'id_pantalla' })
  idPantalla: number;

  @ManyToOne(() => Pantalla, (pantalla) => pantalla.inventariosAlmacen, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'id_pantalla' })
  pantalla: Pantalla;

  @Column('int', { name: 'id_almacen' })
  idAlmacen: number;

  @ManyToOne(() => Almacen, (almacen) => almacen.inventarioAlmacenes, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'id_almacen' })
  almacen: Almacen;

  @Column('int', { name: 'stock_actual', default: 0 })
  stockActual: number;

  @Column('int', { name: 'stock_minimo', default: 0 })
  stockMinimo: number;

  @CreateDateColumn({ name: 'fecha_actualizacion' })
  fechaActualizacion: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion' })
  fechaModificacion: Date;

  @DeleteDateColumn({ name: 'fecha_eliminacion' })
  fechaEliminacion: Date;
}

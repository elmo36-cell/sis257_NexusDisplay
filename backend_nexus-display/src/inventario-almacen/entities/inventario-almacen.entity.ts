import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Pantalla } from "../../pantallas/entities/pantalla.entity";
import { Almacen } from "../../almacenes/entities/almacen.entity";

@Entity('inventario_almacen')
export class InventarioAlmacen {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column('int', { name: 'id_pantalla' })
  idPantalla: number;

  @Column('int', { name: 'id_almacen' })
  idAlmacen: number;

  @Column('int', { default: 0 })
  cantidad: number;

  @CreateDateColumn({ name: 'fecha_actualizacion' })
  fechaActualizacion: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion' })
  fechaModificacion: Date;

  @DeleteDateColumn({ name: 'fecha_eliminacion' })
  fechaEliminacion: Date;
  
  @ManyToOne(() => Pantalla, pantalla => pantalla.inventarios)
  @JoinColumn({ name: 'id_pantalla', referencedColumnName: 'id' })
  pantalla: Pantalla;

  @ManyToOne(() => Almacen, almacen => almacen.inventarios)
  @JoinColumn({ name: 'id_almacen', referencedColumnName: 'id' })
  almacen: Almacen;
}

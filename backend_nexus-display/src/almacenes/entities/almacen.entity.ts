import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { InventarioAlmacen } from "../../inventario-almacen/entities/inventario-almacen.entity";

@Entity('almacenes')
export class Almacen {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column('varchar', { length: 100, unique: true })
  nombre: string;

  @Column('varchar', { length: 200 })
  ubicacion: string;

  @Column('varchar', { length: 255, nullable: true })
  descripcion: string;

  @Column('boolean', { default: true })
  estado: boolean;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion' })
  fechaModificacion: Date;

  @DeleteDateColumn({ name: 'fecha_eliminacion' })
  fechaEliminacion: Date;

  @OneToMany(
    () => InventarioAlmacen,
    (inventarioAlmacen) => inventarioAlmacen.almacen,
  )
  inventarioAlmacenes: InventarioAlmacen[];
}

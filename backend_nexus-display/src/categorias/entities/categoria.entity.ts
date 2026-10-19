<<<<<<< HEAD
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Pantalla } from '../../pantalla/entities/pantalla.entity';
=======
import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Pantalla } from "../../pantallas/entities/pantalla.entity";
>>>>>>> 58ab75d (feat: Se corrigio y elimino tablas sin uso.Se creo tablas, catálogo, proveedores, compras y detalles_compra.)

@Entity('categorias')
export class Categoria {
  @PrimaryGeneratedColumn('identity')
  id: number;

<<<<<<< HEAD
  @Column('varchar', { length: 50 })
=======
  @Column('varchar', { length: 50, unique: true })
>>>>>>> 58ab75d (feat: Se corrigio y elimino tablas sin uso.Se creo tablas, catálogo, proveedores, compras y detalles_compra.)
  nombre: string;

  @Column('varchar', { length: 255 })
  descripcion: string;

<<<<<<< HEAD
  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @CreateDateColumn({ name: 'fecha_modificacion' })
=======
  @Column('boolean', { default: true })
  estado: boolean;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion' })
>>>>>>> 58ab75d (feat: Se corrigio y elimino tablas sin uso.Se creo tablas, catálogo, proveedores, compras y detalles_compra.)
  fechaModificacion: Date;

  @DeleteDateColumn({ name: 'fecha_eliminacion' })
  fechaEliminacion: Date;

<<<<<<< HEAD
  @OneToMany(() => Pantalla, pantalla => pantalla.categoria)
  pantallas: Pantalla[];

=======
  @OneToMany(() => Pantalla, (pantalla) => pantalla.categoria)
  pantallas: Pantalla[];
>>>>>>> 58ab75d (feat: Se corrigio y elimino tablas sin uso.Se creo tablas, catálogo, proveedores, compras y detalles_compra.)
}

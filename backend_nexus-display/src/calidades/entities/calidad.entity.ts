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

@Entity('calidades')
=======
import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Pantalla } from "../../pantallas/entities/pantalla.entity";

@Entity('calidades_repuesto')
>>>>>>> 58ab75d (feat: Se corrigio y elimino tablas sin uso.Se creo tablas, catálogo, proveedores, compras y detalles_compra.)
export class Calidad {
  @PrimaryGeneratedColumn('identity')
  id: number;

<<<<<<< HEAD
  @Column('varchar', { length: 50 })
  nombre: string;

  @Column('integer')
  nivelGarantiaMeses: number;
=======
  @Column('varchar', { length: 50, unique: true })
  nombre: string;

  @Column('varchar', { length: 255 })
  descripcion: string;

  @Column('int', { name: 'garantia_meses' })
  garantiaMeses: number;

  @Column('boolean', { default: true })
  estado: boolean;
>>>>>>> 58ab75d (feat: Se corrigio y elimino tablas sin uso.Se creo tablas, catálogo, proveedores, compras y detalles_compra.)

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

<<<<<<< HEAD
  @CreateDateColumn({ name: 'fecha_modificacion' })
=======
  @UpdateDateColumn({ name: 'fecha_modificacion' })
>>>>>>> 58ab75d (feat: Se corrigio y elimino tablas sin uso.Se creo tablas, catálogo, proveedores, compras y detalles_compra.)
  fechaModificacion: Date;

  @DeleteDateColumn({ name: 'fecha_eliminacion' })
  fechaEliminacion: Date;

  @OneToMany(() => Pantalla, (pantalla) => pantalla.calidad)
  pantallas: Pantalla[];
<<<<<<< HEAD

=======
>>>>>>> 58ab75d (feat: Se corrigio y elimino tablas sin uso.Se creo tablas, catálogo, proveedores, compras y detalles_compra.)
}

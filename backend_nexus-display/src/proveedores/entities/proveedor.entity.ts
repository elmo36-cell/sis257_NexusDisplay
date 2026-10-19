import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Compra } from "../../compras/entities/compra.entity";

@Entity('proveedores')
export class Proveedor {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column('varchar', { length: 120, name: 'nombre_empresa' })
  nombreEmpresa: string;

  @Column('varchar', { length: 100 })
  contacto: string;

  @Column('varchar', { length: 20 })
  telefono: string;

  @Column('varchar', { length: 100, unique: true })
  email: string;

  @Column('varchar', { length: 200 })
  direccion: string;

  @Column('varchar', { length: 50, name: 'pais_origen' })
  paisOrigen: string;

  @Column('boolean', { default: true })
  estado: boolean;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion' })
  fechaModificacion: Date;

  @DeleteDateColumn({ name: 'fecha_eliminacion' })
  fechaEliminacion: Date;

  @OneToMany(() => Compra, (compra) => compra.proveedor)
  compras: Compra[];
}

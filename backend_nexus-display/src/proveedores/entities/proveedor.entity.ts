import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Compra } from '../../compras/entities/compra.entity';

@Entity('proveedores')
export class Proveedor {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column('varchar', { length: 120, name: 'nombre_empresa' })
  nombre: string;

  @Column('varchar', { length: 25 })
  nit: string;

  @Column('varchar', { length: 20, nullable: true })
  telefono: string;

  @Column('varchar', { length: 150, nullable: true })
  direccion: string;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion' })
  fechaModificacion: Date;

  @DeleteDateColumn({ name: 'fecha_eliminacion' })
  fechaEliminacion: Date;

  @OneToMany(() => Compra, (compras) => compras.proveedor)
  compras: Compra[];
}

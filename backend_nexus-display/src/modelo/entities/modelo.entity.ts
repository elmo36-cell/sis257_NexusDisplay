import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Marca } from '../../marcas/entities/marca.entity';
import { Pantalla } from '../../pantalla/entities/pantalla.entity';

@Entity('modelo')
export class Modelo {

  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column('integer', { name: 'id_marca' })
  idMarca: number;

  @Column('varchar', { length: 100 })
  nombre: string;

  @Column('integer', { name: 'anio_lanzamiento' })
  anioLanzamiento: number;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @CreateDateColumn({ name: 'fecha_modificacion' })
  fechaModificacion: Date;

  @DeleteDateColumn({ name: 'fecha_eliminacion' })
  fechaEliminacion: Date;

  @ManyToOne(() => Marca, marca => marca.modelos)
  @JoinColumn({ name: 'id_marca', referencedColumnName: 'id' })
  marca: Marca;

  @OneToMany(() => Pantalla, pantalla => pantalla.modelo)
  pantallas: Pantalla[];

}

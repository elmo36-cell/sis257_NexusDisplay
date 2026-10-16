import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Pantalla } from '../../pantalla/entities/pantalla.entity';

@Entity('especificacion')
export class Especificacion {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column('integer', { name: 'id_pantalla' })
  idPantalla: number;

  @Column('varchar', { length: 100 })
  resolucion: string;

  @Column('varchar', { length: 50 })
  tasaRefresco: string;

  @Column('varchar', { length: 50 })
  tipoPanel: string;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @CreateDateColumn({ name: 'fecha_modificacion' })
  fechaModificacion: Date;

  @DeleteDateColumn({ name: 'fecha_eliminacion' })
  fechaEliminacion: Date;

  @OneToMany(() => Pantalla, (pantalla) => pantalla.especificacion)
  pantallas: Pantalla[];
}

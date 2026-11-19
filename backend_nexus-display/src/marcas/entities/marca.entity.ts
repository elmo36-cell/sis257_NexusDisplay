import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Modelo } from '../../modelos/entities/modelo.entity';

@Entity('marcas')
export class Marca {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column('varchar', { length: 50, unique: true })
  nombre: string;

  // Igual que en pantallas, la base la tiene como TEXT para permitir data URI largos.
  @Column('text', {
    default: 'https://placehold.co/200x200/0f172a/38bdf8?text=Marca',
  })
  fotografia: string;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion' })
  fechaModificacion: Date;

  @DeleteDateColumn({ name: 'fecha_eliminacion' })
  fechaEliminacion: Date;

  @OneToMany(() => Modelo, modelo => modelo.marca)
  modelos: Modelo[];

}

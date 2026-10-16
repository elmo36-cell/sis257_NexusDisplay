import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Modelo } from '../../modelo/entities/modelo.entity';

@Entity('marcas')
export class Marca {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column('varchar', { length: 50, unique: true })
  nombre: string;

  @Column('varchar', { length: 800 })
  logo: string;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @CreateDateColumn({ name: 'fecha_modificacion' })
  fechaModificacion: Date;

  @DeleteDateColumn({ name: 'fecha_eliminacion' })
  fechaEliminacion: Date;

  @OneToMany(() => Modelo, modelo => modelo.marca)
  modelos: Modelo[];

}

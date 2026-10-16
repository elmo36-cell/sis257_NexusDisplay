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
import { Modelo } from '../../modelo/entities/modelo.entity';
import { Categoria } from '../../categorias/entities/categoria.entity';
import { Calidad } from '../../calidades/entities/calidad.entity';
import { Especificacion } from '../../especificacion/entities/especificacion.entity';

@Entity('pantallas')
export class Pantalla {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column('integer', { name: 'id_modelo' })
  idModelo: number;

  @Column('integer', { name: 'id_categoria' })
  idCategoria: number;

  @Column('integer', { name: 'id_calidad' })
  idCalidad: number;

  @Column('varchar', { length: 50, unique: true })
  sku: string;

  @Column('decimal', { precision: 10, scale: 2 })
  precioMinorista: number;

  @Column('decimal', { precision: 10, scale: 2 })
  precioMayorista: number;

  @Column('varchar', { length: 800 })
  imagen: string;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @CreateDateColumn({ name: 'fecha_modificacion' })
  fechaModificacion: Date;

  @DeleteDateColumn({ name: 'fecha_eliminacion' })
  fechaEliminacion: Date;

  @ManyToOne(() => Modelo, (modelo) => modelo.pantallas)
  @JoinColumn({ name: 'id_modelo', referencedColumnName: 'id' })
  modelo: Modelo;

  @ManyToOne(() => Categoria, (categoria) => categoria.pantallas)
  @JoinColumn({ name: 'id_categoria', referencedColumnName: 'id' })
  categoria: Categoria;

  @ManyToOne(() => Calidad, (calidad) => calidad.pantallas)
  @JoinColumn({ name: 'id_calidad', referencedColumnName: 'id' })
  calidad: Calidad;

  @OneToMany(() => Especificacion, (especificacion) => especificacion.pantallas)
  especificacion: Especificacion[];
}

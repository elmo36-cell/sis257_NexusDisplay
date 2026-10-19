import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Marca } from "../../marcas/entities/marca.entity";
import { Pantalla } from "../../pantallas/entities/pantalla.entity";

@Entity('modelos')
export class Modelo {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column('int', { name: 'id_marca' })
  idMarca: number;

  @ManyToOne(() => Marca, (marca) => marca.modelos, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'id_marca' })
  marca: Marca;

  @Column('varchar', { length: 100 })
  nombre: string;

  @Column('int', { name: 'anio_lanzamiento' })
  anioLanzamiento: number;

  @Column('boolean', { default: true })
  estado: boolean;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion' })
  fechaModificacion: Date;

  @DeleteDateColumn({ name: 'fecha_eliminacion' })
  fechaEliminacion: Date;

  @OneToMany(() => Pantalla, (pantalla) => pantalla.modelo)
  pantallas: Pantalla[];
}

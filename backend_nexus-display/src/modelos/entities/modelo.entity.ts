import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Marca } from "../../marcas/entities/marca.entity";
import { Pantalla } from "../../pantallas/entities/pantalla.entity";

@Entity('modelos')
export class Modelo {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column('int', { name: 'id_marca' })
  idMarca: number;

  @Column('varchar', { length: 100 })
  nombre: string;

  @Column('varchar', {
    length: 800,
    default: 'https://placehold.co/400x400/0f172a/38bdf8?text=Modelo',
  })
  fotografia: string;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion' })
  fechaModificacion: Date;

  @DeleteDateColumn({ name: 'fecha_eliminacion' })
  fechaEliminacion: Date;

  @ManyToOne(() => Marca, marca => marca.modelos)
  @JoinColumn({ name: 'id_marca', referencedColumnName: 'id' })
  marca: Marca;

  @OneToMany(() => Pantalla, pantallas => pantallas.modelo)
  pantallas: Pantalla[];
}

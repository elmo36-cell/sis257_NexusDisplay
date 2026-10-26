import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Pantalla } from "../../pantallas/entities/pantalla.entity";

@Entity('categorias')
export class Categoria {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column('varchar', { length: 50, unique: true })
  nombre: string;

  @Column('varchar', { length: 255 })
  descripcion: string;

  @Column('boolean', { default: true })
  estado: boolean;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion' })
  fechaModificacion: Date;

  @DeleteDateColumn({ name: 'fecha_eliminacion' })
  fechaEliminacion: Date;

  @OneToMany(() => Pantalla, (pantalla) => pantalla.categoria)
  pantallas: Pantalla[];
}

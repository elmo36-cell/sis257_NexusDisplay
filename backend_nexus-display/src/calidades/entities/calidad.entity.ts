import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Pantalla } from "../../pantallas/entities/pantalla.entity";

@Entity('calidades_repuesto')
export class Calidad {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column('varchar', { length: 50, unique: true })
  nombre: string;

  @Column('varchar', { length: 255 })
  descripcion: string;

  @Column('int', { name: 'garantia_meses' })
  garantiaMeses: number;

  @Column('boolean', { default: true })
  estado: boolean;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion' })
  fechaModificacion: Date;

  @DeleteDateColumn({ name: 'fecha_eliminacion' })
  fechaEliminacion: Date;

  @OneToMany(() => Pantalla, (pantalla) => pantalla.calidad)
  pantallas: Pantalla[];
}

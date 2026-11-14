import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { DetalleVenta } from '../../detalles-venta/entities/detalle-venta.entity';
import { Almacen } from '../../almacenes/entities/almacen.entity';

@Entity('ventas')
export class Venta {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column('integer', { name: 'id_usuario' })
  idUsuario: number;

  @Column('integer', { name: 'id_almacen' })
  idAlmacen: number;

  @Column('varchar', { length: 100, name: 'nombre_cliente', default: 'S/N' })
  nombreCliente: string;

  @Column('varchar', { length: 30, name: 'documento_cliente', default: '0' })
  documentoCliente: string;

  @CreateDateColumn()
  fecha: Date;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    default: 0,
    transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) },
  })
  total: number;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion' })
  fechaModificacion: Date;

  @DeleteDateColumn({ name: 'fecha_eliminacion' })
  fechaEliminacion: Date;

  @ManyToOne(() => Usuario, (usuario) => usuario.ventas)
  @JoinColumn({ name: 'id_usuario', referencedColumnName: 'id' })
  usuario: Usuario;

  @ManyToOne(() => Almacen, (almacen) => almacen.ventas)
  @JoinColumn({ name: 'id_almacen', referencedColumnName: 'id' })
  almacen: Almacen;

  @OneToMany(() => DetalleVenta, (detalles) => detalles.venta)
  detalles: DetalleVenta[];
}

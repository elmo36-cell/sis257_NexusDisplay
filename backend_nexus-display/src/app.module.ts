import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { RolesModule } from './roles/roles.module';
import { MarcasModule } from './marcas/marcas.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { DireccionesModule } from './direcciones/direcciones.module';
<<<<<<< HEAD
import { SesionesModule } from './sesiones/sesiones.module';
import { CategoriasModule } from './categorias/categorias.module';
import { CalidadesModule } from './calidades/calidades.module';
import { EspecificacionModule } from './especificacion/especificacion.module';
import { ModeloModule } from './modelo/modelo.module';
import { PantallaModule } from './pantalla/pantalla.module';
=======
import { ModelosModule } from './modelos/modelos.module';
import { CategoriasModule } from './categorias/categorias.module';
import { CalidadesModule } from './calidades/calidades.module';
import { PantallasModule } from './pantallas/pantallas.module';
import { ProveedoresModule } from './proveedores/proveedores.module';
import { ComprasModule } from './compras/compras.module';
import { DetallesCompraModule } from './detalles-compra/detalles-compra.module';
>>>>>>> 58ab75d (feat: Se corrigio y elimino tablas sin uso.Se creo tablas, catálogo, proveedores, compras y detalles_compra.)

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number.parseInt(process.env.DB_PORT ?? ''),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [__dirname + '*/**/*.entity{.ts,.js}'],
      synchronize: true,
      autoLoadEntities: true,
    }),
    RolesModule,
    MarcasModule,
    UsuariosModule,
    DireccionesModule,
<<<<<<< HEAD
    SesionesModule,
    SesionesModule,
    CategoriasModule,
    CalidadesModule,
    EspecificacionModule,
    ModeloModule,
    PantallaModule,
=======
    ModelosModule,
    CategoriasModule,
    CalidadesModule,
    PantallasModule,
    ProveedoresModule,
    ComprasModule,
    DetallesCompraModule,
>>>>>>> 58ab75d (feat: Se corrigio y elimino tablas sin uso.Se creo tablas, catálogo, proveedores, compras y detalles_compra.)
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

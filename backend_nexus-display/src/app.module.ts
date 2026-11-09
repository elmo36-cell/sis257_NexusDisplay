import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { RolesModule } from './roles/roles.module';
import { MarcasModule } from './marcas/marcas.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { ModelosModule } from './modelos/modelos.module';
import { CategoriasModule } from './categorias/categorias.module';
import { CalidadesModule } from './calidades/calidades.module';
import { PantallasModule } from './pantallas/pantallas.module';
import { ProveedoresModule } from './proveedores/proveedores.module';
import { ComprasModule } from './compras/compras.module';
import { DetallesCompraModule } from './detalles-compra/detalles-compra.module';
import { VentasModule } from './ventas/ventas.module';

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
    ModelosModule,
    CategoriasModule,
    CalidadesModule,
    PantallasModule,
    ProveedoresModule,
    ComprasModule,
    DetallesCompraModule,
    VentasModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

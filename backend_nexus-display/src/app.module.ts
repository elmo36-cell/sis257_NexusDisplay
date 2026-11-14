import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlmacenesModule } from './almacenes/almacenes.module';
import { AuthModule } from './auth/auth.module';
import { CalidadesModule } from './calidades/calidades.module';
import { CategoriasModule } from './categorias/categorias.module';
import { ComprasModule } from './compras/compras.module';
import { DetallesCompraModule } from './detalles-compra/detalles-compra.module';
import { DetallesVentaModule } from './detalles-venta/detalles-venta.module';
import { InventarioAlmacenModule } from './inventario-almacen/inventario-almacen.module';
import { MarcasModule } from './marcas/marcas.module';
import { ModelosModule } from './modelos/modelos.module';
import { PantallasModule } from './pantallas/pantallas.module';
import { ProveedoresModule } from './proveedores/proveedores.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { VentasModule } from './ventas/ventas.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number.parseInt(process.env.DB_PORT ?? '5432'),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [__dirname + '*/**/*.entity{.ts,.js}'],
      synchronize: true,
      autoLoadEntities: true,
    }),
    AlmacenesModule,
    AuthModule,
    CalidadesModule,
    CategoriasModule,
    ComprasModule,
    DetallesCompraModule,
    DetallesVentaModule,
    InventarioAlmacenModule,
    MarcasModule,
    ModelosModule,
    PantallasModule,
    ProveedoresModule,
    UsuariosModule,
    VentasModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('API Rest Nexus Display - SIS257')
    .setDescription(
      'API Rest para la compra, venta y catálogo web de pantallas móviles SIS257',
    )
    .setVersion('1.0')
    .addTag('auth')
    .addTag('almacenes')
    .addTag('calidades')
    .addTag('categorias')
    .addTag('compras')
    .addTag('detalles-compra')
    .addTag('detalles-venta')
    .addTag('inventario-almacen')
    .addTag('marcas')
    .addTag('modelos')
    .addTag('pantallas')
    .addTag('proveedores')
    .addTag('usuarios')
    .addTag('ventas')

    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      in: 'header',
    })
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
  console.log(`App corriendo en ${await app.getUrl()}`);
}
bootstrap();

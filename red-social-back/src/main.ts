import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Todas las rutas quedan bajo /api (ej: /api/auth/login)
  app.setGlobalPrefix('api');

  // CORS: permite peticiones desde el front local y desde el front desplegado
  app.enableCors({
    origin: ['http://localhost:4200', process.env.FRONTEND_URL].filter(
      (o): o is string => !!o,
    ),
  });

  // Valida automáticamente todos los DTOs. Si algo no cumple, responde 400.
  // - whitelist: descarta propiedades que no están en el DTO
  // - forbidNonWhitelisted: responde 400 si llegan propiedades de más
  // - transform: convierte tipos (ej: "5" -> 5 en los query params)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PublicationsModule } from './publications/publications.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';

@Module({
  imports: [
    // Carga el .env y deja ConfigService disponible en toda la app
    ConfigModule.forRoot({ isGlobal: true }),

    // Conexión a MongoDB usando la URI del .env (nunca hardcodeada)
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.getOrThrow<string>('MONGODB_URI'),
      }),
    }),

    // SPRINT 1: módulos de Autenticación y Usuarios
    AuthModule,
    UsersModule,
    // SPRINT 1 (creado) 
    PublicationsModule,
    CloudinaryModule,
  ],
})
export class AppModule {}
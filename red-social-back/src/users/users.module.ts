import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { User, UserSchema } from './schemas/user.schema';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

// SPRINT 2: el módulo ahora tiene controller y usa Cloudinary para la foto de perfil
@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    CloudinaryModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // lo usa AuthModule
})
export class UsersModule {}
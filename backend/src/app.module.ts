import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { ProjectModule } from './project/project.module';
import { DesignModule } from './design/design.module';
import { ShareModule } from './share/share.module';
import { FloorplanModule } from './floorplan/floorplan.module';
import { RoomModule } from './room/room.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get('MONGO_URI'),
      }),
    }),
    AuthModule,
    ProjectModule,
    DesignModule,
    ShareModule,
    FloorplanModule,
    RoomModule,
  ],
})
export class AppModule { }
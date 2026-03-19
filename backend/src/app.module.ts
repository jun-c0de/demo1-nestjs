import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { ProjectModule } from './project/project.module';
import { DesignModule } from './design/design.module';
import { ShareModule } from './share/share.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        // .env 파일의 MONGO_URI와 이름을 일치시켰습니다.
        uri: configService.get<string>('MONGO_URI'),
      }),
    }),
    AuthModule,
    ProjectModule,
    DesignModule,
    ShareModule,
  ],
})
export class AppModule { }
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'; // Swagger 추가

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. CORS 설정
  app.enableCors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  });

  // 2. 미들웨어 설정
  app.use(cookieParser());
  app.setGlobalPrefix('api');
  app.useGlobalFilters(new HttpExceptionFilter());

  // 3. 유효성 검사 설정
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // 4. Swagger 설정 추가 (이 부분이 들어가야 /api/docs가 작동함)
  const config = new DocumentBuilder()
    .setTitle('Demo API Documentation') // 문서 제목
    .setDescription('Express에서 NestJS로 이식한 API 문서입니다.') // 설명
    .setVersion('1.0')
    .addBearerAuth() // JWT 인증 버튼 추가
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document); // 주소를 'api/docs'로 설정

  // 5. 서버 실행
  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 서버가 포트 ${port}에서 실행 중입니다.`);
  console.log(`📄 API 문서는 http://localhost:${port}/api/docs 에서 확인할 수 있습니다.`);
}

bootstrap();
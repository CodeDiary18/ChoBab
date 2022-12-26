import { AllExceptionsFilter } from '@common/filters/exception.filter';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseInterceptor } from '@common/interceptors/response.interceptor';
import { ValidationPipe } from '@nestjs/common';
import { sessionMiddleware } from '@utils/session';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(sessionMiddleware);
  app.setGlobalPrefix('api');
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 엔티티 데코레이터에 없는 프로퍼티 값은 무조건 거름
      transform: true, // 컨트롤러가 값을 받을때 컨트롤러에 정의한 타입으로 형변환
    })
  );
  await app.listen(3000);
}

bootstrap();

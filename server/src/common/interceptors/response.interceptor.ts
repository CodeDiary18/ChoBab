import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface ResponseTemplateType<T> {
  message: string;
  data: T;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ResponseTemplateType<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ResponseTemplateType<T>> {
    return next.handle().pipe(
      map((data) => ({
        message: data.message,
        data: data.data,
      }))
    );
  }
}

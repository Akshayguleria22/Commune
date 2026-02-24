import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  data: T;
  meta?: Record<string, any>;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((responseData) => {
        // If the response already has a `data` property, pass through (e.g. paginated responses)
        if (responseData && typeof responseData === 'object' && 'data' in responseData) {
          return responseData;
        }

        return {
          data: responseData,
        };
      }),
    );
  }
}

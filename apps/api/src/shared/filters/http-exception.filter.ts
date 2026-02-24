import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const requestId = `req_${uuidv4().split('-')[0]}`;

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let error = 'INTERNAL_ERROR';
    let message = 'An unexpected error occurred';
    let details: any[] | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resp = exceptionResponse as any;
        error = resp.error || this.getErrorCode(status);
        message = resp.message || exception.message;
        details = Array.isArray(resp.message) ? resp.message.map((m: string) => ({ constraint: m })) : undefined;
        if (details) {
          message = 'Validation failed';
          error = 'VALIDATION_ERROR';
        }
      } else {
        message = exception.message;
        error = this.getErrorCode(status);
      }
    } else if (exception instanceof Error) {
      this.logger.error(
        `Unhandled exception: ${exception.message}`,
        exception.stack,
      );
    }

    response.status(status).json({
      statusCode: status,
      error,
      message,
      details,
      requestId,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private getErrorCode(status: number): string {
    const codeMap: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'RESOURCE_NOT_FOUND',
      409: 'DUPLICATE_ENTRY',
      422: 'VALIDATION_ERROR',
      429: 'RATE_LIMITED',
      500: 'INTERNAL_ERROR',
    };
    return codeMap[status] || 'UNKNOWN_ERROR';
  }
}

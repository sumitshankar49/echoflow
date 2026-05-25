import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { Request, Response } from 'express';

interface HttpErrorBody {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string | string[];
  error?: string;
  details?: unknown;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isDevelopment = process.env.NODE_ENV !== 'production';

    const normalizedError = this.normalizeException(exception, isDevelopment);

    const responseBody: HttpErrorBody = {
      statusCode: normalizedError.status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: normalizedError.message,
      error: normalizedError.error,
      details: normalizedError.details,
    };

    response.status(normalizedError.status).json(responseBody);
  }

  private normalizeException(
    exception: unknown,
    isDevelopment: boolean,
  ): {
    status: number;
    message: string | string[];
    error?: string;
    details?: unknown;
  } {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();

      if (typeof response === 'string') {
        return {
          status,
          message: response,
          error: this.getHttpStatusLabel(status),
        };
      }

      const responseObject = response as {
        message?: string | string[];
        error?: string;
      };

      return {
        status,
        message: responseObject.message ?? this.getHttpStatusLabel(status),
        error: responseObject.error ?? this.getHttpStatusLabel(status),
      };
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.mapPrismaError(exception, isDevelopment);
    }

    if (exception instanceof Prisma.PrismaClientUnknownRequestError) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Database operation failed.',
        error: 'Internal Server Error',
        details: isDevelopment ? exception.message : undefined,
      };
    }

    if (exception instanceof Error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: isDevelopment ? exception.message : 'Internal server error',
        error: 'Internal Server Error',
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      error: 'Internal Server Error',
    };
  }

  private mapPrismaError(
    error: Prisma.PrismaClientKnownRequestError,
    isDevelopment: boolean,
  ): {
    status: number;
    message: string;
    error: string;
    details?: unknown;
  } {
    switch (error.code) {
      case 'P2002': {
        const target = Array.isArray(error.meta?.target)
          ? error.meta?.target.join(',')
          : String(error.meta?.target ?? '');

        if (target.toLowerCase().includes('email')) {
          return {
            status: HttpStatus.CONFLICT,
            message: 'Email already exists. Please use another email or login.',
            error: 'Conflict',
          };
        }

        return {
          status: HttpStatus.CONFLICT,
          message: 'A record with the same unique value already exists.',
          error: 'Conflict',
        };
      }
      case 'P2003':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Related record was not found for this operation.',
          error: 'Bad Request',
        };
      case 'P2011':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'A required field is missing.',
          error: 'Bad Request',
        };
      case 'P1000':
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Database authentication failed. Check database credentials.',
          error: 'Internal Server Error',
        };
      default:
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Database operation failed.',
          error: 'Internal Server Error',
          details: isDevelopment ? error.message : undefined,
        };
    }
  }

  private getHttpStatusLabel(status: number): string {
    return (
      {
        400: 'Bad Request',
        401: 'Unauthorized',
        403: 'Forbidden',
        404: 'Not Found',
        409: 'Conflict',
        422: 'Unprocessable Entity',
        500: 'Internal Server Error',
      }[status] ?? 'Error'
    );
  }
}
